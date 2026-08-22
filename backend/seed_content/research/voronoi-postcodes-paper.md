---
title: "Calibrating Free Postcode Boundaries from OpenStreetMap: A Transferable Seed-Density Accuracy Curve"
slug: voronoi-postcodes-paper
excerpt: "Free postcode boundaries built from OpenStreetMap addresses, with a calibrated accuracy curve that predicts how good they are before any reference map exists. Tested across five countries, deployed on all of Italy."
status: draft
category: working-paper
publication_status: working-paper
tags: ["voronoi", "openstreetmap", "postcodes", "geospatial", "iou", "italy", "spatial-data"]
abstract: "Postcode boundary polygons are unavailable free of charge for much of Europe: some countries publish authoritative layers, elsewhere they are sold or absent. Voronoi tessellation of OpenStreetMap address points is the natural estimator, but how many address points are needed, and whether the answer transfers across countries, has not been established. I calibrate a single OSM-Voronoi pipeline against national references in the Netherlands and Denmark (5,160 reference polygons), fit a seed-density-to-IoU curve, and test out-of-sample transfer to held-out Belgium (1,188 polygons). The asymptote is robust across functional forms (mean matched IoU saturates at 0.76–0.82), while the fitted 0.7-IoU threshold is form-sensitive (roughly 40–110 seeds); per-postcode scatter is wide (point-level R² of about 0.26), so the curve calibrates the population mean, not individual polygons. Belgium reaches mean matched IoU 0.618 at 81% coverage, near the curve. Applied to Italy, where no free authoritative intra-city postcode layer exists, the pipeline produces 4,209 estimated CAP polygons; Milan reaches mean IoU 0.783 against the community uMap reference (an earlier pipeline configuration), and the 2,903 matched single-CAP municipalities at median 19 seeds land where the curve predicts (mean IoU 0.500). A Swiss evaluation, where the asymptote falls to 0.644, marks the boundary of the regime."
read_time: ""
date: ""
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: ""
is_premium: false
---

# Calibrating Free Postcode Boundaries from OpenStreetMap

**A Transferable Seed-Density Accuracy Curve (NL, DK, BE), with Italian and Swiss Tests**

**Ian Ronk**, independent researcher, Amsterdam

> **Working paper / draft**: not yet peer-reviewed. arXiv submission in preparation.

---

## Why this exists

The gentrification modelling work on this site needed postcode-level geometries for Italian cities, and it turns out you cannot have them. Italy's 41 officially-zoned cities are divided into multiple CAP zones, but the boundary layer is sold by Poste Italiane under a per-city commercial licence; no free authoritative source exists. The same applies, with variations, to Spain, Ireland and intra-city France. Meanwhile the address *points* are abundant (OSM `addr:postcode` tags carry them in the millions), and Voronoi tessellation of those points is the established estimator for the missing polygons: it is the documented production method behind Ordnance Survey's commercial Code-Point with Polygons product; it has been run end-to-end on OSM addresses for German postcode areas with reference validation; and open implementations exist for Great Britain and Switzerland.

So the pipeline is not the contribution. What none of the prior work establishes is the question a user of such a layer actually faces: **how many address points a given accuracy requires, and whether the answer transfers across countries.** That calibration is the paper.

## What the paper does

The pipeline itself is four steps: a kNN outlier filter on the address points (flag a point whose neighbours mostly carry a different postcode), a point-level Voronoi tessellation, consolidation of cells into one polygon per postcode with fragment reassignment, and tiled country-scale runs. Each OSM address is a seed; 17.3M addresses across five countries, May 2026 snapshots.

The calibration works like this:

1. **Fit.** Run the pipeline in two countries with free authoritative references, the Netherlands (CBS PC4, 4,071 polygons) and Denmark (DAGI postnumre, 1,089 polygons), and fit per-postcode (seed count, IoU) pairs with a saturating exponential. The canonical fit (a = 0.763, b = 16.06 on 5,140 evaluated pairs) reaches IoU 0.5 at about 17 seeds and IoU 0.7 at about 40.
2. **Stress the form.** The saturating exponential is not the best-fitting family: Michaelis–Menten and Hill fit better. The choice matters for the threshold but not the asymptote: the asymptote is stable across all four forms (0.76–0.82), while the fitted 0.7-IoU crossing ranges from about 40 seeds to about 85–110. The paper reports the asymptote as a family-robust band and the threshold as form-dependent, not a point estimate.
3. **Transfer.** Belgium (bpost reference, 1,188 polygons) is held out from the curve fitting, though one Belgian tile entered the preprocessing parameter sweep, so the transfer is blind on the curve but not on the operating point. It matters that Belgium's OSM addresses are mapper-mediated rather than bulk-imported: the Dutch layer is a systematic BAG import at ~96–99% completeness, so NL is partly a test on quasi-authoritative input, and Belgium is the more demanding case.
4. **Apply.** Run the pipeline on a national Italian snapshot (3.05M addresses) and use the curve to bound expected accuracy where no reference exists.

## Headline results

| Test | Reference | Result |
|---|---|---|
| NL calibration | CBS PC4 (4,071 polygons) | mean matched IoU **0.733**, 66% of postcodes > 0.7 |
| DK calibration | DAGI postnumre (1,070 evaluated) | mean matched IoU **0.675**, 53% > 0.7 |
| BE held-out transfer | bpost (1,188 polygons) | **0.618** matched (957/1,188, 81% coverage); held-out RMSE 0.306 vs calibration RMSE 0.158 |
| IT municipal CAPs (low-seed regime) | ISTAT comuni (3,460 pairs) | **0.500** mean over 2,903 matched at median 19 seeds; RMSE vs curve 0.242, bias +0.004 |
| Milan (deployment target) | cap di milano uMap (38 polygons) | mean IoU **0.783**, median 0.798, 30/38 > 0.7 |
| CH out-of-regime | swisstopo PLZ | asymptote **0.644**, matched mean 0.549 |

Three readings I would emphasise. First, the shape transfers: Belgium lands near the curve with the same saturating slope, though held-out error is roughly double the calibration error: the per-postcode precision degrades even where the shape holds. Second, the curve extrapolates downward correctly: NL and DK are predominantly saturated (median seeds ~1,600 and ~590), so Italy's single-CAP municipalities at median 19 seeds are a regime the calibration never saw, and they land on the curve with near-zero bias. Third, the Milan headline (an earlier pipeline configuration whose parameters were originally tuned on Milan itself, so not a tuning-blind test) holds against an independent reference: scored against a cadastral-parcel CAP layer (non-OSM, so non-circular), Milan reaches 0.764, on the calibrated asymptote of 0.763, while sparser cities (Napoli at 26 median seeds, Genova at 49) fall below the curve mean, so for dense multi-CAP cities the curve is an optimistic mean, not a lower bound.

The pipeline also beats the trivial alternative everywhere: against a one-centroid-per-postcode Voronoi baseline the full pipeline gains +0.28 IoU in NL and +0.30 in DK, with smaller margins on the harder cases (+0.10 BE, +0.06 CH).

```map
{
  "dataset": "milan-voronoi-caps",
  "value_field": "iou_vs_official",
  "legend": "IoU vs reference CAP",
  "tooltip": ["postcode", "iou_vs_official", "n_seed_addresses"],
  "layers": [{ "dataset": "milan-official-caps", "label": "Community-traced CAP boundaries" }],
  "height": 460,
  "caption": "Milan's 38 estimated CAP polygons, colored by IoU against the community-traced uMap reference (mean 0.783). Toggle the reference boundaries to compare shapes directly; hover a polygon for its per-CAP IoU and seed-address count."
}
```

## What does not work, and where the claim stops

Two results I want on the record precisely because they are negative. Inverse-density power weighting (giving rural seeds larger Voronoi weights) does not improve on standard Voronoi: at most 0.5–0.6 percentage points in a narrow window, no gain at all on the Italian national run. Below saturation the binding constraint is address density, not the tessellation algorithm.

And the transferability claim is scoped, not universal. A Swiss evaluation with the same pipeline fits an asymptote of 0.644, well below the NL/DK band, against a reference layer a noise check confirms is sound (independent OSM-traced PLZ agree with swisstopo at mean IoU 0.93). Swiss postcode boundaries follow ridgelines rather than address geography, which is plausibly, not demonstrably, the mechanism. The curve is stable across three flat, high-OSM-completeness countries; Switzerland marks where that regime ends.

The honest per-polygon caveat: the curve's point-level R² is only 0.26. It predicts the population-mean reliability of an estimate, not any individual polygon, which is why every released polygon carries its seed count as a fitness-for-use flag.

## Released layers and reproducibility

Estimated postcode polygons for NL, DK, IT and CH are released as GeoJSON (ODbL 1.0, © OpenStreetMap contributors), each polygon carrying its `n_seeds` quality flag; the canonical Italian layer has 4,209 CAP polygons. Every number in the paper regenerates from committed scripts (country pipeline, curve fit with bootstrap uncertainty, Belgian hold-out, centroid baselines) against pinned May 2026 OSM snapshots. The calibration curve itself refits from a committed CSV without the ~4 GB raw archive. A Zenodo DOI and the arXiv identifier will be added here on submission.

<!-- Source notes: all numbers from paper/paper.tex (abstract, §1–§6, Tables 1–5, §Reproducibility). Discrepancy vs brief: the brief says "calibrated against official geometries in NL/DK/BE". Per paper.tex Belgium is held out from calibration (transfer test), not a calibration country; presented per the source. Brief's headline 0.783 matches paper.tex Milan mean IoU. repo_url left empty: README.md names no public repo URL (paper.tex carries "[repository URL]" placeholder). CH mean: paper Discussion also quotes 0.486 (all-evaluated); the table value 0.549 (matched mean, Table 3) is used here and labelled matched. Fact-check pass 2026-08-10: added paper's own hedges (Milan 0.783 = earlier (5,0.5) configuration tuned on Milan, not tuning-blind, per abstract + §5.4; BE partial-blindness on operating point per §3/§4.1); corrected Germany from "open implementation" to end-to-end OSM study per §1; "almost entirely" -> "predominantly" saturated per §5.1; "~4 GB" per README. -->
