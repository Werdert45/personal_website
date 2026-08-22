---
title: "FishFinder: photo-to-species identification for 63 Dutch fish, fully on-device"
slug: fishfinder-on-device-fish-id
excerpt: "Photograph a fish, get the species. On-device, no signal needed. A cross-platform app with a locally hosted classifier and a Pokédex-style FishDex, built on a training pipeline where one click per photo drives Segment Anything masking of ~3,000 self-collected images."
status: published
category: project
publication_status: ""
tags: ["mobile-ml", "flutter", "tflite", "segment-anything", "resnet", "computer-vision"]
abstract: "A mobile fish-identification app plus its own ML training pipeline. Photograph a fish and the app classifies it on-device against 63 Dutch freshwater and coastal species, returning a hand-written Dutch species profile: size, edibility, conservation status, season. Around the classifier sits a gamified FishDex: a Pokédex-style collection where caught species unlock, with accounts, friends and a catch dashboard. A later training-pipeline rebuild reworks the classifier with a point-prompted Segment Anything masking step over ~3,000 self-collected photos, feeding a fine-tuned ResNet50 that ships compressed into the app."
read_time: "5 min"
date: "2022"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: "/projects/fishfinder-on-device-fish-id/point-prompt-to-mask-brasem.jpg"
is_premium: false
---

# FishFinder

## What did I just catch?

Every angler knows the moment: fish in hand, dripping, camera out. *What is this thing?* FishFinder is my answer. Point the camera (or pick from the gallery), and the app classifies the catch against **63 Dutch freshwater and coastal species**, then opens a species page I wrote by hand, in Dutch: latin name, typical length, whether you can eat it, conservation status, season, habitat. That content alone is 126 KB of hand-written natural history, one profile per species.

## The app

FishFinder is a **cross-platform app**, one Flutter codebase covering iOS and Android, with full camera and gallery capture, and the part I'm proudest of: the machine-learning model is **hosted locally, on the phone itself**. The shipped classifier is an **8.8 MB TFLite file bundled inside the app**. No inference server, no network round-trip, no spinner while your catch flops around. It works on a boat in the middle of a lake with zero bars, which is precisely where you need it.

![Diagram of the FishFinder flow: the camera frames a fish, an on-device ResNet50 in TFLite classifies it with no cloud involved, and the result unlocks a cell in the FishDex](/projects/fishfinder-on-device-fish-id/app-flow-diagram.svg)
*The whole loop runs on the phone: camera → local model → species page → FishDex unlock.*

![Three FishFinder screens side by side: a scan result ranking blankvoorn at 94%, the hand-written blankvoorn species page, and the FishDex collection with caught and uncaught species](/projects/fishfinder-on-device-fish-id/app-screens-triptych.jpg)
*That loop in the refreshed UI: the classifier's ranked result, the species page behind it, and the FishDex it unlocks into. One Flutter codebase, iOS and Android.*

That was a deliberate reversal. The v1 classifier was MobileNetV2 transfer learning served over Flask: fine on WiFi, useless on the water. Retiring the server and going fully offline was the single best product decision in the project. Firebase sits underneath for auth, storage and the social layer. And because catching fish is collecting fish, the app wraps the classifier in a **FishDex**, a Pokédex-style gallery where every species you catch unlocks, with friends and a dashboard of recent catches. Catch a zeelt, unlock the zeelt. It's exactly as addictive as it sounds.

## One click per fish

The real engineering lives in the training pipeline. My raw material was **~3,000 self-collected fish photos**, small by ImageNet standards and messy in a very specific way: nearly every photo has hands, a boat, grass, a proud angler. A naive classifier will happily learn that "pike" means "green raincoat".

So the pipeline rebuild puts a human in the loop, but only barely. For each photo, I click **one point** on the fish. That point becomes a prompt for **Segment Anything**, which proposes candidate masks; the best one is kept. One click buys pixel-level segmentation, an order of magnitude cheaper than drawing masks by hand. A fitting routine then strips the background, crops tight, and resizes to 224×224, so every training image becomes a consistently framed fish and nothing else.

![A bream on a white cloth with a single yellow point prompt, next to the Segment Anything mask isolating exactly the fish on black](/projects/fishfinder-on-device-fish-id/point-prompt-to-mask-brasem.jpg)
*One yellow dot on the bream (left) is all Segment Anything needs to isolate the whole fish (right).*

A pretrained **ResNet50** is fine-tuned on the result. Early accuracy on the small self-collected set is honest rather than impressive: about **73% top-1 / 90% top-5 on a 10-class subset**, with visible overfitting. Growing the per-class sample is the known next step. I'd rather report that number truthfully than launder it through a bigger test-set story.

![Four-by-four grid of segmented crops spanning sixteen species, from perch and pike to eel and tench](/projects/fishfinder-on-device-fish-id/species-crops-grid-4x4.jpg)
*Sixteen of the 63 species as the pipeline sees them: perch, pike, carp, tench, eel and friends.*

## Where it stands

Functional end-to-end: photo in, species out, FishDex fills up. The UI refresh shown above is rolling in ahead of a broader release. The pipeline is the part I'd defend in any review: one click per image, Segment Anything doing the heavy lifting, and a model small enough to live in your pocket.
