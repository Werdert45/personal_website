---
title: "When Does Metro Infrastructure Capitalize into Property Prices? Phase-Decomposed Difference-in-Differences Evidence from Seven European Cities"
slug: when-metro-capitalizes-paper
excerpt: "When do new metro lines show up in house prices? Across 42,000 observations from seven European cities, the market pays on delivery, not on promises — and the number worth defending is Milan's +167 EUR/m² within Ring D."
status: published
category: working-paper
publication_status: working-paper
tags: ["difference-in-differences", "metro", "property-prices", "infrastructure", "urban-economics", "italy"]
abstract: "We study when, not merely whether, new metro lines capitalize into residential property prices. Seventeen staggered treated cohorts across seven European cities in five countries (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma) pool into a single phase-decomposed panel (n = 42,004), with the response decomposed into announcement, construction, opening, and maturity phases. The pooled cross-city average locates the largest response at maturity: prices step up by +9 to +12% — drop-Roma to full-sample, measured as the construction-to-maturity contrast — two or more years after opening, a step that is stable across the control ladder and positive under every leave-one-city-out. The step is a pooled average, however, not a within-city fact. City-by-year fixed effects collapse it to an insignificant -0.5 log points while leaving a +2.5 log-point step at opening — a within-city contrast that is itself entity-clustered ordering evidence, not significant under city-clustered bootstrap. Few-cluster significance of the maturity step is partition- and control-set-dependent: a restricted wild cluster bootstrap gives p = 0.036 clustered on the seven cities (level-only controls; p = 0.080 with the full control set) but p = 0.16 on the twenty-four cohorts. Roma, priced through the same OMI appraisal series as Milano, is itself a within-city null whose pooled contribution runs entirely through the common-year fixed effects, and it disciplines the upper-bound reading throughout. The defensible magnitudes are per-city — foremost Milano's within-ring +167 EUR/m² (≈ +5.6%, wild-bootstrap p = 0.004). We read the delayed-to-maturity step as a cross-city pattern worth testing on longer panels, not as a settled within-city effect."
read_time: ""
date: ""
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: ""
is_premium: false
---

# When Does Metro Infrastructure Capitalize into Property Prices?

**Phase-Decomposed Difference-in-Differences Evidence from Seven European Cities**

**Ian Ronk** — Independent researcher, Amsterdam

> **Working paper / draft** — not yet peer-reviewed.

---

## Abstract

We study *when*, not merely whether, new metro lines capitalize into residential property prices. Seventeen staggered treated cohorts across seven European cities in five countries (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma) pool into a single phase-decomposed panel (*n* = 42,004), with the response decomposed into announcement, construction, opening, and maturity phases.

The pooled cross-city average locates the largest response at maturity: prices step up by **+9 to +12%** — drop-Roma to full-sample, measured as the construction-to-maturity contrast — two or more years after opening, a step that is stable across the control ladder and positive under every leave-one-city-out. The step is a pooled average, however, not a within-city fact. City-by-year fixed effects collapse it to an insignificant −0.5 log points while leaving a +2.5 log-point step at opening — a within-city contrast that is itself entity-clustered ordering evidence, not significant under city-clustered bootstrap.

Few-cluster significance of the maturity step is partition- and control-set-dependent: a restricted wild cluster bootstrap gives *p* = 0.036 clustered on the seven cities (level-only controls; *p* = 0.080 with the full control set) but *p* = 0.16 on the twenty-four cohorts. Roma, priced through the same OMI appraisal series as Milano, is itself a within-city null whose pooled contribution runs entirely through the common-year fixed effects, and it disciplines the upper-bound reading throughout.

The defensible magnitudes are per-city — foremost Milano's within-ring **+167 EUR/m²** (≈ +5.6%, wild-bootstrap *p* = 0.004). We read the delayed-to-maturity step as a cross-city pattern worth testing on longer panels, not as a settled within-city effect.

**Keywords:** transit capitalization, property prices, difference-in-differences, capitalization timing, staggered adoption, few-cluster inference, wild cluster bootstrap

**JEL codes:** R31 (housing supply and markets), R41 (transportation demand, supply, congestion), C23 (panel-data models)

---

## What the paper covers

The paper follows a deliberate build: the two cities studied in greatest depth — Milano and Amsterdam — are established as identified single-city groundwork first, and the seven-city pooled timing answer is assembled on top of them.

1. **Introduction** — the hedonic-pricing frame, the gap in the Italian literature (cross-sectional, Naples-concentrated; no peer-reviewed ex-post DiD on Milan's M5/M4), and the four contributions.
2. **Data** — OMI zone-level prices for Milano (2004–2025, area-weighted crosswalk from 2011 to 2025 zone boundaries); CBS WOZ buurt-level values for Amsterdam (2013–2022); staged treatment assignment from actual per-stop opening dates.
3. **Empirical Strategy** — two-way fixed-effects DiD, distance-band DiD, a continuous inverse-distance specification that removes the buffer-choice degree of freedom, Sun–Abraham event studies, placebo tests and rolling windows. Cluster-robust inference throughout.
4. **Results: Milano** — the cleanest single case: within-ring **+167 EUR/m²** (about +5.6%) after opening, wild-bootstrap *p* = 0.004, robust to every deletion. The within-ring contrast controls for the Porta Nuova / CityLife / Scalo Farini regeneration confound.
5. **Results: Amsterdam** — Noord-Zuid Lijn: **+69,800 EUR** per property under the ring-restricted DiD (+31,900 bare TWFE, both *p* < 0.001) — with the paper's own caveat that in log units treated buurten appreciated more slowly than the outer control ring (−4.3% to −5.5%), so the euro figure is a level gain from a 1.74× higher base, not proportional capitalization. Also home to an identification lesson: phase *levels* were unidentified because the panel starts eleven years into construction, and PanelOLS with `check_rank=False` returned pseudo-inverse artifacts with p-values of 1e-9 — fixed by estimating phase *contrasts* instead of levels.
6. **Comparative Discussion: Milano and Amsterdam** — what the two identification environments do and do not share.
7. **Robustness** — Callaway–Sant'Anna doubly-robust staggered DiD, Honest-DiD pre-trend sensitivity, restricted wild cluster bootstrap (Webb weights), leave-one-city-out, measurement-class split.
8. **Seven-City Pooled Analysis** — the headline: seventeen cohorts, four phases, the +9 to +12% maturity step, and the fixed-effects stress tests that bound what the pooled average does and does not establish. Roma is a within-city null at every phase — independently corroborated by a Banca d'Italia study using different methods — and disciplines the upper-bound reading.
9. **Limitations** — including the partition-dependence of few-cluster inference.
10. **Conclusion** — the delayed-to-maturity step as a cross-city pattern worth testing on longer panels, not a settled within-city effect.

---

## Headline results

| Estimate | Identification | Effect | Inference |
|---|---|---|---|
| Milan, Ring D (clean contrast) | Within-ring DiD on M5 | **+167 EUR/m²** (≈ +5.6%) | wild-bootstrap *p* = 0.004 |
| Amsterdam, NZL (ring-restricted) | DiD, 1.5–3 km donut dropped | **+69,800 EUR** per property (bare TWFE: +31,900) | buurt-clustered *p* < 0.001; in logs the sign flips (−4.3% to −5.5%) — level gain, not proportional capitalization |
| Pooled maturity step | Seven-city phase decomposition | +9 to +12% (construction → maturity) | *p* = 0.036 city-clustered, level-only controls; *p* = 0.080 full controls; *p* = 0.16 cohort-clustered |
| Phase decomposition | Joint Wald, entity-clustered | Mature > {Rumour, Construct, Open} | *p* = 2.0×10⁻¹² — ordering evidence only (entity-clustered, anti-conservative); formal inference rests on the few-cluster bootstrap row above |

```map
{
  "dataset": "milan-metro-rings",
  "value_field": "band_effect_eur_m2",
  "legend": "Distance-band effect (EUR/m2)",
  "tooltip": ["zone", "ring", "dist_band", "band_effect_eur_m2", "band_effect_p", "effect_eur_m2"],
  "height": 440,
  "caption": "Milan OMI zones in the M4/M5 estimation sample, colored by the estimated distance-band effect in EUR/m2 (+769 within 500 m, decaying with distance; descriptive gradient, see inference notes in the paper). Hover a zone for its ring, distance band, and estimates — treated Ring D zones also carry the +167 within-ring estimate. Zones beyond 2 km serve as controls."
}
```

One number that does *not* survive into the headline claims: under city-by-year fixed effects the maturity step collapses to an insignificant −0.5 log points, leaving a +2.5 log-point step at opening that is itself not significant under city-clustered bootstrap. The paper reports this prominently rather than burying it — the pooled step is a cross-city pattern, identified through the common-year fixed effects, and the abstract declines the strong causal reading on purpose.

---

## Paper and replication

<!-- fig placeholder: fig: paper PDF download — paper1-when/paper.pdf -->

**PDF:** full working paper — available on request while the arXiv submission is prepared.

**Replication.** Every number in the paper regenerates from committed scripts: city-level pipelines (`did_analysis.py`, `amsterdam_analysis.py`, `copenhagen_analysis.py`, `paris_analysis.py`), the pooled phase Wald test, Callaway–Sant'Anna + Honest-DiD on Milan, Ring-D leave-one-out, and the appraisal-vs-deed measurement split, then `latexmk -pdf paper.tex`. Figures and JSON results in `output/` are regenerable end-to-end.

---

## Companion post

A blog post walks through the methods story behind this paper — how a defensible fixed-effects choice erased the headline result, why rank-check overrides produce unidentified coefficients with confident p-values, and why nulls belong in the sample.

[Read the companion post →](/thoughts/when-metro-capitalizes-fixed-effects)
