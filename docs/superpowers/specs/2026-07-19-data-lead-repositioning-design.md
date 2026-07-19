# Design: Data-Lead Repositioning, Resume Destination & Flow Wiring

Date: 2026-07-19 · Status: approved pending final user review · Approach: B (reframe + resume upgrade + flow wiring)

## Goal

Broaden the site's claims from "geodata engineer" to **Data Lead & Engineer with a geo/urban-dynamics specialization** (job-hunting driver: higher-tier data-lead roles), while keeping the research identity. Make all four visitor flows complete end-to-end, with newsletter signup as the capture. Audience posture: **dual, recruiter-leaning** — neutral CTAs that work for recruiters, startups, and consulting leads alike; no explicit "open to work" signal.

Competence set every claim maps back to: **Big Data · Network Science · Timeseries/Forecasting · Spatial · Product Ownership/Leadership.**

Visitor flows to complete:
1. LinkedIn → Blog → related blogs → who I am → resume/competences + projects
2. Search (organic or LLM) → Landing → what I do → Resume → Projects + Papers
3. ArXiv/publications → Paper → other papers → who I am
4. Recruiter → Landing → Resume → Projects + Publications

deita.eu lessons applied: concrete numbers over adjectives; credibility routed *after* content engagement (content → related → author → subscribe); no gated fluff.

## 1. Positioning copy (homepage, `messages/en.json` mirrored to nl/de/it)

**Hero**
- `Hero.role`: "Data Lead & Engineer · Urban-Dynamics Researcher" (leadership first, research kept).
- Headline structural move: broad claim in headline, geo demoted from identity to evidence. Working shape: "Data engineering & *data leadership*, proven on hard spatial problems" — final wording via ianify pass. Constraint: `renderTitle()` italicizes the last word of `Hero.title` and always appends " & " before `titleHighlight`, so `Hero.title` must not end in a conjunction.
- `Hero.description`: rewritten so all five competences appear naturally; urban dynamics is the domain of proof, not the frame.

**Section renaming (labels only — URLs unchanged to preserve backlinks/indexing)**
- Nav "Thoughts" (`Navigation.visualizations`) → **"Work"**. `/thoughts` page + homepage WritingTeaser reframed to case-study language ("Work notes: case studies from projects that shipped"). Blogs = the case studies.
- Nav "Research" → **"Academics"**. `/research` framed as papers/publications.

**Lanes (§ FourLanes) — rebuilt as four new lanes**
1. **Urban dynamics & research** — anchor, "this is what I do": gentrification, accessibility, papers/PhD.
2. **Spatial data products** — shipped products people use; product-ownership signal.
3. **Forecasting & network analysis** — named examples: EU HPI (Eurostat, 13 countries), nowcasting, Connectivity Score.
4. **Data pipelines — built and maintained** — startup signal (technical + leads + maintains); evidence: 3-year weekly scrape.
- Wrapper copy states the dual read: urban dynamics is the bread and butter; the toolkit is a data lead's. All five competence words must literally appear across lane chips/blurbs.

**Proof — replace all three placeholder outcome cards with real ones**
1. **13** · EU countries · one pipeline — monthly house-price index (Eurostat).
2. **Delivery**: Connectivity Score — 13 servers, within budget, delivered 2 weeks ahead of plan.
3. **Reliability**: 250k+ records · 8 sources · scraped weekly for 3 years through scrape protection — institutional-investor grade, also used by statistics bureaus.
- CTAs: "See how we'd work together" → **"See the full resume"** (→ /about); "Book a 20-minute call" → **"Get in touch"**.
- OPEN ITEM: the COO quote ("Ian shipped the thing…") — user must confirm it is real, else remove. No fabricated testimonials.

**CTA sweep**: Lanes "Discuss a project" → "Get in touch". Hero "Let's talk" stays (neutral).

## 2. /about as the resume destination (`About.*` + one new component)

- Page hero: "Head of *Data* / Geodata Systems & Research" → data-lead claim first; `lede1` rewritten to new positioning; `lede2` (biases) kept verbatim.
- **Competence matrix 4 → 5** (`About.expertise`), each with an evidence line: Big Data & Pipelines (3-yr scrape, 250k+, Airflow/PostGIS) · Network Science (Connectivity Score, accessibility) · Timeseries & Forecasting (EU HPI, nowcasting) · Spatial Analysis (parcel/postcode, ABM, H3/PostGIS) · Product Ownership & Leadership (end-to-end builds, on-budget/early delivery, KR&A team leadership). Update `expertiseSubtitle` ("Four" → five, de-geo-ify).
- **Experience entries**: rewritten as led/delivered statements with concrete numbers where known; missing numbers (team size, budget scale) are marked `[NEEDS FACT: …]` in the draft for the user — never invented.
- **Publications block (new)**: compact papers list on /about linking into /research (Academics); sourced from the same backend feed the research list uses.
- **Years: "4+" → "5+" everywhere** — facts sidebar (`factExperienceValueHighlight`), `experienceSubtitle`, journey heading (`journeyTitlePrefixItalic` "Four" → "Five", adjust the split). Broaden "in Real Estate Data Science" → "data engineering & spatial analytics". Keep "Eurostat · CBS · institutional investors".

## 3. Flow plumbing (new blocks on content detail pages)

- **Blog post** (`blog-post.jsx`), after body, in order: (1) **Related posts** — 2–3 cards by shared category/tags from the existing backend feed; (2) **Author trailer** — name, new role line, two-line bio, link to /about ("Full resume"); then the existing newsletter capture. Exit path: related → who I am → subscribe.
- **Research detail** (`research-article-detail.jsx`): same author trailer; verify related-papers handling renders with real data; remove any surviving hardcoded placeholder (legacy "Alex Cartwright" data).
- All new links fire `trackEvent("cta_click", {cta, location, source})` consistent with existing analytics.
- New i18n namespaces/keys for related/author blocks; full 4-locale parity.

## 4. SEO & metadata

- `app/layout.tsx`: title default/template → "Ian Ronk | Data Lead & Engineer · Urban-Dynamics Researcher"; description leads with breadth (leadership + big data + forecasting + network analysis), geo as specialization; keywords add Data Lead, Big Data, Network Science, Time Series Forecasting, Product Ownership (keep geo terms). OG/Twitter mirror.
- `json-ld.jsx`: `PersonJsonLd.jobTitle` → "Data Lead & Engineer"; `knowsAbout` → five competences + urban-dynamics topics; `sameAs` add Medium/Substack + ORCID/ArXiv (OPEN ITEM: user supplies URLs). `WebSiteJsonLd.description` updated.
- Per-page metadata: /about (resume framing), /thoughts (Work/case studies), /research (Academics/publications).
- **Canonical sentence** used verbatim in metadata description, Person schema, and About lede: "Ian Ronk is a data lead and engineer in Amsterdam who builds and runs production data systems — big data pipelines, forecasting, network analysis — with a research specialization in urban dynamics." (Final wording via ianify pass, then frozen everywhere.)

## 5. Content ops (unblocks publishing real posts)

- **Expose Django admin** via Dokploy subdomain `api.ianronk.nl` → backend:8001 (TLS at edge). Code: add host to `DJANGO_ALLOWED_HOSTS` and add `CSRF_TRUSTED_ORIGINS` (env-driven) in settings/compose. WhiteNoise already serves admin static. Interim alternative: SSH tunnel to :8001.
- **Superuser**: create via `manage.py create_admin --email … --username … --password <strong>`; never run bare (defaults to admin/admin). Verify no default admin/admin account exists in prod.
- **`seed_data` runs every deploy** and resurrects deleted placeholder content (get_or_create by slug). Once real content is in: remove from compose command or gate behind an env flag.
- **Security**: compose publishes `8001:8001` (0.0.0.0) — if the server firewall doesn't block it, admin+API are publicly reachable over plain HTTP. Change to `127.0.0.1:8001:8001` and route via Traefik.

## Non-goals (this round)

- No deita-style interactive data hook (inspiration only; possible later project).
- No route renames (/thoughts, /research URLs stay), no /resume page, no PDF CV, no case-study template rebuild.
- No new backend models — content flows through existing blog/research/projects apps.

## Open items (user input required before/at implementation)

1. COO quote — real (keep) or placeholder (remove)?
2. Leadership facts for experience entries — team size(s), scope numbers.
3. `sameAs` URLs — Medium/Substack, ORCID/ArXiv/Scholar.
4. Server firewall status for port 8001; Dokploy access to add the api subdomain + env vars.

## Verification gate

`cd frontend && npm run build`; 4-locale key parity (`jq -r 'paths(scalars)|join(".")'` diff en↔nl/de/it); curl all locales on dev server (must be 200 — next-intl provider errors don't fail the build); Rich Results / schema validation for JSON-LD; grep for surviving "Discuss a project" / "4+ years" / placeholder strings.
