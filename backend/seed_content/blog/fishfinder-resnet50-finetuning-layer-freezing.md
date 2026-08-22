---
title: "The model inside FishFinder: ResNet50, fine-tuning, and when to freeze layers"
slug: fishfinder-resnet50-finetuning-layer-freezing
status: published
published_at: 2026-08-22
category: explanation
tags: ["computer-vision", "transfer-learning", "resnet", "fine-tuning", "mobile-ml", "pytorch"]
excerpt: "FishFinder classifies 63 Dutch fish species from ~3,000 photos. That only works because the model doesn't start from zero: a pretrained ResNet50, fine-tuned with layer-wise learning rates. Here is how transfer learning, freezing and discriminative LRs actually work, with the real numbers."
read_time: ""
date: "August 2026"
featured: false
is_premium: false
author: Ian Ronk
cover_image: "/blog-figures/fishfinder-resnet50-finetuning/freeze-vs-discriminative-lr.svg"
meta: {"project": "fishfinder-on-device-fish-id"}
---

# The model inside FishFinder: ResNet50, fine-tuning, and when to freeze layers

*Companion post to the [FishFinder project page](/en/research/fishfinder-on-device-fish-id): the app identifies 63 Dutch fish species from a photo, fully on-device. This is the story of the classifier itself.*

## The problem with 3,000 photos

FishFinder's training set is roughly 3,000 photos I collected myself. Sixty-plus species means a few dozen images per class. For context: ImageNet, the dataset image models are typically measured on, has over a million. Training a deep network from scratch on 3,000 photos is not a hard problem; it's an impossible one. The network would memorize every image long before it learned what a fish is.

The way out is **transfer learning**: don't start from zero. Take a network already trained on ImageNet and reuse what it learned. This works because of a lucky property of convolutional networks: their early layers learn things that have nothing to do with the original task. Edges, corners, color gradients, textures. Those are as useful for telling a perch from a pike as they were for telling a husky from a muffin. Only the later layers get task-specific, and the very last layer (the "head") is just a lookup from features to class names.

## What a ResNet50 actually is

FishFinder's classifier is a **ResNet50**: fifty layers of convolutions organized into four stages, where each stage looks at a coarser, more abstract version of the image than the one before. The "Res" is the important part. Each block of layers computes a small *residual correction* to its input rather than a whole new representation, because the block's input is added back to its output through a skip connection. That one trick is what makes fifty-layer networks trainable at all; without it, the training signal degrades as it travels backwards through that many layers.

Feed it a 224×224 image of a bream and each stage hands the next a smaller, deeper summary: first edges and speckle, then scale patterns and fin shapes, then "long silver body, orange fins", until a final layer turns that summary into 62 species probabilities.

## Fine-tuning, and the freezing question

Fine-tuning means continuing to train that pretrained network on your own data. The catch: your tiny dataset can *damage* the pretrained weights. With a normal learning rate and 3,000 images, the network will happily overwrite its general-purpose edge detectors with noise from your photos. This is where freezing comes in, and FishFinder contains both generations of the idea.

![Two-row diagram: hard freezing locks the whole backbone and trains only a new head; discriminative learning rates let every layer train, with the learning rate ramping up from conv1 at a tenth of the base rate to the new head at the full rate](/blog-figures/fishfinder-resnet50-finetuning/freeze-vs-discriminative-lr.svg)
*Two ways to protect pretrained weights: lock them (top) or slow them down in proportion to how general they are (bottom).*

**Version 1 froze everything.** The first FishFinder classifier was a MobileNetV2 feature extractor with `trainable = False`, plus a small new softmax head on top. That is hard freezing: the backbone's weights cannot change at all, and only the head learns. It's fast, it's cheap, it cannot destroy the pretrained features, and for a v1 served from a Flask endpoint it was exactly right. Its ceiling is real, though. A frozen ImageNet backbone has never seen a fish held at arm's length toward a phone camera; it can't adapt its mid-level features to scale texture and fin geometry, because it isn't allowed to.

**The rebuild uses the continuous version of freezing.** The current trainer fine-tunes *all* of ResNet50, but with **discriminative learning rates**: each stage gets its own learning rate, scaled by how general its features are. Straight from the training script:

```python
params = [
    {'params': model.conv1.parameters(), 'lr': lr / 10},
    {'params': model.bn1.parameters(),   'lr': lr / 10},
    {'params': model.layer1.parameters(), 'lr': lr / 8},
    {'params': model.layer2.parameters(), 'lr': lr / 6},
    {'params': model.layer3.parameters(), 'lr': lr / 4},
    {'params': model.layer4.parameters(), 'lr': lr / 2},
    {'params': model.fc.parameters()},   # full lr
]
```

Read it top to bottom: the stem that detects edges moves at a tenth of the base rate (it's nearly perfect already, leave it be), the mid stages get progressively more freedom, and the freshly initialized head, which starts as random noise, learns at full speed. Freezing is just the limit of this: a frozen layer is one whose learning rate is zero. The schedule on top is OneCycleLR, which warms the rates up and back down over the run, and the head is a new `Linear` layer sized to the fish classes.

## Honest numbers

The rest of the recipe is standard but load-bearing: flips, small rotations and random crops so the network never sees the exact same pixels twice; normalization statistics computed on the training split only; a stratified 70/15/15 split; known-bad segmentation masks excluded; and the test score reported from the best-validation checkpoint on a held-out test set the model never touched.

On the full 62-class dataset that lands at **75.9% top-1 and 94.0% top-5**. The training log also shows the small-data reality plainly: training accuracy reaches ~100% while validation sits around 80%. That gap is overfitting, and with a few dozen images per class it doesn't fully close; more photos per species is the known fix. I'd rather publish the gap than hide it.

For the app, the trained network gets compressed into an 8.8 MB TFLite file that runs on the phone itself. A ResNet50 spends its knowledge budget wisely enough that, after conversion, a model that started from a million ImageNet images fits in a fishing app's back pocket, with no server and no signal required.

## The takeaway

Fine-tuning is a negotiation between what the network already knows and what your data can teach it. Freeze too much and you cap what the model can become; free too much and your 3,000 photos bulldoze features learned from a million. Layer-wise learning rates are the grown-up answer: let every layer learn, at a speed proportional to how much you trust it.
