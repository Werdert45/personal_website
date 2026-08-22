---
title: "US vs EU: does training-data geography matter for autonomous-driving object detection?"
slug: us-vs-eu-transfer-autonomous-driving
excerpt: "A controlled 2×3 fine-tuning study on YOLOv3/YOLOv8: US dashcam data transfers roughly nothing to European streets (+0.001 mAP vs +0.153 for in-domain data), and bicycle detection collapses without EU ground truth."
status: published
category: project
publication_status: ""
tags: ["computer-vision", "autonomous-driving", "domain-transfer", "yolo", "kitti"]
abstract: "Does an object detector trained on US dashcam data still work on European streets? An original 2024 course project suggested catastrophic transfer failure, but was confounded: precision-only metrics, no held-out test set, a resolution mismatch between datasets, and models never trained in-domain. This controlled redo runs a 2×3 design — {zero-shot COCO, US-fine-tuned, EU-fine-tuned} × {US-test, EU-test} — with YOLOv3u and YOLOv8s on Udacity/CrowdAI (US) and KITTI (EU). On EU test data, EU fine-tuning gains +0.153 mAP@0.5:0.95 over zero-shot while US fine-tuning gains +0.001; the difference-in-differences gap is +0.077 ± 0.007 across three seeds. The pattern is mirror-symmetric, so the honest conclusion is narrow fine-tune specialisation, not a US-specific geographic bias — with one asymmetry that is genuinely geographic: bicycle detection collapses without European training data."
read_time: "7 min"
date: "2024–2025"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: ""
is_premium: false
---

# US vs EU transfer for autonomous driving

## The question

Autonomous-driving perception stacks are trained on whatever dashcam data their developers have — which is overwhelmingly American. Does a detector trained on US streets still work in Europe, where bicycles share the road, traffic lights hang differently, and streets are narrower? And does fine-tuning on US data actively make a model *worse* on European streets?

## Two attempts, one honest correction

The **original 2024 version** (a Bocconi computer-vision course project) trained a YOLOv3 from a Darknet-53 backbone on downsampled US and European driving data and found what looked like catastrophic transfer failure. It was also confounded five ways: precision-only evaluation, no held-out test set, a resolution mismatch between the two datasets, models that were never trained in-domain as a baseline, and far too little training. The project's own conclusion admitted as much.

The **2025 redo** was built to correct exactly those confounds with a controlled **2×3 design**: three training conditions — zero-shot COCO-pretrained, US-fine-tuned, EU-fine-tuned — evaluated on both a US test set and an EU test set that is never touched during training or model selection. Two architectures (YOLOv3u and YOLOv8s) act as mutual cross-checks; both datasets go through identical 416-pixel letterboxing; fine-tuning uses a fixed 12-epoch budget. US data is Udacity/CrowdAI dashcam footage; EU data is KITTI — which means Karlsruhe, so every "EU" result should be read as "German driving," not Europe at large.

## What it found

- **US data cannot substitute for EU data.** On the EU test set, fine-tuning on EU data gains **+0.153 mAP@0.5:0.95** over the zero-shot baseline (YOLOv8s). Fine-tuning on US data gains **+0.001** — statistically nothing. The mirror experiment (EU data on US test) fails symmetrically.
- **US fine-tuning widens the US–EU gap.** The difference-in-differences estimate is **Δ = +0.077 ± 0.007**, stable across three random seeds and both architectures, and it survives a class-remapping correction and a threshold-free evaluation check.
- **The honest interpretation is specialisation, not geography.** Because the effect is mirror-symmetric — each side loses roughly equally on the other's streets — the data supports *narrow fine-tune specialisation* rather than a uniquely American bias.
- **One genuinely geographic failure: bicycles.** US driving data contains roughly 30× fewer bicycles per image than European data. Bicycle detection sits at essentially zero AP in every US-trained condition and only recovers when the model sees European ground truth. For European deployment, that is the safety-relevant headline.

## Framing

This is a reproducibility-tier result by its own audit: the contribution is the controlled correction of an earlier "catastrophic transfer" claim, executed with proper holdouts, both-direction fine-tuning and seed-stable statistics — not a novel domain-adaptation method.
