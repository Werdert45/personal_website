---
title: "FishFinder — photo-to-species identification for 63 Dutch fish, fully on-device"
slug: fishfinder-on-device-fish-id
excerpt: "A Flutter app that identifies Dutch fish species from a photo and fills a Pokédex-style FishDex as you catch them — with a training pipeline that uses Segment Anything to mask ~3,000 hand-annotated photos before fine-tuning ResNet50."
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
preview_image: ""
is_premium: false
---

# FishFinder

## What it is

FishFinder answers a simple question anglers ask constantly: *what did I just catch?* Photograph a fish — camera or gallery — and the app classifies it against **63 Dutch freshwater and coastal species**, entirely on-device, then opens a species page with a hand-written Dutch natural-history profile: latin name, typical length, edibility, conservation status, season, habitat.

Around the classifier sits the **FishDex** — a Pokédex-style collection of all species where the ones you've caught unlock — plus Firebase-backed accounts, friends, and a dashboard of recent catches. The species content alone is a real dataset: 126 KB of hand-written profiles with a bundled reference photo per species.

## The interesting engineering: the training pipeline

The classifier's raw material is **~3,000 self-collected fish photos** across the species list — small, messy, and full of backgrounds (hands, boats, grass) that a naive classifier would latch onto. The 2024 rebuild solves that with a human-in-the-loop segmentation step:

1. For each photo, a human clicks **one point** on the fish in the annotation tool.
2. That point becomes a prompt for **Segment Anything**, which proposes candidate masks; the best is kept.
3. A cropping routine removes the masked-out background, re-squares the fish and resizes to 224×224, so every training image is a consistently framed fish and nothing else.
4. A pretrained **ResNet50** is fine-tuned on the result.

One click per image buys pixel-level segmentation quality — the cost of annotation drops by an order of magnitude compared to drawing masks by hand. Early-stage accuracy on the small self-collected dataset is honest rather than impressive (about 73% top-1 / 90% top-5 on a 10-class subset, with visible overfitting), and growing the per-class sample is the known next step.

## On-device by design

The shipped model is an **8.8 MB TFLite file bundled inside the app** — no inference server, no network round-trip, works on a boat with no signal. The app itself is Flutter (iOS + Android) with Firebase for auth, storage and the social layer. An earlier v1 classifier (MobileNetV2 transfer learning served over Flask) was retired precisely to get inference fully offline.

## Status

Functional end-to-end; a UI refresh is planned before broader release.
