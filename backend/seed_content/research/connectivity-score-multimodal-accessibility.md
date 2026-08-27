---
title: "Connectivity Score: one accessibility model across 38 countries"
slug: connectivity-score-multimodal-accessibility
excerpt: "A pedestrian, drive and public transport accessibility score developed at KR&A: real network routing over a 250 m grid across Europe, North America and developed APAC, percentile-ranked at four scopes and decomposable down to every count and distance that produced it."
status: published
category: project
publication_status: ""
tags: ["accessibility", "walkability", "routing", "postgis", "network-science", "kra"]
abstract: "A project I led at KR&A with a team of 4 to 5: a unified accessibility score covering 38 countries in Europe, North America and developed APAC. Three composites (pedestrian, drive, public transport) are computed from a single typed multi-modal graph over a 250 m grid and reported as percentile ranks at four cohort scopes, from the local urban area to global. The methodological core is a static multi-modal graph that collapses transit timetables into wait, transfer and transit edges, so one Dijkstra prices a full door-to-door journey. The engineering core is what made 38 countries computable at all: buffer statistics as FFT convolutions, a scipy CSR routing engine that replaced pgRouting, and a 13-server distributed build over TBs of data. Every composite decomposes into the counts and distances behind it, published in a methodology paper so every number can be checked."
read_time: "7 min"
date: "2026"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: ""
is_premium: false
---

# Connectivity Score

## What it is

At KR&A I led the build of a connectivity and walkability score: type in any address or coordinate in one of 38 countries across Europe, North America and developed APAC (Australia, New Zealand, Japan, Korea and Singapore), and you get back three 0 to 100 scores for pedestrian, drive and public transport accessibility. Each score is a percentile rank against four peer groups, from the local urban area up to national, continental and global. The product exists to answer a real-estate question (where does rental growth, vacancy risk and alternative use potential live) but it is built like a research instrument: every composite decomposes into the exact counts and distances that produced it.

Two published methodologies anchor this field. Walk Score covers North America under a single national normalisation; OS-WALK-EU and the more recent European walkability indices are Europe-only. None of them lets you compare a location in Milan against one in Toronto and one in Osaka on the same footing, and most of them score walking only. Closing those two gaps, cross-continental comparability and commensurable modes, is what the project set out to do.

The full method is written up in a [methodology paper](https://connectivityscore.krafin.tech/assets/connectivity-methodology-paper.pdf), and the score itself is live at [connectivityscore.krafin.tech](https://connectivityscore.krafin.tech).

## How the score is built

The kernel shared by all three modes is amenity reach: a network traversal from each location finds reachable points of interest in eight categories (grocery, restaurants, shopping, coffee, parks, schools, health, entertainment), weighted by region. The weights differ between North America, Europe and East Asia because trip behaviour differs, but every weight vector sums to the same total, so a regional re-weighting changes which categories carry the score, not the scale it is reported on.

Distance matters through a decay curve rather than a cutoff: full credit inside a 400 m stroll, a smooth falloff out to about 2.4 km, and a small linear bleed so the far half of the catchment still discriminates. The smoothness is deliberate: a POI at 401 m scores all but the same as one at 399 m, so small geocoding errors cannot move the score. Drive and public transport reuse the same curve on time budgets instead of distance.

On top of amenity reach, the pedestrian score adds infrastructure quality (network connectivity, greenery from both mapped polygons and satellite NDVI, slope) and a 15-minute reachable-area term. Public transport gets its own treatment: stop proximity, frequency and route diversity alongside amenity reach via the transit network.

## The multi-modal graph

The design decision that carries the most methodological weight is how public transport is routed. Timetables are time-dependent, and routing over them properly (time-expanded graphs, RAPTOR-style search) answers "when should I leave?" at a cost that is prohibitive for millions of origins. The score, however, does not need departure times, only expected reachability, and expectation admits a static graph. So the timetable collapses into time-independent edges layered onto the pedestrian network: walk to the stop, wait half the headway (capped at ten minutes, so a twice-a-day rural bus prices as inconvenient rather than unreachable), ride at the median observed inter-stop time, transfer for a flat 180 seconds, walk on to the destination. One Dijkstra then prices the whole door-to-door journey, frequency included.

## The engineering that made it computable

The score covers a 250 m grid over 38 countries, built per sub-region across 230 build units (Germany can only be loaded per Bundesland) on a 13-server setup working through TBs of data from hundreds of sources. Three engineering decisions separate a build that finishes from one that does not.

**Buffer statistics as convolutions.** Seven per-cell inputs are sums over a fixed-radius disc: junction density, green and blue share, road density and so on. Expressed as a spatial join that is one indexed query per cell, millions per market; expressed as a convolution it is a single FFT pass per market. Road density for the Netherlands went from 2,707 seconds to 8. Junction density for Korea, 6.3 million cells, did not finish in 7 hours as a join and takes seconds as a convolution.

**A small routing engine instead of pgRouting.** pgRouting re-materialises its edge set from the database on every call, which for a three-million-edge partition adds 8 to 30 seconds per request. The replacement compiles each partition's edges into an in-memory scipy sparse matrix, one per mode, and runs bounded single-source Dijkstras over it. One profiling find paid for the effort: scipy's undirected search re-symmetrises an already-symmetric matrix internally, which was 77% of worker self-time. Storing both edge directions and searching directed made pedestrian searches 2.4 times faster, drive 11 times, and multi-modal 13.5 times, verified bit-identical.

**Coordination through the database.** Scoring workers are forked processes with no shared state, pulling batches of 1,000 cells with row locks that skip contested rows. A crashed worker's cells are simply picked up by whoever asks next, and writes are upserts, so at-least-once delivery does no harm.

The same routing core serves the offline batch build and the live API, so a stored score and a live score can only differ where the formulas differ, never because two engines disagree.

## Why decomposability is the point

Score composites are opinionated: someone chose the weights. The design decouples weight-free measurement from weighted composition, so all underlying attributes are stored and re-tuning a weight costs a recomposition rather than a recomputation of the network routing. The API exposes the full decomposition on request: per category and per mode, how many amenities were reachable and how far the nearest one sat, plus every infrastructure input. A disagreement with another methodology can therefore be localised to a term instead of argued at the level of the headline score. And the columns that make the score auditable are the same columns that make it cheap to re-tune; both follow from the one decision to store measurement separately from weighting.
