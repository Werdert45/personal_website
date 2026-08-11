---
title: "What €167 per Square Metre Buys: Milan's Lilac Line, Ring by Ring"
slug: milan-metro-m5-what-167-euros-buys
status: draft
category: case-study
tags: ["metro", "milan", "difference-in-differences", "housing-markets", "urban-research", "italy"]
excerpt: "Milan's M5 raised nearby property prices by about 5.6% — but only after untangling the metro from Porta Nuova, CityLife, and everything else Milan was building at the same time. Rome, on the same data, got nothing."
read_time: ""
date: ""
featured: false
is_premium: false
author: Ian Ronk
cover_image: ""
meta: {"related_research_slug": "when-metro-capitalizes-paper"}
---

Milan's M5 — the Lilla, the lilac line — opened in three instalments: seven stops from Bignami to Zara in February 2013, two more to Garibaldi in March 2014, and the final ten out to San Siro in April 2015. Somewhere in the decade since, the neighbourhoods around those stations became more expensive. The question I spent a large part of a paper on is: how much of that was the metro?

My best answer is +167 euros per square metre — about 5.6% of the average control-zone price. Getting to that number was not mostly a story about metros. It was a story about everything else Milan was building at the same time, and about how close I came to publishing a number that was really measuring Porta Nuova.

This is the single-city deep read. The cross-city version of this project — seven cities, and a headline that moved with one fixed-effects choice — has [its own post](/blog/when-metro-capitalizes-fixed-effects), and I will not retell the methods story here.

## The data: 38 zones, 22 years

Italy has a quietly excellent public data source for this: the Osservatorio del Mercato Immobiliare (OMI), published by the national revenue agency, which reports average residential prices in euros per square metre for every appraisal zone in the city. Milan has 43 of these macro-zones on current boundaries; 38 of them have at least 15 years of coverage and form the panel, running 2004 to 2025. Twenty-two years — enough to see prices before anyone had ridden the M5, and a decade after.

A zone counts as treated if it lies within 500 metres of a new M5 or M4 stop, using the actual staged opening dates rather than a single line-opening year. In the 38-zone sample that gives 24 treated zones (16 for M4, 8 for M5) and 14 controls.

The design is a difference-in-differences: each zone is compared with its own history, treated zones against untreated ones, so anything fixed about a neighbourhood — centrality, housing stock, a century of sorting — drops out. What does not drop out is anything that *changed* at the same time as the metro. Hold that thought.

## The number you would get if you weren't careful

Run the obvious regression — all zones, both lines, one post-opening indicator — and you get +820 euros per square metre with a p-value under 0.001. That number is wrong twice. Cluster the standard errors properly at the zone level and the p-value collapses to 0.07. Worse, the specification mixes six staggered opening cohorts from two different lines, which is exactly the setting where a plain two-way fixed-effects estimate becomes a blend of clean and contaminated comparisons: a Callaway–Sant'Anna decomposition puts the largest cohort (the 2024 M4 stage, 11 zones) at −30 euros per square metre, not significant, while a single-zone 2014 cohort carries an implausible +2,702. The paper keeps the +820 only as a cautionary benchmark.

## Ring by ring

Sort the zones by distance to the nearest new stop instead, and a cleaner picture appears. Within 500 metres of a station: +769 euros per square metre. From 500 metres to a kilometre: +283. From one kilometre to a kilometre and a half: +59, statistically nothing. The effect is real near the stations and gone within about 20 minutes' walk — the same decay shape the international literature has found from Atlanta to Singapore.

One honest caveat before anyone quotes the +769: it rests on a handful of treated zones, and under the stricter bootstrap inference the paper applies throughout, its p-value is 0.10. I treat the gradient as descriptive — it tells you *where* the effect lives, not a magnitude I would defend on its own.

## The confound that nearly poisoned everything

Here is the problem with studying Milan in the 2010s: the M5 was not the only thing happening. Porta Nuova was turning rail yards into the city's new skyline. CityLife was replacing the old fairgrounds with towers by Hadid, Libeskind, and Isozaki. Scalo Farini, Symbiosis, MIND, Cascina Merlata, Scalo Romana — the city ran a decade-long regeneration programme, and several of those sites sit close to new metro stations, on purpose. Lines get routed where cities expect development.

For a difference-in-differences design this is close to a worst case: a price shock that switches on at roughly the same time, in roughly the same places, as the treatment. The paper carries a hand-coded covariate for it — a zone counts as regeneration-exposed in a given year if its centroid falls within 800 metres of one of those active projects.

How much does it matter? In Ring C — one band of OMI's concentric zone structure — including the two regeneration-exposed zones puts the estimated M5 effect at +1,696 euros per square metre. Exclude those two zones and it flips to −160. The entire apparent metro effect in that ring was Porta Nuova and its neighbours, wearing a metro costume. If I had published a city-wide number without confronting this, a large share of it would have been regeneration capitalization mislabelled as transit capitalization.

## The within-ring contrast

The fix is to stop comparing centre with periphery at all. OMI's Ring D is the suburban band: 16 zones, all at comparable distances from the centre, of which 8 are within 500 metres of an M5 stop and 8 are not. Same kind of housing, same kind of distance from the Duomo, same exposure to city-wide tides — differing, mainly, in whether the lilac line arrived. That restriction gives up most of the sample (352 observations) in exchange for a comparison I can defend.

The bare within-ring estimate is +139.5 euros per square metre (p = 0.011). Add the regeneration covariate and the M5 effect *rises* to +167 (p = 0.002), while the regeneration covariate itself comes in at +129 — significant in its own right. That direction of travel is worth pausing on: controlling for the confound sharpened the metro estimate rather than killing it, because within Ring D the regeneration exposure sat partly on control zones.

Because 16 zones is few enough that conventional clustered inference over-rejects, the paper re-tests the +167 with a restricted wild cluster bootstrap: p = 0.004, with a 95% interval of +62 to +280. Dropping each of the eight treated zones in turn moves the estimate only within a narrow band — no single zone carries it. Of the Milan results, this is the one I am willing to stand behind, and as far as I have been able to verify, no peer-reviewed ex-post difference-in-differences estimate for the M5 opening exists — prior Milan evidence is ex-ante hedonic work, press-reported agency figures, and earlier non-peer-reviewed numbers (including earlier drafts of this project).

Two texture notes. First, the effect is a level shift, not a widening gap: treated and control zones track each other after opening, just at a new distance. Second, the pre-opening years show close-to-station prices *falling* slightly relative to controls — consistent with construction disturbance, closed streets and displaced parking — which runs opposite to the post-opening jump. If anything, that makes the +167 conservative.

And the timing, within Milan: the construction-phase price differential is a precise zero (+0.010 log points, p = 0.70), the opening phase steps up (+0.106, p = 0.062), and the maturity phase, two or more years after opening, consolidates further (+0.172, p = 0.045). The market did not price the Lilla while the tunnels were being dug. It paid on delivery, and kept paying as the line bedded in.

## Rome, or what happens when you assume the uplift

Here is the part I find most useful, and it is a null result.

Rome's Metro C opened in three tranches — 2014, 2015, 2018 — over the same period, and it can be studied with the *same instrument*: the same OMI appraisal series, the same 500-metre treatment rule, the same pipeline, run over 232 Roman zones. The result is nothing at every phase. Construction: +0.006 log points (p = 0.73). Opening: −0.013 (p = 0.66). Maturity: −0.020 (p = 0.59). The simple post-opening estimate is slightly negative and insignificant. A Banca d'Italia working paper using a different method and a different outcome source finds a significant *negative* suburban effect of roughly −137 euros per square metre; the shared finding across the two studies is the absence of positive capitalization.

There are plausible reasons, and the paper does not adjudicate between them: Metro C serves Rome's low-density eastern periphery rather than a core corridor; the line's credibility was weak for most of the window — under construction since 2007, repeatedly delayed, unconnected to the rest of the network until the San Giovanni interchange opened in 2018; and Rome's coarse zones may dilute whatever localised response exists.

But the practical lesson does not depend on which explanation is right. Value-capture finance — betterment levies, land-value taxes earmarked to a line, uplift-backed borrowing — starts from the premise that the uplift exists. Milan and Rome are the same country, the same data source, the same decade, the same estimator, and one of them produced +167 euros per square metre while the other produced zero. Whatever generated Milan's premium, it is not a law of physics that travels with the tunnel-boring machine. A business case that assumes Milan's number should be able to say why it will not get Rome's.

## An open invitation

Two cities on one instrument is a contrast, not a distribution. The wider project now pools seven European cities, and the binding constraint at every step has been data: long sub-municipal price panels that start well before a metro was announced are rare, and each one added makes both the estimates and the inference honestly stronger.

So: if you work on a city with a recent or imminent metro opening and know its price data — an appraisal series, a deeds register, an assessment panel at neighbourhood grain with a decent pre-period — I would like to hear about it, and there is a co-authorship conversation to be had for the right panel. The pipeline is built; the Milan and Rome results above came out of it unchanged except for the inputs. The working paper and replication code are linked below.

<!-- Links to the working paper and replication repo come from the related research entry (when-metro-capitalizes-paper); do not hardcode URLs before publishing. -->

<!-- Source notes: all quantitative claims from /Users/ianronk/Projects/blogs/italian-metro/papers/paper1-when/paper.tex (Milano data/results/robustness sections; Roma per-city paragraph in the pooled section). No numerical conflicts found between the brief and the source: the brief's "+139.5 -> regen-controlled +167" matches the paper's +139.5 and +166.7 (rounded to +167 throughout the paper itself); +5.6%, wild-bootstrap p = 0.004 match. The co-author invitation register follows italian_metro_coauthor_outreach.md (co-author proposal framing) without naming any individuals. -->
