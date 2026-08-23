---
slug: gentrification-abm-european-cities
excerpt: "An agent-based model of gentrification calibrated on real data from Amsterdam, Utrecht and Milan. It beats the regressions where change actually concentrates, and shows that spatial resolution decides whether the signal exists at all."
title: "A Unified Agent-Based Framework for Gentrification in European Cities"
status: published
category: thesis
publication_status: thesis
tags: ["agent-based-modeling", "gentrification", "urban-research", "amsterdam", "utrecht", "milan"]
abstract: "Gentrification is a complex urban process that significantly impacts city health and inhabitants' well-being, yet remains difficult to predict and model accurately across different urban contexts. Current gentrification research predominantly uses econometric models such as linear regression and temporal approaches like ARIMA and boosting algorithms to estimate where and to what degree gentrification will occur, with most studies focusing on single-city analyses. These traditional models fail to capture the behavioral patterns of inhabitants. They cannot be extrapolated across different cities, while existing agent-based models, though capable of modeling human behavior, are not calibrated using real-world data. This thesis introduces a novel agent-based modeling paradigm that uses neighborhood affordability and attractiveness as primary drivers of urban mobility, fitted on historical data from multiple European cities to create a transferable framework. The results demonstrate that the model successfully explains part of the gentrification trends in Amsterdam, while revealing essential boundary conditions for effective modeling, specifically that neighborhood spatial resolution critically determines model performance across other cities. By modeling inhabitant behaviors rather than solely examining potential drivers, this approach adds a crucial behavioral dimension to gentrification modeling, while providing a unified framework applicable across European cities."
read_time: ""
date: "2025-08"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: ""
is_premium: false
---

## Abstract

Gentrification is a complex urban process that significantly impacts city health and inhabitants' well-being, yet remains difficult to predict and model accurately across different urban contexts. Current gentrification research predominantly uses econometric models such as linear regression and temporal approaches like ARIMA and boosting algorithms to estimate where and to what degree gentrification will occur, with most studies focusing on single-city analyses. These traditional models fail to capture the behavioral patterns of inhabitants. They cannot be extrapolated across different cities, while existing agent-based models, though capable of modeling human behavior, are not calibrated using real-world data. This thesis introduces a novel agent-based modeling paradigm that uses neighborhood affordability and attractiveness as primary drivers of urban mobility, fitted on historical data from multiple European cities to create a transferable framework. The results demonstrate that the model successfully explains part of the gentrification trends in Amsterdam, while revealing essential boundary conditions for effective modeling, specifically that neighborhood spatial resolution critically determines model performance across other cities. By modeling inhabitant behaviors rather than solely examining potential drivers, this approach adds a crucial behavioral dimension to gentrification modeling, while providing a unified framework applicable across European cities.

## The problem, and the gap

Gentrification is usually studied one city at a time. Single-city analyses of Barcelona, Stockholm, Lisbon (tourism-induced displacement, the buffering role of social housing) validate particular social transformations, but their findings do not travel. The literature has two structural pitfalls.

**Pitfall 1: no standardized framework.** Nearly all empirical work builds its model inside one city, for one aspect of gentrification (a spillover effect, the impact of Airbnb). Few studies have built empirical gentrification models usable across cities. That gap matters practically: a transferable model would give policymakers and residents a clearer view without commissioning a fresh study per city.

**Pitfall 2: exclusion of behavioral dynamics.** Empirical studies almost universally regress on absolute variables (amenity counts, public-transport access) using linear regression or decision trees. Human behavior is absent from these models by construction. Agent-based models can express behavior, but the existing ABM work (notably Mauro et al., 2024) runs on synthetic populations rather than being calibrated against real historical data.

The central research question follows directly:

> **Is it possible to construct a unified framework for gentrification in European cities, using a neighborhood-central Agent-Based Model?**

The hypothesis: gentrification can emerge from agents' individual decisions, if those decisions are driven by two things people actually weigh: whether they can afford their neighborhood, and whether it is still attractive to them.

## Approach

The framework is a neighborhood-centric ABM, built as a re-implementation and extension of the Mauro et al. (2024) model (rewritten for current Mesa, moved from an abstract grid to a GIS environment, and parallelized to scale from ~4k toward ~1M agents). Each agent follows a two-step decision sequence per time step:

1. **Affordability.** If rent exceeds a threshold share of household income, the agent must move to a neighborhood it can afford.
2. **Attractiveness.** If the neighborhood remains affordable, the agent may still choose to move, with some probability, to an affordable neighborhood with available housing and a higher attractiveness score. Attractiveness is a weighted composite of connectivity, job opportunity, aesthetics, crime, greenery, education, and neighborhood sentiment.

The model is calibrated on real historical data (roughly 2011–2022) for three European cities: **Amsterdam, Utrecht, and Milan**. Feeding it is a reusable data-collection pipeline designed to make adding a European city near hassle-free, including unconventional predictors (streetview-imagery aesthetics scores, sentiment, amenity counts) and a Voronoi-based postcode geometry estimation.

Baselines are two linear regressions on the same data: a pooled model, and a mixed-effects model with time dummies and city-district random effects. Evaluation is in-sample, against three metrics: MSE, a weighted MSE that upweights the top gentrifying neighborhoods, and a Top-N MSE restricted to the most-gentrifying neighborhoods. Every model is compared against a zero-change null measure that simply carries each neighborhood's starting score forward.

<!-- fig placeholder: fig: Amsterdam GIS environment showing mean income per neighborhood, generated from the geodata pipeline -->

## Results

### Amsterdam

The regressions first. Pooled LR reaches an Adj-R² of 0.12297; adding spatial structure via city-district random effects lifts the Mixed LR to 0.21980, roughly +0.095 Adj-R² from spatial representation alone. Spatial structure is essential even for the baseline.

The ABM (best hyperparameters from grid search: `rich_move` 0.04, `affordability_ratio` 0.25, `move_if_afford` 0.02; averaged over 30 runs) then beats both regressions by a wide margin.

| Model | Adj-R² | MSE | W-Adj-R² | W-MSE | Top-20 MSE |
|---|---|---|---|---|---|
| Null measure | n/a | **0.00117** | n/a | **0.00355** | 0.01308 |
| Pooled LR | 0.12297 | 0.01108 | 0.13753 | 0.01409 | 0.01894 |
| Mixed LR | **0.21980** | 0.00983 | **0.27080** | 0.01299 | 0.01492 |
| ABM | n/a | 0.00276 | n/a | 0.004178 | **0.00985** |

*All model results, Amsterdam, in-sample. Bold marks the best score per column.*

Two honest readings of this table. First: the ABM's MSE of 0.00276 is roughly 3x lower than either linear regression: the behavioral model outperforms both econometric baselines on this metric. Second: on city-wide MSE, the zero-change null measure beats everything, because most neighborhoods barely change and predicting "nothing happens" is hard to beat on average.

But gentrification research is not about the average neighborhood. It is about the ones that change. On the Top-20 most-gentrifying neighborhoods, the ABM is the best model outright: Top-20 MSE 0.00985, against 0.01308 for the null measure and 0.01492–0.01894 for the regressions. On the neighborhoods where gentrification is concentrated, the behavioral model gives the best estimates of the four.

<!-- Editor's note: metrics follow Table tab:all_amsterdam_res and the Discussion in results.tex. The Model Results prose (0.00117/0.00355/0.01307) is a known internal error in the thesis: those are the Null Measure's values. Do not "correct" toward the prose. -->

At the level of individual neighborhoods the picture is mixed, and worth stating plainly: of Amsterdam's top-3 truly gentrifying neighborhoods, the model captures the trend of Nes e.o., but not De Eenhoorn or Weespertrekvaart.

<!-- fig placeholder: fig: hyperparameter grid search for the Amsterdam ABM (rich_move x affordability_ratio, move_if_afford = 0.02) -->

<!-- fig placeholder: fig: boxplot comparison of real vs simulated gentrification score, Amsterdam 2022 -->

<!-- fig placeholder: fig: top-3 most gentrifying Amsterdam neighborhoods, real vs simulated trajectories -->

<!-- fig placeholder: fig: geographic comparison of real vs simulated gentrification change, Amsterdam 2011-2022 -->

```map
{
  "dataset": "ams-gentrification-hotspots",
  "value_field": "gi_star_z",
  "legend": "Getis-Ord Gi* z-score",
  "tooltip": ["name", "g_score_2010", "g_score_2022", "g_diff", "gi_star_z"],
  "height": 460,
  "caption": "Getis-Ord Gi* on the change between the 2010 and 2022 composite gentrification scores across Amsterdam Buurten. Positive z-scores mark spatial clusters of rising scores, negative z-scores mark cold spots; hover a neighborhood for its scores."
}
```

### Utrecht and Milan

These are negative results, and I report them as such. In Utrecht (34 neighborhoods) and Milan (88 NIL areas), the change in gentrification score between 2014 and 2022 is near zero across the whole city at that spatial scale. The consequence is mechanical: the zero-change null measure matches or beats every model, regressions and ABM alike. Nothing meaningful can be won when the target variable barely moves.

I read this as a spatial-resolution failure, not model success or failure per se: the resolution of the administrative units, not the decision rules, is what broke first. That interpretation is developed below.

<!-- fig placeholder: fig: geographic comparison of real vs simulated gentrification change, Utrecht 2014-2022 -->

<!-- fig placeholder: fig: geographic comparison of real vs simulated gentrification change, Milan 2014-2022 -->

## The boundary condition: spatial resolution and leopard spots

The differential outcome across the three cities is the thesis's main finding. Amsterdam's fine-grained Buurten give the model spatial units small enough that localized gentrification registers in the data. Utrecht's 34 neighborhoods and Milan's 88 NILs are too large: local dynamics average out into a near-constant city-wide score, and there is nothing left to model.

This is the "leopard spots" problem, after Semi's (2011) observation about Milan: gentrification there happens in scattered, gradual patches rather than uniform neighborhood-wide transformation. When those patches are smaller than the administrative unit (as with Milan's NILs, which were designed for demographic and economic analysis, not for this), the phenomenon is invisible at the unit level. Gentrification operates at scales below traditional administrative geography.

The conclusion I draw is a boundary condition rather than a verdict: neighborhood spatial resolution critically determines whether gentrification is detectable and modelable at all. The framework demonstrates clear potential across European cities, dependent on an appropriate neighborhood scale definition.

## Limitations

Stated as candidly as in the thesis itself:

- **Temporal window.** ~12 years is too short for full gentrification cycles; neighborhood transformation unfolds over decades, and phases outside the observation window are missed.
- **Imputation noise.** Missing values required extensive imputation, which introduced artificial fluctuations into a signal that is subtle to begin with. Paradoxically, this favors the linear models: the stochastic ABM struggles to reproduce imputation-generated trends that the regressions can fit, a methodological bias toward the simpler approach.
- **Streetview data.** Only two temporal observation points, and amenity counts without categorical detail, limit how well neighborhood character evolution is tracked.
- **In-sample only.** This is an explanation study, not a prediction study. No out-of-sample extrapolation was attempted.
- **Comparability.** Milan's data covers the metropolitan area while Utrecht and Amsterdam cover urban cores, and Italian bracket-based income classification differs from Dutch percentile-based measures.

## Future work

From the conclusion, a non-exhaustive list of extensions:

- **Enhanced demographic modeling**: capture population movements such as students leaving family homes, for more realistic urban demographic transitions.
- **Homes as agent entities**: housing units as interactive agents, enabling household-income-driven moving decisions and family-vs-single-occupant dynamics.
- **Gentrification variable and geographical size**: systematic research into optimal spatial units, using cities with multiple denominations (Buurten vs Wijken in Utrecht, Amsterdam, Rotterdam); for Milan, postcode areas as a finer unit that might capture the leopard-spots pattern.
- **Improved neighborhood factors**: better temporal resolution for streetview imagery, categorical detail for amenities.
- **Migration**: immigration, emigration, and inter-city flows, to complete the picture of who moves into gentrifying areas.
- **Out-of-sample analysis**: move from explanation to a genuine gentrification prediction model.

---

*Full thesis PDF and figures to be uploaded as assets. An interactive map of the Amsterdam results (Buurten-level real vs simulated gentrification change) may follow via the geodata pipeline (`has_map` stays false until it exists).*
