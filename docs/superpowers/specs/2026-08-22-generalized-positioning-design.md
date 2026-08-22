# Generalized positioning — design spec

Date: 2026-08-22
Status: approved in brainstorming session (all four sections; section 1 amended)

## Goal

Reposition the site from spatial-first to Head-of-Data-first: big data
systems + analytics in the foreground, spatial named as the research
specialty rather than the headline. Papers stay spatial-centered.

## Decisions (user-approved)

| Decision | Choice |
|---|---|
| Target read | Head of Data / Data Lead within 10 seconds |
| Named data types | Web-scraped market data · official statistics & time series · documents/text (LLM/OCR) · spatial & network data |
| Scope | Full positioning layer; CV/PDF, papers, posts, nav untouched |
| Hero | "Transforming / *complex data* / into insights." |
| Role duplication | Remove role from hero top meta bar (location stays); role renders only next to the avatar |
| Expertise chips | Capability areas, not technologies: System Infrastructure · Cloud · Complex Data Processing · Analytics — moved into messages/i18n |
| Canonical niche line | "Head of Data — data systems, analytics, and urban-dynamics research" |

## Copy (English canonical; NL/DE/IT mirrored naturally, not literally)

### Hero block (`hero-section.jsx` + `Hero.*` messages)

- title: "Transforming" / titleHighlight: "complex data" / titleEnd: "into insights."
- role (single occurrence, next to avatar; also reused on contact page):
  "Head of Data · Engineer & Researcher"
- description:
  "I build and lead production data systems and the analytics on top:
  web-scraped market data at 300k records a week, official statistics
  and slow time series, document pipelines built on LLMs and OCR, and
  spatial and network data. That last one is the research seat — urban
  dynamics, housing markets, accessibility — where the papers on this
  site come from."
- Top meta bar: location only ("◎ Amsterdam, NL"); the "◆ role" span is removed.
- Expertise chips become `Hero.expertiseAreas` (JSON list in messages):
  ["System Infrastructure", "Cloud", "Complex Data Processing", "Analytics"],
  translated per locale.

### About (`About.*` messages)

- lede1 rewritten around the four data types (same content strategy as
  the hero description, longer form); closing line flipped to lead
  general: "A data lead by trade; a geodata specialist by depth."
- lede2, expertise cards (5 competences), education/experience copy,
  proof strip: unchanged.

### Meta / discoverability layer (doubles as the GEO entity-consistency fix)

One canonical niche line — "Head of Data — data systems, analytics,
and urban-dynamics research" — used identically in:

- homepage and about `<title>` / meta descriptions (currently
  "Data Lead & Engineer · Urban-Dynamics Researcher" variants)
- `Contact.roleTitle` gets the display role line ("Head of Data ·
  Engineer & Researcher"); `Contact.bio` rewritten to the four types
- `frontend/public/llms.txt` (bio line; evidence bullets stay)
- JSON-LD Person `jobTitle` and description (`json-ld.jsx`)

Recommended (user-side): reuse the same string on LinkedIn/GitHub bios.

## Invariants

- Papers, research pages, and their deks stay spatial-centered.
- Blog posts, v6 CV (resume section + generated PDF), map figures,
  Writing/Research nav: untouched.
- No backend changes; frontend copy + components only.

## Error handling / testing

- `npm run build` must pass; hero renders 3 lines with no dangling
  punctuation; chips render from messages in all four locales
  (fallback: EN strings).
- Verify live post-deploy: hero copy, single role occurrence, chips,
  About lede, contact bio, llms.txt, JSON-LD jobTitle, page titles.
