---
title: "Predicting Flooding Risk for Pan-European REIT Assets using Local Features"
slug: predicting-flooding-risk-local-features
excerpt: "Can flood risk be explained instead of simulated? A BSc AI thesis reproducing the EU's hydrodynamic flood maps from 33 local features — a Random Forest reaches 97.5% on the binary 20-year flood question, driven by surrounding imperviousness and relative height."
status: published
category: thesis
publication_status: thesis
tags: ["flood-risk", "random-forest", "geospatial", "real-estate", "explainability", "thesis"]
abstract: "The standard pan-European fluvial flood hazard maps come from a 2D hydrodynamic simulation: accurate, but neither explainable nor adaptable. This BSc thesis (Artificial Intelligence, University of Amsterdam, 2022; industry partner KR&A) asks whether those simulated flood-return-period labels can be reproduced from local, interpretable features of a location. Thirty-three features across micro, meso and macro scales — precipitation extremes, ground type, artificial imperviousness at multiple radii, distance and relative height to the nearest river, terrain depressions, regional economics — are extracted for ~45,700 balanced samples drawn around all European towns above 1,000 inhabitants. A Random Forest reproduces the binary 20-year flood label at 97.5% accuracy and four ordered risk classes at 73.8%, with surrounding imperviousness and relative height dominating feature importance — an explainable-by-construction risk screen for real-estate portfolios."
read_time: "8 min"
date: "2022"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: ""
is_premium: false
---

# Predicting Flooding Risk from Local Features

*BSc thesis, Artificial Intelligence, University of Amsterdam (2022). Industry partner: KR&A, Amsterdam. Supervised by Sander van Splunter and Arjan Knibbe.*

[Download the thesis PDF](/papers/predicting-flooding-risk-local-features.pdf)

## The question

Europe's reference fluvial flood hazard maps (Dottori et al., 2016 — 250 m resolution, return periods from 10 to 200 years) come out of a two-dimensional hydrodynamic simulation. For a real-estate portfolio manager they have two problems: they cannot tell you *why* an asset is flood-prone, and they cannot be updated when local conditions change. The thesis asks: **can the risk of flooding be explained by local values of specific locations?** — that is, can a model built purely on interpretable local features reproduce the simulation's labels?

## Data and features

Thirty-three features in three scale bands, each extracted per location:

- **Micro** — one-day and five-day precipitation maxima (2000–2019), monthly average precipitation climatology, ground type at the point and within 1–5 km, and **artificial imperviousness** (paved surface share) at the point and within 500 m, 1 km and 5 km.
- **Meso** — distance to the nearest river, relative height and terrain depressions versus the surroundings at 500 m / 1 km / 5 km, and relative height versus the nearest river.
- **Macro** — regional GDP and GDP per capita (joined on NUTS3), plus two governance indicators.

Sampling starts from every European town above 1,000 inhabitants, drawing flooded pixels across all return periods and balancing to ~7,600 samples per class — **~45,700 samples** in total, evaluated on a held-out test set and separately on a real asset portfolio.

## Results

Three models were compared — logistic regression, Random Forest, and a neural network — on three formulations of the label. The Random Forest wins every one:

| Formulation | Random Forest accuracy |
|---|---|
| Binary: floods within a 20-year return period? | **97.5%** |
| Four ordered risk classes (none / low / medium / high) | **73.8%** |
| All six return periods | 58.5% |

Feature importance is where the explainability pays off: the four **imperviousness** features dominate the binary model (how paved the surroundings are within 500 m–5 km), with **relative height to the surrounding terrain** the second family in the multi-class models. In other words: the model learns hydrologically sensible structure — paved, low-lying locations near rivers flood — and can show its reasoning per asset.

## What it's for

The result is an explainable-by-construction screening layer for pan-European real-estate risk: each asset gets not just a flood class but the local factors driving it, and inputs can be refreshed as land cover changes — something a frozen simulation output cannot do. The thesis is equally explicit about limits: the simulation is treated as ground truth, accuracy is the only reported metric, and the non-flooding sample construction is flagged for future work.
