---
title: "US vs EU: does training-data geography matter for autonomous-driving object detection?"
slug: us-vs-eu-transfer-autonomous-driving
excerpt: "A controlled 2×3 fine-tuning study on YOLOv3/YOLOv8: US dashcam data transfers roughly nothing to European streets (+0.001 mAP vs +0.153 for in-domain data), and bicycle detection collapses without EU ground truth."
status: published
category: working-paper
publication_status: ""
tags: ["computer-vision", "autonomous-driving", "domain-transfer", "yolo", "kitti"]
abstract: "Does an object detector trained on US dashcam data still work on European streets? An original 2024 course project suggested catastrophic transfer failure, but was confounded: precision-only metrics, no held-out test set, a resolution mismatch between datasets, and models never trained in-domain. This controlled redo runs a 2×3 design ({zero-shot COCO, US-fine-tuned, EU-fine-tuned} × {US-test, EU-test}) with YOLOv3u and YOLOv8s on Udacity/CrowdAI (US) and KITTI (EU). On EU test data, EU fine-tuning gains +0.153 mAP@0.5:0.95 over zero-shot while US fine-tuning gains +0.001; the difference-in-differences gap is +0.077 ± 0.007 across three seeds. The pattern is mirror-symmetric, so the correct read is narrow fine-tune specialisation rather than a US-specific geographic bias, with one asymmetry that is genuinely geographic: bicycle detection collapses without European training data."
read_time: "7 min"
date: "2025-03-05"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: "/projects/us-vs-eu-transfer-autonomous-driving/eu-kitti-detections.jpg"
is_premium: false
---

# US vs EU transfer for autonomous driving

## Introduction

Most self-driving perception stacks learn to see on American roads, because that is where the dashcam data is. European streets are a different environment: bicycles share the lane, traffic lights hang on the near side of the intersection, and the streets were laid out centuries before cars. We test whether US training data transfers to that environment, and whether fine-tuning on US data actively *hurts* on European streets.

![US validation frames with predicted bounding boxes: FedEx trucks, palm trees, wide Mountain View roads](/projects/us-vs-eu-transfer-autonomous-driving/us-udacity-detections.jpg)
*The American side of the experiment: US-fine-tuned YOLOv8s predictions on Udacity dashcam frames. Wide lanes, palm trees, a FedEx truck.*

## Background: the 2024 study and its confounds

The 2024 version of this project (a Bocconi computer-vision course) trained a YOLOv3 from a Darknet-53 backbone and found what looked like catastrophic transfer failure. The headline was striking; the design was confounded five ways: precision-only evaluation, no held-out test set, a resolution mismatch between the two datasets, no in-domain baseline to compare against, and far too little training. The project's own conclusion admitted as much, which is why we redo the experiment here.

## Methods: a controlled 2×3 design

The 2025 redo is a controlled **2×3 design**: three training conditions (zero-shot COCO-pretrained, US-fine-tuned, EU-fine-tuned), each evaluated on a US test set and an EU test set that no model ever touches during training or selection. Two architectures (YOLOv3u and YOLOv8s) cross-check each other. Both datasets get identical 416-pixel letterboxing. Fine-tuning gets a fixed 12-epoch budget. US data is Udacity/CrowdAI dashcam footage; EU data is KITTI, which means Karlsruhe, so every "EU" result reads as "German driving", not Europe at large.

The two datasets differ in more than scenery; the annotations live in different places:

![Bounding-box centre heatmaps comparing US and EU datasets per class](/projects/us-vs-eu-transfer-autonomous-driving/box-center-heatmaps-us-vs-eu.png)
*Where the boxes are: US annotations hug a tight horizontal band, KITTI boxes spread wider and lower, and KITTI has no traffic-light ground truth at all.*

## Results

On the EU test set, fine-tuning on EU data buys YOLOv8s **+0.153 mAP@0.5:0.95** over the zero-shot baseline. Fine-tuning on US data buys **+0.001**. A full fine-tuning run on American streets moves European performance by a rounding error. The mirror experiment fails symmetrically, and the difference-in-differences estimate lands at **Δ = +0.077 ± 0.007**, stable across three seeds and both architectures, surviving a class-remapping correction and a threshold-free evaluation check.

![Grouped bar chart of shared-class mAP gains over zero-shot for both models and both test regions](/projects/us-vs-eu-transfer-autonomous-driving/finetune-gains-us-vs-eu.svg)
*The whole study in one picture: each model only improves on the region it was fine-tuned on. The +0.001 sliver is the headline.*

Because the effect is mirror-symmetric (each side loses roughly equally on the other's streets), we read it as *narrow fine-tune specialisation*, not a uniquely American bias. That is a less dramatic conclusion than the 2024 version's, and a much better-supported one.

![EU validation frames with predicted bounding boxes from the EU-fine-tuned model](/projects/us-vs-eu-transfer-autonomous-driving/eu-kitti-detections.jpg)
*What in-domain fine-tuning buys: the EU-fine-tuned YOLOv8s on KITTI streets. Cars, pedestrians, and a bicycle.*

## Discussion: the bicycle asymmetry

One failure *is* genuinely geographic. US driving data contains roughly 30× fewer bicycles per image than European data, and it shows: bicycle AP sits near zero in every US-trained condition and only recovers when the model sees European ground truth. A US-trained perception stack deployed in a European city has one class it silently cannot see: the cyclist next to the fender. That is the safety-relevant headline.

## Scope and limitations

By its own audit this is a reproducibility-tier result. The contribution is the controlled correction of an earlier "catastrophic transfer" claim (proper holdouts, both-direction fine-tuning, seed-stable statistics), not a novel domain-adaptation method. We find that more useful than the original headline. The 2024 version told the more thrilling story; this one we can defend.

## Full paper

[Download the paper (PDF)](/papers/us-vs-eu-transfer-autonomous-driving.pdf)
