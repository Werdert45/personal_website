# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the homepage per `docs/superpowers/specs/2026-08-22-homepage-redesign-design.md`: reworked jumbotron with a "convergence triptych" hero SVG, renamed nav (Projects & Papers → new `/projects` page, Writing → Blogs), role-centric About Me as section 2, four new expertise lanes, and a 9-card Projects & Papers showcase with new detail pages.

**Architecture:** Frontend is Next.js App Router with next-intl (4 locales: en/nl/de/it; messages in `frontend/messages/*.json`, pretty-printed — edit via python json scripts, never the Edit tool). Homepage is composed of section components in `frontend/app/[locale]/page.jsx`. Backend is Django; project detail pages reuse the Research app (`/research/<slug>` detail route) with a new `project` category, published post-deploy via the content API. Deploy = push to master (Dokploy).

**Tech Stack:** Next.js 14 App Router, next-intl, inline SVG (SMIL animations), Django + DRF, `backend/scripts/publish_content_api.py`.

## Global Constraints

- Canonical strings (verbatim, all surfaces): role line "Head of Data · Engineer & Researcher"; hero "Transforming / *complex data* / into insights."; 300k records a week (never 250k+); single title "Head of Data" everywhere.
- New capability vocabulary (chips AND lanes, identical): Data Engineering · System Architecture · Complex Data Products · Analytics & ML.
- About copy is role-centric ("experience as a Head of Data"), never names KR&A. Card badges MAY say "KR&A".
- **No GitHub links anywhere** (LanguageBuddy repo contains a tracked secret; FishFinder visibility unverified). Only verified external links: `https://huggingface.co/spaces/sponsored-bye/sponsoredbye` and the KR&A URL the user confirms in Task 6.
- All four locale files must stay in parity for every changed namespace. EN is canonical; NL/DE/IT are natural translations, not literal.
- Locale JSON edits: python scripts with `json.load`/`json.dump(..., ensure_ascii=False, indent=2)` + asserts; the Edit tool fails on these files.
- Verification baseline for every task: `cd frontend && npm run build` passes.
- Commit after every task (`--no-verify` is acceptable; repo has unrelated dirty files — stage only the files you touched).
- Paper detail URLs (`/research/<slug>`) must keep working; papers stay spatial-centered.

---

### Task 1: Marquee text + navbar

**Files:**
- Modify: `frontend/components/marquee.jsx:7`
- Modify: `frontend/components/navigation.jsx:28,36-42`
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Navigation` namespace)

**Interfaces:**
- Produces: nav route `/projects` (page created in Task 7 — nav may 404 locally until then; acceptable mid-plan), message key `Navigation.projects`.

- [ ] **Step 1: Marquee** — in `marquee.jsx` change `"Production AI tools"` → `"AI Engineering"` in the `defaults` array.

- [ ] **Step 2: Navigation messages** — python script over all 4 locale files:

```python
import json
vals = {
  "en": {"visualizations": "Blogs",  "projects": "Projects & Papers"},
  "nl": {"visualizations": "Blogs",  "projects": "Projecten & papers"},
  "de": {"visualizations": "Blog",   "projects": "Projekte & Paper"},
  "it": {"visualizations": "Blog",   "projects": "Progetti & paper"},
}
for loc, v in vals.items():
    p = f"frontend/messages/{loc}.json"
    d = json.load(open(p))
    d["Navigation"]["visualizations"] = v["visualizations"]
    d["Navigation"]["projects"] = v["projects"]
    d["Navigation"].pop("research", None)
    json.dump(d, open(p, "w"), ensure_ascii=False, indent=2)
```

(Then re-open each file and assert the keys exist.)

- [ ] **Step 3: navLinks** — in `navigation.jsx` replace the `navLinks` array:

```jsx
const navLinks = [
  { href: `/${locale}`, label: t("home"), idx: "01", routeKey: "/" },
  { href: `/${locale}/about`, label: t("about"), idx: "02", routeKey: "/about" },
  { href: `/${locale}/projects`, label: t("projects"), idx: "03", routeKey: "/projects" },
  { href: `/${locale}/thoughts`, label: t("visualizations"), idx: "04", routeKey: "/thoughts" },
  { href: `/${locale}/contact`, label: t("contact"), idx: "05", routeKey: "/contact" },
];
```

Also update the try/catch fallback dict on line 28 to `{ home: "Home", about: "About", projects: "Projects & Papers", visualizations: "Blogs", contact: "Contact", letsTalk: "Let's talk", menu: "Menu" }`.

Note: `activeKey` matching uses `stripped.startsWith(l.routeKey)`; `/research/<slug>` pages will highlight nothing (no `/research` entry) — acceptable; `/projects` highlights itself.

- [ ] **Step 4: Build** — `cd frontend && npm run build` → passes.
- [ ] **Step 5: Commit** — `git add frontend/components/marquee.jsx frontend/components/navigation.jsx frontend/messages && git commit -m "feat(nav): Projects & Papers + Blogs nav, AI Engineering marquee" --no-verify`

---

### Task 2: Hero visual — convergence triptych component

**Files:**
- Create: `frontend/components/hero-visual.jsx`

**Interfaces:**
- Produces: `export function HeroVisual({ mounted })` — pure inline SVG, no hooks, no libraries. Consumed by Task 3. Static output identical with `mounted=false` (animations only added when true).

- [ ] **Step 1: Create the component** with exactly this structure (adjust coordinates only if visually needed):

```jsx
// Four input panels (map, doc+LLM, graph, time series) feed a structured
// table via dashed arrows — same animation language as the old Europe map.
const PANELS = [
  { x: 30,  label: "SPATIAL" },
  { x: 215, label: "DOCS · LLM" },
  { x: 400, label: "GRAPH" },
  { x: 585, label: "SERIES" },
];

function Panel({ x, label, children }) {
  return (
    <g transform={`translate(${x},30)`}>
      <rect width="145" height="130" fill="var(--paper-2)" stroke="var(--ink)" strokeWidth="0.8" strokeOpacity="0.6" />
      <text x="8" y="120" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink)" opacity="0.75">{label}</text>
      {children}
    </g>
  );
}

export function HeroVisual({ mounted }) {
  const cols = [12, 118, 224, 330, 436]; // table column x-offsets
  return (
    <svg viewBox="0 0 760 560" aria-hidden="true" focusable="false" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <pattern id="hvGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 L0 0 0 30" fill="none" stroke="rgba(15,14,11,.06)" strokeWidth="1" />
        </pattern>
        <radialGradient id="hvGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD60A" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#FFD60A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="760" height="560" fill="url(#hvGrid)" />

      {/* Panel 1 — map: dots + boundary */}
      <Panel x={PANELS[0].x} label={PANELS[0].label}>
        <path d="M18 30 L62 18 L112 34 L126 72 L96 96 L40 92 L20 62 Z" fill="none" stroke="var(--ink)" strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="52" cy="46" r="4" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1" />
        <circle cx="88" cy="62" r="3" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1" />
        <circle cx="66" cy="80" r="2.5" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1" />
      </Panel>

      {/* Panel 2 — document + LLM sparkle */}
      <Panel x={PANELS[1].x} label={PANELS[1].label}>
        <rect x="30" y="16" width="66" height="84" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.9" />
        {[28, 40, 52, 64, 76].map((y, i) => (
          <rect key={y} x="38" y={y} width={i === 2 ? 34 : 50} height="4" fill="var(--ink)" opacity="0.25" />
        ))}
        <path d="M104 26 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="0.8" />
        {mounted && (
          <rect x="30" y="16" width="66" height="3" fill="var(--yellow)" opacity="0.8">
            <animate attributeName="y" values="16;97;16" dur="4s" repeatCount="indefinite" />
          </rect>
        )}
      </Panel>

      {/* Panel 3 — graph/network */}
      <Panel x={PANELS[2].x} label={PANELS[2].label}>
        {[[30, 40], [78, 24], [116, 52], [56, 84], [100, 92]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i === 1 ? 6 : 4} fill={i === 1 ? "var(--yellow)" : "var(--paper)"} stroke="var(--ink)" strokeWidth="1" />
        ))}
        {[[30, 40, 78, 24], [78, 24, 116, 52], [78, 24, 56, 84], [116, 52, 100, 92], [56, 84, 100, 92]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="0.8" opacity="0.6" />
        ))}
      </Panel>

      {/* Panel 4 — time series */}
      <Panel x={PANELS[3].x} label={PANELS[3].label}>
        <polyline points="14,86 34,74 50,80 68,58 86,66 104,40 126,48" fill="none" stroke="var(--ink)" strokeWidth="1.4" />
        <polyline points="14,96 34,92 50,95 68,84 86,88 104,74 126,78" fill="none" stroke="var(--yellow-2)" strokeWidth="1.2" strokeDasharray="4 3" />
      </Panel>

      {/* Converging arrows: panel bottom-centers → table top */}
      {[102, 287, 472, 657].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 165 C ${x} 230, ${380 + (i - 1.5) * 60} 250, ${380 + (i - 1.5) * 60} 300`} fill="none" stroke="var(--ink)" strokeWidth="0.9" strokeDasharray="4 4" opacity="0.55">
            {mounted && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur={`${1.8 + i * 0.35}s`} repeatCount="indefinite" />}
          </path>
          <path d={`M${376 + (i - 1.5) * 60} 294 l4 8 4 -8`} fill="none" stroke="var(--ink)" strokeWidth="0.9" opacity="0.55" />
        </g>
      ))}

      {mounted && (
        <circle cx="380" cy="310" r="70" fill="url(#hvGlow)">
          <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Structured table: header + 4 rows that fill in a loop */}
      <g transform="translate(140,310)">
        <rect width="480" height="180" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
        <rect width="480" height="34" fill="var(--ink)" />
        {["id", "geo", "t", "value", "src"].map((h, i) => (
          <text key={h} x={cols[i]} y="22" fontFamily="var(--font-mono)" fontSize="11" fill="var(--yellow)">{h}</text>
        ))}
        {[0, 1, 2, 3].map((r) => (
          <g key={r} opacity={mounted ? 0 : 0.9}>
            {mounted && (
              <animate attributeName="opacity" values="0;0;0.9;0.9" keyTimes={`0;${0.12 + r * 0.18};${0.2 + r * 0.18};1`} dur="6s" repeatCount="indefinite" />
            )}
            {cols.map((x, c) => (
              <rect key={c} x={x} y={46 + r * 34} width={c === 3 ? 84 : 64} height="10" fill={c === 3 ? "var(--yellow)" : "var(--ink)"} opacity={c === 3 ? 0.85 : 0.18} />
            ))}
          </g>
        ))}
        {[34, 68, 102, 136].map((y) => (
          <line key={y} x1="0" y1={y + 34} x2="480" y2={y + 34} stroke="var(--ink)" strokeWidth="0.5" opacity="0.15" />
        ))}
      </g>

      <text x="140" y="516" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink)" opacity="0.6">4 inputs · one structured layer</text>
    </svg>
  );
}
```

- [ ] **Step 2: Build** — `npm run build` (component compiles even though nothing imports it yet).
- [ ] **Step 3: Commit** — `git add frontend/components/hero-visual.jsx && git commit -m "feat(hero): convergence triptych SVG visual" --no-verify`

---

### Task 3: Jumbotron layout rework

**Files:**
- Modify: `frontend/components/hero-section.jsx`
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Hero.expertiseAreas`)

**Interfaces:**
- Consumes: `HeroVisual({ mounted })` from Task 2.

- [ ] **Step 1: hero-section.jsx edits** (component is already `"use client"` with a `mounted` state — keep both):
  1. Delete the top meta bar `<div>` (lines 48–69: the flex bar containing `{t("location")}` and `§ 01 · Portfolio / 2026`).
  2. In the avatar block, add the location under the role:
     ```jsx
     <div style={{ color: "var(--ink)" }}>Ian Ronk</div>
     <div>{t("role")}</div>
     <div>◎ {t("location")}</div>
     ```
  3. Move the chips row: delete the entire bottom strip `<div>` (the `marginTop: 64 / borderTop` block containing `t("expertise")` and the `expertiseAreas` map) and insert the chips inside the left column, directly under the CTA buttons div:
     ```jsx
     <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
       <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)", marginRight: 8 }}>{t("expertise")}</span>
       {(t.raw("expertiseAreas") || []).map((area) => (
         <span key={area} className="chip">{area}</span>
       ))}
     </div>
     ```
  4. Replace the entire `<svg viewBox="200 80 760 560" ...>…</svg>` map inside `.hero-visual` with `<HeroVisual mounted={mounted} />`. Add `import { HeroVisual } from "./hero-visual";` and remove the now-unused `import { EUROPE_PATH, europeanCities, dataConnections } from "./europe-map-path";` (leave `europe-map-path.js` on disk).

- [ ] **Step 2: Chips messages** — python script, all 4 locales:

```python
areas = {
  "en": ["Data Engineering", "System Architecture", "Complex Data Products", "Analytics & ML"],
  "nl": ["Data engineering", "Systeemarchitectuur", "Complexe dataproducten", "Analytics & ML"],
  "de": ["Data Engineering", "Systemarchitektur", "Komplexe Datenprodukte", "Analytics & ML"],
  "it": ["Data engineering", "Architettura di sistema", "Prodotti dati complessi", "Analytics & ML"],
}
# d["Hero"]["expertiseAreas"] = areas[loc] for each locale, same load/dump pattern as Task 1
```

- [ ] **Step 3: Build + visual smoke** — `npm run build`; then `npm run dev` briefly and eyeball `/en`: no top bar, location under role, chips under CTAs, triptych renders and animates, no layout shift of the hero grid (aspect-ratio container unchanged).
- [ ] **Step 4: Commit** — `git add frontend/components/hero-section.jsx frontend/messages && git commit -m "feat(hero): location under role, chips under CTAs, triptych visual replaces map" --no-verify`

---

### Task 4: Four new lanes + About Me copy

**Files:**
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Lanes`, `AboutTeaser` namespaces)
- Modify: `frontend/components/four-lanes.jsx:27` (tile numbering `§ 04.` → `§ 03.`)

**Interfaces:**
- Produces: `Lanes.items` entries with `{name, blurb, stack}` and **no `anchor` key** (component renders a plain dot when `anchor` is falsy).

- [ ] **Step 1: Lanes EN content** (translate naturally for nl/de/it in the same script):

```python
lanes_en = {
  "kicker": "Expertise: four lanes",
  "titleItalic": "Four",
  "titleRest": "lanes.",
  "subtitle": "One data-and-systems toolkit, four lanes: engineering the pipelines, architecting the platforms they run on, shaping hard data types into products, and the analytics on top.",
  "appliedAcross": "Applied across: urban planning · real estate · climate risk · logistics & mobility · public sector",
  "automationNote": "Also under the hood: LLM/RAG pipelines and internal tools that automate classification, research and reporting — production AI as engineering range, not the headline.",
  "items": [
    {"name": "Data Engineering",
     "blurb": "Data pipelines and storage, built and maintained: three years of weekly collection across 8 authenticated sources at 300k records a week, lakehouse-style warehousing, and orchestration with tests and CI.",
     "stack": ["Airflow", "DuckDB", "lakehouse", "ETL", "CI"]},
    {"name": "System Architecture",
     "blurb": "The platforms underneath: cloud and bare-metal, PostGIS, distributed compute, Linux, networking, APIs and security — 13 servers run as production infrastructure, not pet machines.",
     "stack": ["cloud", "PostGIS", "distributed compute", "Linux", "APIs", "security"]},
    {"name": "Complex Data Products",
     "blurb": "Turning hard data types into products people use: spatial and network data, document pipelines on LLMs and OCR, graphs, and time series — owned end-to-end from method to shipped API.",
     "stack": ["spatial", "graphs", "documents · LLM/OCR", "time series"]},
    {"name": "Analytics & ML",
     "blurb": "The analysis layer on top: time-series models and nowcasting, regressions and causal designs, and applied ML that ships — from hedonic price models to sequence taggers.",
     "stack": ["time series", "nowcasting", "regression", "XGBoost"]},
  ],
}
```

No item carries `anchor: true`. Facts check: 300k/week, 8 sources, 13 servers, three years — all pre-existing verified claims.

- [ ] **Step 2: four-lanes.jsx** — change tile kicker `§ 04.` → `§ 03.` (section label already says § 03).

- [ ] **Step 3: AboutTeaser copy** — role-centric, no KR&A. Update in all 4 locales (EN below; keep existing `kicker`, `title*`, `portraitCaption`, `cta` unless they name KR&A — check and scrub if so). The quick-fire facts block already exists (`factRoleK/V`, `factBasisK/V`, `factEduK/V`, `factStackK/V`) — set values:

```python
about_en = {
  "bio1": "I work as a Head of Data: building and leading the systems that collect, store and serve data at scale — and the analytics on top. Web-scraped market data at 300k records a week, official statistics and slow time series, document pipelines on LLMs and OCR, and spatial and network data.",
  "bio2": "That last one is the research seat: urban dynamics, housing markets, accessibility — where the papers on this site come from.",
  "factRoleK": "Role", "factRoleV": "Head of Data · Engineer & Researcher",
  "factBasisK": "Based", "factBasisV": "Amsterdam, NL",
  "factEduK": "Education", "factEduV": "MSc Bocconi · BSc AI, UvA",
  "factStackK": "Stack", "factStackV": "Python · SQL · Airflow · PostGIS · cloud",
}
```

- [ ] **Step 4: Parity check** — script asserting all 4 locales have identical key sets for `Lanes` and `AboutTeaser`, and 4 lane items each. Then `npm run build`.
- [ ] **Step 5: Commit** — `git add frontend/messages frontend/components/four-lanes.jsx && git commit -m "feat(home): four new expertise lanes + role-centric About Me" --no-verify`

---

### Task 5: Homepage section order + numbering

**Files:**
- Modify: `frontend/app/[locale]/page.jsx`
- Modify: `frontend/components/writing-teaser.jsx` (num-label `§ 06` → `§ 05`)
- Modify: `frontend/components/contact-band.jsx` (grep `num-label`; set to `§ 06`)

- [ ] **Step 1: Reorder** `page.jsx` body to:

```jsx
<main>
  <PersonJsonLd />
  <WebSiteJsonLd />
  <HeroSection />
  <Marquee />
  <AboutTeaser />
  <FourLanes />
  <ProjectsGallery />
  <WritingTeaser locale={locale} />
  <ContactBand />
</main>
```

Remove the `ProofStrip` and `ResearchPreview` imports and usages (files stay on disk). This deletes "Things that shipped" and the standalone research preview (papers now live in the Projects & Papers card set and on `/projects`).

- [ ] **Step 2: Renumber** — AboutTeaser already `§ 02`, FourLanes `§ 03`, ProjectsGallery `§ 04` (fix its card kicker `§ 03.{num}` → `§ 04.{num}` in `projects-gallery.jsx:166` — can be folded into Task 6 if executing sequentially), WritingTeaser → `§ 05`, ContactBand → `§ 06`.
- [ ] **Step 3: Build**, eyeball `/en` section order.
- [ ] **Step 4: Commit** — `git add frontend/app frontend/components && git commit -m "feat(home): new section order — about second, proof strip & research preview removed" --no-verify`

---

### Task 6: 9 project cards

**Files:**
- Modify: `frontend/components/projects-gallery.jsx` (badge render, stat-tile viz, card kicker number)
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Projects` namespace)

**Interfaces:**
- Consumes (user input): the exact KR&A destination URL for the Connectivity card — **ask the user via AskUserQuestion at the start of this task** (options: kra.nl homepage / a specific product page they paste). Do not guess the URL.
- Produces: `Projects.items[]` with fields `{viz, stat?, badge, sector, title, outcome, stack, link}`; `viz: "stat"` renders `VizStat` with `item.stat = {value, label}`.

- [ ] **Step 1: Component changes** in `projects-gallery.jsx`:
  1. Add a stat-tile viz next to the existing ones:

```jsx
function VizStat({ value, label }) {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={`${value} — ${label}`} style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id={`sg-${value}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill={`url(#sg-${value})`} />
      <rect x="14" y="14" width="34" height="5" fill="#FFD60A" />
      <text x="14" y="98" fontFamily="var(--font-serif)" fontSize="52" fill="#111110" letterSpacing="-0.02em">{value}</text>
      <text x="14" y="126" fontFamily="var(--font-mono)" fontSize="10" fill="#8A8676" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</text>
    </svg>
  );
}
```

  2. `ProjectViz`: `if (kind === "stat") return <VizStat value={stat?.value} label={stat?.label} />;` and pass `stat={item.stat}` from the card render.
  3. Badge chip in the card kicker row (`project-kicker`), after `{item.sector}`:

```jsx
{item.badge && (
  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, background: item.badge === "KR&A" ? "var(--ink)" : "var(--yellow)", color: item.badge === "KR&A" ? "var(--yellow)" : "var(--ink)", padding: "2px 8px", borderRadius: 2, letterSpacing: "0.08em" }}>{item.badge}</span>
)}
```

  4. Card kicker number `§ 03.{num}` → `§ 04.{num}` (if not already done in Task 5).

- [ ] **Step 2: Projects messages (EN canonical; translate outcome/sector for nl/de/it, keep titles/stack/links identical across locales):**

```python
projects_en = {
  "kicker": "Projects & papers: systems, products, research",
  "titlePrefix": "Projects",
  "titleItalic": "& papers.",
  "subtitle": "Nine pieces of work across the four lanes — production systems, shipped products, and the research they make possible.",
  "viewCase": <keep existing>, "viewPaper": <keep existing>,
  "items": [
    {"viz": "stat", "stat": {"value": "6,200+", "label": "vocab entries · 3 languages"},
     "badge": "PROJECT", "sector": "AI product",
     "title": "LanguageBuddy — AI language tutor",
     "outcome": "A self-hosted AI language tutor for Dutch, Italian and Spanish: chat or voice-call an LLM tutor, and every mistake is captured into a spaced-repetition queue that drives the next day's exercises, real-news reading and printable workbooks. Adaptive CEFR placement, 6,200+ curated vocabulary entries, a 336-test suite.",
     "stack": ["FastAPI", "LLM", "TTS", "SQLite", "Docker"],
     "link": "/research/languagebuddy-ai-language-tutor"},
    {"viz": "abm", "badge": "RESEARCH", "sector": "MSc Thesis · Bocconi",
     "title": "Gentrification agent-based model",
     "outcome": "An agent-based model of neighbourhood change: households and landlords interacting on real parcel data for Amsterdam, Utrecht and Milan, reproducing gentrification waves from attractiveness and affordability feedback — with a two-tenure social-housing extension in progress.",
     "stack": ["Python", "Mesa", "GeoPandas", "Postgres"],
     "link": "/research/gentrification-abm-european-cities"},
    {"viz": "stat", "stat": {"value": "38", "label": "markets · parcel resolution"},
     "badge": "KR&A", "sector": "Developed at KR&A",
     "title": "Connectivity & walkability scoring",
     "outcome": "A saturation-validated connectivity and walkability score at parcel resolution, rolled out across 38 EU/NA/APAC markets. Method paper forthcoming 2026.",
     "stack": ["PostGIS", "H3", "GeoPandas", "Python"],
     "link": "<KR&A URL from user>"},
    {"viz": "hedonic", "badge": "RESEARCH", "sector": "Research · Eurostat",
     "title": "Monthly house-price index · 13 EU countries",
     "outcome": "A web-scraping pipeline across 13 countries feeding a log-price hedonic regression; monthly indices tested as disaggregation indicators for Eurostat quarterly HPIs — and the price data behind the metro-capitalisation paper.",
     "stack": ["Python", "Scrapy", "PostGIS", "MongoDB", "XGBoost"],
     "link": "/research/metro-capitalisation-timing"},
    {"viz": "stat", "stat": {"value": "726 GB", "label": "largest DAG input · 6 pipelines"},
     "badge": "PROJECT", "sector": "Engineering",
     "title": "Research pipelines as production systems",
     "outcome": "Every research project on this site rebuilt as a truthful Airflow 3 DAG — real scripts, real idempotency guards, custom operators, tests and CI — scaling from a laptop to a multi-machine CeleryExecutor cluster. Written up as a case-study series.",
     "stack": ["Airflow", "Celery", "DuckDB", "Docker", "CI"],
     "link": "/thoughts/research-pipelines-are-production-systems"},
    {"viz": "stat", "stat": {"value": "+0.001", "label": "mAP gained from US data on EU streets"},
     "badge": "RESEARCH", "sector": "Computer vision · Bocconi",
     "title": "US vs EU transfer for autonomous driving",
     "outcome": "Does a detector trained on US dashcam data work on European streets? A controlled 2×3 fine-tuning study (YOLOv3/YOLOv8, Udacity vs KITTI) correcting an earlier course project's confounds: US fine-tuning transfers roughly nothing to EU streets, while in-domain fine-tuning gains +0.15 mAP.",
     "stack": ["PyTorch", "YOLOv8", "KITTI", "Udacity"],
     "link": "/research/us-vs-eu-transfer-autonomous-driving"},
    {"viz": "stat", "stat": {"value": "86%", "label": "macro F1 · 38,600 videos"},
     "badge": "PROJECT", "sector": "NLP · live demo",
     "title": "SponsoredBye — sponsor-segment detection",
     "outcome": "A text-only sponsor-skipper for YouTube, built before YouTube Premium shipped one: sentence-T5 embeddings feed a BiLSTM sequence tagger that flags sponsored sentences and maps them back to timestamps. Live demo on Hugging Face Spaces.",
     "stack": ["TensorFlow", "BiLSTM", "sentence-T5", "MongoDB", "Gradio"],
     "link": "https://huggingface.co/spaces/sponsored-bye/sponsoredbye"},
    {"viz": "stat", "stat": {"value": "63", "label": "species · fully on-device"},
     "badge": "PROJECT", "sector": "Mobile ML",
     "title": "FishFinder — photo-to-species ID",
     "outcome": "A Flutter app that identifies 63 Dutch fish species from a photo, fully on-device, and fills a Pokédex-style FishDex as you catch them. The training pipeline: ~3,000 hand-annotated photos masked with Segment Anything, then a fine-tuned ResNet50 compressed to an 8.8 MB TFLite model.",
     "stack": ["Flutter", "TFLite", "ResNet50", "Segment Anything", "Firebase"],
     "link": "/research/fishfinder-on-device-fish-id"},
    {"viz": "stat", "stat": {"value": "97.5%", "label": "binary flood accuracy · RF"},
     "badge": "RESEARCH", "sector": "BSc Thesis · UvA",
     "title": "Predicting flooding risk from local features",
     "outcome": "Can flood risk be explained by local features instead of a black-box hydrodynamic simulation? 33 features across ~45,000 European locations; a Random Forest hits 97.5% on the binary 20-year flood question, with surrounding imperviousness and relative height doing most of the work.",
     "stack": ["scikit-learn", "Random Forest", "raster data", "GIS"],
     "link": "/research/predicting-flooding-risk-local-features"},
  ],
}
```

Facts all sourced from the 2026-08-22 repo deep-dives recorded in the spec. Do not add repo links.

- [ ] **Step 3: Build + parity check** (9 items in all 4 locales; identical `link`/`stack`/`stat`/`badge` values across locales), eyeball the grid — stat tiles render, badges show, external cards open in new tab (existing `isExternalLink` logic handles this).
- [ ] **Step 4: Commit** — `git add frontend/components/projects-gallery.jsx frontend/messages && git commit -m "feat(projects): 9-card Projects & Papers showcase with badges and stat tiles" --no-verify`

---

### Task 7: `/projects` page + `/research` index redirect

**Files:**
- Create: `frontend/app/[locale]/projects/page.jsx`
- Delete: `frontend/app/[locale]/research/page.jsx` (keep `research/[slug]/`)
- Modify: `frontend/next.config.mjs` (redirect)
- Modify: `frontend/components/research-list.jsx` (filter out `project` category rows)

- [ ] **Step 1: New page** — `frontend/app/[locale]/projects/page.jsx`:

```jsx
import { ProjectsGallery } from "@/components/projects-gallery";
import { ResearchList } from "@/components/research-list";

export const revalidate = 300;

async function fetchResearchList() {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/research/`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || data;
    return Array.isArray(results) && results.length ? results : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";
  const url = `${siteUrl}/${locale}/projects`;
  const description =
    "Projects and papers by Ian Ronk — production data systems, shipped products, and research on urban dynamics, housing markets and geospatial methods.";
  return {
    title: "Projects & Papers",
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/projects`, nl: `${siteUrl}/nl/projects`,
        de: `${siteUrl}/de/projects`, it: `${siteUrl}/it/projects`,
        "x-default": `${siteUrl}/en/projects`,
      },
    },
    openGraph: { title: "Projects & Papers", description, url, type: "website" },
  };
}

export default async function ProjectsPage() {
  const items = await fetchResearchList();
  const papers = (items || []).filter((i) => i.category !== "project");
  return (
    <main style={{ paddingTop: 72 }}>
      <ProjectsGallery />
      <ResearchList initialItems={papers} />
    </main>
  );
}
```

(Check how `thoughts/page.jsx` handles top padding under the fixed nav and mirror it; drop the inline `paddingTop` if a `page-frame`/class already does this.)

- [ ] **Step 2: Redirect** — delete `research/page.jsx`; in `next.config.mjs` `redirects()` add per locale:

```js
{ source: `/${locale}/research`, destination: `/${locale}/projects`, permanent: true },
```

(Exact-match source — `/research/:slug` detail pages are untouched.)

- [ ] **Step 3: Filter safety in `research-list.jsx`** — where API items render (and in any client-side refetch), exclude `item.category === "project"` so project detail rows never appear among papers even when the component fetches on its own:

```jsx
const visible = (items || []).filter((i) => i.category !== "project");
```

- [ ] **Step 4: Sitemap check** — `frontend/app/sitemap.ts`: ensure `/projects` is emitted for each locale and `/research` index entries are removed (research `[slug]` URLs stay).
- [ ] **Step 5: Build; verify** `curl -sI localhost:3000/en/research` → 308 to `/en/projects` in `npm run start` smoke, `/en/projects` renders cards + papers.
- [ ] **Step 6: Commit** — `git add -A frontend/app frontend/next.config.mjs frontend/components/research-list.jsx && git commit -m "feat(projects): combined /projects index, /research index redirects" --no-verify`

---

### Task 8: Backend `project` category

**Files:**
- Modify: `backend/apps/research/models.py` (CATEGORY_CHOICES)
- Create: migration `backend/apps/research/migrations/0012_*.py` (via makemigrations)

- [ ] **Step 1:** Add `("project", "Project"),` to `CATEGORY_CHOICES` in `models.py`.
- [ ] **Step 2:** `cd backend && python manage.py makemigrations research` (choices-only change; migration will be a no-op AlterField — commit it anyway so prod migrate is clean).
- [ ] **Step 3:** Quick check that the serializer/list view doesn't hard-filter categories (it doesn't today — `excerpt`/`category` pass through).
- [ ] **Step 4: Commit** — `git add backend/apps/research && git commit -m "feat(research): project category for project detail pages" --no-verify`

---

### Task 9: Four project detail pages (seed content)

**Files:**
- Create: `backend/seed_content/research/languagebuddy-ai-language-tutor.md`
- Create: `backend/seed_content/research/us-vs-eu-transfer-autonomous-driving.md`
- Create: `backend/seed_content/research/fishfinder-on-device-fish-id.md`
- Create: `backend/seed_content/research/predicting-flooding-risk-local-features.md`

**Interfaces:**
- Produces: slugs matching the card links in Task 6 exactly. Frontmatter must match what `publish_content_api.py` expects — copy the frontmatter key set from an existing file in `backend/seed_content/research/` (e.g. the metro paper), with `category: project` and `status: published`. Include an `excerpt:` dek (2 sentences, plain language) — it renders in list rows, though these rows are filtered off the papers list; the detail page shows the abstract/content.

Each page: 400–700 words of markdown — sections **What it is / How it works / Results / Stack**. Write from these verified fact sheets ONLY (no repo links, no "code available" claims):

1. **LanguageBuddy** (`languagebuddy-ai-language-tutor`, date "2026", category project): self-hosted AI language tutor, NL/IT/ES (A1–C1). Adaptive CEFR placement exam scoring five skills independently; daily lesson plans (cloze, grammar, translation, listening via TTS, reading comprehension built from that day's real news — NOS/ANSA/EFE; writing graded by LLM against a CEFR rubric). Free chat + hands-free voice-call mode (Web Speech API + neural TTS); mistakes auto-captured, lemmatized, scheduled by SM-2 spaced repetition, resurfaced in next-day exercises and printable PDF workbooks. Duolingo-style gamification (XP, streaks, hearts). Stack: FastAPI (Python 3.12), SQLite (35-table schema), pluggable LLM provider, edge-tts, LibreTranslate, PWA frontend, Docker Compose, 336 tests. Scale: 6,219 vocab entries across 31 files, 177 conversation scenarios, ~20,700 lines of Python. Hardened containers (read-only rootfs, dropped capabilities).
2. **US vs EU transfer** (`us-vs-eu-transfer-autonomous-driving`, date "2024–2025", category project — framed as a study): question = does US dashcam training data transfer to European streets? Original 2024 Bocconi course project (YOLOv3, Zenseact + US data) was confounded (precision-only, no holdout, resolution mismatch); the 2025 redo fixes this with a controlled 2×3 design — {zero-shot COCO, US-fine-tuned, EU-fine-tuned} × {US-test, EU-test}, YOLOv3u + YOLOv8s, Udacity/CrowdAI (US) vs KITTI (EU = German driving only; state this caveat). Results: on EU test, EU fine-tuning gains +0.153 mAP@.5:.95 over zero-shot vs +0.001 for US fine-tuning; difference-in-differences Δ = +0.077 ± 0.007 across 3 seeds; conclusion = narrow-fine-tune specialisation rather than a US-specific geographic bias; bicycle detection collapses without EU data (~30× fewer bicycles in US ground truth). Honest framing: a controlled correction of a "catastrophic transfer" claim, reproducibility-tier.
3. **FishFinder** (`fishfinder-on-device-fish-id`, date "2020–2024", category project): Flutter app identifying 63 Dutch fish species from a photo, fully on-device (8.8 MB TFLite model, no inference server); Pokédex-style FishDex, Firebase accounts/friends, hand-written Dutch species profiles (126 KB JSON: latin name, size, edibility, conservation status, season). Training pipeline v2 (2024): ~3,000 self-collected images, one human click per fish in CVAT → point prompt to Segment Anything → best mask kept → crop/re-square to 224×224 → fine-tuned ResNet50 (73% val top-1 / ~90% top-5 on 10 classes — say "early-stage accuracy on a small self-collected dataset"; do not overstate). v1 was MobileNetV2 transfer learning. UI refresh planned.
4. **Flooding thesis** (`predicting-flooding-risk-local-features`, date "2022", category project or thesis — use `thesis`, it's truthful and renders as THESIS tag): "Predicting Flooding Risk for Pan-European REIT Assets using Local Features", BSc AI thesis, University of Amsterdam, 2022, industry partner KR&A. Question: can the EU's simulated fluvial flood maps (Dottori et al. 2016, 250 m, return periods 10–200 yr) be reproduced from local, explainable features? 33 features in micro/meso/macro bands (precipitation extremes, ground type, artificial imperviousness at multiple radii, distance/relative height to nearest river, depressions, regional GDP); ~45,700 balanced samples from all European towns >1,000 inhabitants. Models: logistic regression, Random Forest, neural net. RF wins everywhere: 97.5% binary (20-yr flood), 73.8% across four risk classes on held-out test; imperviousness within 500 m–1 km and relative height dominate feature importance. Framing: explainable-by-construction alternative to a black-box hydrodynamic simulation, for real-estate risk screening. **This card's detail page also links the PDF** — copy `Afstudeerproject___Flooding_Risk.pdf` to `frontend/public/papers/predicting-flooding-risk-local-features.pdf` and reference it as the paper link in frontmatter (`pdf_url` or the field the metro paper uses for its PDF — mirror it).

- [ ] **Step 1:** Write the four markdown files (frontmatter cloned from an existing seed research file; `category: project` except thesis → `thesis`; `status: published`).
- [ ] **Step 2:** Copy the thesis PDF into `frontend/public/papers/` (create dir if missing) with the name above.
- [ ] **Step 3:** Local sanity: `python3 -c` frontmatter parse of each file (yaml between `---` fences loads, slug matches filename).
- [ ] **Step 4: Commit** — `git add backend/seed_content/research frontend/public/papers && git commit -m "content: four project detail pages (LanguageBuddy, US-vs-EU CV, FishFinder, flooding thesis)" --no-verify`

---

### Task 10: Deploy + publish + live verification

- [ ] **Step 1: Final build** — `cd frontend && npm run build` clean.
- [ ] **Step 2: Push** — merge/push to `master` (this deploys via Dokploy; frontend files changed, so the frontend container rebuilds).
- [ ] **Step 3: Migrate (prod)** — `ssh root@188.245.79.77 "docker exec personal-website-website-to1fca-backend-1 python manage.py migrate"`
- [ ] **Step 4: Publish the four items (prod)** — content ops via API per project memory: retrieve key `docker exec <backend-container> printenv CONTENT_API_KEY`, then for each of the four files run `publish_content_api.py` (upsert by slug) inside the container or via tunnel — same procedure as the August blog/paper publishes.
- [ ] **Step 5: Live checks** (curl + browser):
  - `https://ianronk.nl/en/research` → 308 → `/en/projects`; `/en/projects` shows 9 cards + papers list (papers exclude the 4 project items).
  - Old paper URL still 200: `/en/research/metro-capitalisation-timing` (or current live paper slug).
  - 4 new detail pages 200 with content; flooding page links its PDF.
  - Homepage: order Hero → Marquee → About → Lanes → Projects → Blogs → Contact; no top meta bar; location under role; chips under CTAs reading Data Engineering · System Architecture · Complex Data Products · Analytics & ML; triptych animating; marquee says "AI Engineering"; no "Things that shipped".
  - Nav shows Home · About · Projects & Papers · Blogs · Contact in all 4 locales.
  - SponsoredBye card opens the HF Space in a new tab.
- [ ] **Step 6: Memory update** — update `project-positioning-strategy.md` memory: chips/lanes vocabulary superseded (new four capability areas), nav is now Projects & Papers + Blogs, `/research` index redirects to `/projects`.

## Self-review notes

- Spec coverage: jumbotron (T2/T3), marquee (T1), nav (T1/T7), section order + removals (T5), lanes (T4), About role-centric + quick-fire (T4), 9 cards (T6), combined index + redirect (T7), backend category (T8), detail pages + PDF (T9), guardrails (global constraints), deploy/verify (T10). About full-page copy rework is explicitly out of scope (spec: workshopped later).
- Open user input: KR&A URL (gated inside Task 6, explicit AskUserQuestion step).
- Type consistency: card `link` slugs in T6 === seed file slugs in T9 (`languagebuddy-ai-language-tutor`, `us-vs-eu-transfer-autonomous-driving`, `fishfinder-on-device-fish-id`, `predicting-flooding-risk-local-features`).
