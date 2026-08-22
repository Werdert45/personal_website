---
title: "FishFinder — photo-to-species identification for 63 Dutch fish, fully on-device"
slug: fishfinder-on-device-fish-id
excerpt: "Photograph a fish, get the species — on-device, no signal needed. A Flutter app with a Pokédex-style FishDex, built on a training pipeline where one click per photo drives Segment Anything masking of ~3,000 self-collected images before fine-tuning ResNet50."
status: published
category: project
publication_status: ""
tags: ["mobile-ml", "flutter", "tflite", "segment-anything", "resnet", "computer-vision"]
abstract: "A mobile fish-identification app plus its own ML training pipeline. Photograph a fish and the app classifies it on-device against 63 Dutch freshwater and coastal species, returning a hand-written Dutch species profile — size, edibility, conservation status, season. Around the classifier sits a gamified FishDex: a Pokédex-style collection where caught species unlock, with accounts, friends and a catch dashboard. The 2024 training pipeline rebuilds the classifier with a point-prompted Segment Anything masking step over ~3,000 self-collected photos, feeding a fine-tuned ResNet50 that ships compressed into the app."
read_time: "5 min"
date: "2020–2024"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: "/projects/fishfinder-on-device-fish-id/sam-point-prompt-to-mask.jpg"
is_premium: false
---

# FishFinder

## What did I just catch?

Every angler knows the moment: fish in hand, dripping, camera out — *what is this thing?* FishFinder is my answer. Point the camera (or pick from the gallery), and the app classifies the catch against **63 Dutch freshwater and coastal species**, entirely on-device. Then it opens a species page I wrote by hand, in Dutch: latin name, typical length, whether you can eat it, conservation status, season, habitat. That content alone is 126 KB of hand-written natural history, one profile per species.

And because catching fish is collecting fish, the app wraps the classifier in a **FishDex** — a Pokédex-style gallery where every species you catch unlocks. Firebase handles accounts, friends and a dashboard of recent catches. Catch a zeelt, unlock the zeelt. It's exactly as addictive as it sounds.

## One click per fish

The real engineering lives in the training pipeline. My raw material was **~3,000 self-collected fish photos** — small by ImageNet standards, and messy in a very specific way: nearly every photo has hands, a boat, grass, a proud angler. A naive classifier will happily learn that "pike" means "green raincoat".

So the 2024 rebuild puts a human in the loop, but only barely. For each photo, I click **one point** on the fish. That point becomes a prompt for **Segment Anything**, which proposes candidate masks; the best one is kept. One click buys pixel-level segmentation — an order of magnitude cheaper than drawing masks by hand.

![Point prompt on an angler photo next to the resulting Segment Anything mask covering exactly the fish](/projects/fishfinder-on-device-fish-id/sam-point-prompt-to-mask.jpg)
*One green star on the perch (left) is all Segment Anything needs to mask the whole fish (right).*

From there a fitting routine takes over: strip the masked-out background, crop tight to the fish, re-square, resize to 224×224. Every training image becomes a consistently framed fish and nothing else.

![Three-step fitting sequence: segmented eel at original size, tightly cropped, then the final 224 by 224 model input](/projects/fishfinder-on-device-fish-id/fit-pipeline-original-crop-224.png)
*From segmented original to tight crop to the final 224×224 input the model actually sees.*

The payoff is a training set that looks like this — fish floating on black, no raincoats in sight:

![Grid of six segmented training inputs, each a single fish on a black background](/projects/fishfinder-on-device-fish-id/segmented-training-inputs.jpg)
*Six training inputs after the pipeline: the classifier sees fish, only fish.*

A pretrained **ResNet50** is fine-tuned on the result. Early accuracy on the small self-collected set is honest rather than impressive — about **73% top-1 / 90% top-5 on a 10-class subset**, with visible overfitting — and growing the per-class sample is the known next step. I'd rather report that number truthfully than launder it through a bigger test-set story.

![Four-by-four grid of segmented crops spanning sixteen species, from perch and pike to eel and tench](/projects/fishfinder-on-device-fish-id/species-crops-grid-4x4.jpg)
*Sixteen of the 63 species as the pipeline sees them — perch, pike, carp, tench, eel and friends.*

## No signal? No problem

The shipped model is an **8.8 MB TFLite file bundled inside the app**. No inference server, no network round-trip, no spinner while your catch flops around. It works on a boat in the middle of a lake with zero bars — which is precisely where you need it.

That was a deliberate reversal. The v1 classifier was MobileNetV2 transfer learning served over Flask: fine on WiFi, useless on the water. Retiring the server and going fully offline was the single best product decision in the project. The app itself is Flutter, so one codebase covers iOS and Android, with Firebase underneath for auth, storage and the social layer.

## Where it stands

Functional end-to-end: photo in, species out, FishDex fills up. A UI refresh is planned before broader release. The pipeline is the part I'd defend in any review — one click per image, Segment Anything doing the heavy lifting, and a model small enough to live in your pocket.
