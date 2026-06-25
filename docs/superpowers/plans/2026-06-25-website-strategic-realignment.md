# Website Strategic Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the site as *geodata engineer + urban-dynamics researcher* (not an automation consultant), restructure the homepage into a reputation-led funnel that terminates in contact, and close the verified conversion leaks.

**Architecture:** Next.js 16 App Router. The homepage (`app/[locale]/page.jsx`, a server component) composes client section-components that read copy from `next-intl` namespaces in `messages/{en,nl,de,it}.json`. We reorder the composition, replace the Skills-Grid + Sectors-Strip with a new **Four Lanes** section, restore the **Proof** section, append a new **Contact band**, rewrite positioning copy across all four locales, and patch funnel mechanics (hero CTA, mobile nav, dead-end content pages, sitemap/hreflang).

**Tech Stack:** Next.js 16.0.10, React 19.2.0, next-intl 4.8.3, global CSS (no Tailwind/CSS-modules), Google-Analytics via `lib/analytics.js`, Django/PostGIS backend (content API only).

## Global Constraints

- **No test framework exists** (no `test` script; no jest/vitest/playwright). The verification cycle for every task is: **`cd frontend && npm run build` passes** + (for copy) **locale key-parity holds** + (for UI) a **dev-server visual check**. Do not invent a test runner. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so the build will not catch type errors — read carefully.
- **Four locales are load-bearing:** `en`, `nl`, `de`, `it` (decision: keep all 4). Every copy key added/renamed/changed in `en.json` MUST be mirrored in `nl.json`, `de.json`, `it.json`. Parity is verified per task (command in Task 0).
- **Copy authoring:** author EN verbatim as given here (already in Ian's register). NL/DE translate to match. **IT strings are flagged for human review** before merge (Verona market-seeding) — translate as a first pass, mark the PR for IT review; do not treat machine IT as final.
- **Conversion verb:** **"Let's talk"** across hero + nav + Contact band.
- **Styling:** match house style — semantic global classes `btn primary` / `btn ghost` (primary buttons carry a trailing arrow `<svg ...><path d="M5 12h14M13 5l7 7-7 7" /></svg>`), section scaffolding `section-pad`, `section-label` > (`bar`, `num-label`), `section-head`; design tokens `var(--font-serif)`, `var(--ink)`, `var(--ink-2)`, `var(--yellow-2)`, etc. Manual `§ NN` section kickers.
- **Analytics:** `trackEvent(name, params)` from `@/lib/analytics`; convention `trackEvent("cta_click", { cta, location, source })`. It no-ops without consent — that's expected.
- **No dark patterns:** CTAs stay calm and low-pressure ("ask, do not pitch"). No popups, scarcity, or auto-opening modals.
- **Branch:** all work on a feature branch off `master` (Task 0). Commit after every task.
- **Booking URL:** the canonical booking link is `https://cal.com/ianronk/intro` (already used in `proof-strip.jsx`).

**Spec:** `docs/superpowers/specs/2026-06-25-website-strategic-realignment-design.md`. Every task traces to a spec section, noted inline.

---

## Phase 0 — Setup

### Task 0: Branch + verification helpers

**Files:** none created; establishes workflow.

- [ ] **Step 1: Create the feature branch**

```bash
cd /Users/ianronk/Projects/personal-website
git checkout -b feat/strategic-realignment
```

- [ ] **Step 2: Confirm a clean baseline build**

```bash
cd frontend && npm run build
```
Expected: build completes (`✓ Compiled`, route list printed). If it fails on the *current* tree, stop and report — do not start changes on a broken baseline. (Backend may be down; the sitemap try/catch tolerates that.)

- [ ] **Step 3: Save the locale key-parity check as a one-liner you'll reuse**

Run this after any `messages/*.json` change; it prints keys present in `en` but missing per locale (empty output = parity holds):

```bash
cd frontend && for l in nl de it; do echo "== $l missing vs en =="; diff <(jq -r 'paths(scalars)|join(".")' messages/en.json|sort) <(jq -r 'paths(scalars)|join(".")' messages/$l.json|sort) | grep '^<' || echo "  (none)"; done
```

- [ ] **Step 4: Fix the pre-existing parity gap (baseline hygiene)**

`nl/de/it` are each missing `About.factClientsPersonal` and `About.factClientsPersonalValue`. Add them to each (translate the label; the value `ingoglia.de` is a URL — keep verbatim). In `messages/nl.json`, `de.json`, `it.json`, inside the `About` object add:
```json
"factClientsPersonal": "Personal",
"factClientsPersonalValue": "ingoglia.de"
```
(NL "Persoonlijk", DE "Persönlich", IT "Personale" for the label.) Re-run Step 3 → expect `(none)` for all three.

- [ ] **Step 5: Commit**

```bash
git add frontend/messages/nl.json frontend/messages/de.json frontend/messages/it.json
git commit -m "chore: restore About.factClientsPersonal key parity across locales"
```

---

## Phase 1 — Positioning copy

> Reframe the identity copy in all four locales. Spec §3, §4 (§01/§02), §5. No structural changes yet.

### Task 1: Hero — reposition + rebalance CTAs (spec §4 §01; funnel L5/R5)

**Files:**
- Modify: `frontend/components/hero-section.jsx` (CTA block)
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Hero` namespace)

**Interfaces:**
- Produces: `Hero.letsTalk` (primary CTA label), `Hero.aboutMe` (renamed from `Hero.viewProjects`).

- [ ] **Step 1: Rewrite Hero copy in `en.json`**

Replace the current `Hero` values for these keys (leave all other Hero keys as-is):
```json
"title": "Geodata engineering and ",
"titleHighlight": "urban-dynamics research",
"titleEnd": " for decisions about place.",
"description": "I build production spatial systems and study how cities change — gentrification, accessibility, housing markets — at parcel and postcode resolution. The sectors vary; the question rarely does: where, how much, and what's next.",
"viewProjects": "About me",
"workWithMe": "Let's talk"
```
Then **rename** the key `viewProjects` → `aboutMe` (same value `"About me"`). Net: `Hero.aboutMe = "About me"`, `Hero.workWithMe = "Let's talk"`. Keep `role` = `"Head of Data @ KR&A"` (KR&A as credential).

- [ ] **Step 2: Mirror in `nl/de/it`**

Apply the same key rename (`viewProjects`→`aboutMe`) and value changes, translated. IT flagged for human review. Suggested:
- NL: title `"Geodata-engineering en "`, highlight `"onderzoek naar stadsdynamiek"`, end `" voor beslissingen over plek."`, aboutMe `"Over mij"`, workWithMe `"Even praten"`.
- DE: title `"Geodaten-Engineering und "`, highlight `"Stadtdynamik-Forschung"`, end `" für Entscheidungen über Orte."`, aboutMe `"Über mich"`, workWithMe `"Sprechen wir"`.
- IT (review): title `"Ingegneria geodata e "`, highlight `"ricerca sulle dinamiche urbane"`, end `" per decisioni sui luoghi."`, aboutMe `"Chi sono"`, workWithMe `"Parliamone"`.
- Description: translate the EN sentence per locale.

- [ ] **Step 3: Rebalance the CTA block in `hero-section.jsx`**

Replace the existing CTA `<div>` (the block with the two `<Link>`s) with this — Contact becomes **primary**, About becomes **ghost**, and `t("viewProjects")` → `t("aboutMe")`:
```jsx
<div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
  <Link
    href={`/${locale}/contact`}
    className="btn primary"
    onClick={() => trackEvent("cta_click", { cta: "contact", location: "hero", source: "hero_primary" })}
  >
    <span>{t("workWithMe")}</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
  </Link>
  <Link
    href={`/${locale}/about`}
    className="btn ghost"
    onClick={() => trackEvent("cta_click", { cta: "about_me", location: "hero", source: "hero_secondary" })}
  >
    <span>{t("aboutMe")}</span>
  </Link>
</div>
```

- [ ] **Step 4: Verify** — `cd frontend && npm run build` passes; run the parity check (Task 0 Step 3) → `(none)`. Start `npm run dev`, load `/en`: hero reads the new headline, the **primary** (filled) button says "Let's talk" → `/contact`, ghost says "About me" → `/about`. Confirm "AI/ML Automation" no longer appears in the hero.

- [ ] **Step 5: Commit**
```bash
git add frontend/components/hero-section.jsx frontend/messages/*.json
git commit -m "feat(hero): reposition to geodata+urban-dynamics; make contact the primary CTA"
```

### Task 2: Marquee items (spec §4 §02)

**Files:** Modify `frontend/components/marquee.jsx` (the `defaults` array).

- [ ] **Step 1: Replace the `defaults` array**
```jsx
const defaults = [
  "Urban dynamics",
  "Geospatial methods",
  "Spatial forecasting",
  "Data engineering",
  "Production AI tools",
];
```
(The marquee is not localized — single source. "AI/ML Automation" leaves the front; "Production AI tools" sits last as range.)

- [ ] **Step 2: Verify** — build passes; dev server shows the new scrolling items.

- [ ] **Step 3: Commit**
```bash
git add frontend/components/marquee.jsx
git commit -m "feat(marquee): lead with urban dynamics; demote automation to range"
```

### Task 3: About teaser + About page lede (spec §3, §5)

**Files:** Modify `frontend/messages/{en,nl,de,it}.json` (`AboutTeaser` and `About` namespaces).

> Lead with the researcher+engineer identity; KR&A as cited credential; real estate as one application. (`AboutTeaser` is its own namespace — verify exact keys in `en.json` before editing; this task changes copy only.)

- [ ] **Step 1: Rewrite `About.lede1` and `About.lede2` in `en.json`**
```json
"lede1": "Based in Amsterdam, I engineer production spatial systems and research how cities change. The work runs from PostGIS schemas, hedonic models and agent-based gentrification models to DeckGL maps that turn parcel-level data into a decision. Real estate is one application among several — climate risk, mobility, public planning — not the frame. Head of Data at KR&A is the credential; the throughline is geospatial engineering with research-grade depth in urban dynamics.",
"lede2": "My bias: opinionated internal tools beat big platforms; a calibrated pipeline beats a clever one; and a map should answer a question, not perform complexity."
```

- [ ] **Step 2: Reframe the `AboutTeaser` namespace copy** — open `en.json`, read the `AboutTeaser` keys, and rewrite its bio lines so the first sentence leads with "geodata engineer and urban-dynamics researcher" and cites "Head of Data at KR&A" as a credential rather than the frame (mirror the lede1 tone). Keep key names unchanged.

- [ ] **Step 3: Mirror all changed keys in `nl/de/it`** (translate; IT flagged for review). Run parity check → `(none)`.

- [ ] **Step 4: Verify** — build passes; `/en` about-teaser and `/en/about` lede read identity-first; real estate framed as one application.

- [ ] **Step 5: Commit**
```bash
git add frontend/messages/*.json
git commit -m "feat(about): lead with researcher identity; KR&A as credential; real estate as one application"
```

### Task 4: Contact bio + Research subtitle reframe (spec §5)

**Files:** Modify `frontend/messages/{en,nl,de,it}.json` (`Contact.bio`, `Contact.roleTitle`, `Research.listSubtitle`, `Research.previewSubtitleShort`).

- [ ] **Step 1: `en.json` edits**
```json
"Contact.roleTitle": "Geodata Engineer & Urban-Dynamics Researcher · Head of Data @ KR&A",
"Contact.bio": "Based in Amsterdam. I engineer production spatial systems and research how cities change — gentrification, accessibility, housing markets — at parcel and postcode resolution. The sectors vary (real estate, climate risk, public planning); the question rarely does: where, how much, and what's next.",
"Research.listSubtitle": "Work on urban dynamics and geospatial methods — gentrification, accessibility, large-scale European spatial-data engineering and housing-market analysis.",
"Research.previewSubtitleShort": "Recent work on urban dynamics, geospatial methods and large-scale European spatial-data engineering."
```
(Write these as the actual nested values inside their objects, not dotted keys.)

- [ ] **Step 2: Mirror in `nl/de/it`** (IT review). Parity → `(none)`.

- [ ] **Step 3: Verify** — build passes; `/en/contact` and `/en/research` read urban-dynamics-first; the EU HPI is framed as "European spatial-data engineering," not "real-estate econometrics."

- [ ] **Step 4: Commit**
```bash
git add frontend/messages/*.json
git commit -m "feat(copy): reframe contact bio + research subtitles to urban-dynamics-first"
```

### Task 5: Proof outcomes recast (spec §4 §05)

**Files:** Modify `frontend/messages/{en,nl,de,it}.json` (`Proof` namespace).

> Keep the strong shipped outcomes but reframe away from "automation audit / ops-heavy teams," and add a production-AI-tool (LanguageBuddy) proof of range. Automation lives here as case-study evidence, openly (per user note).

- [ ] **Step 1: Rewrite `Proof` in `en.json`**
```json
"Proof": {
  "kicker": "Proof: outcomes that shipped",
  "titlePrefix": "Things that",
  "titleItalic": "shipped",
  "titleSuffix": "and stuck.",
  "quote": "Ian shipped the thing he said he'd ship, in the time he said he'd ship it.",
  "quoteAttribution": "COO, regulated services",
  "outcomes": [
    { "value": "13", "unit": "EU countries · one pipeline", "context": "Monthly house-price index · Eurostat" },
    { "value": "2,500+", "unit": "hrs / yr reclaimed", "context": "Deal-screening data tool · 6 weeks" },
    { "value": "3", "unit": "languages · live AI tutor", "context": "LanguageBuddy · production AI product" }
  ],
  "ctaPrimary": "See how we'd work together",
  "ctaSecondary": "Book a 20-minute call"
}
```
(The third outcome reframes automation proof as "I ship production AI tools." The first foregrounds the spatial-engineering scale of the EU HPI.)

- [ ] **Step 2: Mirror in `nl/de/it`** (IT review). Parity → `(none)`.

- [ ] **Step 3: Verify** — build passes (note: `ProofStrip` is not rendered yet — it's restored in Task 8; this task only updates copy). JSON is valid.

- [ ] **Step 4: Commit**
```bash
git add frontend/messages/*.json
git commit -m "feat(proof): recast outcomes away from 'automation audit'; add production-AI-tool range proof"
```

---

## Phase 2 — Structure & components

> Build the Four Lanes section, recompose the homepage, reframe the work block, and add the Contact band. Spec §4.
>
> **Execution order (important for subagent-driven/in-order runs):** the homepage recompose (Task 8) imports `FourLanes` (Task 7), `ContactBand` (Task 10), and the reframed `ProjectsGallery` (Task 9). Implement **6 → 7 → 9 → 10 → 8** so Task 8's build gate has its dependencies. If you must run strictly in number order, create the minimal `ContactBand` stub from Task 10 Step 1 before Task 8's build.

### Task 6: Four Lanes content namespace (spec §4 §04)

**Files:** Modify `frontend/messages/{en,nl,de,it}.json` (add new top-level `Lanes` namespace).

**Interfaces:**
- Produces: `Lanes` namespace consumed by `components/four-lanes.jsx` (Task 7) — keys: `kicker`, `titleItalic`, `titleRest`, `subtitle`, `appliedAcross`, `automationNote`, `ctaLabel`, `items[]` (each `{name, anchor?, blurb, stack[]}`).

- [ ] **Step 1: Add `Lanes` to `en.json`** (top level, alongside the other namespaces)
```json
"Lanes": {
  "kicker": "What I work on: four lanes",
  "titleItalic": "Four",
  "titleRest": "lanes.",
  "subtitle": "One geospatial-engineering toolkit, four lanes. Urban dynamics is the anchor; real estate is one application, not the frame.",
  "appliedAcross": "Applied across: urban planning · real estate · climate risk · logistics & mobility · public sector",
  "automationNote": "Also under the hood: LLM/RAG pipelines and internal tools that automate classification, research and reporting — production AI as engineering range, not the headline.",
  "ctaLabel": "Discuss a project",
  "items": [
    {
      "name": "Urban dynamics & geospatial methods",
      "anchor": true,
      "blurb": "Gentrification modelling, accessibility and connectivity, parcel- and postcode-level spatial analysis. The anchor — where the publishing and the PhD concentrate.",
      "stack": ["PostGIS", "GeoPandas", "H3", "ABM", "CV"]
    },
    {
      "name": "Real estate & investment",
      "blurb": "Valuation, rent and risk models, alternative data for REITs and funds. One lane and the warmest network — not the identity.",
      "stack": ["XGBoost", "hedonic", "alt-data"]
    },
    {
      "name": "Supply-chain & commodity forecasting",
      "blurb": "The spatial-optimisation slice of logistics: network design, catchment and routing, facility siting, wood and commodity supply forecasting.",
      "stack": ["routing", "time-series", "optimisation"]
    },
    {
      "name": "Spatial data products",
      "blurb": "Productised scores and feeds — connectivity and walkability indices, first-home-buyer methods. Validated as licensing first, funded by the consulting lanes.",
      "stack": ["APIs", "Python", "React"]
    }
  ]
}
```

- [ ] **Step 2: Mirror `Lanes` in `nl/de/it`** (translate; IT review; keep `stack` tokens and `anchor:true` unchanged). Parity → `(none)`.

- [ ] **Step 3: Verify** — `npm run build` passes (namespace added; not yet consumed). JSON valid.

- [ ] **Step 4: Commit**
```bash
git add frontend/messages/*.json
git commit -m "feat(i18n): add Lanes namespace (Four Lanes content, urban-dynamics anchored)"
```

### Task 7: Four Lanes component (spec §4 §04; folds in Sectors)

**Files:** Create `frontend/components/four-lanes.jsx`.

**Interfaces:**
- Consumes: `Lanes` namespace (Task 6); `useLocale`; `trackEvent`.
- Produces: `<FourLanes />` (no props; reads locale itself), rendered at §04 by Task 8.

- [ ] **Step 1: Create the component** (matches the Skills-Grid/Sectors house pattern; lanes carry name + blurb + stack chips; the anchor lane gets a marker; one calm "Discuss a project" CTA; the folded-in sectors become the `appliedAcross` line)
```jsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function FourLanes() {
  const t = useTranslations("Lanes");
  const locale = useLocale();
  const items = t.raw("items");

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 04</span>
        <span>{t("kicker")}</span>
      </div>
      <div className="section-head" style={{ alignItems: "end", marginBottom: 56 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 5.6vw, 84px)", lineHeight: 0.98, letterSpacing: "-0.02em" }}>
          <i style={{ fontStyle: "italic", color: "var(--yellow-2)" }}>{t("titleItalic")}</i> {t("titleRest")}
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "52ch" }}>{t("subtitle")}</p>
      </div>

      <div className="lanes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {items.map((lane, i) => (
          <div key={lane.name} className="lane-tile" style={{ borderTop: "1px solid var(--ink)", paddingTop: 18 }}>
            <div className="sector-kicker" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>§ 04.{String(i + 1).padStart(2, "0")}</span>
              {lane.anchor ? (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)", background: "var(--yellow)", padding: "2px 8px", borderRadius: 2 }}>ANCHOR</span>
              ) : (
                <span className="sector-dot" />
              )}
            </div>
            <h3 className="sector-name" style={{ marginTop: 12 }}>{lane.name}</h3>
            <p className="sector-blurb">{lane.blurb}</p>
            <div className="stack" style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {lane.stack.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 40, fontSize: 14, color: "var(--mute)", maxWidth: "70ch" }}>{t("appliedAcross")}</p>
      <p style={{ marginTop: 12, fontSize: 14, color: "var(--mute)", maxWidth: "70ch" }}>{t("automationNote")}</p>

      <div style={{ marginTop: 40 }}>
        <Link
          href={`/${locale}/contact`}
          className="btn primary"
          onClick={() => trackEvent("cta_click", { cta: "contact", location: "home_lanes", source: "lanes_cta" })}
        >
          <span>{t("ctaLabel")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </section>
  );
}
```
(If `.lanes-grid`/`.lane-tile` styling needs polish, the inline styles above are sufficient to ship; deeper CSS can be added to the global stylesheet later. Reuses existing `.chip`, `.sector-*`, `.section-*` classes.)

- [ ] **Step 2: Verify** — build passes (component exists, not yet rendered — that's Task 8).

- [ ] **Step 3: Commit**
```bash
git add frontend/components/four-lanes.jsx
git commit -m "feat(lanes): Four Lanes section component (urban-dynamics anchored, sectors folded in)"
```

### Task 8: Recompose the homepage (spec §4 — reputation-led order, §08 added)

**Files:**
- Modify: `frontend/app/[locale]/page.jsx`
- Delete (after grep): `frontend/components/skills-grid.jsx`, `frontend/components/sectors-strip.jsx`

**Interfaces:**
- Consumes: `<FourLanes />` (Task 7), `<ContactBand />` (Task 10), existing `<ProofStrip />`, `<ProjectsGallery />`, `<ResearchPreview />`, `<AboutTeaser />`.

Target order (spec §4): Hero → Marquee → **Selected work & papers (ProjectsGallery + ResearchPreview)** → **Four Lanes** → **Proof** → **About teaser** → **Thoughts (WritingTeaser)** → **Contact band**.

- [ ] **Step 1: Confirm replaced/orphaned components aren't used elsewhere**
```bash
cd frontend && grep -rn "skills-grid\|SkillsGrid\|sectors-strip\|SectorsStrip\|research-article\b\|ResearchArticle\b" app components --include=*.jsx --include=*.tsx | grep -v "components/skills-grid\|components/sectors-strip\|components/research-article.jsx"
```
Expected: only `page.jsx` references Skills-Grid/Sectors-Strip; `research-article.jsx` (the orphan, NOT `research-article-detail.jsx`) shows no importers. If anything else shows up, keep that file and only remove the `page.jsx` reference.

Also confirm `ProofStrip`'s export style so the Step 2 import matches:
```bash
cd frontend && grep -n "export" components/proof-strip.jsx | head
```
If it's a default export, use `import ProofStrip from "@/components/proof-strip";` in Step 2 instead of the named form.

- [ ] **Step 2: Rewrite `page.jsx`** (swap imports + reorder; ProofStrip & ContactBand newly composed)
```jsx
import { HeroSection } from "@/components/hero-section";
import { Marquee } from "@/components/marquee";
import { AboutTeaser } from "@/components/about-teaser";
import { FourLanes } from "@/components/four-lanes";
import { ProjectsGallery } from "@/components/projects-gallery";
import { ProofStrip } from "@/components/proof-strip";
import { WritingTeaser } from "@/components/writing-teaser";
import { ResearchPreview } from "@/components/research-preview";
import { ContactBand } from "@/components/contact-band";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/json-ld";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}`;
  return {
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en`,
        nl: `${siteUrl}/nl`,
        de: `${siteUrl}/de`,
        it: `${siteUrl}/it`,
        "x-default": `${siteUrl}/en`,
      },
    },
    openGraph: { url, type: "website" },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  return (
    <main>
      <PersonJsonLd />
      <WebSiteJsonLd />
      <HeroSection />
      <Marquee />
      <ProjectsGallery />
      <ResearchPreview locale={locale} />
      <FourLanes />
      <ProofStrip />
      <AboutTeaser />
      <WritingTeaser locale={locale} />
      <ContactBand />
    </main>
  );
}
```
(`ProjectsGallery` + `ResearchPreview` together form the §03 "Selected work & papers" credibility block — papers-first, before the Lanes. This also extends the homepage hreflang to de+it, covering part of Task 19.)

- [ ] **Step 3: Delete the replaced + orphaned components** (only if Step 1 showed no other consumers)
```bash
cd frontend && git rm components/skills-grid.jsx components/sectors-strip.jsx components/research-article.jsx
```
(`research-article.jsx` is dead code with non-locale-prefixed `/research` and `/contact` links — leak L11. Keep `research-article-detail.jsx`, the live component.)

- [ ] **Step 4: Verify** — `npm run build` passes (ContactBand must exist; do Task 10 before this build, or stub it). Run dev: homepage order is Hero → Marquee → work → papers → Four Lanes → Proof → About → Thoughts → Contact band; no Skills-Grid/Sectors-Strip; page ends on the Contact band.

> **Sequencing note:** Task 10 (ContactBand) and Task 9 (ProjectsGallery reframe) should land before this task's build passes. Implement 9 + 10, then this. If executing strictly in order, create a minimal `ContactBand` stub first, then flesh it out in Task 10.

- [ ] **Step 5: Commit**
```bash
git add frontend/app/[locale]/page.jsx
git commit -m "feat(home): reputation-led recompose; Four Lanes in, Skills/Sectors out, Proof + Contact band added"
```

### Task 9: Reframe the work block (spec §4 §03)

**Files:** Modify `frontend/messages/{en,nl,de,it}.json` (`Projects` namespace).

> §03 leads with research-grade work: Gentrification ABM (foregrounded), EU HPI (recast as spatial-engineering), and the KR&A-credited connectivity card pointing to the forthcoming paper. LanguageBuddy moves out (it's now Proof, Task 5). Decision: connectivity card credits KR&A and links to the forthcoming connectivity paper (later 2026) — use a "paper forthcoming 2026" link target until release.

- [ ] **Step 1: Rewrite `Projects` header + items in `en.json`**
```json
"Projects": {
  "kicker": "Selected work & papers: research, methods, theses",
  "titlePrefix": "Selected work",
  "titleItalic": "& papers.",
  "subtitle": "Research-grade work on urban dynamics and geospatial methods. Real estate is one application; the throughline is the method.",
  "items": [
    {
      "viz": "abm",
      "sector": "MSc Thesis · Bocconi",
      "title": "Gentrification agent-based model",
      "outcome": "Ten-year ABM of neighbourhood turnover in Amsterdam, calibrated on Kadaster and CBS microdata. Affordability-attractiveness decision rules; agent mobility emergent from price pressure. The single best evidence of the urban-dynamics identity.",
      "stack": ["Python", "Mesa", "GeoPandas", "Postgres"],
      "link": "/research/gentrification-abm"
    },
    {
      "viz": "hedonic",
      "sector": "Research · Eurostat",
      "title": "Monthly house-price index · 13 EU countries",
      "outcome": "Large-scale European spatial-data engineering: a web-scraping pipeline across 13 countries feeding a log-price hedonic regression. Monthly indices tested as disaggregation indicators for Eurostat quarterly HPIs.",
      "stack": ["Python", "Scrapy", "PostGIS", "MongoDB", "XGBoost"],
      "link": ""
    },
    {
      "viz": "hedonic",
      "sector": "Method · developed at KR&A",
      "title": "Connectivity & walkability scoring",
      "outcome": "A geospatial-methods contribution: a saturation-validated connectivity/walkability score at parcel resolution. Developed at KR&A; method paper forthcoming 2026.",
      "stack": ["PostGIS", "H3", "GeoPandas", "Python"],
      "link": "/research"
    }
  ],
  "viewCase": "Read more",
  "viewPaper": "View paper",
  "ctaAll": "See all papers"
}
```
(Removed the LanguageBuddy item. The connectivity card uses `viz: "hedonic"` to reuse an existing visualization renderer — verify `projects-gallery.jsx` handles the `viz` value; if it switches on `viz` and lacks a default, pick a `viz` value the component already supports.)

- [ ] **Step 2: Confirm the gallery renders 3 items and the `viz` values are handled** — read `frontend/components/projects-gallery.jsx`; ensure it maps `Projects.items` and that each `viz` (`"abm"`, `"hedonic"`) has a renderer with a safe fallback. If `viz: "hedonic"` reused twice causes a key collision, the map key should be `item.title` (verify/adjust).

- [ ] **Step 3: Mirror `Projects` in `nl/de/it`** (IT review). Parity → `(none)`.

- [ ] **Step 4: Verify** — build passes; `/en` §03 shows ABM, EU HPI (spatial-engineering framing), connectivity (KR&A-credited); LanguageBuddy gone from the gallery.

- [ ] **Step 5: Commit**
```bash
git add frontend/messages/*.json
git commit -m "feat(work): reframe §03 as research-grade work+papers; connectivity card credited to KR&A; drop LanguageBuddy"
```

### Task 10: Contact band component (spec §4 §08)

**Files:** Create `frontend/components/contact-band.jsx`.

**Interfaces:**
- Consumes: `Contact` namespace (existing keys `bandLine1`, `bandLine2Italic`, `bandLine3`, `letsTalkPrefix`, `letsTalkItalic`, `linkBookCall`), `Navigation.letsTalk`, `useLocale`, `trackEvent`.
- Produces: `<ContactBand />` rendered last on the homepage (Task 8).

- [ ] **Step 1: Create the terminal Contact band** (closes the funnel; primary "Let's talk" → `/contact`, secondary book-a-call → cal.com)
```jsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function ContactBand() {
  const t = useTranslations("Contact");
  const nav = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <section className="section-pad" style={{ background: "var(--ink)", color: "var(--paper-2)" }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 08</span>
        <span>{t("sectionKicker")}</span>
      </div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(48px, 8vw, 120px)", lineHeight: 0.95, letterSpacing: "-0.02em", marginTop: 24, color: "var(--paper-2)" }}>
        {t("bandLine1")}{" "}
        <i style={{ fontStyle: "italic", color: "var(--yellow)" }}>{t("bandLine2Italic")}</i>{" "}
        {t("bandLine3")}
      </h2>
      <div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <Link
          href={`/${locale}/contact`}
          className="btn primary"
          onClick={() => trackEvent("cta_click", { cta: "contact", location: "home_contact_band", source: "contact_band_primary" })}
        >
          <span>{nav("letsTalk")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
        <a
          href="https://cal.com/ianronk/intro"
          target="_blank"
          rel="noopener noreferrer"
          className="btn ghost"
          onClick={() => trackEvent("cta_click", { cta: "book_call", location: "home_contact_band", source: "contact_band_secondary" })}
        >
          <span>{t("linkBookCall")}</span>
        </a>
      </div>
    </section>
  );
}
```
(Reuses the existing `Contact.bandLine*` copy — already localized in all four files, so no new keys. Verify the dark-band contrast reads on `var(--ink)`; adjust `.btn` colors via existing modifier classes if needed.)

- [ ] **Step 2: Verify** — build passes; homepage now ends on the Contact band; primary "Let's talk" → `/contact`, secondary → `cal.com/ianronk/intro`.

- [ ] **Step 3: Commit**
```bash
git add frontend/components/contact-band.jsx
git commit -m "feat(home): terminal Contact band so the funnel ends on convert (§08)"
```

---

## Phase 3 — Funnel fixes

> Close the verified leaks on the rest of the surface. Spec §6.

### Task 11: "Let's talk" in the mobile nav (spec §6 L6)

**Files:** Modify `frontend/components/navigation.jsx` (the open mobile-menu block).

- [ ] **Step 1: Read `navigation.jsx`**, find the desktop `letsTalk` CTA (in the `md:flex`/desktop bar) and the mobile-menu render block. Note how the desktop button is built (className, `trackEvent` shape) and the mobile menu's existing link list.

- [ ] **Step 2: Add the CTA inside the open mobile menu**, after the nav links, mirroring the desktop pattern:
```jsx
<Link
  href={`/${locale}/contact`}
  className="btn primary"
  onClick={() => { trackEvent("cta_click", { cta: "lets_talk", location: "nav_mobile", source: "nav_mobile" }); /* also call the existing menu-close handler here */ }}
>
  <span>{t("letsTalk")}</span>
</Link>
```
Use the component's existing translations hook for the `Navigation` namespace and its `locale`/menu-close handler (match what the surrounding mobile links already call). `Navigation.letsTalk` exists in all four locales.

- [ ] **Step 3: Verify** — build passes; in dev, shrink to mobile width, open the menu → "Let's talk" appears and routes to `/contact`.

- [ ] **Step 4: Commit**
```bash
git add frontend/components/navigation.jsx
git commit -m "fix(nav): show 'Let's talk' CTA in the mobile menu"
```

### Task 12: Fix the broken booking link (spec §6 L7)

**Files:** Modify `frontend/components/contact-content.jsx` (the "Book a call" link, ~line 234).

- [ ] **Step 1: Replace the broken href** — change `href="https://calendly.com"` to `href="https://cal.com/ianronk/intro"`. Ensure the anchor has `target="_blank" rel="noopener noreferrer"` and a `trackEvent("cta_click", { cta: "book_call", location: "contact_page", source: "contact_book_call" })` onClick (add if missing; import `trackEvent` from `@/lib/analytics` if not already imported).

- [ ] **Step 2: Verify** — build passes; on `/en/contact`, "Book a call" opens `cal.com/ianronk/intro` in a new tab.

- [ ] **Step 3: Commit**
```bash
git add frontend/components/contact-content.jsx
git commit -m "fix(contact): point 'Book a call' at cal.com/ianronk/intro (was a dead calendly.com link)"
```

### Task 13: Contact thread on research detail pages (spec §6 L1)

**Files:**
- Modify: `frontend/components/research-article-detail.jsx`
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Research` namespace — add `endCtaKicker`, `endCtaHeading`, `endCtaButton`)

- [ ] **Step 1: Add `Research` CTA keys in `en.json`**
```json
"endCtaKicker": "§ Next",
"endCtaHeading": "Working on something spatial? Let's talk.",
"endCtaButton": "Get in touch"
```

- [ ] **Step 2: Mirror in `nl/de/it`** (IT review). Parity → `(none)`.

- [ ] **Step 3: Add the import + CTA in `research-article-detail.jsx`** — add `import { trackEvent } from "@/lib/analytics";` (the file has no such import today; confirm it has `Link` and `locale` — it uses `useLocale`/next-intl; if not, add `import Link from "next/link"` and `const locale = useLocale()`). After the inline `<NewsletterSubscribe ... />` block and before the related-articles section, insert:
```jsx
<aside style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid var(--rule)" }}>
  <div className="num-label" style={{ color: "var(--mute)" }}>{t("endCtaKicker")}</div>
  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.0, margin: "12px 0 20px" }}>{t("endCtaHeading")}</h3>
  <Link
    href={`/${locale}/contact`}
    className="btn primary"
    onClick={() => trackEvent("cta_click", { cta: "contact", location: "research_end", source: "research_end", slug })}
  >
    <span>{t("endCtaButton")}</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
  </Link>
</aside>
```
(`t` is the `Research` translations hook already in the file; `slug` is the article slug available in scope — verify the variable name and adjust. Keep it understated, not a pitch.)

- [ ] **Step 4: Verify** — build passes; a research detail page now shows a calm contact CTA after the newsletter; click → `/contact`.

- [ ] **Step 5: Commit**
```bash
git add frontend/components/research-article-detail.jsx frontend/messages/*.json
git commit -m "fix(research): add contact CTA on detail pages (close dead-end L1)"
```

### Task 14: Contact link on blog post end-CTA (spec §6 L2)

**Files:**
- Modify: `frontend/components/blog-post.jsx` (end-CTA aside, ~lines 134-165)
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Thoughts` namespace — add `endCtaContact`)

- [ ] **Step 1: Add `Thoughts.endCtaContact` in `en.json`** = `"Have a where / how-much / what's-next question? Let's talk"`. Mirror in `nl/de/it` (IT review). Parity → `(none)`.

- [ ] **Step 2: Add a third link in the end-CTA aside** of `blog-post.jsx`, alongside the existing `endCtaButton` (→ `/thoughts`) and `endCtaSecondary` (→ `/about`). Render it at the lighter secondary tier (match the `about_me` link's style):
```jsx
<Link
  href={`/${locale}/contact`}
  onClick={() => trackEvent("cta_click", { cta: "contact_from_post", location: "blog_post_end", source: "blog_post_end", slug })}
  style={{ /* match the existing endCtaSecondary link styling */ }}
>
  {t("endCtaContact")}
</Link>
```
(`t` = `Thoughts` hook; `locale` and `slug` already in scope — verify names.)

- [ ] **Step 3: Verify** — build passes; a blog post end now offers a contact link beside "More writing" / "About me," with the inline newsletter still above.

- [ ] **Step 4: Commit**
```bash
git add frontend/components/blog-post.jsx frontend/messages/*.json
git commit -m "fix(thoughts): add contact link to blog-post end CTA (close dead-end L2)"
```

### Task 15: Tail capture on index pages (spec §6 L3)

**Files:**
- Modify: `frontend/components/research-list.jsx`, `frontend/components/blog-list.jsx`
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Research` — add `indexDiscuss`)

- [ ] **Step 1: Add `Research.indexDiscuss` in `en.json`** = `"Discuss a project"`. Mirror in `nl/de/it`. Parity → `(none)`.

- [ ] **Step 2: Append an inline newsletter to both index components** — both are `'use client'`, use `useLocale`, import `Link`. Add `import NewsletterSubscribe from "@/components/newsletter-subscribe";` (default export) and render at the end of the list, before the closing tag:
```jsx
<div style={{ marginTop: 64 }}>
  <NewsletterSubscribe variant="inline" source="research-index" locale={locale} />
</div>
```
Use `source="research-index"` in `research-list.jsx` and `source="thoughts-index"` in `blog-list.jsx`.

- [ ] **Step 3: On `/research` only**, add one quiet contact link below the newsletter (single soft capture + single contact link — do not stack):
```jsx
<Link
  href={`/${locale}/contact`}
  className="btn ghost"
  style={{ marginTop: 20 }}
  onClick={() => trackEvent("cta_click", { cta: "contact", location: "research_index", source: "research_index" })}
>
  <span>{t("indexDiscuss")}</span>
</Link>
```
(Add `trackEvent` import to `research-list.jsx` if absent; `t` = `Research` hook.)

- [ ] **Step 4: Verify** — build passes; `/en/research` and `/en/thoughts` end with a newsletter form; `/en/research` also shows a "Discuss a project" link.

- [ ] **Step 5: Commit**
```bash
git add frontend/components/research-list.jsx frontend/components/blog-list.jsx frontend/messages/*.json
git commit -m "fix(indexes): add tail newsletter capture + research contact link (close L3)"
```

### Task 16: Homepage secondary newsletter capture (spec §6 L10)

**Files:**
- Modify: `frontend/components/newsletter-subscribe.jsx` (add optional heading/description overrides)
- Modify: `frontend/components/writing-teaser.jsx`
- Modify: `frontend/messages/{en,nl,de,it}.json` (`Newsletter` — add `homeThoughtsHeading`, `homeThoughtsDescription`)

> The funnel framing ("not ready to talk? get the next piece") needs custom copy, so we add optional overrides to the inline newsletter rather than leaving dead keys.

- [ ] **Step 1: Add `Newsletter.homeThoughtsHeading` / `homeThoughtsDescription` in `en.json`**
```json
"homeThoughtsHeading": "Not ready to talk? Get the next piece.",
"homeThoughtsDescription": "Notes from the field — occasional pieces on urban dynamics, geospatial methods and what breaks in production."
```
Mirror in `nl/de/it` (IT review). Parity → `(none)`.

- [ ] **Step 2: Add optional override props to `newsletter-subscribe.jsx`** — change the signature, and make the inline variant prefer the overrides with the existing keys as fallback:
```jsx
export default function NewsletterSubscribe({ variant = "compact", source = "other", locale = "en", heading, description }) {
```
Where the inline variant renders its heading/description:
```jsx
<h3>{heading || t("inlineHeading")}</h3>
<p>{description || t("inlineDescription")}</p>
```
(Leave the compact variant and all existing callers unchanged — overrides are optional.)

- [ ] **Step 3: Embed the inline newsletter in `writing-teaser.jsx`** — it's an async server component, so read strings via `getTranslations`:
```jsx
import { getTranslations } from "next-intl/server";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
// inside the component (locale is already a prop):
const nl = await getTranslations({ locale, namespace: "Newsletter" });
// after the post cards:
<div style={{ marginTop: 56 }}>
  <NewsletterSubscribe
    variant="inline"
    source="home-thoughts"
    locale={locale}
    heading={nl("homeThoughtsHeading")}
    description={nl("homeThoughtsDescription")}
  />
</div>
```
(Reuse `WritingTeaser`'s existing translation-call style; add the `Newsletter` handle alongside any existing `Thoughts` one.)

- [ ] **Step 4: Verify** — build passes; the homepage Thoughts section shows the newsletter with the "Not ready to talk?" framing; the blog/research inline newsletters still show their default headings.

- [ ] **Step 5: Commit**
```bash
git add frontend/components/newsletter-subscribe.jsx frontend/components/writing-teaser.jsx frontend/messages/*.json
git commit -m "feat(home): newsletter secondary capture with funnel framing in Thoughts section (close L10)"
```

### Task 17: Chat-widget contact affordance (spec §6 L8)

**Files:** Modify `frontend/components/chat-widget.jsx`.

- [ ] **Step 1: Read `chat-widget.jsx`** — find where assistant messages render and where each message's `category` is available (the backend returns a `category`; `'contact'` is one).

- [ ] **Step 2: Add imports** at top: `import Link from "next/link";`, `import { useLocale } from "next-intl";`, `import { trackEvent } from "@/lib/analytics";`. Add `const locale = useLocale();` in the component body.

- [ ] **Step 3: When an assistant message has `category === 'contact'`, render an action link** below the message text (trigger off the backend `category`, NOT the English starter string, so it works in all locales):
```jsx
{msg.category === "contact" && (
  <Link
    href={`/${locale}/contact`}
    className="btn ghost"
    style={{ marginTop: 10 }}
    onClick={() => trackEvent("cta_click", { cta: "contact", location: "chat_widget", source: "chat_widget" })}
  >
    <span>Reach out via the contact page</span>
  </Link>
)}
```
(Match the message-object field name used in the component — adjust `msg`/`category`. Do not auto-open or nag.)

- [ ] **Step 4: Verify** — build passes; in dev, ask the widget "How do I get in touch?" → the response renders a real link to `/contact`.

- [ ] **Step 5: Commit**
```bash
git add frontend/components/chat-widget.jsx
git commit -m "fix(chat): render a real contact link when the answer category is 'contact' (close L8)"
```

---

## Phase 4 — Sitemap & hreflang (spec §6 L9 — Verona/IT discoverability)

### Task 18: Extend the sitemap to all 4 locales

**Files:** Modify `frontend/app/sitemap.ts`.

- [ ] **Step 1: Change the locales array** — line 5: `const locales = ['en', 'nl']` → `const locales = ['en', 'nl', 'de', 'it']`.

- [ ] **Step 2: Verify** — `npm run build` passes; if the backend is reachable, the generated `sitemap.xml` includes `/de` and `/it` URLs for static + research + blog routes (try `curl localhost:3000/sitemap.xml` against a running dev/prod server, or inspect `.next` output).

- [ ] **Step 3: Commit**
```bash
git add frontend/app/sitemap.ts
git commit -m "fix(seo): emit de+it in the sitemap (close L9, Verona/IT discoverability)"
```

### Task 19: Extend hreflang `alternates` across the remaining page files

**Files:** Modify the `generateMetadata` `languages` map in each of these (the homepage was already done in Task 8):
- `frontend/app/[locale]/about/page.jsx`
- `frontend/app/[locale]/research/page.jsx`
- `frontend/app/[locale]/research/[slug]/page.jsx`
- `frontend/app/[locale]/thoughts/page.jsx`
- `frontend/app/[locale]/thoughts/[slug]/page.jsx`
- `frontend/app/[locale]/contact/page.jsx`
- `frontend/app/[locale]/privacy-policy/page.jsx`
- `frontend/app/[locale]/cookie-policy/page.jsx`
- `frontend/app/[locale]/terms-of-service/page.jsx`

- [ ] **Step 1: In each file, extend the `languages` object** from the current shape to include `de` and `it`. For static pages the map looks like the homepage's; pattern:
```jsx
languages: {
  en: `${siteUrl}/en${PATH}`,
  nl: `${siteUrl}/nl${PATH}`,
  de: `${siteUrl}/de${PATH}`,
  it: `${siteUrl}/it${PATH}`,
  "x-default": `${siteUrl}/en${PATH}`,
},
```
where `${PATH}` is that page's path (e.g. `/about`, `/research`, `/contact`, `''` already handled on home). For the `[slug]` pages, preserve the existing slug interpolation; just add the `de` and `it` lines mirroring `en`/`nl`. **Caveat:** detail-page bodies source from Django and may fall back to default-language text even where the route is valid — that's acceptable for hreflang (the route resolves); note it for the QA pass.

- [ ] **Step 2: Verify** — `npm run build` passes for all routes; spot-check two files' generated `<link rel="alternate" hreflang="de" ...>` via view-source on the dev server.

- [ ] **Step 3: Commit**
```bash
git add frontend/app/[locale]/**/page.jsx
git commit -m "fix(seo): add de+it hreflang alternates across all localized pages (close L9)"
```

---

## Phase 5 — Verification & handoff

### Task 20: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Clean build**
```bash
cd frontend && npm run build
```
Expected: success, full route list.

- [ ] **Step 2: Locale parity**
```bash
cd frontend && for l in nl de it; do echo "== $l =="; diff <(jq -r 'paths(scalars)|join(".")' messages/en.json|sort) <(jq -r 'paths(scalars)|join(".")' messages/$l.json|sort) | grep '^<' || echo "  (none)"; done
```
Expected: `(none)` for all three.

- [ ] **Step 3: Positioning pass** — across `/en` (spot-check `/nl`, `/de`, `/it`): "AI/ML Automation" headlines nowhere (hero, marquee, competencies); the hero leads with geodata + urban-dynamics; real estate appears only as one lane; KR&A reads as a credential.

- [ ] **Step 4: Funnel pass** — verify every surface offers a path to Contact or newsletter and nothing dead-ends:
  - Homepage ends on the Contact band; hero primary = "Let's talk" → /contact; Lanes CTA present.
  - `/research/[slug]` and `/thoughts/[slug]` each have a contact CTA + inline newsletter.
  - `/research` and `/thoughts` indexes have a tail newsletter (+ research contact link).
  - Mobile nav shows "Let's talk."
  - Contact page "Book a call" → `cal.com/ianronk/intro` (opens a real calendar).
  - Chat widget "how to get in touch" renders a contact link.

- [ ] **Step 5: Analytics QA** (R12 — no code change) — with analytics consent accepted, click the hero CTA and submit the contact form; confirm `cta_click` and `contact_submit` reach GA4 (Realtime/DebugView). Leave Vercel `<Analytics />` always-on (cookieless, already disclosed).

- [ ] **Step 6: IT review gate** — flag the PR description: "IT strings are first-pass machine translations — require human review before merge (Verona market-seeding)." List the namespaces touched: `Hero`, `About`, `AboutTeaser`, `Contact`, `Research`, `Proof`, `Lanes`, `Projects`, `Thoughts`, `Newsletter`.

- [ ] **Step 7: Final commit (if any verification fixups were needed)**
```bash
git add -A && git commit -m "chore: verification fixups for strategic realignment"
```

---

## Out of scope (spec §8 Future Work — do NOT build here)

Google Scholar/ORCID + downloadable CV/master-dossier credibility surface (R13); productised data-feed/viz showcase; publishing-cadence widget; newsletter-prominence redesign; changing the Vercel Analytics consent posture (R12 — keep always-on).
