# Data-Lead Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition ianronk.com from "geodata engineer" to "Data Lead & Engineer with an urban-dynamics/geo specialization", make /about the resume destination, wire the four visitor flows end-to-end, and harden LLM discoverability — per the approved spec `docs/superpowers/specs/2026-07-19-data-lead-repositioning-design.md`.

**Architecture:** Next.js 16 App Router frontend (`frontend/`), copy in next-intl message files (`frontend/messages/{en,nl,de,it}.json`), Django backend (`backend/`). Most work is JSON copy + three small new components + metadata/JSON-LD edits + two backend ops changes.

**Tech Stack:** Next.js 16, next-intl, Tailwind v4 + house CSS classes (`btn primary`/`btn ghost`, `section-pad`, `section-label`, `chip`), Django 5 + gunicorn, docker-compose (Dokploy deploys on push to master).

## Global Constraints

- **NEVER `git push`.** Pushing to master triggers a production Dokploy deploy. Local commits only; the user pushes.
- No test framework exists. Every task's verify cycle is: `cd frontend && npm run build` (must pass) + task-specific grep/curl checks. Run builds from `frontend/`.
- `messages/en.json` is source of truth. nl/de/it are mirrored **in Task 7 only** — do not touch them in Tasks 1–6. Final parity: all 4 files must have identical key paths (`jq -r '[paths(scalars)|join(".")]|sort|.[]'` diff must be empty).
- Copy voice: match the existing site register (pragmatic, concrete, e.g. "a calibrated pipeline tends to outlast a clever one"). No superlatives, no "passionate", no invented numbers. Facts you don't have → write `[NEEDS FACT: what]` literally in the EN copy so the user can fill it.
- Canonical sentence (frozen, use verbatim wherever "CANONICAL" appears): `Ian Ronk is a data lead and engineer in Amsterdam who builds and runs production data systems — big data pipelines, forecasting, network analysis — with a research specialization in urban dynamics.`
- Niche retrieval phrase that must survive on /about and its metadata: **"geodata specialist based in Amsterdam"**.
- `renderTitle()` in `hero-section.jsx` italicizes the LAST word of `Hero.title` then ALWAYS appends " & " before `Hero.titleHighlight` — `Hero.title` must never end in a conjunction.
- Analytics call shape everywhere: `trackEvent("cta_click", { cta, location, source })` from `@/lib/analytics`.
- Commit after each task with the trailer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: Homepage claims — Hero, Lanes, Proof

**Files:**
- Modify: `frontend/messages/en.json` (namespaces `Hero`, `Lanes`, `Proof`)
- Modify: `frontend/components/proof-strip.jsx` (CTA hrefs + analytics, lines ~58–76)

**Interfaces:**
- Produces: `Proof.ctaPrimary` now routes to `/about` — Task 3 makes /about worth landing on. Lane/Proof copy is the evidence base Tasks 3/6 reference.
- Consumes: nothing.

- [ ] **Step 1: Rewrite `Hero` values in `frontend/messages/en.json`**

Replace the values of these existing keys (keep all other Hero keys untouched):

```json
"role": "Data Lead & Engineer · Urban-Dynamics Researcher",
"title": "Data engineering",
"titleHighlight": "leadership",
"titleEnd": ", proven on hard spatial problems",
"description": "I lead data teams and build the systems they run: big-data pipelines, forecasting and nowcasting models, network analysis and spatial data products. The research specialization is urban dynamics — gentrification, accessibility, housing markets — because cities are where data problems get hard.",
"description2": "I lead data teams and ship production systems — pipelines, forecasts, network models — with a research edge in urban dynamics. The sectors vary; the question rarely does: where, how much, and what's next."
```

Rendered headline check: "Data *engineering* & leadership, proven on hard spatial problems" (title must not end in a conjunction — see Global Constraints).

- [ ] **Step 2: Rewrite `Lanes` in `frontend/messages/en.json`**

Replace values (component reads `t.raw("items")`, fields `name`/`anchor`/`blurb`/`stack`; only lane 1 gets `anchor: true`):

```json
"kicker": "What I work on: four lanes",
"titleItalic": "Four",
"titleRest": "lanes.",
"subtitle": "One data-engineering and leadership toolkit, four lanes. Urban dynamics is the bread and butter; the rest is proof the toolkit generalises.",
"appliedAcross": "Applied across: urban planning · real estate · climate risk · logistics & mobility · public sector",
"automationNote": "Also under the hood: LLM/RAG pipelines and internal tools that automate classification, research and reporting — production AI as engineering range, not the headline.",
"ctaLabel": "Get in touch",
"items": [
  {
    "name": "Urban dynamics & research",
    "anchor": true,
    "blurb": "Gentrification modelling, accessibility and connectivity, parcel- and postcode-level spatial analysis. This is what I do — where the papers and the publishing concentrate.",
    "stack": ["PostGIS", "GeoPandas", "H3", "ABM", "network science"]
  },
  {
    "name": "Spatial data products",
    "blurb": "Productised scores and feeds — connectivity and walkability indices, valuation inputs — owned end-to-end from method to shipped API.",
    "stack": ["APIs", "Python", "React", "product ownership"]
  },
  {
    "name": "Forecasting & network analysis",
    "blurb": "A monthly EU house-price index across 13 countries tested with Eurostat, nowcasting models, and a saturation-validated Connectivity Score.",
    "stack": ["time-series", "nowcasting", "graphs", "XGBoost"]
  },
  {
    "name": "Data pipelines, built and maintained",
    "blurb": "Big-data scrape and ETL infrastructure that keeps running: three years of weekly collection across 8 protected sources, 250k+ records — maintained, not just launched.",
    "stack": ["Airflow", "PostGIS", "big data", "13 servers"]
  }
]
```

- [ ] **Step 3: Rewrite `Proof` outcomes + CTAs in `frontend/messages/en.json`**

```json
"outcomes": [
  {
    "value": "13",
    "unit": "EU countries · one pipeline",
    "context": "Monthly house-price index · tested with Eurostat"
  },
  {
    "value": "2 wks",
    "unit": "ahead of plan · on budget",
    "context": "Connectivity Score · 13-server build"
  },
  {
    "value": "250k+",
    "unit": "records · 8 sources · weekly, 3 years",
    "context": "Institutional-grade scrape · used by statistics bureaus"
  }
],
"ctaPrimary": "See the full resume",
"ctaSecondary": "Get in touch"
```

Leave `Proof.quote`/`quoteAttribution` untouched (open item #1 — user confirms or removes; do not invent).

- [ ] **Step 4: Repoint Proof CTAs in `frontend/components/proof-strip.jsx`**

Primary CTA (lines ~58–66): change `Link` href from `/${locale}/contact` to `/${locale}/about`, and the trackEvent to `trackEvent("cta_click", { cta: "resume", location: "home_proof_strip", source: "home_proof_primary" })`.

Secondary CTA (lines ~67–76): change the `<a href="https://cal.com/ianronk/intro">` to a `Link` to `/${locale}/contact` (drop `target="_blank"`), keep `btn ghost`, and change trackEvent to `trackEvent("cta_click", { cta: "contact", location: "home_proof_strip", source: "home_proof_secondary" })`. (The cal.com booking link survives on the Contact page via `Contact.linkBookCall`.)

- [ ] **Step 5: Verify**

Run: `cd frontend && npm run build` → must pass.
Run: `grep -c "Discuss a project" messages/en.json` → expected `1` (only `Research.indexDiscuss`, fixed in Task 2).
Run: `grep -c "cal.com" components/proof-strip.jsx` → expected `0`.

- [ ] **Step 6: Commit**

```bash
git add frontend/messages/en.json frontend/components/proof-strip.jsx
git commit -m "feat: hero/lanes/proof repositioned to data-lead claims with real outcomes"
```

---

### Task 2: Section renaming — Work & Academics

**Files:**
- Modify: `frontend/messages/en.json` (namespaces `Navigation`, `Thoughts`, `Research`)
- Modify: `frontend/app/[locale]/thoughts/page.jsx:3-29` (generateMetadata strings)
- Modify: `frontend/app/[locale]/research/page.jsx:3-29` (generateMetadata strings)

**Interfaces:**
- Produces: nav labels "Work"/"Academics"; case-study framing keys other tasks' copy references.
- Consumes: nothing. URLs `/thoughts` and `/research` DO NOT change (backlink preservation — spec §1).

- [ ] **Step 1: Rename nav labels in `en.json`**

In `Navigation`: `"visualizations": "Work"`, `"research": "Academics"`. (The key *name* `visualizations` stays — components reference it.)

- [ ] **Step 2: Reframe `Thoughts` copy values in `en.json`**

Replace these values (key names unchanged):

```json
"kicker": "Work: case studies & field notes",
"recentTitle": "Recent",
"recentItalic": "work",
"subtitle": "Case studies from shipped projects — what got built, what broke, and what it changed.",
"writingTeaserKicker": "Work: case studies & field notes",
"writingTeaserSubtitle": "Case studies from shipped projects, plus field notes on what breaks in production.",
"backToList": "← Back to work"
```

- [ ] **Step 3: Reframe `Research` index copy in `en.json`**

Set `"indexDiscuss": "Get in touch"`. Then enumerate which Research keys the index page heading uses:
Run: `grep -oE 't\("(index[A-Za-z]*|kicker|title[A-Za-z]*)"\)' frontend/components/research-list.jsx | sort -u`
For the kicker/title keys that command surfaces, set values to the Academics framing: kicker → `"Academics: papers, methods, publications"`; if a subtitle key exists → `"Peer-reviewed papers, working papers and method write-ups on urban dynamics, network analysis and geospatial methods."` Leave structural keys (loading, notFound…) alone.

- [ ] **Step 4: Update the two index pages' metadata**

`frontend/app/[locale]/thoughts/page.jsx` — in generateMetadata, set:
title `"Work — case studies & field notes"`; description `"Case studies and field notes from shipped data projects — pipelines, forecasting, geospatial methods — by Ian Ronk, data lead in Amsterdam."`; mirror both into its `openGraph` block.

`frontend/app/[locale]/research/page.jsx` — set:
title `"Academics — papers & publications"`; description `"Papers and publications on urban dynamics, network analysis and geospatial methods by Ian Ronk — gentrification, accessibility, housing markets."`; mirror into `openGraph`.

- [ ] **Step 5: Verify**

Run: `cd frontend && npm run build` → pass.
Run: `grep -n '"visualizations"' messages/en.json` → value is `"Work"`.
Run: `grep -c "Discuss a project" messages/en.json` → expected `0`.

- [ ] **Step 6: Commit**

```bash
git add frontend/messages/en.json "frontend/app/[locale]/thoughts/page.jsx" "frontend/app/[locale]/research/page.jsx"
git commit -m "feat: rename sections — Thoughts→Work, Research→Academics (labels only, URLs unchanged)"
```

---

### Task 3: /about as resume — About namespace + expertise grid rendering + years sweep

**Files:**
- Modify: `frontend/messages/en.json` (namespaces `About`, `AboutTeaser`, `Contact`)
- Modify: `frontend/components/about-content.jsx` (insert expertise grid between facts sidebar ~line 73 and journey section)
- Modify: `frontend/app/[locale]/about/page.jsx:3-23` (generateMetadata)

**Interfaces:**
- Consumes: house CSS classes; `About.expertise`/`expertiseBadge`/`expertiseSubtitle` (exist in JSON, currently rendered by NOTHING — this task adds the surface).
- Produces: the resume destination `Proof.ctaPrimary` (Task 1) and `AuthorTrailer` (Task 5) route to.

- [ ] **Step 1: Rewrite About hero/ledes in `en.json`**

```json
"heroTitleLine1a": "Data",
"heroTitleLine1aItalic": "Lead",
"heroTitleLine2": "Engineering",
"heroTitleLine2Underline": "Systems",
"heroTitleLine3": "& Research.",
"lede1": "Based in Amsterdam, I lead data teams and build what they run: big-data pipelines, forecasting and nowcasting models, network analysis and spatial data products. The research seat stays warm — urban dynamics, gentrification, accessibility at parcel resolution — because cities are where data problems get hard. A geodata specialist based in Amsterdam by depth; a data lead by trade."
```

`lede2` stays verbatim (spec: keep the biases line).

- [ ] **Step 2: Replace `About.expertise` with the five competences**

```json
"expertiseSubtitle": "Five competences, one constraint: a calibrated pipeline tends to outlast a clever one.",
"expertise": [
  {
    "title": "Big Data & Pipelines",
    "description": "Scrape and ETL infrastructure that keeps running: three years of weekly collection across 8 protected sources, 250k+ records, Airflow and PostGIS underneath."
  },
  {
    "title": "Network Science",
    "description": "Graph methods on real geographies — a saturation-validated Connectivity Score at parcel resolution, accessibility and connectivity research."
  },
  {
    "title": "Timeseries & Forecasting",
    "description": "A monthly house-price index across 13 EU countries tested with Eurostat, plus nowcasting models for sparse, slow official statistics."
  },
  {
    "title": "Spatial Analysis",
    "description": "Parcel- and postcode-level modelling: agent-based gentrification models, hedonic pricing, H3 and PostGIS as daily tools."
  },
  {
    "title": "Product Ownership & Leadership",
    "description": "End-to-end ownership from method to shipped API — a 13-server build delivered two weeks ahead of plan, on budget, and a team led at KR&A. [NEEDS FACT: team size]"
  }
]
```

- [ ] **Step 3: Years + breadth sweep in `en.json`**

- `About.factExperienceValueHighlight`: `"5+ years"`; `About.factExperienceValueRest`: `"in data engineering & spatial analytics"`
- `About.experienceSubtitle`: `"5+ years building and leading production data systems — pipelines, forecasting, geospatial — across European markets and academic research."`
- `About.journeyTitlePrefixItalic`: `"Five"`
- `About.bio1` and `AboutTeaser.bio1`: change "roughly four years" → `"roughly five years"` (keep the rest of each sentence).
- `Contact.yearsExperience`: `"5+ years in data engineering & spatial analytics"`
- Sweep check: `grep -n "four years\|4+ years\|Four competencies" frontend/messages/en.json` → expected no matches.

- [ ] **Step 4: Rewrite `About.experience` entries as led/delivered statements**

Transformation rule for each entry (fields `year/role/company/description` unchanged except `description`): activity phrasing ("Working on…", "Delivering insights…") becomes led/delivered claims with the concrete numbers from this plan (250k+ records, 8 sources, 13 countries, 13 servers, 2 weeks early) where the entry matches that work; where a leadership number is missing, insert `[NEEDS FACT: …]`. KR&A entry description becomes:

```
"Head of Data: leading data strategy, the team [NEEDS FACT: team size] and AI initiatives for an alternative-data FinTech serving European real-estate funds and REITs. Led the aggregation pipeline homogenising listings across 13 EU countries and the Connectivity Score build — 13 servers, on budget, two weeks ahead of plan."
```

Apply the same rule to the remaining entries, preserving each entry's existing facts (do not delete factual content; only reframe activity → led/delivered).

- [ ] **Step 5: Render the expertise grid in `about-content.jsx`**

Add `const expertise = t.raw("expertise") || [];` next to the existing `t.raw("experience")` (line ~11). Insert after the facts-sidebar section closes (~line 73) and before the journey section:

```jsx
{expertise.length > 0 && (
  <section className="section-pad">
    <p className="section-label">{t("expertiseBadge")}</p>
    <p className="max-w-2xl opacity-80">{t("expertiseSubtitle")}</p>
    <div className="grid gap-6 md:grid-cols-2 mt-8">
      {expertise.map((e) => (
        <div key={e.title} className="border-t pt-4">
          <h3 className="font-medium">{e.title}</h3>
          <p className="text-sm opacity-80 mt-1">{e.description}</p>
        </div>
      ))}
    </div>
  </section>
)}
```

Match the file's surrounding markup conventions (class names, wrappers) — mirror how the journey section is structured rather than inventing new patterns; the block above is the minimum shape.

- [ ] **Step 6: /about metadata**

In `frontend/app/[locale]/about/page.jsx` generateMetadata: title `"Resume & competences — Data Lead & Engineer"`; description `"Resume of Ian Ronk — data lead and geodata specialist based in Amsterdam: competences across big data, network science, forecasting and spatial analysis, plus experience, education and publications."`; mirror into `openGraph`.

- [ ] **Step 7: Verify**

`cd frontend && npm run build` → pass.
`grep -c "NEEDS FACT" messages/en.json` → non-zero is EXPECTED (user fills these); note the count in the task report.
Start dev server `npx next dev -p 3002` and `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/en/about` → `200`.

- [ ] **Step 8: Commit**

```bash
git add frontend/messages/en.json frontend/components/about-content.jsx "frontend/app/[locale]/about/page.jsx"
git commit -m "feat: /about upgraded to resume destination — 5 competences rendered, led/delivered experience, 5+ years"
```

---

### Task 4: Publications block on /about

**Files:**
- Create: `frontend/components/publications-list.jsx`
- Modify: `frontend/app/[locale]/about/page.jsx` (render after `<AboutContent />`)
- Modify: `frontend/messages/en.json` (`About` namespace: 3 new keys)

**Interfaces:**
- Consumes: Django `GET ${DJANGO_API_URL}/api/research/?status=published` (same server-fetch pattern as `writing-teaser.jsx:7-20`; response `data.results || data`); `getItemField(item, field, locale)` from `@/lib/i18n-item`.
- Produces: `<PublicationsList locale />` server component.

- [ ] **Step 1: Add keys to `About` in `en.json`**

```json
"publicationsKicker": "Publications & papers",
"publicationsEmpty": "Papers land here as they publish.",
"publicationsViewAll": "All papers →"
```

- [ ] **Step 2: Create `frontend/components/publications-list.jsx`**

```jsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getItemField } from "@/lib/i18n-item";

async function fetchPublications() {
  const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
  try {
    const res = await fetch(`${djangoUrl}/api/research/?status=published`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || data;
    return Array.isArray(results) ? results.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export async function PublicationsList({ locale }) {
  const t = await getTranslations({ locale, namespace: "About" });
  const pubs = await fetchPublications();
  if (!pubs.length) return null;

  return (
    <section className="section-pad">
      <p className="section-label">{t("publicationsKicker")}</p>
      <ul className="mt-6 divide-y">
        {pubs.map((p) => (
          <li key={p.slug} className="py-3">
            <Link href={`/${locale}/research/${p.slug}`} className="hover:underline">
              {getItemField(p, "title", locale)}
            </Link>
            <span className="text-sm opacity-60">
              {" "}· {p.category} · {(p.published_at || p.date || "").slice(0, 4)}
            </span>
          </li>
        ))}
      </ul>
      <Link href={`/${locale}/research`} className="btn ghost mt-4">
        {t("publicationsViewAll")}
      </Link>
    </section>
  );
}
```

- [ ] **Step 3: Render it in `frontend/app/[locale]/about/page.jsx`**

Import `PublicationsList`, and inside `<main>` after `<AboutContent />` add `<PublicationsList locale={locale} />` (the page already awaits `params` for `locale`; if it doesn't destructure `locale`, add it).

- [ ] **Step 4: Verify**

`cd frontend && npm run build` → pass. With dev server + backend running, `curl -s http://localhost:3002/en/about | grep -c "Publications"` → `1`; without a backend the section renders nothing and the page still 200s (fetch is try/caught) — verify `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/en/about` → `200`.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/publications-list.jsx "frontend/app/[locale]/about/page.jsx" frontend/messages/en.json
git commit -m "feat: publications block on /about — closes recruiter flow to papers"
```

---

### Task 5: Flow plumbing — RelatedPosts + AuthorTrailer on content pages

**Files:**
- Create: `frontend/components/related-posts.jsx`
- Create: `frontend/components/author-trailer.jsx`
- Modify: `frontend/components/blog-post.jsx` (insert after ReactMarkdown ~line 84, before NewsletterSubscribe ~line 87)
- Modify: `frontend/components/research-article-detail.jsx` (insert AuthorTrailer before the tail `NewsletterSubscribe` ~line 372)
- Modify: `frontend/messages/en.json` (new `Author` namespace; `Thoughts.relatedKicker` key)

**Interfaces:**
- Consumes: client proxy `GET /api/django?endpoint=blog` (shape `data.results || data`, fields `slug,title,category,tags?,date,published_at,translations[]`); `getItemField`; `trackEvent`; the related-scoring pattern already proven in `research-article-detail.jsx:168-192`.
- Produces: `<RelatedPosts slug category tags />` and `<AuthorTrailer location />` client components.

- [ ] **Step 1: Add copy to `en.json`**

New top-level namespace:

```json
"Author": {
  "roleLine": "Data Lead & Engineer · Urban-Dynamics Researcher",
  "bio": "I lead data teams and build production data systems in Amsterdam. This site collects the case studies, papers and field notes.",
  "cta": "Full resume →"
}
```

In `Thoughts`, add: `"relatedKicker": "Related work"`.

- [ ] **Step 2: Create `frontend/components/related-posts.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getItemField } from "@/lib/i18n-item";
import { trackEvent } from "@/lib/analytics";

export function RelatedPosts({ slug, category, tags = [] }) {
  const locale = useLocale();
  const t = useTranslations("Thoughts");
  const [related, setRelated] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/django?endpoint=blog`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const results = data.results || data;
        if (!Array.isArray(results)) return;
        const picks = results
          .filter((p) => p.slug && p.slug !== slug)
          .map((p) => {
            let score = 0;
            if (category && p.category === category) score += 2;
            if (Array.isArray(p.tags) && tags.length) {
              score += p.tags.filter((x) => tags.includes(x)).length;
            }
            return { p, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((s) => s.p);
        setRelated(picks);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug, category, tags]);

  if (!related.length) return null;

  return (
    <section className="mt-12">
      <p className="section-label">{t("relatedKicker")}</p>
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        {related.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/thoughts/${p.slug}`}
            className="block border-t pt-3 hover:underline"
            onClick={() =>
              trackEvent("cta_click", {
                cta: "related_post",
                location: "post_related",
                source: p.slug,
              })
            }
          >
            <span className="chip">
              {(getItemField(p, "category", locale) || p.category || "ARTICLE").toUpperCase()}
            </span>
            <h4 className="mt-2 font-medium">{getItemField(p, "title", locale)}</h4>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `frontend/components/author-trailer.jsx`**

```jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function AuthorTrailer({ location = "post_author" }) {
  const locale = useLocale();
  const t = useTranslations("Author");

  return (
    <aside className="mt-12 flex items-start gap-4 border-t pt-6">
      <Image
        src="/ianronk.jpeg"
        alt="Ian Ronk"
        width={56}
        height={56}
        className="rounded-full object-cover"
      />
      <div>
        <p className="font-medium">Ian Ronk</p>
        <p className="text-sm opacity-70">{t("roleLine")}</p>
        <p className="text-sm mt-1 max-w-prose">{t("bio")}</p>
        <Link
          href={`/${locale}/about`}
          className="btn ghost mt-3"
          onClick={() =>
            trackEvent("cta_click", {
              cta: "about_me",
              location,
              source: "author_trailer",
            })
          }
        >
          {t("cta")}
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Wire into `blog-post.jsx`**

Import both components. Directly after the `<ReactMarkdown>` block (~line 84) and BEFORE `<NewsletterSubscribe variant="inline" source="post-end" …>` insert:

```jsx
<RelatedPosts slug={slug} category={post.category} tags={post.tags || []} />
<AuthorTrailer location="post_author" />
```

Resulting exit order: article → related work → who wrote this → newsletter → share → end-CTA. 

- [ ] **Step 5: Wire into `research-article-detail.jsx`**

Import `AuthorTrailer`; insert `<AuthorTrailer location="research_author" />` immediately before the tail `<NewsletterSubscribe variant="inline" source="research-end" …>` (~line 372). Its related-articles grid already exists (lines 389–427) — leave as is. The `STATIC_PAPERS` fallback (lines 17–84) contains real papers, not placeholders — leave as is.

- [ ] **Step 6: Verify**

`cd frontend && npm run build` → pass. Dev server: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/en/thoughts` → 200; open one post route the same way → 200 (client blocks render browser-side; build+200 is the gate here).

- [ ] **Step 7: Commit**

```bash
git add frontend/components/related-posts.jsx frontend/components/author-trailer.jsx frontend/components/blog-post.jsx frontend/components/research-article-detail.jsx frontend/messages/en.json
git commit -m "feat: related-posts + author trailer close the content→resume flow"
```

---

### Task 6: SEO & LLM discoverability

**Files:**
- Modify: `frontend/app/layout.tsx:15-48` (metadata)
- Modify: `frontend/components/json-ld.jsx` (PersonJsonLd + WebSiteJsonLd; add ProfilePageJsonLd export)
- Modify: `frontend/app/[locale]/about/page.jsx` (render ProfilePageJsonLd)
- Create: `frontend/public/llms.txt`

**Interfaces:**
- Consumes: CANONICAL sentence (Global Constraints).
- Produces: `ProfilePageJsonLd` export from `@/components/json-ld`.

- [ ] **Step 1: Root metadata in `app/layout.tsx`**

- `title.default` and `openGraph.title` and `twitter.title`: `'Ian Ronk | Data Lead & Engineer · Urban-Dynamics Researcher'`
- `description` (all three places): CANONICAL sentence.
- `keywords`: `['Data Lead', 'Data Engineering', 'Big Data', 'Network Science', 'Time Series Forecasting', 'Product Ownership', 'Geodata', 'Geospatial Analysis', 'Geodata Specialist Amsterdam', 'Machine Learning', 'PostGIS', 'Urban Dynamics', 'Amsterdam', 'Ian Ronk']`
- `openGraph.images[0].alt`: `'Ian Ronk — Data Lead · Geospatial · ML'`

- [ ] **Step 2: Enrich `PersonJsonLd` in `json-ld.jsx`**

Set `jobTitle: "Data Lead & Engineer"`; add `description` = CANONICAL; add:

```js
hasOccupation: [
  { "@type": "Occupation", name: "Data Lead" },
  {
    "@type": "Occupation",
    name: "Geodata Specialist",
    occupationLocation: { "@type": "City", name: "Amsterdam" },
  },
],
```

Replace `knowsAbout` with:

```js
knowsAbout: [
  "Data Engineering", "Big Data Pipelines", "Network Science",
  "Time Series Forecasting", "Nowcasting", "Spatial Analysis",
  "Geospatial Engineering", "Urban Dynamics", "Gentrification",
  "Housing Markets", "Accessibility", "PostGIS", "Machine Learning",
  "Product Ownership",
],
```

`sameAs`: keep LinkedIn + GitHub; append a comment-free placeholder is NOT allowed — instead leave the array as-is and record in the task report: "sameAs additions (Medium/Substack, ORCID/ArXiv) pending user URLs (open item #3)."

In `WebSiteJsonLd`, set `description` = CANONICAL.

- [ ] **Step 3: Add `ProfilePageJsonLd` export to `json-ld.jsx`**

```jsx
export function ProfilePageJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Ian Ronk",
      jobTitle: "Data Lead & Engineer",
      description:
        "Ian Ronk is a data lead and engineer in Amsterdam who builds and runs production data systems — big data pipelines, forecasting, network analysis — with a research specialization in urban dynamics.",
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

Render `<ProfilePageJsonLd />` inside `<main>` in `frontend/app/[locale]/about/page.jsx`.

- [ ] **Step 4: Create `frontend/public/llms.txt`**

```
# Ian Ronk — ianronk.com

> Ian Ronk is a data lead and engineer in Amsterdam who builds and runs production data systems — big data pipelines, forecasting, network analysis — with a research specialization in urban dynamics. A geodata specialist based in Amsterdam. Head of Data at KR&A; MSc Data Science (Bocconi), BSc Artificial Intelligence (University of Amsterdam).

## Key pages
- About / resume: https://ianronk.com/en/about — competences, experience, education, publications
- Work (case studies): https://ianronk.com/en/thoughts
- Academics (papers): https://ianronk.com/en/research
- Contact: https://ianronk.com/en/contact

## Competences
Big data pipelines · Network science · Time-series forecasting & nowcasting · Spatial analysis (PostGIS, H3, agent-based models) · Product ownership & team leadership

## Evidence
- Monthly EU house-price index across 13 countries, tested with Eurostat
- Connectivity/walkability score at parcel resolution — 13-server build, on budget, two weeks ahead of plan
- Three-year weekly scrape: 250k+ records across 8 protected sources; used by statistics bureaus
```

- [ ] **Step 5: Verify**

`cd frontend && npm run build` → pass. `curl -s http://localhost:3002/llms.txt | head -3` → serves the file. `curl -s http://localhost:3002/en/about | grep -c 'ProfilePage'` → `1`. Paste homepage HTML JSON-LD into a local check: `curl -s http://localhost:3002/en | grep -o '"jobTitle":"[^"]*"'` → `"jobTitle":"Data Lead & Engineer"`.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/layout.tsx frontend/components/json-ld.jsx "frontend/app/[locale]/about/page.jsx" frontend/public/llms.txt
git commit -m "feat: metadata + JSON-LD + llms.txt for data-lead entity and LLM retrieval"
```

---

### Task 7: Translation parity — mirror nl/de/it

**Files:**
- Modify: `frontend/messages/nl.json`, `frontend/messages/de.json`, `frontend/messages/it.json`

**Interfaces:**
- Consumes: final `en.json` from Tasks 1–6.
- Produces: 4-locale key parity.

- [ ] **Step 1: Diff key paths**

```bash
cd frontend/messages
for f in nl de it; do
  echo "== $f =="
  diff <(jq -r '[paths(scalars)|join(".")]|sort|.[]' en.json) \
       <(jq -r '[paths(scalars)|join(".")]|sort|.[]' $f.json)
done
```

This also surfaces the PRE-EXISTING drift (en had 353 leaves vs 352) — identify that stray key and reconcile it (add the missing translation or remove the orphan en key if it's dead; check component usage before removing).

- [ ] **Step 2: Translate every changed/new key**

For every key changed in Tasks 1–6 (Hero, Lanes, Proof, Navigation, Thoughts, Research, About, AboutTeaser, Contact, Author namespaces): write the nl/de/it translations in the same register as each file's existing copy (they were professionally ianified in June — match tone, don't literal-translate idioms). Keep `[NEEDS FACT: …]` markers verbatim untranslated. Proper nouns (Eurostat, Connectivity Score, PostGIS, Airflow) stay untranslated. "Data Lead" stays "Data Lead" in all locales (job-market term).

- [ ] **Step 3: Verify parity + build**

Re-run the Step 1 diff → empty output for all three. `cd frontend && npm run build` → pass. Dev server: `for l in en nl de it; do curl -s -o /dev/null -w "$l %{http_code}\n" http://localhost:3002/$l; done` → four 200s (next-intl provider errors do NOT fail the build — the curl gate is mandatory).

- [ ] **Step 4: Commit**

```bash
git add frontend/messages/nl.json frontend/messages/de.json frontend/messages/it.json frontend/messages/en.json
git commit -m "i18n: mirror repositioned copy to nl/de/it at full key parity"
```

---

### Task 8: Content ops — admin exposure prep, seed gating, port hardening

**Files:**
- Modify: `backend/config/settings.py` (~line 24 area)
- Modify: `docker-compose.yml` (backend service)

**Interfaces:**
- Consumes: env pattern `os.getenv(...)` (settings.py line 24 style).
- Produces: `CSRF_TRUSTED_ORIGINS` env support; gated seeding; localhost-only port binding. User-side Dokploy steps are documented in the final report, not automated.

- [ ] **Step 1: Add CSRF_TRUSTED_ORIGINS to `settings.py`**

Directly below the `ALLOWED_HOSTS` line (~24):

```python
CSRF_TRUSTED_ORIGINS = [o for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if o]
```

- [ ] **Step 2: docker-compose backend changes**

In the backend service:
- `ports:` → `- "127.0.0.1:8001:8001"` (Traefik/Dokploy reaches the container over the docker network, not the host port — this only closes the raw-HTTP public exposure).
- `environment:` add two lines:
  - `- DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,ianronk.nl,api.ianronk.nl`  (replaces the existing DJANGO_ALLOWED_HOSTS line)
  - `- CSRF_TRUSTED_ORIGINS=https://api.ianronk.nl`
- `command:` gate seeding — replace `python manage.py seed_data &&` with:

```yaml
command: >
  sh -c "python manage.py migrate &&
         if [ \"$$SEED_DEMO_DATA\" = \"true\" ]; then python manage.py seed_data; fi &&
         gunicorn --bind 0.0.0.0:8001 config.wsgi:application"
```

and add `- SEED_DEMO_DATA=${SEED_DEMO_DATA:-true}` to `environment:`. (Default stays true so nothing changes until the user flips it to false in Dokploy once real content is in — flipping stops placeholder resurrection.)

- [ ] **Step 3: Verify**

`docker compose config -q` → exits 0 (valid YAML/interpolation). `python3 -c "import ast; ast.parse(open('backend/config/settings.py').read())"` → no error. Grep: `grep -n "127.0.0.1:8001" docker-compose.yml` → 1 match.

- [ ] **Step 4: Commit**

```bash
git add backend/config/settings.py docker-compose.yml
git commit -m "ops: CSRF trusted origins + api host, gate seed_data, bind backend to localhost"
```

---

### Task 9: Final verification sweep

**Files:** none created — checks only.

- [ ] **Step 1: Full build + locale gate**

`cd frontend && npm run build` → pass. Dev server: curl `/{en,nl,de,it}` and `/{en}/about`, `/en/thoughts`, `/en/research` → all 200.

- [ ] **Step 2: Claim-consistency greps (all must return 0 matches)**

```bash
cd frontend
grep -rn "Discuss a project\|Book a 20-minute\|4+ years\|four years\|Geodata Engineer &" messages/*.json
grep -rn "Head of Data @" messages/*.json
```

(KR&A as a *credential* in About bio/experience/json-ld `worksFor` stays — spec keeps it deliberately.)

- [ ] **Step 3: Report open items to the user**

List: (1) Proof quote — confirm real or remove; (2) all `[NEEDS FACT]` markers with file+key; (3) sameAs URLs wanted (Medium/Substack, ORCID/ArXiv); (4) user-side Dokploy steps: add `api.ianronk.nl` domain → backend:8001 with TLS, set `SEED_DEMO_DATA=false` after real content, rotate secrets (pre-existing pending item), create superuser via `manage.py create_admin --email … --username … --password <strong>` (never bare), verify server firewall for port 8001.

- [ ] **Step 4: No push**

Leave everything as local commits. The user reviews and pushes (push = production deploy).
