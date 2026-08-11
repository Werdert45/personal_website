---
title: "Parameters belong in the schema, not the filename"
slug: parameters-belong-in-the-schema
status: published
category: explanation
tags: ["data-engineering", "orchestration", "reproducibility", "provenance", "series"]
excerpt: "A pre-arXiv audit found the paper and its artifacts disagreeing about which hyperparameters produced the headline number — and nothing in the data model could settle it."
read_time: ""
date: "July 2026"
featured: false
is_premium: false
author: Ian Ronk
cover_image: "/blog-figures/parameters-belong-in-the-schema/f04_1_provenance.png"
meta: {"series": "research-pipelines-are-production-systems", "series_part": 5, "series_total": 5}
---

# Parameters belong in the schema, not the filename

*Voronoi postcodes — data-engineering case study, chapter: the audit blocker*

On 19 July 2026, during a pre-arXiv audit of my postcode-boundaries project, I found blocker number one. The manuscript said the Netherlands and Denmark validation runs used the tuned operating point (3, 0.3) — k=3 for the kNN outlier filter, τ=0.3 — because that is what the grid search had selected. The committed result files were from the frozen legacy run at (5, 0.5). The calibration curve and the Belgian transfer test, two of the paper's central results, were built on a mix of operating points that the text nowhere disclosed.

The uncomfortable part is not that the two disagreed. It is that nothing in the data model could contradict either of them. The paper made a claim about provenance; the CSVs made a different one; and the only place the truth lived was a filename suffix and my memory of which script had been run when.

## How two operating points came to exist

There was nothing improper about having two. The early work was a single-city run: Flow A/B on a Milan dump of 33,476 OSM addresses, filtered at (5, 0.5), scored against a community-traced reference. That run produced the headline mean IoU of 0.783, and it was deliberately frozen — the canonical committed artifact, never re-run.

Later, a proper operating-point sweep arrived: a 3×3 grid over (k, τ) on one tile each for NL, BE and IT. On all three countries the grid maximum was (3, 0.3). The Italy national run — 4,209 released polygons — was executed at the tuned point, with `--out-suffix _tuned` to keep its outputs apart from everything else. So far, defensible: a legacy headline at one operating point, a tuned national release at another, both documented in the run commands.

The failure was in the middle. The NL and DK country validation runs — the inputs to the calibration curve — had been produced earlier at the legacy (5, 0.5), and they stayed that way. The manuscript, written later and from memory of what the pipeline "does now", described them as tuned runs. Between the writing and the artifacts there was no mechanical link at all.

## The data model that couldn't say no

The core results relation in this project is a per-postcode IoU row, conceptually keyed on (country, postcode, operating point). Only the postcode is a real column. The other two keys are a filename convention: `iou_results_country_NL.csv` names the country, no suffix means the frozen legacy (5, 0.5) run; `_tuned` means (3, 0.3); `_untiled_*` marks the Belgian tiling controls. The rows themselves carry the postcode, an `iou` and a match status — no k, no τ, no run identifier.

Downstream, the curve-fitting script reads `iou_results_country_{NL,DK}.csv` by name — the unsuffixed files. The pooled NL+DK fit (asymptote a=0.7633, b=16.06) and the Belgian hold-out built on it (957 matched postcodes, RMSE 0.306, bias +0.071) therefore inherit whatever operating point those particular files happen to contain. The script does not know, and cannot check, that this matches what the paper says. A filename suffix is a claim made once, at write time, by whoever typed the command. A column is a claim carried by every row, joinable, queryable, and checkable against the manuscript by a script rather than by me squinting at a directory listing at 11pm.

I want to be precise about the mechanism, because it is boring and that is the point. Nobody overrode a config or fat-fingered a flag. The convention worked exactly as designed; it just had no way to push back when the prose drifted away from the artifacts. Filename-encoded provenance fails open.

## Why not just re-run everything at (3, 0.3)?

The tempting fix — re-run NL and DK at the tuned point so the artifacts match the claim — is the one I refused, and the refusal is itself a data-engineering position. Two artifact families in this pipeline are never recomputed: the frozen legacy NL/DK CSVs and the Milan headline run. Voronoi construction has tie-breaking nondeterminism — enough that a re-export can nudge published numbers. That is why polygon releases go through a separate script from validation in the first place: so a re-export can never overwrite a frozen, cited CSV. Re-running the validation to launder a provenance mismatch would have replaced a documented inconsistency with an undocumented one.

So the fix that shipped was the honest, cheap one: relabel the paper to say what actually ran — the calibration inputs are legacy (5, 0.5) runs; the Italy release is tuned — and document the suffix convention and the split explicitly in the scripts README. No heroics, one afternoon, and a paper that now describes its own artifacts correctly. The durable lesson cost more, because I had to notice it was a lesson.

## The same failure class, twice more

If the suffix incident were an isolated fumble I would not be writing a chapter about it. But the project had already produced the same shape of failure once, and would produce it again.

On 29 May 2026 I found that the curve scripts were pooling NL, DK *and* CH while the paper said the fit was NL+DK. Removing the contamination moved the asymptote from 0.745 to 0.763, and a cascade of downstream numbers had to be regenerated — the calibration RMSE among them, 0.195 to 0.158. Then, in the pre-release review of 5 August, the pooled fit had quietly drifted back to NL+DK+CH (n=8,281) — the second occurrence of the identical contamination class. It is now guarded in-script, and the fit JSON records a `fit_on` field naming exactly which countries fed it.

All three incidents share one anatomy: a prose claim about which data or parameters produced a number, with no machine-readable record binding the number to its inputs. Vigilance caught each one, eventually, in review passes. I do not find that reassuring. A lineage check — which CSVs feed which fit JSON, which operating point sits in which rows — would have caught all three mechanically, on every run, without requiring anyone to be sharp on a particular Tuesday.

## Parameters as columns

The schema-first version is not sophisticated. The results relation gains two columns, `k` and `tau`, populated by the run script from its own arguments — the one place the true values are guaranteed to exist. Every artifact gets one lineage record: input files, parameters, code version, run id. Aggregate JSONs name their inputs, the way `fit_on` now does. Under that model, the audit question that cost me a blocker — *which parameters produced the headline IoU, and do the calibration inputs match the manuscript?* — becomes a join and a comparison, not an archaeology session across filenames, a README, and my recollection of July.

Pieces of this now exist. The DuckDB warehouse added to the ingestion layer this August lands every raw snapshot with a `batch_id`, so run lineage is a column from the first table onward; the QA gate checks exact pinned row counts per country rather than trusting that ingestion happened once. The results zone has not been migrated — the frozen CSVs stay frozen, suffixes and all, because they are cited. For a v2 refresh service the posture would be: parquet everywhere, parameters in rows from the start, and a diff gate that compares freshly generated summary JSONs against the published numbers before anything is allowed to ship.

## The general claim

I will keep the conclusion at the size the evidence supports. In one medium-sized research pipeline, three provenance failures reached or nearly reached a paper, and all three had the same cause: metadata that existed only in filenames, prose, or intent. The fix in each case was to move one fact — an operating point, a country list — from convention into schema, where a query can check it. A column costs nothing at write time. The suffix cost me an audit blocker, and it would happily have cost more if the audit had been less paranoid. The goal is an audit that finds nothing because there is nothing left for it to find by hand.

<!--
Source notes:
- No conflicts found between the brief and DATA_ENGINEERING.md on any number; brief's "(5, 0.5) vs (3, 0.3), blocker #1, ~line 211" matches source lines 211-217.
- Fact-check corrections (2026-08-10): committed iou_results_*.csv actually carry only (postcode, iou, status) — country is filename-encoded too, and seed/outlier counts live in summary JSONs / nl_dk_seeds_iou.csv, contra DATA_ENGINEERING.md line 116; 0.158 is the calibration-fit RMSE per paper.tex (the transfer RMSE is 0.306); "consolidation sensitive to fragment ordering" and "anything new lands with params in rows" were unsupported and removed.
- Source says the shipped fix was relabelling the paper + documenting the split in scripts/README.md; the schema-columns fix is stated in the source as the "durable lesson" and the v2 posture ("params in rows", lines 217, 284-286), and the body presents it that way rather than as an implemented migration.
- meta.series_total bumped to 5 for this fifth chapter; the four existing series posts still carry series_total 4 and would need a matching bump when this publishes.
- Cover image path is a placeholder consistent with the series' /blog-figures/<slug>/fNN_* convention; figure not yet created.
-->
