# Personal-website cleanup — design spec

**Date:** 2026-04-28
**Branch:** `negatives-cleanup` (off `playful-restyle`)
**Status:** approved by user, ready for implementation plan

---

## Background

Following a review of the public-facing personal website (Next.js 16 frontend + Django backend), 14 concrete problems were identified. The user opted to address all of them in a single branch alongside one new feature (newsletter subscribe). This document is the consolidated design.

The site's three goals — show what the user does and his experience, share his ideas and work, let people contact him — frame every decision below. The single most impactful issue (placeholder email in three customer-facing spots) actively breaks goal #3, so contact correctness leads the work.

## Out of scope

The following are explicitly NOT part of this spec:

- Visitor identity resolution by name (would need RB2B / Leadfeeder / Clearbit Reveal — separate project).
- Newsletter sending logic. We collect addresses now; sending, double-opt-in, and the matching consent layer are deferred.
- Geo-targeted cookie banners (one banner is shown to all visitors).
- Full WCAG 2.1 AA conformance audit. Targeted fixes + an axe-devtools sweep instead.
- Any work on `/admin-portal`, `/crm`, `/login` (internal tooling).

---

## Section 1 — Contact correctness

**Problem:** `ian@example.com` is hardcoded in three customer-facing spots while the real receiving inbox is `ianronk0@gmail.com`. Any visitor who copies the visible email sends nothing.

**Changes:**

1. Replace the placeholder in `frontend/components/contact-content.jsx:140`, `contact-content.jsx:224`, and `frontend/components/footer.jsx:38` with `ianronk0@gmail.com`.
2. Render the address through a new helper `frontend/components/obfuscated-email.jsx`:
   - SSR output: HTML-entity-encoded characters (`&#105;&#97;&#110;…`) so naive scrapers get garbled bytes.
   - On hydration, JS assembles the visible string and the `mailto:` href from segmented constants.
   - JS-disabled fallback: a "Use the contact form" link.
3. Privacy line at `contact-content.jsx:211` ("We respect your privacy") becomes a link to `/privacy-policy`.

**Server-side spam tightening (`frontend/app/api/contact/route.js`):**

- New file `frontend/lib/spam/disposable-domains.json` ships a list of disposable-email providers (mailinator, tempmail, guerrillamail, 10minutemail, yopmail, etc. — ~80 entries).
- New file `frontend/lib/spam/check-submitter.js` exports a `isLikelySpamSubmitter(email)` helper. Returns `true` if the domain matches the denylist or if the local-part matches obvious spam patterns (random-letter prefixes, all-numeric local parts beyond N digits).
- The contact route, before sending mail, runs `isLikelySpamSubmitter`. If `true`, returns 200 OK (silently dropping) — never signals rejection back to the bot.
- Existing keyword-body filter, honeypot, reCAPTCHA, and timestamp validation all stay.

---

## Section 2 — Dead-code removal & route cleanup

**Delete (unused, verified by repo-wide grep before removal):**

- `frontend/components/email-gate.jsx`
- `frontend/components/newsletter-gate.jsx`
- `frontend/components/newsletter-popup.jsx`
- `frontend/components/project-abm-thesis.jsx`
- `frontend/components/project-languagebuddy.jsx`
- `frontend/components/work-content.jsx`
- `frontend/components/work-teaser.jsx`
- `ianronk.jpeg` and `ianronk2.jpeg` at the repo root.

**Keep:**

- `frontend/app/[locale]/work/page.jsx` — preserves the `/work → /about` redirect for any inbound links.
- `Disallow: /work` in `frontend/app/robots.ts`.

**Verification gate before commit:**

- `pnpm build` succeeds.
- Grep confirms no orphan imports of any deleted file.

---

## Section 3 — Newsletter subscribe (new feature)

### Frontend

- New component `frontend/components/newsletter-subscribe.jsx` with two variants:
  - `compact` — single-line email + submit, used in the footer.
  - `inline` — slightly larger, with a one-line headline and explanatory subtext, used at the end of post pages.
- Visual styling matches the rest of the site (paper background, yellow accent on submit, monospace label text, Instrument Serif headline for the inline variant).
- Submit POSTs to `/api/newsletter/subscribe` (Next route handler) with the same protections as the contact form: honeypot, reCAPTCHA token, timestamp validation, and the same `isLikelySpamSubmitter` check from Section 1.
- Success state: in-place "Thanks — we'll be in touch." message replacing the form, no redirect.
- All copy added to `frontend/messages/{en,nl,it,de}.json` under a new `Newsletter` namespace.

### Placements

1. `frontend/components/footer.jsx` — `compact` variant, always visible.
2. End of every `/thoughts/[slug]` page (`frontend/app/[locale]/thoughts/[slug]/page.jsx` or its render component) — `inline` variant after the post body, before the share bar.
3. End of every `/research/[slug]` page — `inline` variant in the same position.

### Backend (new Django app)

- New app `backend/apps/newsletter/`:
  - `Subscriber` model fields:
    - `email` — unique, indexed, lowercased before save.
    - `locale` — char field, validated to one of `en`/`nl`/`it`/`de`.
    - `source` — char field, validated to one of `footer`/`post-end`/`research-end`/`other`.
    - `created_at`, `confirmed_at` (nullable, for future double-opt-in), `unsubscribed_at` (nullable).
  - DRF endpoint `POST /api/newsletter/subscribe/`:
    - Validates email format and normalizes (lowercase, strip).
    - Idempotent: if email already exists, return 200 OK without modification (do not leak existence).
    - Records `source` and `locale` from the request body.
    - Rate-limited per IP via a DRF `UserRateThrottle` / `AnonRateThrottle` (added to `REST_FRAMEWORK` settings if not already configured) — 5 requests/minute is sufficient for a subscribe form.
  - Migration generated; app registered in `backend/config/settings.py` `INSTALLED_APPS`.
  - Django admin registration so the user can browse subscribers, filter by source/locale, and export.
- Model docstring explicitly notes: "Sender, double-opt-in, and consent-tier integration are deferred until the sending pipeline is built."

### Privacy disclosure

- `frontend/app/[locale]/privacy-policy/page.jsx` gets one new sentence: what we collect (email + locale + source), why (to send a future newsletter the user has opted into), retention (until unsubscribe), and how to unsubscribe (email request to `ianronk0@gmail.com` until automated unsubscribe is wired).
- Localized to all 4 locales.

---

## Section 4 — SEO: OG images + locale-correct JSON-LD

### Static OG (top-level pages)

- New `frontend/public/og.png` at 1200×630.
- Composed via a one-off generation script using `puppeteer` (already in devDependencies):
  - Layout: portrait crop on the left third, Instrument Serif title "Ian Ronk — Geospatial · ML · AI" centered, yellow accent bar, paper background.
  - Generated from an HTML template in `scripts/generate-og.html`, screenshotted to `frontend/public/og.png`.
- User approves the rendered image before commit.
- Wired into `frontend/app/layout.tsx` `metadata.openGraph.images` and `metadata.twitter.images`. Pages without their own OG override inherit this.

### Dynamic OG (post pages)

- New file `frontend/app/[locale]/thoughts/[slug]/opengraph-image.tsx`.
- New file `frontend/app/[locale]/research/[slug]/opengraph-image.tsx`.
- Both use `next/og`'s `ImageResponse` with `runtime = 'edge'`.
- Shared template (extracted to `frontend/lib/og/post-template.tsx`):
  - Paper background, yellow vertical accent bar on the left edge.
  - Post title in Instrument Serif, auto-sized via a length-based scale (96px for short titles → 56px for long).
  - Category label + date in monospace below the title.
  - `ianronk.com` footer in monospace, bottom-right.
- Title and metadata are fetched from Django at request time. If the Django response is not OK, the OG renders using the same template with a generic title ("New post on ianronk.com") rather than throwing — `next/og` can't redirect at runtime, so a successful render with placeholder text is the safer fallback.

### Locale-correct JSON-LD

- `frontend/components/json-ld.jsx`:
  - `ArticleJsonLd` accepts a new `locale` prop.
  - Builds `mainEntityOfPage["@id"]` as `https://ianronk.com/${locale}/research/${slug}`.
  - Adds `inLanguage: locale`.
  - Adds `isPartOf`: `{ "@type": "WebSite", "@id": "https://ianronk.com/${locale}" }`.
  - Adds a `sameAs` array listing the equivalent URL in each other locale where the article exists. Translation availability is determined by the Django response (each article record carries a list of available locales).
  - A new `BlogPostingJsonLd` component is added, mirroring `ArticleJsonLd` but emitting `BlogPosting` schema for `/thoughts/[slug]` pages.
- Callers in `[locale]/research/[slug]/page.jsx` and `[locale]/thoughts/[slug]/page.jsx` pass `locale` from `params`.

### Per-page metadata audit

- `/about`, `/contact`, `/research`, `/thoughts` page-level `metadata` blocks each set:
  - `openGraph.url` — locale-correct canonical.
  - `alternates.languages` — full map of locale → URL for all 4 locales.

---

## Section 5 — UX & a11y

### Mobile menu auto-close (`navigation.jsx`)

- Each `<Link>` rendered inside the mobile-menu overlay invokes `setMobileOpen(false)` via an `onClick` handler. Implementation prefers a single delegated `onClick` on the overlay container that detects link clicks via event-target check, to avoid attaching handlers to every link.
- Existing close-on-X-button and close-on-outside-click behaviors stay.

### Targeted a11y fixes

- **`research-list.jsx:99`** — wrap input in a `<label>` element with visible "Search research" text (or visually hidden via a `.sr-only` utility, depending on the existing visual layout). The wrapping container gets `role="search"`.
- **Decorative SVGs** in `skills-grid.jsx`, `projects-gallery.jsx`, `hero-section.jsx` — every SVG that is purely decorative gets `aria-hidden="true"` + `focusable="false"`.
- **Informational SVGs** (the intake-flow / ABM-grid / sales-pipeline diagrams in `projects-gallery.jsx`) get a `<title>` element with a one-sentence description so AT users get the gist.
- **`navigation.jsx:97` and any inline-styled buttons** — define a single `.focus-ring` utility in `frontend/app/globals.css` (yellow `2px solid #FFD60A` outline with `2px` offset) and apply it to all interactive elements that currently rely on inline styles.

### Axe-devtools sweep (per Question 8 = option B)

- Run axe in browser devtools against `/`, `/about`, `/contact`, `/thoughts`, `/research`, plus one post page from each.
- Every axe issue at **Serious** or **Critical** severity must be fixed before merge. Common candidates: heading-order, missing `lang` attributes on quoted foreign text, color-contrast on muted text, focus-order on interactive elements. Moderate/Minor severities are fixed if cheap, deferred otherwise.
- Findings + fixes are documented inline in the implementation plan.
- Commit organization: if the sweep yields ≤ 5 fixes, fold them into the existing a11y commit; if more, group them in a second a11y commit. If the sweep surfaces a single nontrivial item (e.g., structural rework), that item is flagged for separate user decision rather than silently expanded.

### `next/image` `sizes` audit

- Audit every `<Image>` in components and pages. For each:
  - If the image is responsive: add an explicit `sizes` prop, e.g. `"(max-width: 768px) 100vw, 50vw"`.
  - If the image is fixed-size: ensure `width`/`height` are correct and `fill` is removed if not needed.
- Touched files (non-exhaustive): `frontend/components/about-content.jsx`, `about-teaser.jsx`, `projects-gallery.jsx`.

---

## Section 6 — Server-side data fetching

### Move teaser components to server

- `frontend/components/writing-teaser.jsx` and `research-preview.jsx`:
  - Drop the `"use client"` directive.
  - Become `async` server components that `await fetch(${DJANGO_URL}/api/...)` directly with `next: { revalidate: 60 }` for light caching.
  - The `DEFAULT_POSTS` constant arrays are deleted from both files.
- Error path: if the Django response is not OK, the section renders a quiet "Posts loading — check back shortly" message rather than throwing. The error is logged server-side via `console.error` (Vercel captures this).
- Same treatment is applied to any other component performing a client-side fetch from `/api/django` discovered during the audit.

### Search interactivity stays client-side

- `research-list.jsx` keeps its filtering UX as a client component but receives the initial post list via props from a server-rendered parent. First paint shows the full list rendered server-side; the client component only takes over filtering once interactive.

### Layout-shift smoke test

- After deploy, run Lighthouse mobile + desktop on `/`, `/research`, `/thoughts`. Confirm CLS < 0.1 on each. If any page regresses, fix before merging the branch.

---

## Section 7 — Tracking + consent

### Cookie banner rework (`cookie-consent.jsx`)

- Two opt-in checkboxes inside the banner: **Analytics** and **Marketing**. Both default OFF.
- Buttons: "Accept all", "Reject all", "Save preferences" (visible only once the user toggles either box manually).
- Choices persist in `localStorage` under the new versioned key `cookie-consent-v2`. Schema:
  ```json
  {
    "analytics": false,
    "marketing": false,
    "decidedAt": "2026-04-28T12:34:56.000Z",
    "version": 2
  }
  ```
- Old `cookie-consent` / `v1` keys are read once at boot, then discarded — users with a prior consent are re-prompted because the surface area of what's being consented to has changed.
- A "Cookie preferences" link in the footer reopens the banner.
- All banner copy localized in all 4 locales.

### Consent context provider

- New `frontend/components/consent-provider.jsx` exposes a `useConsent()` hook returning `{ analytics, marketing, ready }`.
- Wraps the body in `app/layout.tsx`.
- A `storage` event listener syncs across tabs: changing consent in one tab updates the others without reload.

### Tier wiring

| Tier | Tool | Loaded when |
|---|---|---|
| 1 — always on | Vercel Analytics (`@vercel/analytics`, already installed) | Always. Cookieless. |
| 2 — analytics consent | Google Analytics (`google-analytics.jsx`) | `consent.analytics === true`. The script tag is rendered conditionally in `app/layout.tsx`. |
| 2 — analytics consent | Microsoft Clarity (new `clarity.jsx` component) | Same gating. Project ID via `NEXT_PUBLIC_CLARITY_PROJECT_ID`. |
| 3 — marketing consent | LinkedIn Insight Tag (`linkedin-insight.jsx`) | `consent.marketing === true`. |

- New helper `frontend/lib/analytics/track.js` exposes `trackEvent(name, props)`. Reads consent state via `consentStore.getState()` (a small vanilla store the provider also writes to, so `track.js` doesn't need to be a hook). Drops events silently when `analytics === false`.
- All call sites — `hero-section.jsx:178`, `navigation.jsx:146`, and any others discovered during the audit — switch to importing from this helper.

### Privacy & cookie-policy pages

- `privacy-policy/page.jsx` and `cookie-policy/page.jsx` updated in all 4 locales:
  - Enumerate each tool (Vercel Analytics, GA, Microsoft Clarity, LinkedIn Insight) with purpose, data collected, retention, and the consent tier gating it.
  - Note that newsletter subscriber data is governed by the consent given at signup time and is separate from analytics consent.

### Verification

- After deploy, with banner not yet accepted:
  - Open devtools → Network. Confirm GA, Clarity, and LinkedIn Insight requests do NOT fire.
  - Vercel Analytics may fire (cookieless, expected).
- Accept analytics-only:
  - Confirm GA + Clarity start. LinkedIn Insight does not fire.
- Accept marketing also:
  - Confirm LinkedIn Insight fires.

---

## Implementation order (proposed)

The implementation plan that follows this spec will sequence work to keep each commit shippable:

1. Section 1 — Contact correctness (smallest, highest impact).
2. Section 2 — Dead-code removal (unblocks grep noise).
3. Section 5 — UX & a11y targeted fixes (small, isolated).
4. Section 4 — SEO: OG images + locale JSON-LD.
5. Section 6 — Server-side fetching (also kills `DEFAULT_POSTS`).
6. Section 3 — Newsletter feature (touches frontend + new Django app).
7. Section 7 — Tracking + consent (largest, touches the most surfaces; ships last so the rest is verified beforehand).

Each section is its own commit (or small commit cluster) so review is incremental and individual sections can be reverted if needed.

## Verification before merge

- `pnpm build` and `pnpm lint` clean.
- Django migrations apply cleanly on a fresh DB (`python manage.py migrate`).
- Manual click-through on `/`, `/about`, `/contact`, `/thoughts`, `/research`, plus one `/thoughts/[slug]` and one `/research/[slug]` post in at least 2 locales.
- Lighthouse mobile run on `/`, `/research`, `/thoughts`: CLS < 0.1, no perf regressions vs. current `playful-restyle` baseline.
- Axe-devtools clean of Serious/Critical issues on the same pages.
- Manual consent-tier verification (per Section 7 "Verification").
- Submit the contact form once (real email) and the newsletter form once (real email) end-to-end.
