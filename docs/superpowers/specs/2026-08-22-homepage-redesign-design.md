# Homepage redesign — design spec

Date: 2026-08-22
Status: decisions approved in discussion (hero visual, chips, nav target,
card links via AskUserQuestion); spec pending user review

## Goal

Restructure the homepage around the generalized Head-of-Data positioning:
new hero visual (replacing the Europe map), tightened jumbotron layout,
renamed nav, new four expertise lanes, and a consolidated Projects &
Papers showcase of 9 cards with real landing pages.

## 1. Jumbotron

- **Layout**: "Amsterdam, NL" moves under the role line ("Head of Data ·
  Engineer & Researcher") in the avatar block. The top meta bar is
  removed entirely (both the location span and "§ 01 · Portfolio /
  2026"). The expertise chips row moves up to sit directly under the CTA
  buttons; the bottom border-strip chips row is removed.
- **Chips renamed** to match the new lanes (supersedes the Aug-22
  positioning spec's chip set; update `Hero.expertiseAreas` in all four
  locales and the positioning memory):
  Data Engineering · System Architecture · Complex Data Products ·
  Analytics & ML.
- **Marquee**: "Production AI tools" → "AI Engineering" (all locales).
- **Hero visual — convergence triptych** (replaces the Europe map SVG):
  four small input panels — map (dots), document with LLM sparkle,
  graph/network, time-series squiggle — with animated dashed arrows
  (same SMIL dash-offset animation the map uses now) converging into a
  structured table whose rows fill in a loop. Pure inline SVG, no
  libraries; grid-paper background, ink strokes, yellow accents;
  animations gated behind the existing `mounted` state so SSR output is
  stable. Roughly square aspect to preserve the current hero grid.

## 2. Navbar

Home · About · Projects & Papers · Blogs · Contact.

- "Projects & Papers" → new combined `/projects` index page.
- "Blogs" is the renamed Writing label; route stays `/thoughts`.
- "Research" nav item is absorbed by Projects & Papers. The `/research`
  index redirects to `/projects`; paper detail URLs
  (`/research/<slug>`) are unchanged.

## 3. Homepage section order

1. Navbar
2. Jumbotron (§ 1)
3. **About Me** — states what Ian does without naming KR&A (copy to be
   workshopped separately), plus a quick-fire row of 4 bullets:
   Role · Based · Education · Stack.
4. **Four expertise lanes**:
   - Data Engineering — data pipelines and storage (lakehouse), tooling
   - System Architecture — cloud, PostGIS, distributed compute, Linux,
     networking, APIs, security
   - Complex Data Products — spatial, graphs, documents, time series
   - Analytics & ML — time series, nowcasting, regressions
5. **Projects & Papers** — 9 showcase cards (below), same set as the
   `/projects` index.
6. **Blogs & Recent Work** — unchanged for now (Recent Work examples
   stay).
7. Contact CTA.

"Things that shipped" section is removed. The old duplicate about/
competence homepage blocks are replaced by §3 and §4.

## 4. The 9 showcase cards

Each card shows a badge: `Project`, `Research`, or `KR&A` (employer
work; About prose still avoids naming KR&A — badges may, since the
Connectivity card links to their site. User may veto the literal name).

| # | Card | Badge | Link | Blurb angle (facts verified from source repos 2026-08-22) |
|---|---|---|---|---|
| 1 | LanguageBuddy | Project | new detail page | Self-hosted AI language tutor (NL/IT/ES): LLM chat + voice-call tutor; mistakes auto-captured into an SM-2 spaced-repetition queue driving next-day exercises; adaptive CEFR placement; 6,200+ curated vocab entries; FastAPI + Docker; 336-test suite |
| 2 | Gentrification ABM | Research | existing paper page (beefed-up description) | MSc thesis ABM; description rewritten from thesis corpus |
| 3 | Connectivity Score | KR&A | external → KR&A site | Multi-modal connectivity ranking across 38 EU/NA/APAC markets. No project page (employer work) |
| 4 | HPI / Eurostat | Research | metro paper + `metro-pipeline-one-json-per-number` post | Eurostat HPI ingestion feeding the metro-capitalization study |
| 5 | Research Systems Pipeline | Project | published series post | Every research project rebuilt as a truthful Airflow 3 DAG (1.5 GB–726 GB inputs); laptop LocalExecutor → Hetzner → multi-machine CeleryExecutor (Redis, pinned queues) |
| 6 | US vs EU CV for Autonomous Driving | Research | new detail page | Controlled 2×3 geographic-transfer study (YOLOv3u/YOLOv8s; Udacity/CrowdAI vs KITTI) correcting the 2024 course project's confounds; US fine-tuning transfers ~zero to EU streets (shared-class mAP@.5:.95 gain +0.001 vs +0.153 in-domain; DiD Δ = +0.077 ± 0.007 across 3 seeds) |
| 7 | SponsoredBye | Project | external → HF Space `huggingface.co/spaces/sponsored-bye/sponsoredbye` (+ optional detail page) | Text-only sponsor-skipper predating YouTube Premium's: sentence-T5 embeddings → BiLSTM sequence tagger (86.15% macro F1 over 38,600 videos), fuzzy-matched back to caption timestamps |
| 8 | FishFinder | Project | new detail page (UI refresh later) | Flutter app identifying 63 Dutch fish species fully on-device (TFLite) with a Pokédex-style FishDex; training pipeline: ~3,000 hand-annotated photos masked with Segment Anything, then fine-tuned ResNet50 |
| 9 | Flooding thesis | Research | new detail page + hosted PDF | "Predicting Flooding Risk for Pan-European REIT Assets using Local Features" (UvA BSc AI, 2022, with KR&A): reproducing EU hydrodynamic flood-map labels from 33 local features; Random Forest 97.5% binary accuracy; imperviousness and relative height dominate |

### Detail pages

Per user decision: every non-KR&A card gets an on-site detail page in
the style of `/en/research/gentrification-abm-european-cities` — i.e.
reuse the existing research detail infrastructure and publish page
content via `publish_content_api.py` (exact model/category mechanics
resolved in the implementation plan; may need a `kind`/category field to
separate projects from papers on the combined index).

### Guardrails

- **No GitHub links** on any card until repos are verified public and
  clean. LanguageBuddy's repo has a git-tracked secrets file
  (`openclaw/openclaw.json`, gateway auth token) — must be rotated and
  scrubbed before any link; FishFinder repo visibility unverified.
- SponsoredBye's HF Space URL is verified live; Connectivity links to
  KR&A's site.
- All card numbers come from the 2026-08-22 repo deep-dives; do not
  embellish (e.g. CV study is a workshop/reproducibility-tier result by
  its own audit, not a novel-finding claim).
- 300k records/week, single role title, and other positioning
  guardrails unchanged.

## Invariants

- Papers and their deks stay spatial-centered; paper detail URLs stable.
- CV/resume section and PDF untouched.
- Blogs & Recent Work section content unchanged this round.
- About copy rewrite is a separate follow-up discussion (user: "we
  discuss what we can write better here later").

## Error handling / testing

- `npm run build` passes; all four locales have parity for new keys
  (nav, lanes, about bullets, 9 project cards).
- `/research` index → `/projects` redirect returns 308/301 and old
  paper URLs still resolve.
- Hero SVG renders statically without JS (animations only enhance);
  no layout shift vs current hero grid.
- Live post-deploy check: new hero, chips, nav labels, lanes, 9 cards
  with correct links, redirect, marquee text.
