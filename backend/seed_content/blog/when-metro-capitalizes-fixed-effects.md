---
title: 'Seven Cities, 42,000 Observations, and a Headline That Hung on One Modeling Choice'
slug: when-metro-capitalizes-fixed-effects
status: published
published_at: 2026-06-10
date: "2026-06-10"
excerpt: 'A phase-decomposed DiD across seven cities, and how one fixed-effects specification choice moved the headline result.'
category: explanation
tags: ["difference-in-differences", "fixed-effects", "econometrics", "housing-markets", "metro", "italy"]
author: Ian Ronk
read_time: ''
featured: false
is_premium: false
cover_image: ''
meta: {"related_research_slug": "when-metro-capitalizes-paper"}
---

*I pooled seven European metro projects to find out when new lines show up in house prices. The answer was +12%. Then I changed the fixed effects (defensibly) and it became zero. This post is about what that taught me about spatial econometrics.*

---

Everyone agrees that metro stations raise nearby property values; the literature has spent thirty years converging on premiums somewhere between roughly zero and fifteen percent. What it mostly cannot tell you is *when* the money arrives: at the announcement, during construction, at opening, or years later. For a city planning to finance a line by taxing the uplift, the timing is the whole game: a betterment levy collected at opening is worthless if the appreciation shows up two years later.

So I built a panel to answer it: seven European cities (Milan, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Rome), 42,004 neighbourhood-year observations, seventeen staggered station cohorts, every project decomposed into announcement, construction, opening, and maturity phases.

The headline came out clean: on the pooled average, prices step up **9 to 12%, but only two or more years after opening**. Stable across the control ladder. Positive when you drop any single city. A satisfying, policy-ready number.

Then I ran one more specification, and the step disappeared entirely.

This post is about that specification, and why the most dangerous numbers in spatial econometrics are the ones that survive every test you thought to run.

## Two questions wearing one regression

The workhorse design here is two-way fixed effects: every neighbourhood gets its own intercept, every year gets its own intercept, and the phase dummies pick up what is left. The year effects are *common*: one shock per year, shared by Milan and Helsinki alike.

That sounds innocuous. It is not. With common year effects, a treated neighbourhood in Milan is implicitly compared against untreated neighbourhoods *everywhere*, including cities whose entire housing markets are on different trajectories. If treated cities happen to boom late in the sample for reasons unrelated to metros, that boom flows into the "maturity" coefficient.

The alternative is city-by-year fixed effects: absorb each city's entire annual price path, and identify the effect only from treated-versus-untreated gaps *within the same city and year*. It costs you statistical power and any effect that operates city-wide. It is also, for the question "did the metro raise prices in the neighbourhoods it touched," clearly the more honest comparison.

Under city-by-year effects, the +9 to +12% maturity step collapses to a precise nothing (−0.5 log points, p = 0.66). What survives instead is a small **+2.5 log-point step at opening**, with partial reversion afterwards. And even that step, once I ran it through the same few-cluster bootstrap discipline as the headline, turned out to be a pattern rather than a significant estimate.

Neither regression is wrong. They answer different questions. The pooled cross-city average says: places that build metros see prices rise late, partly on city-wide tides that common year effects cannot separate from the treatment. The within-city contrast says: the neighbourhood-level premium is smaller and arrives at opening. The mistake, the one I nearly shipped, is letting the first number wear the second number's interpretation. "Metros raise nearby prices 12% at maturity" is precisely the within-city claim, and it is precisely the claim the data rejects.

## Seven clusters is where inference goes to die

The second lesson is about standard errors, and it bites anyone doing policy evaluation where treatment is assigned at the level of a city, a region, or a school district.

Treatment here varies at the city level, and there are seven cities. Clustered standard errors are asymptotic in the number of clusters; at G = 7 the asymptotics are a polite fiction. The remedy is the restricted wild cluster bootstrap with Webb weights: impose the null, resample signs at the cluster level, and let the bootstrap distribution replace the broken asymptotics.

Fine. But the bootstrap forces a question the asymptotics let you dodge: *what is a cluster?* Cluster on cities and the maturity step's p-value is 0.036. Cluster on the twenty-four cohort blocks (the seventeen treated city-by-opening-cohort cells plus the seven never-treated per-city blocks, also a defensible partition, arguably closer to the assignment level) and it is 0.164. Same coefficient, same data, significant or null depending on a choice that reasonable referees disagree about.

There is no trick that resolves this. The honest move is the only move: report both partitions, say which one you find more defensible and why, and let the headline carry the ambiguity. One of the quiet findings of this project is how rarely published transit-capitalization studies with a handful of treated cities report any of this at all.

## The footgun with a paper trail

One more confession, because it is the most transferable bug in the paper. Amsterdam's price panel starts eleven years into the metro's construction. Every treated neighbourhood is therefore in some treatment phase in every observed year, and the phase dummies sum to a constant that the neighbourhood fixed effects absorb. The phase *levels* are simply not identified. There is nothing to estimate.

The estimator did not care. `PanelOLS` with `check_rank=False` returned coefficients anyway (pseudo-inverse artifacts, the minimum-norm solution to an unanswerable question) wearing p-values of 10⁻⁹. They sat in the results table looking like the strongest findings in the paper, and they survived an embarrassing number of read-throughs, because nothing about a confident point estimate announces that it is unidentified.

The fix is standard once you see it: estimate *contrasts* between phases, which are identified, rather than levels, which are not. The lesson is blunter: a rank-check override is a loaded weapon, and software that fills identification holes with plausible-looking numbers will let you publish the holes.

## What actually survived

After the full stress battery (control ladders, leave-one-out, pre-trend sensitivity bounds, both bootstrap partitions, an appraisal-versus-deed measurement split), here is what I am willing to stand behind:

- **Milan** is the cleanest single case: +5.6% within-ring after opening, robust to every deletion. As far as I can verify there is no peer-reviewed ex-post difference-in-differences estimate for the M5/M4 openings before this one; the numbers that circulate come from ex-ante hedonic work and earlier non-peer-reviewed analyses, including earlier drafts of this project.
- **The within-city pattern** is a modest step at opening, not a delayed boom. The delayed +9 to +12% is real as a *cross-city average* (a fact about cities that build metros), but it is not a neighbourhood-level capitalization effect.
- **Rome is a null at every phase.** Same instrument, same pipeline as Milan; nothing. A Banca d'Italia study using entirely different methods independently corroborates it. The nulls are half the message: Rome and Helsinki show what its absence looks like. And Copenhagen's condo series points negative after opening, a result the paper flags as plausibly compositional rather than a metro disamenity. An uplift-financed business case assumes an uplift; three of seven cities show no sign of one.

And the meta-result, the one I keep relearning: across this project, the right-hand-side choices (fixed-effects structure, clustering partition, ring width, estimator) moved the headline more than the data did. The paper ships the full lattice of those choices, with every number regenerable from committed scripts, because the alternative is choosing the cell with the best p-value and calling it the finding.

## Key takeaways

- **Common year effects answer a different question than unit-by-time effects.** Decide which question is yours *before* you see which answer is bigger. The gap between them is itself informative: here it is the entire headline.
- **With few clusters, the inference is a choice, not a computation.** Wild cluster bootstrap, yes, but report every defensible clustering partition. If significance is partition-dependent, that is a result, and hiding it is the same as fabricating precision.
- **Identification failures do not announce themselves.** Estimators with rank-check overrides return confident numbers for parameters the data cannot speak to. If a coefficient's identification depends on your panel window, check the rank by hand.
- **Let nulls into the sample and keep them there.** Rome joined the panel after its outcome was knowable, which is exactly why dropping it later would have been selection on the dependent variable. It stayed; it reshaped the paper; the paper is more credible for it.

The full estimates, robustness checks and inference details are in [the working paper](/research/when-metro-capitalizes-paper). If you work on transit capitalization, or you have been burned by a fixed-effects choice of your own, I would like to hear which specification you would have led with.

<!-- Links to the working paper and replication repo come from the related research entry (when-metro-capitalizes-paper); do not hardcode URLs before publishing. -->
