---
title: 'One JSON per Published Number: the Pipeline Contract That Made Adversarial Review Cheap'
slug: metro-pipeline-one-json-per-number
status: published
date: "2026-08-11"
published_at: "2026-08-11"
excerpt: 'How a one-script, one-JSON, one-figure contract turned a full methodology overhaul of the metro capitalization paper into a single working session instead of a rewrite.'
category: explanation
tags: ["data-engineering", "reproducibility", "difference-in-differences", "metro", "pipelines", "series"]
author: Ian Ronk
read_time: ''
featured: false
is_premium: false
cover_image: ''
meta: {"series": "research-pipelines-are-production-systems", "related_research_slug": "when-metro-capitalizes-paper"}
---

*Part of the [research pipelines are production systems](/thoughts/research-pipelines-are-production-systems) series: the data-engineering post for the metro capitalization project. The research post about the results themselves is [here](/blog/when-metro-capitalizes-fixed-effects).*

---

On 12 May 2026 I sat down and demoted my own headline results. The Milan Ring D estimate (the cleanest identification of the M5 effect in the paper) had been +136 EUR/m² with three stars, and the combined Milan panel +820 with three stars. Those stars were wrong. The proximate cause was naive standard errors: I had been treating zone-level panel observations as independent draws, and the resulting p < 0.001 headlines were an artifact of the inference, not the data.

The defensible numbers, after the overhaul: Milan Ring D, regeneration-controlled, **+167 EUR/m²** (SE 52, p = 0.002, zone-clustered). The combined Milan panel went from +820 with three stars to +813 with p = 0.07: same coefficient, honest clustering, demoted below the line. Amsterdam failed differently: the full-sample estimate of +31,900 EUR per property was sitting on a contaminated control set, and the ring-restricted correction landed at **+69,800 EUR per property** (SE 12.7k, p < 0.001), a levels estimate the paper is careful not to read as proportional capitalization, since the same panel in logs runs slightly negative. And an Amsterdam anticipation claim I had been fond of was retracted outright: β = −0.1, p = 0.997. Not weakened. Retracted.

This post is not about the econometrics: that story is in the research post. It is about why the overhaul took one working session instead of three weeks, which comes down to one architectural decision made early: **every number that appears in the paper is produced by exactly one script, which writes exactly one JSON artifact, which feeds exactly one figure or table.** When an adversarial review lands (including the one you run against yourself), the cost of re-estimating everything is the cost of re-running scripts, not the cost of archaeology.

## The contract

At the time of the overhaul the project was a four-city difference-in-differences study of metro capitalization: Milan (M4/M5, on the OMI semestral panel 2004–2025), Amsterdam (Noord/Zuidlijn, on CBS WOZ values), Copenhagen (Cityringen, on Boliga deed data), Paris (Grand Paris Express, on geo-DVF). The pooled panel has since grown to seven cities: Helsinki, Rennes and Rome joined later. Different registries, different measurement instruments, one harmonised panel layer, one paper.

The lab journal keeps a table with one row per published result, and each row names three files:

| Result | Script | JSON artifact | Output |
|---|---|---|---|
| Milan Ring D, regen-controlled | `ring_d_milano.py` | `data/ring_d_milano.json` | `output/milano_ring_d.pdf` |
| Milan 0–500 m band gradient | `continuous_distance_milano.py` | `data/continuous_dist_milano.json` | `output/milano_continuous_dist.pdf` |
| Milan CS + Honest-DiD | `cs_honestdid_milano.py` | `data/cs_milano_results.json` | `output/milano_cs_honestdid.pdf` |
| Milan TWFE + controls | `twfe_with_ovs_milano.py` | `data/twfe_ov_milano.json` | – |
| Amsterdam ring + anticipation | `twfe_with_ovs_amsterdam.py` | `data/twfe_ov_amsterdam.json` | – |

The paper compiles from that contract. Reproducing it is a fixed block of script invocations (the per-city analyses, the pooled Wald test, the CS/Honest-DiD sensitivity run, the leave-one-out pass, the measurement split) followed by one `latexmk` call. No notebook state, no "run cells 3 through 11 but skip 7", no number that exists only in a terminal scrollback from March.

Two properties of this setup did the actual work on 12 May.

**First, the JSON layer separates estimation from presentation.** The scripts own the statistics; the figures and the LaTeX own nothing but formatting. When the inference changed, the blast radius was the scripts. Everything downstream regenerated.

**Second, deprecation instead of deletion.** The original analysis script, `did_analysis.py`, still exists in the repo with its naive-SE output, flagged in the code map as legacy and *not authoritative*. Its numbers are the "before" column in the correction story, and keeping them runnable is what makes the correction auditable rather than merely asserted. If someone wants to verify that naive standard errors were the proximate cause of the false headlines, the script that produced them is one command away.

## What one session bought

The overhaul itself was seven decisions, recorded in the handoff note the same day:

1. Cluster-robust standard errors everywhere: the fix for the false p < 0.001s.
2. Callaway–Sant'Anna for the staggered design: Milan has six treatment cohorts, and plain two-way fixed effects is Goodman-Bacon biased in that setting.
3. Honest-DiD sensitivity, reported as a breakdown value M̄, replacing an ad hoc battery of placebo regressions with a single robustness number per specification.
4. A continuous-distance kernel, 1/(d+0.5)·post, replacing the binary 500 m buffer.
5. Hand-coded omitted-variable regressors: seven Milan regeneration projects and Amsterdam's construction window.
6. A ring restriction for Amsterdam, dropping the contaminated 1.5–3 km donut.
7. The anticipation retraction.

The overhaul did not uniformly shrink the results. The Amsterdam correction ran the other way: removing contaminated controls via the ring restriction nearly doubled the point estimate, from the full-sample +31,900 to the defensible +69,800. Broken pipelines do not systematically flatter you; they are just wrong in directions you have not measured.

The Honest-DiD numbers are the part I would defend hardest, because they replaced volume with a contract of their own. Instead of a dozen placebo regressions of varying persuasiveness, each specification now carries one breakdown value: the Milan combined panel sits at M̄ ≈ 0 (it fails: any pre-trend violation kills it), the Amsterdam ring above 2 (very robust). Ring D is the honest exception: at sixteen zones the per-horizon breakdown is too imprecise to be informative (it collapses to ≈ 0 at most horizons), so the Ring D headline is defended by a wild cluster bootstrap on the coefficient itself, which holds at p = 0.004. One number per spec where the design can support one, produced by the same script that produces the estimate, written into the same JSON.

## The failure that had nothing to do with statistics

The second failure story is about a data source that deletes itself.

The Italian revenue agency runs a free portal, Consultazione Valori Immobiliari Dichiarati, that returns per-deed transaction data (price, surface, deed type, month, OMI zone) behind a SPID login. It is the only free route to Milanese deed-level microdata; I checked Kaggle, GitHub, Zenodo, OSF, Dataverse and Figshare, and nobody has ever published a Compravendite-derived dataset, because the portal's k-anonymity threshold and login wall have been effective.

The catch is the window: a **five-year rolling window that rolls forward monthly**. The oldest month drops and is lost forever. As of May 2026 the visible range was mid-2021 to the present, which means M5's staged opening (2013–2015) is invisible, permanently, while M4's three stages (November 2022, July 2023, October 2024) sit inside the window with usable pre- and post-periods.

That constraint had two pipeline consequences. The strategic one: on 16 May 2026, Paper 2 pivoted to Paris-primary, because the year-by-year event study is simply unidentified on Milan's public data surface until a bulk microdata request comes through. The engineering one is the more transferable lesson: **when the upstream is destructive, the snapshot is the first task, not the last.** The scraper (`scrape_compravendite.py`, plain `requests` against a reverse-engineered JSON endpoint, 0.6-second sleeps, roughly 700 queries, about ten minutes wall-clock) writes to a date-stamped directory (`data/compravendite_snapshot_YYYY-MM-DD/`) precisely so that the archive is frozen and citable even if the analysis happens months later. Every week of delay costs a week of history that no amount of later diligence recovers. The window had already eaten M5's treatment period before I got there; the snapshot-first rule is what that cost.

## Robustness as infrastructure, not as a chapter

After the paper drafted, I ran a structured gap audit against it: not "is what the paper claims correct" (two peer-review rounds covered that) but "what will a careful reader ask that the paper doesn't answer", each item tagged CRITICAL, MAJOR or MINOR. The striking thing about the resulting punch list is how much of it compiles down to *new scripts against existing artifacts*.

Leave-one-out on Ring D is the clean example. Ring D has eight treated zones; the standard small-sample worry is that one zone drives the whole +167. The audit tagged this MAJOR and noted, correctly, that it is mechanically cheap to run from the existing artifacts, so `leave_one_out_ringd.py` now sits in the reproduce block with its own row in the results table. The same applies to the appraisal-versus-deed split (`measurement_class_split.py`): the panel mixes two measurement instruments (assessed values in Milan, Rome and Amsterdam, deed prices in Copenhagen, Paris, Rennes and Helsinki) and the audit's deepest measurement item asks whether the pooled estimate depends on which subset. Both rows read TBD in the journal when the audit landed; both slots have since been filled: all eight leave-one-out estimates stay positive and significant, so no single zone carries Ring D, and the split's appraisal-only and deed-only pools agree in sign and bracket the pooled estimate between them. The point of the architecture is that filling a slot is a half-day, not a month.

The control structure works the same way. The Milan design carries fourteen named never-treated suburban municipalities as pure controls, plus eight in-Milano zones near the older M1/M3 lines that are *present but off by default*, behind an explicit `--include-existing-metro-controls` flag: they are weaker controls, already treated by old metro lines, and the flag makes that judgement a recorded, reversible run-time choice instead of a silent hard-coding.

## What the contract does not fix

Honesty requires the other column. The Callaway–Sant'Anna bootstrap confidence interval on the Milan overall ATT is [−332, +1834]: useless, because 38 zones is 38 zones, and no artifact discipline manufactures statistical power. The event study's k = −1 coefficient of +129 lands in 2012, six years after the project's 2006 approval, so the "pre-trends violation" may in fact *be* the announcement-anticipation signal, an identification question no pipeline resolves. And the audit's top-ranked gap, metro routing endogeneity, is a limitation to be argued in prose, not a script to be added.

A contract between scripts and paper makes review cheap. It does not make conclusions right. Those are different products, and confusing them is its own failure mode.

## Takeaways

- **One script, one JSON, one figure.** When every published number has exactly one producer, a methodology overhaul is a re-run, not a reconstruction. The 12 May correction (new estimator, new inference, one demotion, one retraction) fit in a session because of this and nothing else.
- **Deprecate, don't delete.** The naive-SE script stays in the repo, flagged non-authoritative. The before/after story (+136 → +167; +820 → +813) is only verifiable because both sides still run.
- **Snapshot destructive upstreams first.** A rolling window is a deadline attached to your data. Date-stamp the archive directory and scrape before you analyse.
- **Ship the robustness battery as scripts, not as a chapter.** An adversarial audit is cheap to answer when its punch list maps onto re-runnable slots in a results table, and honest TBD rows beat a battery that exists only in the limitations section.

<!--
SOURCE DISCREPANCY NOTES (updated after adversarial fact-check against papers/paper1-when/paper.tex, which outranks the notes):
1. City count RESOLVED: paper.tex (current, authoritative) is a SEVEN-city, five-country study (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma; 17 cohorts, n = 42,004). The May-era notes (LAB/HANDOFF, audits) describe the earlier four-city state. Post now scopes the four-city description to "at the time of the overhaul" and names the later expansion. The 17 GB figure remains unsourced in every file checked: still omitted.
2. Brief's "poisoned routing cache" failure story appears in NO source (notes, audits, or paper.tex). Omitted; substituted the source-supported destructive-rolling-window story (HANDOFF.md §5/§5b).
3. Brief's "naive SEs faked 2–7x precision": no source states a 2–7x multiplier. paper.tex documents the combined-panel SE rising by a factor of ~5 under clustering; the 2–7x range claim stays omitted.
4. Wild cluster bootstrap: gap audit B5/F1 flagged it NOT executed, but that audit (2026-05-16) is superseded: paper.tex executes it (scripts/wild_bootstrap_milano.py; Ring D p = 0.004, 0–500 m band p = 0.10, Webb bootstraps on the pooled step). Post now cites the Ring D bootstrap.
5. Amsterdam before-number RESOLVED per paper.tex: the pre-correction full-sample estimate is +31,900 (paper: "+31.9k → +69.8k", near-doubling via ring restriction; contamination, not naive SEs, is the mechanism). The +36,400 *** in the LAB/HANDOFF headline tables is not corroborated by the paper and was removed. Paper also caveats +69,800 as a LEVELS object (same panel in logs ≈ −4.3%); caveat added to the post.
6. Leave-one-out and measurement-split are TBD in LAB.md but EXECUTED in paper.tex (LOO: eight estimates all positive/significant, range [+0.0358, +0.0494] vs baseline +0.0432; split: appraisal-only +0.157, deed-only +0.060, pooled +0.1195 sits between). Post updated from "open slots" to "slots since filled".
7. Ring D Honest-DiD M̄ ≈ 1.4 (LAB/HANDOFF) is superseded by paper.tex: the per-horizon Ring D breakdown collapses to ≈ 0 (16 zones, too imprecise); the paper defends Ring D via the wild cluster bootstrap instead. Post corrected accordingly.
-->
