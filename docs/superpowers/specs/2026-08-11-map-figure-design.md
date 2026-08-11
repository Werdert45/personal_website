# Interactive map element (MapFigure) — design spec

Date: 2026-08-11
Status: approved in brainstorming session (all three sections)

## Goal

Posts and papers embed interactive maps of the actual research results —
Milan's metro rings, Voronoi postcode polygons, the thesis's hotspot and
clustering analyses — as living figures. Data is GeoJSON the owner can
re-upload through the API at any time without a redeploy.

## Decisions (user-approved)

| Decision | Choice |
|---|---|
| Rollout | Phased: embedded figures in posts/papers now; gallery page later reuses the same component |
| Phase-1 maps | Milan metro rings · Voronoi generated-vs-official CAPs · Amsterdam gentrification hot/cold spots · thesis clustering analysis |
| Interaction level | Focused figure: pan/zoom, hover tooltips with real values, legend, at most one layer toggle |
| Architecture | A: markdown ```map fence + geodata-app datasets via API |
| Data format | GeoJSON, uploaded/updated via X-API-Key content workflow, referenced by slug |
| Size budget | ~1.5 MB per dataset (simplify geometries before upload) |

## Components

### 1. `frontend/components/map-figure.jsx`

Props (from fence config):

```js
{
  dataset: "milan-metro-rings",          // required, geodata dataset slug
  value_field: "effect",                 // optional, drives choropleth color
  legend: "Δ price after opening (EUR/m²)", // optional label; scale derived from data
  tooltip: ["zone", "effect", "p"],      // property names shown on hover
  layers: [{ dataset, label }],          // optional, max 1 extra → toggle
  center: [lon, lat], zoom: 11,          // optional; default fitBounds(data)
  height: 420,                           // optional, px
  caption: "..."                        // optional figure caption
}
```

- Built on the existing `mapbox-map.jsx` / `mapbox-wrapper.jsx` patterns
  and the site's mapbox style; loaded with `next/dynamic` (`ssr: false`)
  so mapless posts ship zero mapbox JS.
- Interactions capped at the focused-figure set. No filters, no fly-tos.
- Failure behavior: fetch error, unknown dataset, or invalid config →
  a quiet bordered placeholder with the caption (and the error in
  `console.warn`); never a crashed post body. Config errors additionally
  render a visible warning in development only.

### 2. Markdown integration

- In `blog-post.jsx` and `research-article-detail.jsx` ReactMarkdown
  `components` maps: fenced code blocks with language `map` are
  intercepted; body is `JSON.parse`d into MapFigure props.
- Content flows through the existing markdown path (seed files → content
  API), so no backend content-model change; a map is just a fence in the
  body.

### 3. Data path (backend)

- Each map is a dataset in the existing geodata app, fetched via the
  established `/api/django?endpoint=geodata/datasets/<slug>/geojson`
  proxy route (research-article-detail already uses the ID-based form).
- Backend adjustments, only as needed at implementation time:
  - slug-based lookup for datasets if the current API is ID-only;
  - geodata upload endpoint accepts the `X-API-Key` service auth (it
    authenticates globally via DRF settings — verify, don't assume);
  - anonymous GET stays allowed for published datasets.
- Upload/update workflow (no redeploy): POST/PUT to the geodata
  datasets endpoint with the GeoJSON + slug + value_field metadata,
  authenticated with CONTENT_API_KEY (implementation verifies the exact
  route and upsert semantics; extend `publish_content_api.py` with a
  `--geojson` mode so content and map data share one tool).

### 4. Phase-1 exports and wiring

Export four GeoJSONs from the research pipelines (source of truth:
`~/Projects/blogs`), simplify to budget, upload as datasets, then add
fences to the five pages via the content API:

| Dataset slug | Source | Used by |
|---|---|---|
| `milan-metro-rings` | italian-metro output (rings/zones + effects) | Milan M5 case study, metro paper page |
| `milan-voronoi-caps` | voronoi_postcodes deliverables (generated CAP polygons) | Voronoi paper page (main layer) |
| `milan-official-caps` | voronoi_postcodes references (official CAP polygons) | Voronoi paper page (toggle layer) |
| `ams-gentrification-hotspots` | Master Thesis outputs (hot/cold spots) | thesis page, gentrification-Milan blog post |
| `ams-thesis-clustering` | Master Thesis outputs (clustering analysis) | thesis page |

(The Voronoi figure demonstrates the one-toggle design: generated
polygons as the main layer, official boundaries as `layers[0]`.)

Every property surfaced in tooltips must carry values that reproduce
from the pipelines — same fact-check bar as the written content.

## Error handling

- MapFigure guards: JSON.parse failure, missing `dataset`, fetch !ok,
  empty FeatureCollection — all → placeholder path.
- Upload script validates GeoJSON structure and size budget before POST.

## Testing

- Unit-light: render a post fixture containing a valid fence (map
  renders), an invalid-JSON fence (placeholder, no crash), and a fence
  with unknown dataset (placeholder after fetch 404).
- Manual: each phase-1 page on desktop + mobile; tooltip values
  spot-checked against pipeline outputs; Lighthouse check that a
  mapless post loads no mapbox chunk.

## Out of scope

- The gallery/visualizations page (phase 2 — component reuse is the only
  requirement this spec imposes).
- Time sliders, story-scrolling, multi-layer explorers.
- Choropleth palette design beyond the site's existing map styling.
