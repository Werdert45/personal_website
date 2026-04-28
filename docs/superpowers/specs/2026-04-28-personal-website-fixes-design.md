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

**Server-side spam tightening (revised — see Discoveries §A):**

The codebase already has `validate_serious_email` in `backend/apps/users/models.py` (lines 62–132). It runs:
- email-validator deliverability check (when `email-validator` is installed).
- django-disposable-email-checker against a maintained list (or a fallback hardcoded list of ~30 free-mail/disposable domains).
- Pattern checks: rejects digit-heavy local parts, plus `^test\d*@`, `^fake\d*@`, `^spam\d*@`, `^noreply@`, `^no-reply@`, `^donotreply@`, `^asdf`, `^qwerty`, `^aaa+@`, `^xxx+@`, `^zzz+@`.

Rather than duplicating this in a frontend denylist, we expose it as an HTTP endpoint and call it from the contact route:

- New view `ValidateEmailView` in `apps/users/views.py`: `POST /api/auth/validate-email/` accepts `{"email": "…"}`, runs `validate_serious_email`, returns 200 (`{"valid": true}`) or 400 (`{"valid": false, "reason": "…"}`). No persistence side-effect.
- `frontend/app/api/contact/route.js`, before sending mail, POSTs the submitter email to that endpoint. If the response is 400, the contact route returns 200 OK to the client (silently dropping) — never signals rejection back to the bot.
- Existing keyword-body filter, honeypot, reCAPTCHA, and timestamp validation all stay.
- If `DJANGO_API_URL` is unreachable, the contact route falls through (does not block legitimate submissions on infrastructure failure).

---

## Section 2 — Dead-code removal & route cleanup

**Delete (verified by repo-wide grep before removal):**

- `frontend/components/email-gate.jsx` (truly unused)
- `frontend/components/newsletter-gate.jsx` — see note below
- `frontend/components/newsletter-popup.jsx` (truly unused)
- `frontend/components/project-abm-thesis.jsx` (truly unused)
- `frontend/components/project-languagebuddy.jsx` (truly unused)
- `frontend/components/work-content.jsx` (truly unused)
- `frontend/components/work-teaser.jsx` (truly unused)
- `frontend/components/providers.jsx` — its only purpose was wrapping the app in `<NewsletterProvider>` from newsletter-gate
- `ianronk.jpeg` and `ianronk2.jpeg` at the repo root.

**Note on newsletter-gate.jsx (revised — see Discoveries §B):** the original review said this file was unused. It was wrong: `newsletter-gate.jsx` exports `NewsletterProvider`, which `providers.jsx` mounts in `app/layout.tsx`. The provider's *consumers* (`MapAccessGate`, `useNewsletter` callers) are however genuinely unused — confirmed by grep against `mapbox-map.jsx`, `mapbox-wrapper.jsx`, and the rest of the tree. Deleting the gate file plus `providers.jsx` plus the `<Providers>` wrapper in `app/layout.tsx` (lines 5, 76, 78) cleanly removes the orphaned scaffolding.

**Modify:**

- `frontend/app/layout.tsx` — remove the `import { Providers } from '@/components/providers'` (line 5) and unwrap the `<Providers>…</Providers>` block (lines 76–78). The new `ConsentProvider` from Section 7 takes over wrapping the app.

**Keep:**

- `frontend/app/[locale]/work/page.jsx` — preserves the `/work → /about` redirect for any inbound links.
- `Disallow: /work` in `frontend/app/robots.ts`.

**Verification gate before commit:**

- `pnpm build` succeeds.
- Grep confirms no orphan imports of any deleted file.
- Page loads at `/en` and `/en/contact` — confirm no runtime crash from the unmounted provider.

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

### Backend (revised — reuse existing `apps.users.NewsletterSubscriber`, see Discoveries §C)

The original review missed that there is already a `NewsletterSubscriber` model in `backend/apps/users/models.py` (built for map-access gating, now orphaned at the consumer level after Section 2 deletes the gate UI). It already validates emails via the strict `validate_serious_email` and stores `email`, `is_business_email`, `email_domain`, `is_verified`, `verification_token`, `verified_at`, `subscribed_at`, `ip_address`, `user_agent`, `is_active`, `unsubscribed_at`. Three fields exist solely for the now-gone map-gating flow: `access_count`, `last_access`, `access_attempts_this_hour`, `current_hour_start`.

**Plan: reshape the existing model rather than building a parallel `apps.newsletter` app.**

- Migration `apps/users/migrations/0003_newsletter_locale_source.py`:
  - Add `locale` — `CharField(max_length=5, choices=[("en","English"),("nl","Dutch"),("it","Italian"),("de","German")], default="en")`.
  - Add `source` — `CharField(max_length=20, choices=[("footer","Footer"),("post-end","Post end"),("research-end","Research end"),("contact-form","Contact form"),("other","Other")], default="other")`.
  - Drop `access_count`, `last_access`, `access_attempts_this_hour`, `current_hour_start` (all map-gating-only).
  - Keep `is_verified`, `verification_token`, `verified_at` — re-purposed for forthcoming double-opt-in.
  - Also drop the model's `can_access_map` / `record_map_access` / `get_hourly_remaining` methods if defined on the model.

- `apps/users/models.py` `NewsletterSubscriber` class — update field list to match the migration above. Update the docstring to reflect the new purpose: "Newsletter subscribers (replaces the deprecated map-access-gating use case). `is_verified`/`verification_token` are kept for forthcoming double-opt-in."

- Existing `NewsletterSubscribeView` (`apps/users/views.py:140`) — extend `post()` to:
  - Accept optional `locale` and `source` from `request.data`.
  - On NEW subscriber: persist `locale` and `source` alongside the existing fields.
  - On EXISTING subscriber: leave `locale`/`source` unchanged (preserve original signup context).
  - Return 200 OK regardless of new/existing (the response no longer needs to expose `access_token` since the new consumer doesn't use it; for backwards compatibility with any vestigial caller, keep returning the field but do not add new logic around it).
  - Existing IP / user-agent capture stays.
  - Existing rate-limiting on the view (or DRF default throttling, whichever is in place — `REST_FRAMEWORK` lacks throttle defaults today, so add `AnonRateThrottle: 60/minute` as a global default).

- Existing `VerifyMapAccessView` and `CheckSubscriptionView` — DELETE. Their only consumers were the gate UI in newsletter-gate.jsx (deleted in Section 2) and the Next.js `/api/newsletter/verify/route.js` (deleted below). Remove their URL bindings.

- Existing `apps/users/urls.py` — remove the verify/check route bindings; add a new binding for `ValidateEmailView` (Section 1) at `/api/auth/validate-email/`.

- Django admin (`apps/users/admin.py`) — register `NewsletterSubscriber` if not already registered, with `list_display = ("email", "locale", "source", "is_verified", "is_active", "subscribed_at")`, `list_filter = ("locale", "source", "is_verified", "is_active")`, `search_fields = ("email",)`.

### Frontend proxy routes (revised)

- `frontend/app/api/newsletter/subscribe/route.js` — already exists (proxies to `${DJANGO_API_URL}/api/auth/newsletter/subscribe/`). Edit it to:
  - Honeypot + timestamp checks (parity with contact form).
  - Forward `locale` and `source` from the request body to Django.
  - Always return 200 OK on success or "duplicate" (Django's idempotent path); 400 only for malformed input or `validate_serious_email` failure (which surfaces from Django as 400).
- `frontend/app/api/newsletter/route.js` — DELETE. It duplicates `subscribe/route.js` and was wired to the deprecated `${DJANGO_API_URL}/api/newsletter/subscribe/` path (note: the existing Django URL pattern is `/api/auth/newsletter/subscribe/`, so this duplicate route was probably broken in production anyway).
- `frontend/app/api/newsletter/verify/route.js` — DELETE. Only consumer was the gate UI deleted in Section 2.

Notes:
- `DJANGO_API_URL` is the project-wide convention (visible in `app/api/auth/login/route.js:3` etc.). All new and revised routes use `process.env.DJANGO_API_URL` with a `"http://localhost:8000"` fallback.
- The frontend `<NewsletterSubscribe />` component does NOT consume any access token from the response — it only reads `response.ok`. The Django response shape is therefore free to evolve later without breaking the frontend.

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
6. Section 3 — Newsletter feature (frontend + reshape `apps.users.NewsletterSubscriber`).
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

---

## Discoveries during execution (2026-04-28)

When the implementer set up the baseline build, several pieces of pre-existing infrastructure surfaced that the original review and design missed. These were resolved by user decision (Q1=R, Q2=R3, Q3=D) before any code was dispatched:

**§A — Contact spam check.** The codebase already has `validate_serious_email` in `apps/users/models.py:62` doing comprehensive validation (deliverability, disposable-email-checker, fake-pattern matching). The original Section 1 plan (frontend `disposable-domains.json` + `check-submitter.js`) would have duplicated this. **Decision (Q3=D): expose `validate_serious_email` as `POST /api/auth/validate-email/` and have the contact route call it.** Section 1 above reflects this.

**§B — `newsletter-gate.jsx` was not actually unused.** It exports `NewsletterProvider`, mounted in `providers.jsx`, mounted in `app/layout.tsx:76`. Its consumers (`MapAccessGate`, `useNewsletter`) are however genuinely unused. **Decision: also delete `providers.jsx` and remove the `<Providers>` wrapper from `app/layout.tsx`.** Section 2 above reflects this.

**§C — A `NewsletterSubscriber` model already exists in `apps.users`** with email validation, IP/user-agent capture, verification fields, and active/unsubscribed tracking — built for map-access gating. Three views serve it (`NewsletterSubscribeView`, `VerifyMapAccessView`, `CheckSubscriptionView`); three Next.js proxy routes consume them (`/api/newsletter/`, `/api/newsletter/subscribe/`, `/api/newsletter/verify/`). **Decision (Q1=R, Q2=R3): reshape the existing model rather than building a parallel `apps.newsletter` app — keep `is_verified`/`verification_token`/`verified_at` for forthcoming double-opt-in, drop `access_count`/`last_access`/`access_attempts_this_hour`/`current_hour_start`, add `locale` and `source`. Extend the existing `NewsletterSubscribeView`. Delete `VerifyMapAccessView`, `CheckSubscriptionView`, and the matching Next.js routes (`/api/newsletter/route.js`, `/api/newsletter/verify/route.js`).** Section 3 above reflects this.

**§D — Env var convention.** The codebase consistently uses `DJANGO_API_URL` (visible in `app/api/auth/login/route.js:3`, `app/api/geodata/datasets/route.js:3`, etc.). The original plan referenced `DJANGO_URL` in places. **Decision: standardize on `DJANGO_API_URL`** with a `"http://localhost:8000"` fallback in any new route handler.

**§E — Mixed package manager state.** The repo contained both `pnpm-lock.yaml` and `package-lock.json`, with `node_modules` installed via npm and a stale `next` binary that crashed `pnpm` and `npm run build` until `node_modules` was wiped and reinstalled. No code change needed; just an environment fix. **Going forward, use `npm` for the frontend** to match the lockfile that's actually working.
