---
title: "The Model Worked in Amsterdam and Broke in Milan — and That Was the Finding"
slug: why-my-gentrification-model-broke-in-milan
status: draft
category: case-study
tags: ["agent-based-modeling", "gentrification", "urban-research", "milan", "simulation"]
excerpt: "What happens when a gentrification model calibrated on Dutch cities meets Milan — and why the failure mode is the interesting result. Drawn from my MSc thesis."
read_time: ""
date: ""
featured: false
is_premium: false
author: Ian Ronk
cover_image: ""
meta: {"related_research_slug": "gentrification-abm-european-cities"}
---

For my MSc thesis I built one gentrification model and ran it on three European cities: Amsterdam, Utrecht, and Milan. It worked in one of them. In the other two, nothing I built could beat the dumbest possible baseline — assuming that nothing changes at all.

The usual move at this point is to bury the failures in a limitations section and lead with the Amsterdam numbers. But the failures turned out to be the most useful result. They point at a boundary condition that matters for anyone modeling urban change: **spatial resolution decides whether your signal exists before any model gets a chance to find it.**

## Modeling people instead of variables

Most empirical gentrification research fits econometric models — linear regression, ARIMA, boosting — on absolute variables: amenity counts, rent levels, transit access. Those models describe correlations in one city and rarely transfer to another. They also leave out the thing that actually produces gentrification: people deciding to move.

The thesis took a different route. It asks a single question — *is it possible to construct a unified framework for gentrification in European cities, using a neighborhood-central agent-based model?* — and answers it with an ABM in which agents represent inhabitants. Each agent's decision to move rests on two things about their neighborhood:

- **Affordability** — can they still afford to live there as rents shift?
- **Attractiveness** — does the neighborhood still offer what drew them there?

The hypothesis: if you model these two individual-level decision rules, gentrification emerges from the aggregate behavior rather than being regressed out of tabular features. The model builds on and extends the ABM paradigm of Mauro et al. (2024), with one important difference — it is calibrated on real historical data, roughly 2011–2022, rather than synthetic populations.

Feeding it required a reusable data-collection pipeline designed to work for any European city, including some unconventional predictors: aesthetics scores derived from streetview imagery, amenity counts, and a Voronoi-based method for estimating postcode geometries where official boundaries are missing. That pipeline is a contribution in its own right; the paper page has the details.

## Amsterdam: where it worked

Amsterdam publishes statistics at the *Buurt* level — fine-grained neighborhood units that give the model something to resolve.

The baselines first. A pooled linear regression reaches an Adjusted R² of 0.12297 (MSE 0.01108). Adding spatial structure — a mixed model with city-district random effects — lifts Adjusted R² to 0.21980 (MSE 0.00983). That gain of roughly 0.095 in Adjusted R² from spatial representation alone was an early hint of where this story was going.

The ABM, with its best hyperparameters from grid search (rich_move 0.04, affordability_ratio 0.25, move_if_afford 0.02) and averaged over 30 runs, reaches an MSE of 0.00276 and a weighted MSE of 0.004178 — roughly 3x lower than the linear regression models.

![fig: Hyperparameter grid search for the Amsterdam ABM](TODO-upload)

Here is the part most write-ups would skip: a naive null measure — predict zero change for every neighborhood — still wins on city-wide MSE, at 0.00117. That is not a scandal; it is a property of the data. Most neighborhoods barely change over a decade, so "nothing happens" is a strong city-wide predictor. It is also a useless one, because nobody needs a model to tell them that most places stay the same.

Where the models are actually asked to earn their keep — the Top-20 fastest-gentrifying neighborhoods — the ranking flips. There the ABM is the best model: Top-20 MSE of 0.00985, against 0.01308 for the null measure and 0.01492–0.01894 for the regressions. The ABM is worse at predicting stasis and better at predicting change, which is the trade you want.

It is not uniformly good at change, either. Of Amsterdam's top-3 truly gentrifying neighborhoods, the model captures the trend of Nes e.o. but misses De Eenhoorn and Weespertrekvaart.

![fig: Real vs simulated gentrification change, top gentrifying Amsterdam neighborhoods](TODO-upload)

![fig: Geographic comparison of real and simulated gentrification change, Amsterdam 2011–2022](TODO-upload)

## Utrecht and Milan: where it broke

Then the same framework went to Utrecht and Milan. Utrecht's data comes in 34 neighborhoods; Milan's in 88 NIL areas (Nuclei di Identità Locale). Both are much coarser than Amsterdam's Buurten.

At that scale, the measured change in gentrification score between 2014 and 2022 is close to zero almost everywhere. And when the ground truth is "nearly nothing changed," no model beats assuming nothing happened. The zero-change null measure matches or beats every model in both cities — regression and ABM alike.

![fig: Real vs simulated gentrification change, Milan NIL areas 2014–2022](TODO-upload)

The tempting reading is that the model failed to transfer. The more accurate reading is that at 34 and 88 spatial units, there was no signal left for any model to fit. The failure is upstream of the model.

## The leopard-spots problem

Why does the signal vanish? Semi (2011) observed that gentrification in Milan happens in "leopard spots" — scattered, gradual improvements in patches smaller than any administrative unit, rather than uniform neighborhood-wide transformation.

Milan's NILs were designed for demographic and economic reporting, not for tracking micro-level urban change. When a gentrifying pocket covers a fraction of a NIL, averaging over the whole unit dilutes it toward zero. The phenomenon is real; the aggregation erases it. Amsterdam's Buurten are small enough that the patches and the units roughly align — which is why the same model, same decision rules, same pipeline produced a usable result there and noise elsewhere.

That is the headline conclusion of the thesis, and it is a boundary condition rather than a victory lap: **neighborhood spatial resolution critically determines whether gentrification is detectable and modelable at all.**

## What I'd tell a practitioner

If you are modeling any localized urban process — gentrification, displacement, commercial turnover — the order of operations matters:

1. **Choose your spatial resolution before you choose your model.** No architecture recovers signal that aggregation already destroyed. If your units are larger than the patches the phenomenon occurs in, you will faithfully model a flat line.
2. **Benchmark against the null measure, and report it.** In slow-moving systems, "nothing changes" is embarrassingly competitive on aggregate metrics. If you cannot beat it where change actually happens, you do not have a model yet.
3. **Evaluate where the phenomenon lives.** City-wide MSE rewarded predicting stasis; the Top-20 metric is what showed the ABM doing something the baselines could not.

## Honest caveats

The thesis is explicit about its limits, and they belong in this post too. The ~12-year window is too short for full gentrification cycles, which unfold over decades. Missing data required imputation that introduced artificial noise — which, paradoxically, favors the linear models, since the imputation-generated trends are easier for them to fit than for a stochastic ABM to simulate. Streetview data existed at only two time points. And the whole analysis is in-sample: this is explanation, not prediction. Out-of-sample forecasting, housing units as agents, and migration flows are all future work.

The framework is a foundation, not a finished predictor. But it earned one durable result: before you ask whether a model can explain urban change, ask whether your map is drawn finely enough for the change to show up at all.

*The full tables, figures, and the thesis PDF are on the [paper page](/research/gentrification-abm-european-cities).*
