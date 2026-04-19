# Content Simplification & Thoughts Rename — Design

**Date:** 2026-04-19
**Branch:** `playful-restyle`
**Status:** Draft — awaiting user review

## Summary

Collapse the content model to three top-level types (Research, Projects, Thoughts), retire the standalone `Visualization` model, rename the Blog surface to "Thoughts" (including its route), and refocus the four core competences on **Machine Learning**, **Data Engineering**, **Geospatial Analysis**, and **Internal Processes** (replacing Scraping).

## Motivation

- Today's content model has four entities (BlogPost, Research, Visualization, Project) with overlapping categories. A visualisation is really just a blog post with a map embed — splitting them into a separate model adds admin surface without adding reader value.
- Research filter chips (analysis/case-study/methodology/other) are not how the owner thinks about the output. It's a flat list of papers.
- "Scraping & Data Mining" as one of four headline competences under-sells the breadth of operational work (orchestration, internal tooling, process automation). Folding those three into **Internal Processes** is a better frame for prospective clients.
- "Blog" is the default label every developer site uses. "Thoughts" matches the tone of the restyle (editorial/paper aesthetic) and signals essays + visualisations + short notes under one roof.

## Decisions

### Content types

| Type | Subtypes (`category` field) | Route |
|---|---|---|
| **Research** | *(no subtype — flat paper list)* | `/research` |
| **Projects** | `webapp`, `simulation`, `tool`, `other` | `/projects` |
| **Thoughts** (was Blog) | `visualisation`, `update`, `explanation`, `thought`, `note` | `/thoughts` |

The Django model stays named `BlogPost` (internal name, no user-facing impact); only the UI label and route change.

### Visualization model: full retirement

- Data migration copies every `Visualization` row to a new `BlogPost` with:
  - `category = "visualisation"`
  - `title`, `slug`, `content`, `preview_image`, `is_premium`, timestamps carried over
  - `description` → `excerpt`
  - Map/PostGIS-related fields (`map_config`, `geojson_endpoint`, `geodataset`, `value_field`, `metrics`, `data_points`, `region`) preserved inside the blog post body as frontmatter-style JSON in a new `BlogPost.meta` JSONField, so a future `visualisation` renderer can re-attach them.
- After the migration, drop the `Visualization` model, the `visualizations` table, the admin registration, the serializer, the viewset, and the URL route.
- Frontend: remove any `Visualization`-specific components, the `/visualizations` route (if still present), and any fetches to `/api/django?endpoint=research/visualizations`.

### Blog category migration

- Current choices: `article`, `tutorial`, `note`, `announcement`, `other`.
- New choices: `visualisation`, `update`, `explanation`, `thought`, `note`.
- Mapping for existing seeded rows:
  - `article` → `thought`
  - `tutorial` → `explanation`
  - `note` → `note`
  - `announcement` → `update`
  - `other` → `thought`

### Project category migration

- Current: `web`, `data`, `gis`, `ml`, `other`.
- New: `webapp`, `simulation`, `tool`, `other`.
- Mapping:
  - `web` → `webapp`
  - `data`, `gis`, `ml`, `other` → `other` (domain moves to tags; category now describes the *form*)

### Research category

- Keep the `category` field on the model (backward compat, cheap to keep) but remove the filter chip row from the research page UI. The research list renders as a single flat chronological list.

### Four core competences

| # | Title | Short tag | Stack chips |
|---|---|---|---|
| 01 | Machine Learning | `ML` | SAM, LVMs, XGBoost, PyTorch, scikit-learn |
| 02 | Data Engineering | `ENG` | Airflow, Docker, Python, Postgres, PostGIS, dbt |
| 03 | Geospatial Analysis | `GEO` | PostGIS, GeoPandas, H3, CV, Agent-based |
| 04 | **Internal Processes** | `OPS` | Airflow, dbt, Docker, FastAPI, Streamlit, Postgres |

**Card 04 description:** "Automating the machinery teams rely on — orchestrating data pipelines, building internal tooling, and replacing manual workflows with reliable systems."

**Card 04 SVG motif:** three-node closed-loop automation diagram.
- Nodes (mono font, rectangles): `trigger` (paper), `run` (yellow — the automated step), `report` (ink-filled with yellow text).
- Solid arrows: `trigger → run → report`.
- Curved feedback arrow: `report` back to `trigger` (dashed), signalling the loop.
- Same visual language (paper/ink/yellow, 1.4px strokes, JetBrains Mono labels) as the other three cards.

### Marquee (yellow banner)

New default list:

```
Machine Learning · Data Engineering · Geospatial Analysis · Internal Processes · REITs · Funds · Eurostat
```

Leading four items are the competences; trailing three are the domain context already present today.

### Nav + route rename

- Nav entry: `Blog` → `Thoughts` (label + `routeKey` in `navigation.jsx`).
- Route: `/blog` → `/thoughts`. Move `app/[locale]/blog/` to `app/[locale]/thoughts/` (both the index page and the `[slug]` subroute).
- Add a permanent redirect `/[locale]/blog` → `/[locale]/thoughts` and `/[locale]/blog/[slug]` → `/[locale]/thoughts/[slug]` via `next.config.mjs` `redirects()` so any inbound links keep working.
- Internal references (`WritingTeaser` "View all" link, any deep links in content) updated to `/thoughts`.
- Heading on home teaser: "Recent writing." → "Recent **thoughts**."

### Translation files

All four locales (`en`, `nl`, `it`, `de`) updated:

- `Navigation.visualizations` (already repurposed to Blog) → now "Thoughts" / equivalent:
  - en: `Thoughts`
  - nl: `Gedachten`
  - it: `Pensieri`
  - de: `Gedanken`
- `About.expertise[3]` (4th competence):
  - en title: `Internal Processes`, description: "Automating the machinery teams rely on — orchestrating data pipelines, building internal tooling, and replacing manual workflows with reliable systems."
  - nl/it/de: localized equivalents in the same tone
- Scrub remaining `"scraping"` references in copy (writing-teaser default posts, marquee default, any about-page text).

## Files touched

### Backend
- `backend/apps/research/models.py` — remove `Visualization` class; keep `Research`.
- `backend/apps/research/admin.py` — remove Visualization admin registration.
- `backend/apps/research/serializers.py` — remove `VisualizationSerializer`.
- `backend/apps/research/views.py` — remove `VisualizationViewSet`.
- `backend/apps/research/urls.py` — remove `visualizations/` route.
- `backend/apps/research/migrations/XXXX_retire_visualization.py` — new migration: data copy → drop table.
- `backend/apps/blog/models.py` — update `CATEGORY_CHOICES`; add `meta = JSONField(default=dict)` for migrated visualisation metadata.
- `backend/apps/blog/migrations/XXXX_new_categories_and_meta.py` — schema + data migration (existing categories remapped).
- `backend/apps/projects/models.py` — update `CATEGORY_CHOICES`.
- `backend/apps/projects/migrations/XXXX_new_categories.py` — data remap.
- `backend/seed/seed_data.py` (or wherever seeding lives) — update seeded categories to the new set.

### Frontend
- `frontend/app/[locale]/blog/` → rename directory to `frontend/app/[locale]/thoughts/` (both `page.jsx` and `[slug]/page.jsx`).
- `frontend/next.config.mjs` — add `redirects()` for `/blog` and `/blog/[slug]`.
- `frontend/components/navigation.jsx` — update nav entry label + href to `/thoughts`.
- `frontend/components/skills-grid.jsx` — rewrite `SkillViz` index 3 (closed-loop SVG); update `stacks[3]` and `shortTags[3]`.
- `frontend/components/marquee.jsx` — new `defaults` array.
- `frontend/components/writing-teaser.jsx` — heading to "Recent thoughts"; update `View all` link to `/thoughts`; remove "scraping" from `DEFAULT_POSTS`.
- `frontend/components/blog-list.jsx` — rename component to `ThoughtsList` (or leave filename, update label); update category filter chip set; update link base to `/thoughts`.
- `frontend/components/blog-post.jsx` — update link base to `/thoughts`.
- `frontend/components/research-list.jsx` — remove category filter chip row + `activeCategory` state.
- `frontend/components/research-preview.jsx` — no structural change (already paper-focused).
- `frontend/messages/{en,nl,it,de}.json` — `Navigation` label, `About.expertise[3]`, scrub remaining "scraping" copy.
- Delete any `frontend/components/visualization-*.jsx` files and the `/visualizations` route if still present.

## Non-goals

- No new API endpoints. Existing `/api/django?endpoint=blog` continues to serve the `Thoughts` feed.
- No visual redesign of the four cards beyond card #04's SVG motif.
- No new blog post subtype renderers (e.g., special `visualisation` layout). Category just tags the post; rendering enhancements land in a future spec.
- No change to the i18n keys' internal names (`visualizations` key stays named that way in JSON, holds the "Thoughts" value — renaming the key is churn).

## Risks

- **Data migration of Visualization rows** is the only operation that touches real DB state. Mitigation: the migration is reversible only via backup. Test on local seed data first; run `seed_data` idempotently after.
- **Route rename** could break inbound links from any shared URL. Mitigation: 301 redirects in `next.config.mjs`.
- **Project category remap** loses the `data/gis/ml` distinction. That's acceptable — those domains now live in the `technologies` / tags arrays and the new categories describe form, not domain.

## Acceptance criteria

- [ ] `/research` page shows a flat paper list with no category filter chips.
- [ ] `/thoughts` loads the former blog content; `/blog` and `/blog/:slug` 301 to their `/thoughts` equivalents in all four locales.
- [ ] Nav shows "Thoughts" (+ localized equivalents).
- [ ] Home teaser heading reads "Recent thoughts."
- [ ] Marquee shows the new six-item list starting with the four competences.
- [ ] Skills grid card #04 reads "Internal Processes" with the new description, `OPS` tag, new stack chips, and closed-loop SVG.
- [ ] Seeded visualisation rows are reachable as blog posts at `/thoughts/:slug` with `category=visualisation`.
- [ ] Django admin no longer shows a Visualization section.
- [ ] `django check` and `next build` both pass with no errors.
- [ ] No remaining references to "scraping" in user-facing copy (grep is clean).
