// Static fallbacks describe the REAL manuscripts faithfully. Any number or
// claim here must match the current paper text — when in doubt, say less and
// point at the paper. (These render only when the CMS has no row for the slug.)
//
// Lives in its own plain module (no "use client") so both the server page and
// the client detail component get the actual object — exports of a client
// module become opaque client references when imported into a server component.
export const STATIC_PAPERS = {
  "metro-capitalisation-timing": {
    slug: "metro-capitalisation-timing",
    title: "When does metro infrastructure capitalize into property prices?",
    abstract: "Phase-decomposed difference-in-differences evidence from seven European cities. Seventeen staggered treated cohorts (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma; n = 42,004) pooled into one panel, with the response decomposed into announcement, construction, opening and maturity phases. The pooled cross-city average locates the largest response at maturity. But that step is a pooled average, not a within-city fact: city-by-year fixed effects collapse it to an insignificant −0.5 log points. The defensible magnitudes are per-city, foremost Milano's within-ring +167 EUR/m² (≈ +5.6%, wild-bootstrap p = 0.004).",
    category: "WORKING-PAPER",
    date: "2026-07",
    author: "Ian Ronk",
    tags: ["difference-in-differences", "property prices", "metro", "urban economics", "wild cluster bootstrap"],
    publication_status: "Working paper, draft available on request",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2026). "When Does Metro Infrastructure Capitalize into Property Prices? Phase-Decomposed Difference-in-Differences Evidence from Seven European Cities." Working paper.',
    content: `## Question

Not *whether* new metro lines capitalize into residential property prices, but *when* along the project timeline: announcement, construction, opening, or maturity. Single-snapshot hedonic studies cannot separate those phases; a phase-decomposed staggered design can.

## Design

Seventeen staggered treated cohorts across seven European cities in five countries (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma) pool into a single phase-decomposed panel of 42,004 observations. Outcomes are property prices from administrative and register sources (OMI appraisal series for the Italian cities, WOZ/Kadaster for Amsterdam, DVF for France, national registers elsewhere). With only seven city clusters, inference uses the wild cluster bootstrap throughout.

## What the paper actually finds

The pooled cross-city average locates the largest response at maturity: a construction-to-maturity step of +9 to +12%, two or more years after opening, stable across the control ladder and positive under every leave-one-city-out check. The paper then spends much of its length establishing what that step is *not*: under city-by-year fixed effects it collapses to an insignificant −0.5 log points, and its few-cluster significance depends on the clustering partition and control set. The defensible magnitudes are per-city, foremost Milano's within-ring +167 EUR/m² (≈ +5.6%, wild-bootstrap p = 0.004), the first ex-post difference-in-differences evidence on Milano's M5/M4 openings. The delayed-to-maturity pattern is read as a cross-city hypothesis worth testing on longer panels, not a settled within-city effect.

## Status and what comes next

Working paper. A Milan case study and a data-engineering write-up of the seven-city pipeline are planned as companion posts here, and the future-work post doubles as an open invitation: extending the phase-decomposed design to more cities is co-author-shaped work.`,
  },
  "voronoi-postcode-estimation": {
    slug: "voronoi-postcode-estimation",
    title: "Calibrating free postcode boundaries from OpenStreetMap",
    abstract: "Postcode polygons are free and authoritative in some European countries and sold or absent in others. Voronoi tessellation of OSM address points is the natural estimator. But how many address points are needed, and does the answer transfer across countries? One pipeline calibrated against national references in NL and DK (5,160 polygons), a seed-density-to-IoU curve whose asymptote is robust across functional forms (mean matched IoU ≈ 0.76–0.82), out-of-sample transfer tested on held-out Belgium (mean matched IoU 0.618 at 81% coverage), and an application to Italy's 4,209 CAP polygons, where no free authoritative intra-city layer exists.",
    category: "PREPRINT",
    date: "2026-07",
    author: "Ian Ronk",
    tags: ["Voronoi", "OpenStreetMap", "postcode boundaries", "calibration", "geospatial"],
    publication_status: "Preprint in preparation, arXiv August 2026",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2026). "Calibrating Free Postcode Boundaries from OpenStreetMap." Preprint.',
    content: `## Problem

Several European countries publish authoritative postcode polygons free of charge (the Netherlands, Denmark, Belgium, Switzerland, Finland, Norway); elsewhere they are sold or simply absent. Italy, the application case, has no free authoritative intra-city postcode layer at all.

## Approach

One pipeline: OSM address points as seeds, a kNN-based outlier pre-filter, Voronoi tessellation, dissolution by postcode. The contribution is not the tessellation; it is the *calibration*: fitting a seed-density-to-IoU curve against national reference layers in two countries (NL CBS PC4 and DK DAGI postnumre, 5,160 polygons combined) so that the accuracy of an estimated polygon can be predicted from its seed count before anyone uses it.

## What the calibration shows

The curve's asymptote is robust across functional forms (mean matched IoU saturates around 0.76–0.82), while the fitted 0.7-IoU seed threshold is form-sensitive, and per-postcode scatter is wide: the curve calibrates the population mean, not individual polygons. The shape transfers out of sample: held-out Belgium reaches mean matched IoU 0.618 at 81% coverage, near the curve, with roughly double the calibration error.

## Application

Applied to Italy, the pipeline produces 4,209 estimated CAP polygons with per-polygon seed counts, so downstream users can filter by predicted quality. Full method, uncertainty treatment and limitations are in the paper; the GeoJSON and the complete pipeline are released alongside it (repository and archive links land here with the arXiv submission, August 2026).`,
  },
  "gentrification-abm": {
    slug: "gentrification-abm",
    title: "Agent-based modelling of gentrification dynamics",
    abstract: "MSc thesis (2025). An agent-based model of neighbourhood change driven by attractiveness and affordability, applied to Amsterdam, Utrecht and Milan on open spatial data, including an honest account of where the chosen aggregation level limits what the model can claim.",
    category: "THESIS",
    date: "2025-08",
    author: "Ian Ronk",
    tags: ["agent-based modelling", "gentrification", "housing", "Amsterdam", "urban dynamics"],
    publication_status: "MSc thesis (2025)",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2025). "Agent-based modelling of gentrification dynamics." MSc thesis.',
    content: `## In one paragraph

The thesis builds an agent-based model of gentrification in which households respond to neighbourhood attractiveness and affordability, and applies it to three European cities (Amsterdam, Utrecht and Milan) on open spatial data. Alongside the simulation results, it documents the data pipeline that fed the model and treats the limits seriously: the spatial aggregation level materially constrains which conclusions the model can support, and the thesis says so rather than smoothing over it.

## What's coming here

From August 2026 this site carries a case-study series on the thesis: the model itself, the pipeline that ran it, a revisit of the hot/cold-spot analysis, and the streetview and simulation work, written now, about 2025 work, and labelled as such. A social-housing extension of the model is the subject of ongoing follow-up research.`,
  },
};
