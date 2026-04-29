# Personal-website cleanup — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 14 review findings on the personal-website plus add a passive newsletter subscribe form, in one branch off `playful-restyle`.

**Architecture:** Seven semi-independent units of work (Sections A–G) sharing one branch `negatives-cleanup`. Each section is a self-contained commit cluster that can be reviewed independently. Sections A, B, C, D, E, F can run in parallel — they touch disjoint files. Section G (tracking + consent) ships last because it modifies privacy/cookie policy pages that Section F also touches; running G last avoids merge conflicts on those policy pages.

**Tech Stack:** Next.js 16 (app router, `next-intl` i18n) + React 19 + Django 5 / DRF + PostGIS. No frontend test runner installed; Django test runner exists.

**Test strategy:** Frontend has no test runner — verification is manual (build, lint, dev-server walkthrough, devtools checks). Backend gets Django unit tests for the new newsletter app and a small contact-route spam check is verified via curl. This is consistent with the project's existing posture (no tests in `apps/blog`).

---

## Branch setup

- [ ] **Step 0.1: Create the working branch**

```bash
cd /Users/ianronk/Projects/personal-website
git checkout playful-restyle
git pull --ff-only
git checkout -b negatives-cleanup
```

- [ ] **Step 0.2: Confirm clean baseline**

```bash
cd /Users/ianronk/Projects/personal-website/frontend
npm install
npm run build
```

Expected: build succeeds. If it doesn't, fix the baseline before proceeding.

---

# Section A — Contact correctness (Spec §1)

**Files:**
- Modify: `frontend/components/contact-content.jsx` (lines 140, 211, 224)
- Modify: `frontend/components/footer.jsx` (line 38)
- Modify: `frontend/app/api/contact/route.js`
- Create: `frontend/components/obfuscated-email.jsx`
- Create: `backend/apps/users/views.py` (append `ValidateEmailView`) — not a new file but a new class in the existing one
- Modify: `backend/apps/users/urls.py` (route the new validate-email view)

### Task A1: Build the email obfuscation helper

- [ ] **A1.1: Create `frontend/components/obfuscated-email.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";

const USER = "ianronk0";
const DOMAIN = "gmail.com";

function entityEncode(s) {
  return s
    .split("")
    .map((c) => `&#${c.charCodeAt(0)};`)
    .join("");
}

export default function ObfuscatedEmail({ children, className, prefixIcon }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    const encoded = entityEncode(`${USER}@${DOMAIN}`);
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{
          __html: `${prefixIcon ? `${prefixIcon} ` : ""}${encoded}`,
        }}
      />
    );
  }

  const address = `${USER}@${DOMAIN}`;
  return (
    <a href={`mailto:${address}`} className={className}>
      {prefixIcon ? `${prefixIcon} ` : ""}
      {children ?? address}
    </a>
  );
}
```

Notes for the engineer: the SSR output is HTML-entity-encoded (no `mailto:`, no readable `@`), then on hydration JS replaces it with a real anchor + `mailto:`. JS-disabled visitors see the encoded email rendered as text by the browser (which renders entities into glyphs) but get no `mailto:` link — they can still copy the text.

- [ ] **A1.2: Use it in `contact-content.jsx` line ~140**

Find the existing line:

```jsx
<a href="mailto:ian@example.com">✉ ian@example.com</a>
```

Replace with:

```jsx
<ObfuscatedEmail prefixIcon="✉" />
```

Add the import at the top of the file:

```jsx
import ObfuscatedEmail from "./obfuscated-email";
```

- [ ] **A1.3: Use it in `contact-content.jsx` line ~224**

Find:

```jsx
<a href="mailto:ian@example.com">ian@example.com</a>
```

Replace with:

```jsx
<ObfuscatedEmail />
```

- [ ] **A1.4: Use it in `footer.jsx` line ~38**

Find the email link in the footer (mailto:ian@example.com) and replace it with `<ObfuscatedEmail />` plus matching styles. Add the import.

- [ ] **A1.5: Manual verification**

```bash
cd /Users/ianronk/Projects/personal-website/frontend
npm run dev
```

In a browser:
- View page source on `/en/contact`. Confirm no `ian@example.com` appears anywhere; the address shows as `&#105;&#97;...` entity-encoded.
- Inspect element on the visible address; confirm after JS has run the rendered `<a>` tag has `href="mailto:ianronk0@gmail.com"`.
- Click the address — your default mail client opens with `ianronk0@gmail.com` in To.

- [ ] **A1.6: Commit**

```bash
git add frontend/components/obfuscated-email.jsx frontend/components/contact-content.jsx frontend/components/footer.jsx
git commit -m "Contact: replace placeholder email with obfuscated ianronk0@gmail.com"
```

### Task A2: Link privacy line to policy

- [ ] **A2.1: Modify `contact-content.jsx` line ~211**

Find:

```jsx
<p className="privacy">{t("privacy")}</p>
```

Replace with:

```jsx
<p className="privacy">
  <Link href={`/${locale}/privacy-policy`}>{t("privacy")}</Link>
</p>
```

If `Link` and `locale` aren't already imported/destructured at the top of the file, add them. The component should already have access to `locale` from `next-intl`'s `useLocale()` or via a prop — check the existing imports and reuse the same source other links in this file use.

- [ ] **A2.2: Manual verification**

In dev, navigate to `/en/contact`, scroll to the privacy line, click — should land on `/en/privacy-policy`. Repeat for `/nl/contact` to confirm locale interpolation.

- [ ] **A2.3: Commit**

```bash
git add frontend/components/contact-content.jsx
git commit -m "Contact: link privacy line to /privacy-policy"
```

### Task A3: Reuse Django `validate_serious_email` for contact spam check

The codebase has `validate_serious_email` in `backend/apps/users/models.py:62` doing strict validation (email-validator deliverability, disposable-email-checker, fake-pattern matching, digit-density check). We expose it as a new endpoint and call it from the contact route.

- [ ] **A3.1: Add Django view `ValidateEmailView`**

Open `backend/apps/users/views.py`. After the existing imports, ensure `ValidationError` is imported:

```python
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NewsletterSubscriber, validate_serious_email
```

(Adjust if the existing `from .models import …` line already has these names.)

Append a new view to the file:

```python
class ValidateEmailView(APIView):
    """Public stateless email-quality check. No persistence side-effect.

    Accepts {"email": "..."}. Returns 200 {"valid": true} on pass,
    400 {"valid": false, "reason": "..."} on fail.
    Used by the Next.js contact route to silently drop spam submissions.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").lower().strip()
        try:
            validate_serious_email(email)
            return Response({"valid": True})
        except ValidationError as e:
            return Response(
                {"valid": False, "reason": getattr(e, "message", str(e))},
                status=status.HTTP_400_BAD_REQUEST,
            )
```

- [ ] **A3.2: Wire the URL**

Open `backend/apps/users/urls.py` and add (alongside whatever already routes `/newsletter/...` and `/login/`):

```python
from .views import ValidateEmailView

urlpatterns = [
    # ... existing
    path("validate-email/", ValidateEmailView.as_view(), name="validate_email"),
]
```

The users app is mounted at `/api/auth/`, so the full path is `/api/auth/validate-email/`.

- [ ] **A3.3: Modify `frontend/app/api/contact/route.js`**

In the POST handler, after the email format validation and before the captcha verification or mail-sending step, add:

```js
const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";

// inside POST(...), after basic email format validation:
try {
  const validateRes = await fetch(`${DJANGO_API_URL}/api/auth/validate-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    // 3-second timeout — if Django is unreachable, fall through and let mail proceed
    signal: AbortSignal.timeout(3000),
  });
  if (validateRes.status === 400) {
    // Spam — silently 200 OK to the bot
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  // Any other non-OK status (5xx, network) is treated as "Django unavailable" — don't block legit users
} catch {
  // Network error / timeout — same: don't block legit users on infra failure
}
```

Place this block *after* the existing email regex check but *before* the captcha verification.

- [ ] **A3.4: Manual verification with curl**

Start backend:

```bash
cd /Users/ianronk/Projects/personal-website/backend
python manage.py runserver
```

In another terminal:

```bash
# Direct hit on the validator endpoint
curl -X POST http://localhost:8000/api/auth/validate-email/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mailinator.com"}'
# Expected: {"valid": false, "reason": "..."}

curl -X POST http://localhost:8000/api/auth/validate-email/ \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}'
# Expected: {"valid": true}
```

Then start frontend:

```bash
cd /Users/ianronk/Projects/personal-website/frontend
npm run dev
```

```bash
# Through the contact route — should silently 200, no mail sent
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@mailinator.com","subject":"hi","message":"This is a long enough message to pass the length check, more than ten chars."}'

# Should proceed (may fail captcha — that's fine; what we want is to confirm it got past the validator)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"alice@example.com","subject":"hi","message":"This is a long enough message to pass the length check, more than ten chars."}'
```

- [ ] **A3.5: Commit**

```bash
git add backend/apps/users/views.py backend/apps/users/urls.py frontend/app/api/contact/route.js
git commit -m "Contact: validate submitter email via Django validate_serious_email; silently drop spam"
```

---

# Section B — Dead code removal (Spec §2)

**Files:**
- Delete: `frontend/components/email-gate.jsx`
- Delete: `frontend/components/newsletter-gate.jsx` (the only live consumer is `providers.jsx`, also deleted below)
- Delete: `frontend/components/newsletter-popup.jsx`
- Delete: `frontend/components/project-abm-thesis.jsx`
- Delete: `frontend/components/project-languagebuddy.jsx`
- Delete: `frontend/components/work-content.jsx`
- Delete: `frontend/components/work-teaser.jsx`
- Delete: `frontend/components/providers.jsx` (its only purpose was wrapping the app in `<NewsletterProvider>`)
- Modify: `frontend/app/layout.tsx` — remove the `Providers` import (line 5) and unwrap the `<Providers>...</Providers>` block (lines 76–78)
- Delete: `ianronk.jpeg`, `ianronk2.jpeg` (project root)

### Task B1: Verify nothing else imports the dead files

- [ ] **B1.1: Grep for imports of each file**

```bash
cd /Users/ianronk/Projects/personal-website
for f in email-gate newsletter-gate newsletter-popup project-abm-thesis project-languagebuddy work-content work-teaser providers; do
  echo "=== $f ==="
  grep -rn "$f" frontend/app frontend/components | grep -v "$f.jsx" | grep -v "$f.tsx"
done
```

Expected matches:
- `newsletter-gate` → `providers.jsx` (gone after this section)
- `providers` → `app/layout.tsx:5` and `app/layout.tsx:76,78` (handled in B3 below)
- everything else: no matches

If anything else surfaces, STOP and report — those usages need to be excised first or the file isn't actually dead.

- [ ] **B1.2: Verify root images aren't referenced**

```bash
grep -rn "ianronk\.jpeg\|ianronk2\.jpeg" frontend backend
```

Expected: no matches.

### Task B2: Delete the files

- [ ] **B2.1: Delete the components**

```bash
cd /Users/ianronk/Projects/personal-website
git rm frontend/components/email-gate.jsx \
       frontend/components/newsletter-gate.jsx \
       frontend/components/newsletter-popup.jsx \
       frontend/components/project-abm-thesis.jsx \
       frontend/components/project-languagebuddy.jsx \
       frontend/components/work-content.jsx \
       frontend/components/work-teaser.jsx \
       frontend/components/providers.jsx
```

- [ ] **B2.2: Delete the root images**

```bash
git rm ianronk.jpeg ianronk2.jpeg
```

### Task B3: Unwrap `<Providers>` in `app/layout.tsx`

- [ ] **B3.1: Remove the import**

In `frontend/app/layout.tsx`, delete line 5:

```tsx
import { Providers } from '@/components/providers'
```

- [ ] **B3.2: Unwrap the JSX**

Around lines 76–78, replace:

```tsx
        <Providers>
          {children}
        </Providers>
```

with:

```tsx
        {children}
```

(Keep the surrounding `<body>` / `<html>` / other wrappers untouched.)

- [ ] **B3.3: Build to confirm no orphan imports**

```bash
cd /Users/ianronk/Projects/personal-website/frontend
npm run build
```

Expected: build succeeds. If a missing-module error surfaces, the grep in B1.1 missed something — find and fix.

- [ ] **B3.4: Smoke-test the dev server**

```bash
npm run dev
```

In a browser visit `/en` and `/en/contact`. Confirm no runtime crashes (the deleted `NewsletterProvider` wrapped the app, so any orphan `useNewsletter()` call would surface as "must be used within NewsletterProvider"). Check the browser console for errors.

- [ ] **B3.5: Commit**

```bash
git add -A
git commit -m "Cleanup: remove unused gate/popup/project/work components, providers wrapper, and orphan root images"
```

---

# Section C — UX & a11y (Spec §5)

**Files:**
- Modify: `frontend/components/navigation.jsx` (mobile menu auto-close, focus-visible)
- Modify: `frontend/components/research-list.jsx` (search input label)
- Modify: `frontend/components/skills-grid.jsx` (aria-hidden on decorative SVGs)
- Modify: `frontend/components/projects-gallery.jsx` (aria-hidden + titles)
- Modify: `frontend/components/hero-section.jsx` (aria-hidden on decorative SVG)
- Modify: `frontend/components/about-content.jsx`, `about-teaser.jsx` (Image sizes)
- Modify: `frontend/app/globals.css` (`.focus-ring` utility)

### Task C1: Mobile menu auto-close

- [ ] **C1.1: Modify `navigation.jsx` lines 188–240**

The current overlay renders nav links inside the `isMobileMenuOpen` block. Each `<Link>` needs an `onClick={() => setIsMobileMenuOpen(false)}`.

Find the link rendering (around lines 201–217) and add the onClick:

```jsx
<Link
  href={...}
  onClick={() => setIsMobileMenuOpen(false)}
  // ... existing props
>
  ...
</Link>
```

If multiple `<Link>` components are rendered in a `.map()`, attach the same onClick to each.

- [ ] **C1.2: Manual verification**

In dev on mobile-emulator viewport (Chrome devtools, iPhone preset):
1. Open hamburger menu
2. Tap "About" — page navigates AND overlay closes
3. Open hamburger again on the new page — works
4. Tap outside the overlay — still closes (existing behavior preserved)

- [ ] **C1.3: Commit**

```bash
git add frontend/components/navigation.jsx
git commit -m "Navigation: auto-close mobile menu on link tap"
```

### Task C2: Focus-visible utility

- [ ] **C2.1: Add `.focus-ring` to `frontend/app/globals.css`**

Append at the end of the file:

```css
.focus-ring:focus-visible {
  outline: 2px solid #FFD60A;
  outline-offset: 2px;
}
```

- [ ] **C2.2: Apply `.focus-ring` to inline-styled buttons**

In `navigation.jsx` around lines 97–108 (and any other inline-styled `<button>` or `<a>` in the file), add `className="focus-ring"` (merge with any existing className if present).

Other places to apply: any `<button>` rendered with inline `style={{...}}` and no Tailwind class. Grep:

```bash
grep -rn 'style={{' frontend/components | grep -i 'button\|<a '
```

Apply `.focus-ring` to the interactive ones the grep surfaces.

- [ ] **C2.3: Manual verification**

In dev, tab through the navigation with the keyboard. Each focusable element should show a yellow outline. Click somewhere (mouse activates `:focus` but not `:focus-visible`); the outline should NOT show on click — that's the point of `:focus-visible`.

- [ ] **C2.4: Commit**

```bash
git add frontend/app/globals.css frontend/components/navigation.jsx
git commit -m "A11y: add focus-visible outline utility on inline-styled buttons"
```

### Task C3: Research search input label

- [ ] **C3.1: Modify `research-list.jsx` lines 98–117**

Wrap the `<input type="search">` in a `<label>`. Replace the existing input block with:

```jsx
<div role="search" style={{ flex: "1 1 260px" }}>
  <label htmlFor="research-search" className="sr-only">
    {t("searchPlaceholder")}
  </label>
  <input
    id="research-search"
    type="search"
    placeholder={t("searchPlaceholder")}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    style={{
      width: "100%",
      background: "transparent",
      border: 0,
      borderBottom: "1px solid var(--ink)",
      padding: "10px 0",
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      letterSpacing: "0.04em",
      outline: "none",
      color: "var(--ink)",
    }}
    className="focus-ring"
  />
</div>
```

- [ ] **C3.2: Add `.sr-only` utility to `globals.css` if it doesn't already exist**

Check first:

```bash
grep -n "sr-only" /Users/ianronk/Projects/personal-website/frontend/app/globals.css
```

If absent, append:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **C3.3: Manual verification with screen reader**

If macOS, enable VoiceOver (Cmd+F5) and navigate to `/en/research`. Tab into the search field; VoiceOver should announce "Search research, search field" (or your locale's equivalent), not just "search field" or empty.

- [ ] **C3.4: Commit**

```bash
git add frontend/components/research-list.jsx frontend/app/globals.css
git commit -m "A11y: add accessible label and role=search to research filter input"
```

### Task C4: Decorative SVG aria-hidden

- [ ] **C4.1: Audit `hero-section.jsx`**

The Europe map SVG is decorative (it's atmospheric, not conveying specific information that text doesn't already convey). Find the `<svg>` opening tag in the hero around lines 202–268 and add `aria-hidden="true"` and `focusable="false"` if not already present:

```jsx
<svg viewBox="0 0 800 480" aria-hidden="true" focusable="false" ...>
```

- [ ] **C4.2: Audit `skills-grid.jsx`**

Each of the small infographic SVGs (line chart, DAG, hex heat map, etc.) is decorative — the text labels next to them already convey the meaning. Add `aria-hidden="true"` and `focusable="false"` to each `<svg>` in the file.

- [ ] **C4.3: Audit `projects-gallery.jsx`**

The project preview SVGs (`VizIntake`, `VizABM`, `VizPipeline` — lines 8–123) are *informational* — they're the visual case-study preview. Don't aria-hide them; instead add a `<title>` element as the first child:

```jsx
function VizIntake() {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-labelledby="viz-intake-title" style={{ width: "100%", height: "100%" }}>
      <title id="viz-intake-title">Intake flow diagram showing data sources funneling into a pipeline</title>
      {/* existing content */}
    </svg>
  );
}
```

Repeat for `VizABM` (e.g., "Account-based marketing grid showing target accounts and their engagement scores") and `VizPipeline` ("Sales pipeline stages with conversion arrows").

The `id` on the `<title>` must be unique per SVG instance — if these components render multiple times on the page, suffix with a React `useId()` or hard-code unique IDs.

- [ ] **C4.4: Manual verification**

With VoiceOver on, navigate to homepage. The hero map should NOT be announced. Navigate to the projects gallery — each project tile's SVG should announce its title text.

- [ ] **C4.5: Commit**

```bash
git add frontend/components/hero-section.jsx frontend/components/skills-grid.jsx frontend/components/projects-gallery.jsx
git commit -m "A11y: hide decorative SVGs, label informational ones"
```

### Task C5: next/image sizes audit

- [ ] **C5.1: Modify `about-content.jsx` line 39**

Change:

```jsx
<Image src="/profile.jpg" alt="Ian Ronk" width={600} height={800} priority />
```

To (assuming the portrait takes ~half the viewport on desktop and full on mobile):

```jsx
<Image
  src="/profile.jpg"
  alt="Ian Ronk"
  width={600}
  height={800}
  priority
  sizes="(max-width: 768px) 100vw, 600px"
/>
```

- [ ] **C5.2: Modify `about-teaser.jsx` line 42**

```jsx
<Image
  src="/profile.jpg"
  alt="Ian Ronk"
  width={600}
  height={800}
  priority={false}
  sizes="(max-width: 768px) 100vw, 600px"
/>
```

- [ ] **C5.3: Audit other usages**

```bash
grep -rn '<Image' frontend/components frontend/app | grep -v sizes
```

For each match without a `sizes` prop, decide:
- Fixed-size hero images: leave as-is (the explicit `width`/`height` is enough).
- Responsive images: add `sizes` matching the actual layout.

`projects-gallery.jsx` line 172–179 already has `sizes="(max-width: 800px) 100vw, 33vw"` — leave it.

- [ ] **C5.4: Manual verification**

Run `npm run build`; observe the `Generated...` output for image optimization warnings — the "image with `fill` but no `sizes`" warning should be gone.

- [ ] **C5.5: Commit**

```bash
git add frontend/components/about-content.jsx frontend/components/about-teaser.jsx
git commit -m "Perf: add explicit sizes to responsive next/image usages"
```

### Task C6: Axe-devtools sweep

- [ ] **C6.1: Install axe DevTools browser extension**

(This is a one-time browser setup, not a code step.) Install axe DevTools for Chrome/Firefox if not already installed.

- [ ] **C6.2: Run axe on every public page**

Pages to scan:
- `/en` (home)
- `/en/about`
- `/en/contact`
- `/en/thoughts`
- `/en/research`
- One `/en/thoughts/<slug>` post (pick the most recent)
- One `/en/research/<slug>` article

For each page, click "Scan ALL of my page" in the axe panel. Record every Serious or Critical issue.

- [ ] **C6.3: Fix findings**

Common categories to expect:
- Heading hierarchy (e.g., `h2` followed by `h4` with no `h3`) — fix the heading levels.
- Color contrast on muted text — bump `var(--mute)` if it's used as foreground anywhere (it's `#8A8676` which is ~3.4:1 on `#F6F4EE` — borderline AA).
- Missing `lang` attribute on quoted foreign text — wrap `<span lang="nl">...</span>` etc.
- Form errors — already handled by Section A's label fix and contact form.

For each fix, note the file + line in the commit message.

- [ ] **C6.4: Commit per batch**

If ≤ 5 fixes total, one commit:

```bash
git add -A
git commit -m "A11y: fix axe-devtools findings (<list of files>)"
```

If > 5, split logically (e.g., one commit for heading hierarchy, one for contrast, one for lang attributes).

If a single nontrivial item surfaces (e.g., the projects gallery needs a structural rework), STOP and surface it — don't silently expand scope.

---

# Section D — SEO: OG images + locale-correct JSON-LD (Spec §4)

**Files:**
- Create: `frontend/public/og.png` (generated artifact)
- Create: `scripts/generate-og.html`
- Create: `scripts/generate-og.js`
- Create: `frontend/lib/og/post-template.tsx`
- Create: `frontend/app/[locale]/thoughts/[slug]/opengraph-image.tsx`
- Create: `frontend/app/[locale]/research/[slug]/opengraph-image.tsx`
- Modify: `frontend/components/json-ld.jsx`
- Modify: `frontend/app/[locale]/research/[slug]/page.jsx`
- Modify: `frontend/app/[locale]/thoughts/[slug]/page.jsx`
- Modify: `frontend/app/layout.tsx`
- Modify per-locale layout files / page metadata blocks for openGraph.url + alternates.languages

### Task D1: Static OG image

- [ ] **D1.1: Create `scripts/generate-og.html`**

Project root has no `scripts/` directory yet — create one.

```bash
mkdir -p /Users/ianronk/Projects/personal-website/scripts
```

Create `scripts/generate-og.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=JetBrains+Mono&display=swap');
    body { margin: 0; }
    .og {
      width: 1200px;
      height: 630px;
      background: #F6F4EE;
      display: flex;
      align-items: stretch;
      font-family: 'Instrument Serif', serif;
      color: #111110;
      position: relative;
      overflow: hidden;
    }
    .accent {
      width: 24px;
      background: #FFD60A;
    }
    .left {
      flex: 0 0 420px;
      background-image: url('../frontend/public/profile.jpg');
      background-size: cover;
      background-position: center;
    }
    .right {
      flex: 1;
      padding: 80px 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 32px;
    }
    .kicker {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #8A8676;
    }
    .title {
      font-size: 88px;
      line-height: 1.05;
      font-weight: 400;
    }
    .title em { font-style: italic; }
    .footer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      letter-spacing: 0.08em;
      color: #8A8676;
    }
  </style>
</head>
<body>
  <div class="og">
    <div class="accent"></div>
    <div class="left"></div>
    <div class="right">
      <div class="kicker">Ian Ronk · Amsterdam</div>
      <div class="title">Geospatial · ML · <em>AI</em></div>
      <div class="footer">ianronk.com</div>
    </div>
  </div>
</body>
</html>
```

- [ ] **D1.2: Create `scripts/generate-og.js`**

```js
import puppeteer from "puppeteer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto(`file://${path.join(__dirname, "generate-og.html")}`, { waitUntil: "networkidle0" });
await page.screenshot({
  path: path.join(__dirname, "..", "frontend", "public", "og.png"),
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
console.log("Generated frontend/public/og.png");
```

- [ ] **D1.3: Run the generator**

Puppeteer is in `frontend/devDependencies`. Run from the frontend directory:

```bash
cd /Users/ianronk/Projects/personal-website/frontend
node ../scripts/generate-og.js
```

Expected output: `Generated frontend/public/og.png`. Verify the file exists and inspect it visually:

```bash
open /Users/ianronk/Projects/personal-website/frontend/public/og.png
```

If the layout looks wrong (missing portrait, wrong fonts), iterate on the HTML template.

**STOP HERE for user approval** of the rendered image before committing.

- [ ] **D1.4: Wire the static OG into `app/layout.tsx` metadata**

Find the `metadata` block (lines 14–66). Add or update `openGraph.images` and `twitter.images`:

```tsx
openGraph: {
  // ... existing fields
  images: [
    {
      url: "/og.png",
      width: 1200,
      height: 630,
      alt: "Ian Ronk — Geospatial · ML · AI",
    },
  ],
},
twitter: {
  // ... existing fields
  images: ["/og.png"],
},
```

- [ ] **D1.5: Manual verification**

```bash
npm run dev
```

Visit `/` then view source. Confirm `<meta property="og:image" content="https://.../og.png">` appears.

Test the share preview using a tool like https://www.opengraph.xyz/ on `http://localhost:3000/en` (with ngrok if needed) or simply paste the URL into LinkedIn's Post Inspector after deployment.

- [ ] **D1.6: Commit**

```bash
git add scripts/generate-og.html scripts/generate-og.js frontend/public/og.png frontend/app/layout.tsx
git commit -m "SEO: generate and wire static OG image"
```

### Task D2: Dynamic OG for posts (shared template)

- [ ] **D2.1: Create `frontend/lib/og/post-template.tsx`**

```tsx
import { ImageResponse } from "next/og";

interface OgPostProps {
  title: string;
  category?: string;
  date?: string;
}

export function renderPostOg({ title, category, date }: OgPostProps) {
  // Auto-size title: 96 for short, 56 for long
  const fontSize = title.length < 40 ? 96 : title.length < 80 ? 72 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#F6F4EE",
          color: "#111110",
          display: "flex",
          fontFamily: "serif",
        }}
      >
        <div style={{ width: 24, background: "#FFD60A" }} />
        <div
          style={{
            flex: 1,
            padding: "80px 64px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8A8676",
              fontFamily: "monospace",
            }}
          >
            {category ?? "Post"}{date ? ` · ${date}` : ""}
          </div>
          <div style={{ fontSize, lineHeight: 1.05 }}>{title}</div>
          <div
            style={{
              fontSize: 16,
              letterSpacing: "0.08em",
              color: "#8A8676",
              fontFamily: "monospace",
            }}
          >
            ianronk.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

- [ ] **D2.2: Create `frontend/app/[locale]/thoughts/[slug]/opengraph-image.tsx`**

```tsx
import { renderPostOg } from "@/lib/og/post-template";

export const runtime = "edge";
export const alt = "Post on ianronk.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const djangoUrl = process.env.DJANGO_API_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${djangoUrl}/api/blog/${slug}/`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("not ok");
    const post = await res.json();

    const t = post.translations?.find((x: any) => x.language === locale);
    const title = t?.title ?? post.title;
    const category = post.category ?? "Thoughts";
    const date = post.date ?? "";

    return renderPostOg({ title, category, date });
  } catch {
    return renderPostOg({ title: "New post on ianronk.com", category: "Thoughts" });
  }
}
```

- [ ] **D2.3: Create `frontend/app/[locale]/research/[slug]/opengraph-image.tsx`**

Mirror D2.2 but fetch from `/api/research/${slug}/` and use category "Research":

```tsx
import { renderPostOg } from "@/lib/og/post-template";

export const runtime = "edge";
export const alt = "Research on ianronk.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const djangoUrl = process.env.DJANGO_API_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${djangoUrl}/api/research/${slug}/`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("not ok");
    const article = await res.json();

    const t = article.translations?.find((x: any) => x.language === locale);
    const title = t?.title ?? article.title;
    const date = article.date ?? "";

    return renderPostOg({ title, category: "Research", date });
  } catch {
    return renderPostOg({ title: "New research on ianronk.com", category: "Research" });
  }
}
```

- [ ] **D2.4: Manual verification**

```bash
npm run dev
# In browser
open http://localhost:3000/en/research/<some-real-slug>/opengraph-image
```

The browser shows the rendered image. Confirm: yellow accent on left, paper bg, post title in serif, "RESEARCH · <date>" kicker.

Repeat for `/en/thoughts/<some-real-slug>/opengraph-image`.

- [ ] **D2.5: Commit**

```bash
git add frontend/lib/og/post-template.tsx frontend/app/[locale]/thoughts/[slug]/opengraph-image.tsx frontend/app/[locale]/research/[slug]/opengraph-image.tsx
git commit -m "SEO: dynamic OG images for thoughts and research posts"
```

### Task D3: Locale-correct JSON-LD

- [ ] **D3.1: Modify `frontend/components/json-ld.jsx` ArticleJsonLd**

Replace the existing `ArticleJsonLd` (around lines 73–112) to accept `locale` and any-locale `availableLocales`:

```jsx
export function ArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  image,
  locale = "en",
  availableLocales = ["en"],
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ianronk.com";
  const url = `${siteUrl}/${locale}/research/${slug}`;

  const sameAs = availableLocales
    .filter((l) => l !== locale)
    .map((l) => `${siteUrl}/${l}/research/${slug}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    publisher: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/${locale}` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **D3.2: Add `BlogPostingJsonLd` to the same file**

Append after `ArticleJsonLd`:

```jsx
export function BlogPostingJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  image,
  locale = "en",
  availableLocales = ["en"],
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ianronk.com";
  const url = `${siteUrl}/${locale}/thoughts/${slug}`;

  const sameAs = availableLocales
    .filter((l) => l !== locale)
    .map((l) => `${siteUrl}/${l}/thoughts/${slug}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    publisher: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    inLanguage: locale,
    isPartOf: { "@type": "Blog", "@id": `${siteUrl}/${locale}/thoughts` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **D3.3: Update `WebSiteJsonLd` to include all 4 locales**

Find `WebSiteJsonLd` (lines 48–71). Update its `inLanguage` array:

```jsx
inLanguage: ["en", "nl", "it", "de"],
```

- [ ] **D3.4: Pass `locale` to ArticleJsonLd in research detail page**

`frontend/app/[locale]/research/[slug]/page.jsx` already has `locale` from params and uses ArticleJsonLd somewhere (check `research-article-detail.jsx` if not in the page itself). Pass `locale` through.

For `availableLocales`: the research API response should include a `translations` array. Compute:

```jsx
const availableLocales = ["en", ...(article.translations ?? []).map((t) => t.language)];
```

Pass `availableLocales={availableLocales}` to `ArticleJsonLd`.

- [ ] **D3.5: Wire `BlogPostingJsonLd` into thoughts detail page**

In `frontend/app/[locale]/thoughts/[slug]/page.jsx` (or its render component `blog-post.jsx`), import and render `BlogPostingJsonLd` with `locale` and `availableLocales` (computed the same way from the blog API response).

- [ ] **D3.6: Manual verification**

```bash
npm run dev
# View source of /en/research/<slug>
```

Find the `<script type="application/ld+json">` block. Confirm:
- `url` is `https://ianronk.com/en/research/<slug>` (uses correct locale)
- `inLanguage` is `"en"`
- `sameAs` lists `nl`/`it`/`de` URLs IF the article has those translations

Repeat for `/nl/research/<slug>` (if a translated article exists) and `/en/thoughts/<slug>`.

- [ ] **D3.7: Commit**

```bash
git add frontend/components/json-ld.jsx frontend/app/[locale]/research/[slug]/page.jsx frontend/app/[locale]/thoughts/[slug]/page.jsx frontend/components/blog-post.jsx frontend/components/research-article-detail.jsx
git commit -m "SEO: locale-correct JSON-LD with sameAs cross-language URLs + BlogPosting schema"
```

(Adjust `git add` based on which files you actually touched.)

### Task D4: Per-page metadata audit

- [ ] **D4.1: Audit each route's metadata**

For each of `/about`, `/contact`, `/research`, `/thoughts`:

In `app/[locale]/<route>/page.jsx`, the `generateMetadata` (or static `metadata` export) should include:

```tsx
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ianronk.com";
  return {
    title: "...",
    description: "...",
    openGraph: {
      url: `${siteUrl}/${locale}/<route>`,
      // images inherit from layout
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/<route>`,
      languages: {
        en: `${siteUrl}/en/<route>`,
        nl: `${siteUrl}/nl/<route>`,
        it: `${siteUrl}/it/<route>`,
        de: `${siteUrl}/de/<route>`,
      },
    },
  };
}
```

If a page already has metadata, augment with the missing pieces. Don't blow away existing fields.

- [ ] **D4.2: Update `research/[slug]/page.jsx` alternates**

The existing alternates only list en/nl/it. Add `de`.

- [ ] **D4.3: Update `sitemap.ts`**

The current sitemap (lines 7–58) is missing `/`, `/about`. Add them. Also confirm it covers all 4 locales.

```ts
const staticPages = [
  { path: "", priority: 1.0 },
  { path: "/about", priority: 0.9 },
  { path: "/research", priority: 0.9 },
  { path: "/thoughts", priority: 0.8 },
  { path: "/contact", priority: 0.8 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms-of-service", priority: 0.3 },
  { path: "/cookie-policy", priority: 0.3 },
];

const LOCALES = ["en", "nl", "it", "de"];

const staticEntries = staticPages.flatMap(({ path, priority }) =>
  LOCALES.map((locale) => ({
    url: `${siteUrl}/${locale}${path}`,
    lastModified: new Date(),
    priority,
  })),
);
```

(Adapt to the existing structure of the file — don't blow it away, just extend the static-pages list.)

- [ ] **D4.4: Manual verification**

```bash
npm run dev
curl -s http://localhost:3000/sitemap.xml | head -100
```

Confirm `/about` URLs appear for all 4 locales.

In a browser, view source on `/en/about` and confirm:
- `<link rel="alternate" hreflang="de" href="https://ianronk.com/de/about" />` (and similarly for other locales) is present.
- `<meta property="og:url" content="https://ianronk.com/en/about" />` is present.

- [ ] **D4.5: Commit**

```bash
git add frontend/app/[locale]/about/page.jsx frontend/app/[locale]/contact/page.jsx frontend/app/[locale]/research/page.jsx frontend/app/[locale]/thoughts/page.jsx frontend/app/[locale]/research/[slug]/page.jsx frontend/app/sitemap.ts
git commit -m "SEO: per-page metadata audit — openGraph.url, alternates.languages (incl. de), sitemap completeness"
```

---

# Section E — Server-side data fetching (Spec §6)

**Files:**
- Modify: `frontend/components/writing-teaser.jsx`
- Modify: `frontend/components/research-preview.jsx`
- Possibly modify: `frontend/components/research-list.jsx` (initial-list-as-prop pattern)
- Possibly modify: `frontend/components/blog-list.jsx` (same)
- Possibly modify: callers of these components if they're rendered in client trees

### Task E1: Convert `writing-teaser.jsx` to server component

- [ ] **E1.1: Rewrite the file**

Replace the current contents (which include `"use client"`, `useState`, `useEffect`, `DEFAULT_POSTS`) with:

```jsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";

async function fetchPosts() {
  const djangoUrl = process.env.DJANGO_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${djangoUrl}/api/blog/?status=published&page_size=3`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error("writing-teaser fetch failed:", res.status);
      return null;
    }
    const data = await res.json();
    return data.results ?? data;
  } catch (err) {
    console.error("writing-teaser fetch error:", err);
    return null;
  }
}

export default async function WritingTeaser({ locale }) {
  const t = await getTranslations({ locale, namespace: "Thoughts" });
  const posts = await fetchPosts();

  if (!posts) {
    return (
      <section className="writing-teaser">
        <p>{t("loadingFallback") /* "Posts loading — check back shortly" */}</p>
      </section>
    );
  }

  return (
    <section className="writing-teaser">
      {/* Preserve the EXACT rendering block currently at writing-teaser.jsx
          lines ~88–102: the section header, the "View all" link, and the
          .map(post => …) producing each card. Read the current file before
          starting; copy that JSX block here unchanged, replacing the
          variable name `displayPosts` (or whatever local) with `posts`.
          Do NOT redesign the markup — this task is a fetch refactor only. */}
    </section>
  );
}
```

**Important:** open `frontend/components/writing-teaser.jsx` before starting, copy the JSX rendering block (the `<section>` and inner card-mapping), and paste it where the comment block above is. The job here is purely to swap `useEffect` + state for a server-side `await fetch` — the visual output should be byte-identical.

- [ ] **E1.2: Update callers**

Wherever `<WritingTeaser />` was rendered (likely homepage `app/[locale]/page.jsx`), it now needs `locale` as a prop:

```jsx
const { locale } = await params;
// ...
<WritingTeaser locale={locale} />
```

If the parent is a client component, it must become a server component (most likely already is, since the homepage is a server route).

- [ ] **E1.3: Add `loadingFallback` translation key**

Add to `messages/{en,nl,it,de}.json` under the existing `Thoughts` namespace:

```json
"Thoughts": {
  // ... existing
  "loadingFallback": "Posts loading — check back shortly"
}
```

Translate appropriately for each locale.

- [ ] **E1.4: Manual verification**

```bash
npm run dev
```

Disable network to Django (e.g., temporarily stop the docker-compose backend or block `localhost:8000` in dev tools):
- The teaser should show the fallback text instead of crashing.

Re-enable Django:
- The teaser should show real posts immediately on first paint (view source — confirm post titles are present in the HTML, NOT hydrated in after).

- [ ] **E1.5: Commit**

```bash
git add frontend/components/writing-teaser.jsx frontend/app/[locale]/page.jsx frontend/messages/en.json frontend/messages/nl.json frontend/messages/it.json frontend/messages/de.json
git commit -m "Perf: server-render writing teaser, drop DEFAULT_POSTS fallback"
```

### Task E2: Convert `research-preview.jsx` to server component

- [ ] **E2.1: Rewrite same way as E1**

Mirror the structure from E1: drop `"use client"`, replace `useState`/`useEffect` with an async `fetchArticles()` helper, accept `locale` as a prop, drop `DEFAULT_ITEMS`. Fetch from `/api/research/?status=published&page_size=4`. Preserve the exact JSX rendering block currently at `research-preview.jsx` lines ~83–96 (the numbered list with arrow markers) — only the data-source plumbing changes.

Add a `loadingFallback` key to the `Research` namespace in `messages/{en,nl,it,de}.json`:

```json
"Research": {
  // ... existing keys
  "loadingFallback": "Articles loading — check back shortly"
}
```

- [ ] **E2.2: Update callers + verification**

Same pattern as E1.

- [ ] **E2.3: Commit**

```bash
git add frontend/components/research-preview.jsx frontend/app/[locale]/page.jsx frontend/messages/*.json
git commit -m "Perf: server-render research preview, drop DEFAULT_ITEMS fallback"
```

### Task E3: Server-render the listing pages with client-only filter

- [ ] **E3.1: Audit `research-list.jsx`**

If it's a client component fetching data, split:

- New parent `frontend/app/[locale]/research/page.jsx` becomes async server component, fetches the full list.
- `research-list.jsx` keeps `"use client"` but accepts `initialPosts` as a prop instead of fetching internally. Filtering UX stays.

```jsx
// frontend/app/[locale]/research/page.jsx (server)
async function fetchAllResearch(locale) {
  const djangoUrl = process.env.DJANGO_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${djangoUrl}/api/research/?status=published&page_size=100`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? data;
}

export default async function ResearchPage({ params }) {
  const { locale } = await params;
  const posts = await fetchAllResearch(locale);
  return <ResearchList initialPosts={posts} locale={locale} />;
}
```

```jsx
// frontend/components/research-list.jsx
"use client";
import { useState } from "react";

export default function ResearchList({ initialPosts, locale }) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = initialPosts.filter(/* existing filter logic */);
  // ... render
}
```

- [ ] **E3.2: Same treatment for `blog-list.jsx` if applicable**

If `blog-list.jsx` also fetches client-side, mirror E3.1. Otherwise skip.

- [ ] **E3.3: Manual verification**

```bash
npm run build
npm run start
```

In a real browser (production-mode, not dev), view source on `/en/research`. Confirm post titles appear in the HTML (not just empty placeholders that hydrate later). Filter input still works interactively.

Run Lighthouse mobile on `/`, `/en/research`, `/en/thoughts`. Confirm CLS < 0.1 on all three. If any regress, fix before proceeding.

- [ ] **E3.4: Commit**

```bash
git add frontend/app/[locale]/research/page.jsx frontend/components/research-list.jsx
git commit -m "Perf: server-fetch research list with client filter only for interactivity"
```

(Add `blog-list.jsx` and `frontend/app/[locale]/thoughts/page.jsx` if E3.2 applied.)

---

# Section F — Newsletter subscribe (Spec §3, revised — reuse `apps.users.NewsletterSubscriber`)

**Files:**

Frontend (new):
- Create: `frontend/components/newsletter-subscribe.jsx`
- Modify: `frontend/components/footer.jsx`
- Modify: `frontend/components/blog-post.jsx` (or wherever post body ends)
- Modify: `frontend/components/research-article-detail.jsx`
- Modify: `frontend/messages/{en,nl,it,de}.json` (new `Newsletter` namespace)
- Modify: `frontend/app/api/newsletter/subscribe/route.js` (already exists; add honeypot/timestamp/forward locale+source)
- Delete: `frontend/app/api/newsletter/route.js` (duplicate of `subscribe/route.js`)
- Delete: `frontend/app/api/newsletter/verify/route.js` (only consumer was the gate UI deleted in Section B)

Backend (reshape, no new app):
- Modify: `backend/apps/users/models.py` — drop map-gating fields, add `locale`/`source`
- Modify: `backend/apps/users/views.py` — extend `NewsletterSubscribeView` to accept `locale`/`source`; delete `VerifyMapAccessView` and `CheckSubscriptionView`
- Modify: `backend/apps/users/urls.py` — drop verify-access/check route bindings
- Modify: `backend/apps/users/admin.py` — register or update `NewsletterSubscriber` with new list_display
- Create: `backend/apps/users/migrations/0003_newsletter_locale_source.py`
- Modify: `backend/config/settings.py` (`REST_FRAMEWORK` throttle defaults if not present)

Privacy:
- Modify: `frontend/app/[locale]/privacy-policy/page.jsx` (newsletter disclosure)

### Task F1: Backend — reshape `NewsletterSubscriber`

- [ ] **F1.1: Update `NewsletterSubscriber` model in `apps/users/models.py`**

Locate the existing class around line 156. Replace its docstring and field list to:

```python
class NewsletterSubscriber(models.Model):
    """Newsletter subscriber.

    Originally built for map-access gating; now the public newsletter
    signup feeds this model. ``is_verified`` / ``verification_token`` /
    ``verified_at`` are kept for forthcoming double-opt-in; sender pipeline
    is deferred.
    """

    LOCALE_CHOICES = [
        ("en", "English"),
        ("nl", "Dutch"),
        ("it", "Italian"),
        ("de", "German"),
    ]

    SOURCE_CHOICES = [
        ("footer", "Footer"),
        ("post-end", "Post end"),
        ("research-end", "Research end"),
        ("contact-form", "Contact form"),
        ("other", "Other"),
    ]

    email = models.EmailField(unique=True, validators=[validate_serious_email])
    is_business_email = models.BooleanField(default=False)
    email_domain = models.CharField(max_length=255, blank=True)

    locale = models.CharField(max_length=5, choices=LOCALE_CHOICES, default="en")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="other")

    # Verification (kept for forthcoming double-opt-in)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    subscribed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Unsubscribe
    is_active = models.BooleanField(default=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "newsletter_subscribers"
        ordering = ["-subscribed_at"]

    def __str__(self):
        return self.email
```

Also delete any methods on the class related to map-access tracking (`can_access_map`, `record_map_access`, `get_hourly_remaining`, etc.). Keep only `__str__`.

- [ ] **F1.2: Generate the migration**

```bash
cd /Users/ianronk/Projects/personal-website/backend
python manage.py makemigrations users --name newsletter_locale_source
```

Expected: a new file `apps/users/migrations/0003_newsletter_locale_source.py` with `RemoveField` operations for `access_count`, `last_access`, `access_attempts_this_hour`, `current_hour_start` and `AddField` operations for `locale`, `source`.

Inspect the generated migration file. If `makemigrations` produces anything unexpected (e.g., changing the email validator on the unique field), pause and check.

- [ ] **F1.3: Apply the migration**

```bash
python manage.py migrate
```

Expected: applies cleanly. If there is existing data in `newsletter_subscribers`, the dropped columns disappear; the new columns are added with defaults `"en"` / `"other"` so existing rows are populated.

- [ ] **F1.4: Update `NewsletterSubscribeView` in `apps/users/views.py`**

Locate the view (around line 140). Edit `post()` to accept `locale` and `source`, and to persist them on new subscribers:

```python
def post(self, request):
    email = request.data.get("email", "").lower().strip()
    locale = request.data.get("locale", "en")
    source = request.data.get("source", "other")

    # Validate email
    try:
        email = validate_serious_email(email)
    except ValidationError as e:
        return Response(
            {"error": str(e.message)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Coerce to allowed choices; silently fall back if a bad client sends garbage
    if locale not in dict(NewsletterSubscriber.LOCALE_CHOICES):
        locale = "en"
    if source not in dict(NewsletterSubscriber.SOURCE_CHOICES):
        source = "other"

    ip_address = self.get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

    subscriber = NewsletterSubscriber.objects.filter(email=email).first()

    if subscriber:
        if not subscriber.is_active:
            subscriber.is_active = True
            subscriber.unsubscribed_at = None
            subscriber.save(update_fields=["is_active", "unsubscribed_at"])
        # Existing subscriber: leave locale/source unchanged (preserve original signup context).
        # Idempotent 200 — do not reveal existence.
        return Response({"ok": True}, status=status.HTTP_200_OK)

    # New subscriber
    NewsletterSubscriber.objects.create(
        email=email,
        locale=locale,
        source=source,
        ip_address=ip_address,
        user_agent=user_agent,
        is_verified=True,  # Auto-verify until double-opt-in is wired
        verified_at=timezone.now(),
    )

    return Response({"ok": True}, status=status.HTTP_201_CREATED)
```

- [ ] **F1.5: Delete `VerifyMapAccessView` and `CheckSubscriptionView`**

In the same file (`apps/users/views.py`), delete the two view classes (around lines 211–onward — the file's other views). Also delete any `secrets` import if no remaining view uses it. Confirm `from django.utils import timezone` and the other imports stay in place if `NewsletterSubscribeView` still needs them.

- [ ] **F1.6: Update `apps/users/urls.py`**

Open `apps/users/urls.py`. Remove the URL patterns binding `VerifyMapAccessView` and `CheckSubscriptionView`. The remaining newsletter route is `path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), …)`. The `validate-email/` route added in Section A also lives here.

- [ ] **F1.7: Update Django admin**

In `apps/users/admin.py`, register `NewsletterSubscriber` (or update the existing registration):

```python
from django.contrib import admin
from .models import NewsletterSubscriber

@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "locale", "source", "is_verified", "is_active", "subscribed_at")
    list_filter = ("locale", "source", "is_verified", "is_active")
    search_fields = ("email",)
    readonly_fields = ("subscribed_at", "ip_address", "user_agent")
```

If `NewsletterSubscriber` was already registered, replace the previous admin with this one.

- [ ] **F1.8: Add throttle defaults to settings (if missing)**

In `backend/config/settings.py`, in the `REST_FRAMEWORK` dict (around lines 124–134), add throttle defaults if not present:

```python
"DEFAULT_THROTTLE_CLASSES": [
    "rest_framework.throttling.AnonRateThrottle",
],
"DEFAULT_THROTTLE_RATES": {
    "anon": "60/minute",
},
```

- [ ] **F1.9: Write Django tests**

Create `backend/apps/users/tests_newsletter.py`:

```python
from django.test import TestCase

from .models import NewsletterSubscriber


class NewsletterSubscribeTests(TestCase):
    URL = "/api/auth/newsletter/subscribe/"

    def test_creates_subscriber_with_locale_and_source(self):
        response = self.client.post(
            self.URL,
            data={"email": "alice@example.com", "locale": "nl", "source": "footer"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.email, "alice@example.com")
        self.assertEqual(sub.locale, "nl")
        self.assertEqual(sub.source, "footer")

    def test_normalizes_email(self):
        self.client.post(
            self.URL,
            data={"email": "  Alice@EXAMPLE.com  ", "source": "footer"},
            content_type="application/json",
        )
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.email, "alice@example.com")

    def test_idempotent_does_not_overwrite_source(self):
        self.client.post(
            self.URL,
            data={"email": "alice@example.com", "locale": "en", "source": "footer"},
            content_type="application/json",
        )
        response = self.client.post(
            self.URL,
            data={"email": "alice@example.com", "locale": "nl", "source": "post-end"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.locale, "en")
        self.assertEqual(sub.source, "footer")

    def test_unknown_locale_falls_back_to_en(self):
        self.client.post(
            self.URL,
            data={"email": "alice@example.com", "locale": "xx", "source": "footer"},
            content_type="application/json",
        )
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.locale, "en")

    def test_disposable_email_rejected_400(self):
        response = self.client.post(
            self.URL,
            data={"email": "test@mailinator.com", "source": "footer"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(NewsletterSubscriber.objects.count(), 0)

    def test_reactivates_unsubscribed(self):
        sub = NewsletterSubscriber.objects.create(
            email="alice@example.com",
            locale="en",
            source="footer",
            is_active=False,
        )
        response = self.client.post(
            self.URL,
            data={"email": "alice@example.com", "source": "footer"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        sub.refresh_from_db()
        self.assertTrue(sub.is_active)
        self.assertIsNone(sub.unsubscribed_at)
```

- [ ] **F1.10: Run tests**

```bash
cd /Users/ianronk/Projects/personal-website/backend
python manage.py test apps.users.tests_newsletter
```

Expected: 6 tests, all pass.

- [ ] **F1.11: Commit**

```bash
git add backend/apps/users backend/config/settings.py
git commit -m "Newsletter: reshape users.NewsletterSubscriber for public signup (locale/source, drop map-gating fields, keep verification fields for double-opt-in)"
```

### Task F2: Frontend — newsletter subscribe component

- [ ] **F2.1: Add `Newsletter` namespace to messages**

In `frontend/messages/en.json` (and copy/translate into nl, it, de), add:

```json
"Newsletter": {
  "compactHeading": "Stay in the loop",
  "compactDescription": "Occasional notes on geospatial, ML, and AI work.",
  "inlineHeading": "Get the next one in your inbox",
  "inlineDescription": "Subscribe — no spam, unsubscribe anytime.",
  "emailPlaceholder": "you@domain.com",
  "submit": "Subscribe",
  "success": "Thanks — we'll be in touch.",
  "error": "Something went wrong. Try again or email directly.",
  "privacy": "We won't share your address."
}
```

- [ ] **F2.2: Create `frontend/components/newsletter-subscribe.jsx`**

```jsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterSubscribe({ variant = "compact", source = "other", locale = "en" }) {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [tsStart] = useState(Date.now());
  const [state, setState] = useState("idle"); // idle | submitting | success | error

  async function onSubmit(e) {
    e.preventDefault();
    if (state !== "idle") return;
    if (hp) {
      // Honeypot caught — silently succeed
      setState("success");
      return;
    }
    if (Date.now() - tsStart < 2000) {
      // Submitted too fast — silently succeed
      setState("success");
      return;
    }
    setState("submitting");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, locale, hp, ts: tsStart }),
      });
      if (res.ok) setState("success");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return <p className="newsletter-success">{t("success")}</p>;
  }

  const isInline = variant === "inline";

  return (
    <form onSubmit={onSubmit} className={`newsletter-form newsletter-${variant}`}>
      {isInline && (
        <>
          <h3>{t("inlineHeading")}</h3>
          <p>{t("inlineDescription")}</p>
        </>
      )}
      {!isInline && (
        <p className="newsletter-compact-heading">{t("compactHeading")}</p>
      )}
      <div className="newsletter-row">
        <label htmlFor={`newsletter-email-${variant}`} className="sr-only">
          {t("emailPlaceholder")}
        </label>
        <input
          id={`newsletter-email-${variant}`}
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring"
        />
        {/* honeypot — hidden from humans */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          style={{ position: "absolute", left: "-9999px", height: 0, width: 0 }}
          aria-hidden="true"
        />
        <button type="submit" disabled={state === "submitting"} className="btn primary focus-ring">
          {t("submit")}
        </button>
      </div>
      {state === "error" && <p className="newsletter-error">{t("error")}</p>}
    </form>
  );
}
```

Add matching styles in `frontend/app/globals.css`:

```css
.newsletter-form { display: flex; flex-direction: column; gap: 8px; }
.newsletter-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.newsletter-row input[type="email"] {
  flex: 1 1 240px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--ink);
  padding: 10px 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink);
}
.newsletter-compact-heading {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mute);
  margin-bottom: 4px;
}
.newsletter-form h3 {
  font-family: var(--font-serif);
  font-size: 28px;
  margin: 0 0 8px;
}
.newsletter-success { color: var(--ink); font-style: italic; }
.newsletter-error { color: #B33A3A; font-size: 13px; }
```

- [ ] **F2.3: Update the Next.js API route proxy**

The file `frontend/app/api/newsletter/subscribe/route.js` already exists. Replace its contents with:

```js
import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { email, source = "other", locale = "en", hp, ts } = body ?? {};

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Honeypot — bots fill this; humans don't
  if (hp) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  // Submitted too fast — likely a bot
  if (typeof ts === "number" && Date.now() - ts < 2000) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Forward to Django; the existing NewsletterSubscribeView there runs
  // validate_serious_email and rejects disposable/suspicious addresses.
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/auth/newsletter/subscribe/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale, source }),
    });
    if (res.ok) return NextResponse.json({ ok: true });
    if (res.status === 400) {
      // Django rejected the email (disposable / fake / etc.) — silently 200 OK to the bot
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 502 });
  } catch (err) {
    console.error("newsletter proxy error:", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
```

- [ ] **F2.4: Delete the duplicate root proxy and the orphaned verify proxy**

```bash
git rm frontend/app/api/newsletter/route.js \
       frontend/app/api/newsletter/verify/route.js
```

These two routes were:
- `route.js` — duplicated `subscribe/route.js` and pointed to `/api/newsletter/subscribe/` (the Django path is actually `/api/auth/newsletter/subscribe/`, so this duplicate was misrouted).
- `verify/route.js` — only consumer was `newsletter-gate.jsx`, deleted in Section B.

### Task F3: Frontend — placement

- [ ] **F3.1: Footer placement**

In `frontend/components/footer.jsx`, add a new section above or alongside the existing footer content:

```jsx
import NewsletterSubscribe from "./newsletter-subscribe";
import { useLocale } from "next-intl";

// in the footer JSX (or pass locale via prop):
const locale = useLocale();
// ...
<div className="footer-newsletter">
  <NewsletterSubscribe variant="compact" source="footer" locale={locale} />
</div>
```

If `footer.jsx` is a server component, accept `locale` as a prop (passed from the layout) instead of using `useLocale`.

- [ ] **F3.2: End-of-post placement (`blog-post.jsx`)**

After the post body, before the `<ShareBar />` rendering, insert:

```jsx
<NewsletterSubscribe variant="inline" source="post-end" locale={locale} />
```

Pass `locale` from the page params if not already in scope.

- [ ] **F3.3: End-of-article placement (`research-article-detail.jsx`)**

Same pattern as F3.2 but `source="research-end"`.

- [ ] **F3.4: Manual end-to-end verification**

```bash
# Backend
cd /Users/ianronk/Projects/personal-website/backend
python manage.py runserver

# Frontend (separate terminal)
cd /Users/ianronk/Projects/personal-website/frontend
npm run dev
```

In a browser:
1. Visit `/en` — scroll to footer, see the compact form.
2. Visit a `/en/thoughts/<slug>` page — scroll to bottom of post, see the inline form before the share bar.
3. Submit a real test address.
4. Confirm "Thanks — we'll be in touch." replaces the form.
5. Open Django admin (`localhost:8000/admin`) → Users → Newsletter subscribers — confirm the new entry appears with `source=post-end` (or `footer`) and the right `locale`.

Submit again with the same address — should still get success message but no duplicate row in admin.

Submit a disposable address (e.g., `test@mailinator.com`) — should still get the success message in the UI but NO new row in the admin (Django's `validate_serious_email` rejects it; the proxy silently returns 200).

- [ ] **F3.5: Update privacy policy**

In each of `privacy-policy/page.jsx` (en, nl, it, de), add a new paragraph after the "Data we collect" section:

> **Newsletter:** if you enter your email into a subscribe form, we store your email address, the locale of the page where you subscribed, and the date. We will use it only to send the newsletter you opted into. To unsubscribe before automated unsubscribe is wired, email `<ObfuscatedEmail />` and we'll remove you within 7 days.

(Localized as needed.)

- [ ] **F3.6: Commit**

```bash
git add frontend/components/newsletter-subscribe.jsx \
        frontend/app/api/newsletter \
        frontend/components/footer.jsx \
        frontend/components/blog-post.jsx \
        frontend/components/research-article-detail.jsx \
        frontend/messages \
        frontend/app/globals.css \
        frontend/app/[locale]/privacy-policy
git commit -m "Newsletter: subscribe form (footer + post-end + research-end), proxy API, privacy disclosure"
```

---

# Section G — Tracking + tiered consent (Spec §7)

**Files:**
- Modify: `frontend/components/analytics/cookie-consent.jsx`
- Create: `frontend/components/analytics/clarity.jsx`
- Modify: `frontend/components/analytics/google-analytics.jsx`
- Modify: `frontend/components/analytics/linkedin-insight.jsx`
- Create: `frontend/components/consent-provider.jsx`
- Create: `frontend/lib/analytics/track.js`
- Modify: `frontend/components/hero-section.jsx`
- Modify: `frontend/components/navigation.jsx` (and any other call sites of `trackEvent`)
- Modify: `frontend/app/[locale]/layout.tsx`
- Modify: `frontend/app/[locale]/cookie-policy/page.jsx`
- Modify: `frontend/app/[locale]/privacy-policy/page.jsx`
- Modify: `frontend/messages/{en,nl,it,de}.json`

### Task G1: Consent store + provider

- [ ] **G1.1: Create `frontend/lib/analytics/consent-store.js`**

A vanilla pub/sub for consent state, readable from non-React code (i.e., `track.js`):

```js
const STORAGE_KEY = "cookie-consent-v2";

let state = { analytics: false, marketing: false, decidedAt: null, version: 2, ready: false };
const listeners = new Set();

function notify() {
  for (const fn of listeners) fn(state);
}

function read() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function initConsent() {
  if (typeof window === "undefined") return;
  const stored = read();
  if (stored) {
    state = { ...stored, ready: true };
  } else {
    state = { ...state, ready: true };
  }
  notify();

  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    const next = read();
    if (next) {
      state = { ...next, ready: true };
      notify();
    }
  });
}

export function setConsent({ analytics, marketing }) {
  if (typeof window === "undefined") return;
  state = {
    analytics: !!analytics,
    marketing: !!marketing,
    decidedAt: new Date().toISOString(),
    version: 2,
    ready: true,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notify();
}

export function getConsent() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isBannerNeeded() {
  return state.ready && state.decidedAt === null;
}
```

- [ ] **G1.2: Create `frontend/components/consent-provider.jsx`**

```jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getConsent, initConsent, subscribe } from "@/lib/analytics/consent-store";

const ConsentCtx = createContext({ analytics: false, marketing: false, ready: false });

export function ConsentProvider({ children }) {
  const [state, setState] = useState(() => getConsent());

  useEffect(() => {
    initConsent();
    setState(getConsent());
    return subscribe(setState);
  }, []);

  return <ConsentCtx.Provider value={state}>{children}</ConsentCtx.Provider>;
}

export function useConsent() {
  return useContext(ConsentCtx);
}
```

- [ ] **G1.3: Wrap the app in the provider**

In `frontend/app/[locale]/layout.tsx`, wrap children:

```tsx
import { ConsentProvider } from "@/components/consent-provider";

// inside the return:
<ConsentProvider>
  {children}
  <CookieConsent />
  <GoogleAnalytics />
  <Clarity />
  <LinkedInInsight />
</ConsentProvider>
```

### Task G2: New banner UI

- [ ] **G2.1: Rewrite `cookie-consent.jsx`**

Replace the entire file content with a two-checkbox banner:

```jsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { setConsent, isBannerNeeded, subscribe, getConsent } from "@/lib/analytics/consent-store";

export default function CookieConsent() {
  const t = useTranslations("Consent");
  const locale = useLocale();
  const [show, setShow] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    setShow(isBannerNeeded());
    return subscribe(() => setShow(isBannerNeeded()));
  }, []);

  if (!show) return null;

  function acceptAll() {
    setConsent({ analytics: true, marketing: true });
    setShow(false);
  }
  function rejectAll() {
    setConsent({ analytics: false, marketing: false });
    setShow(false);
  }
  function savePreferences() {
    setConsent({ analytics, marketing });
    setShow(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner-inner">
        <h2 id="cookie-banner-title">{t("title")}</h2>
        <p>
          {t("body")}{" "}
          <Link href={`/${locale}/cookie-policy`}>{t("readMore")}</Link>
        </p>

        {showCustom && (
          <div className="cookie-tiers">
            <label>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              {t("tierAnalytics")}
              <span className="cookie-tier-detail">{t("tierAnalyticsDetail")}</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              {t("tierMarketing")}
              <span className="cookie-tier-detail">{t("tierMarketingDetail")}</span>
            </label>
          </div>
        )}

        <div className="cookie-actions">
          <button onClick={rejectAll} className="btn ghost focus-ring">{t("rejectAll")}</button>
          <button onClick={() => setShowCustom((v) => !v)} className="btn ghost focus-ring">
            {showCustom ? t("hidePrefs") : t("customize")}
          </button>
          {showCustom && (
            <button onClick={savePreferences} className="btn focus-ring">{t("savePrefs")}</button>
          )}
          <button onClick={acceptAll} className="btn primary focus-ring">{t("acceptAll")}</button>
        </div>
      </div>
    </div>
  );
}

// Re-open helper used by the footer "Cookie preferences" link
export function reopenCookieBanner() {
  if (typeof window === "undefined") return;
  // Setting decidedAt to null forces the banner to show again
  const current = getConsent();
  setConsent({ analytics: current.analytics, marketing: current.marketing });
  // The above keeps current preferences but updates decidedAt; for a true re-prompt we want decidedAt=null:
  try {
    const raw = window.localStorage.getItem("cookie-consent-v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.decidedAt = null;
      window.localStorage.setItem("cookie-consent-v2", JSON.stringify(parsed));
      window.dispatchEvent(new StorageEvent("storage", { key: "cookie-consent-v2" }));
    }
  } catch {}
}
```

Add CSS for `.cookie-banner`, `.cookie-banner-inner`, `.cookie-tiers`, `.cookie-actions` in `globals.css` matching the rest of the site (paper bg, max-width container, fixed-bottom positioning).

- [ ] **G2.2: Add Consent translations**

In each `frontend/messages/{en,nl,it,de}.json`, ensure a `Consent` namespace exists with these keys (the file already has a `Consent` namespace per the gathered context — extend it, don't replace):

```json
"Consent": {
  "title": "Privacy preferences",
  "body": "We use cookies to understand site usage and (with your consent) for retargeting. You can change preferences anytime.",
  "readMore": "Read the cookie policy",
  "acceptAll": "Accept all",
  "rejectAll": "Reject all",
  "customize": "Customize",
  "hidePrefs": "Hide preferences",
  "savePrefs": "Save preferences",
  "tierAnalytics": "Analytics",
  "tierAnalyticsDetail": "Google Analytics, Microsoft Clarity. Pageviews, behavior, heatmaps.",
  "tierMarketing": "Marketing",
  "tierMarketingDetail": "LinkedIn Insight Tag. Aggregated audience demographics + retargeting."
}
```

Localize for nl, it, de.

- [ ] **G2.3: Footer "Cookie preferences" link**

In `frontend/components/footer.jsx`, add a button (or link) labeled "Cookie preferences" that calls `reopenCookieBanner()`:

```jsx
import { reopenCookieBanner } from "./analytics/cookie-consent";

<button onClick={reopenCookieBanner} className="footer-link focus-ring">
  {t("cookiePreferences")}
</button>
```

Add `cookiePreferences` translation key to all locales' `Footer` namespace.

### Task G3: Tier-aware analytics scripts

- [ ] **G3.1: Update `google-analytics.jsx`**

Replace the existing consent-checking logic (which reads from the old key) with:

```jsx
"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent-provider";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const { analytics, ready } = useConsent();
  if (!ready || !analytics || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
```

- [ ] **G3.2: Create `clarity.jsx`**

`frontend/components/analytics/clarity.jsx`:

```jsx
"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent-provider";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function Clarity() {
  const { analytics, ready } = useConsent();
  if (!ready || !analytics || !CLARITY_ID) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}
```

- [ ] **G3.3: Update `linkedin-insight.jsx`**

```jsx
"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent-provider";

const LI_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;

export default function LinkedInInsight() {
  const { marketing, ready } = useConsent();
  if (!ready || !marketing || !LI_ID) return null;

  return (
    <Script id="li-insight" strategy="afterInteractive">
      {`
        _linkedin_partner_id = "${LI_ID}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        (function(l) {
          if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
          window.lintrk.q=[]}
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);
        })(window.lintrk);
      `}
    </Script>
  );
}
```

### Task G4: `trackEvent` helper

- [ ] **G4.1: Create `frontend/lib/analytics/track.js`**

```js
import { getConsent } from "./consent-store";

export function trackEvent(name, props = {}) {
  if (typeof window === "undefined") return;
  const { analytics, ready } = getConsent();
  if (!ready || !analytics) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, props);
}
```

- [ ] **G4.2: Replace existing trackEvent imports**

Find all current call sites of `trackEvent`:

```bash
grep -rn 'trackEvent\|track-event' /Users/ianronk/Projects/personal-website/frontend/components /Users/ianronk/Projects/personal-website/frontend/app
```

For each, change the import to:

```js
import { trackEvent } from "@/lib/analytics/track";
```

If the existing `trackEvent` was defined inline somewhere (e.g., in a file that's now redundant), delete that definition.

- [ ] **G4.3: Verify hero-section.jsx and navigation.jsx**

Confirm:
- `hero-section.jsx:178` (and surrounding `trackEvent` calls) now imports from `@/lib/analytics/track`.
- `navigation.jsx:146` (and any other call sites) — same.

- [ ] **G4.4: Manual verification**

```bash
npm run dev
```

Open `/en` in incognito (no prior consent stored).
1. Open devtools → Application → Local Storage. Confirm no `cookie-consent-v2` key yet.
2. Open Network panel. Filter for `googletagmanager` and `linkedin`. Reload page.
   - Confirm NO requests to `googletagmanager.com`, `clarity.ms`, or `licdn.com`.
   - Confirm Vercel Analytics requests (`vitals.vercel-analytics.com` or similar) DO fire — these are cookieless and always-on.
3. Click a CTA (e.g., "About me") that wires `trackEvent`. Inspect console — no errors. No GA event fires (silently dropped).
4. The cookie banner appears at the bottom. Click "Accept all".
5. Reload page. Confirm GA, Clarity, and LinkedIn requests now appear.
6. Click the same CTA — GA event fires (visible in Network as a `collect` request to GA).
7. Click "Cookie preferences" in the footer. Banner reappears. Toggle "Marketing" off, click "Save preferences". Reload.
8. Confirm GA and Clarity still fire (analytics still on) but LinkedIn does NOT.

### Task G5: Cookie-policy and privacy-policy updates

- [ ] **G5.1: Update `cookie-policy/page.jsx`**

The current file has cookie tables (essential, analytics, functional). Update to reflect new tiers:

- **Essential** section: keep `cookie_consent` is renamed to `cookie-consent-v2`. Update the table.
- **Analytics tier**: list GA cookies (_ga, _ga_*) + add Microsoft Clarity (`_clck`, `_clsk`, `MR`, `SM`).
- **Marketing tier**: add LinkedIn Insight (`bcookie`, `bscookie`, `lidc`, `li_gc`).
- **Always-on (cookieless)**: add a note about Vercel Analytics — no cookies, no consent needed.

Localize across all 4 locales.

- [ ] **G5.2: Update `privacy-policy/page.jsx`**

In the third-party services section, list:
- Google Analytics — analytics tier consent.
- Microsoft Clarity — analytics tier consent.
- LinkedIn Insight Tag — marketing tier consent.
- Vercel Analytics — always on, cookieless, no consent needed.
- Newsletter — separate opt-in via subscribe form (consent given by submitting the form, NOT by the cookie banner).

Localize across all 4 locales.

- [ ] **G5.3: Commit**

```bash
git add frontend/components/analytics frontend/components/consent-provider.jsx frontend/lib/analytics frontend/app/[locale]/layout.tsx frontend/components/hero-section.jsx frontend/components/navigation.jsx frontend/components/footer.jsx frontend/app/[locale]/cookie-policy frontend/app/[locale]/privacy-policy frontend/messages frontend/app/globals.css
git commit -m "Consent: tiered cookie banner (analytics/marketing) with consent-aware GA, Clarity, LinkedIn Insight, and trackEvent helper"
```

---

# Final verification (before merging the branch)

- [ ] **Z.1: Build clean**

```bash
cd /Users/ianronk/Projects/personal-website/frontend
npm install
npm run build
npm run lint
```

All clean.

- [ ] **Z.2: Backend tests**

```bash
cd /Users/ianronk/Projects/personal-website/backend
python manage.py migrate --dry-run
python manage.py test apps.users.tests_newsletter
```

All pass.

- [ ] **Z.3: End-to-end manual walkthrough**

In `npm run start` (production-mode):
- Hit `/en`, `/en/about`, `/en/contact`, `/en/research`, `/en/thoughts`. No console errors.
- Repeat for `/nl/...`. Locale switching works.
- Submit the contact form with a real email — receive auto-reply, see the message in your inbox.
- Submit the contact form with `test@mailinator.com` — silently 200, nothing in inbox.
- Submit the newsletter form — see "Thanks" message; check Django admin for the row.
- Submit the same newsletter email again — same success message; no duplicate row.
- View source on `/en/research/<slug>` — JSON-LD `url` is `/en/research/<slug>` and `inLanguage` is `en`.
- Trigger `/en/research/<slug>/opengraph-image` — image renders correctly.
- Open in incognito. No GA/Clarity/LinkedIn requests until consent.
- Accept analytics only. GA + Clarity fire, LinkedIn does not.

- [ ] **Z.4: Lighthouse**

Run Lighthouse mobile against `/`, `/research`, `/thoughts`. CLS < 0.1 on each. Performance score not regressed vs. the `playful-restyle` baseline.

- [ ] **Z.5: Axe**

Final axe pass on the same pages. No Serious/Critical issues remaining.

- [ ] **Z.6: Push the branch**

```bash
git push -u origin negatives-cleanup
```

Then open a PR against `master` (or against `playful-restyle` if you want to land it on the restyle branch first). Title: "Cleanup: address 14 review findings + add newsletter subscribe".

---

## Self-review checklist (run before handing off)

- [x] **Spec coverage:** every section of the spec maps to a Section A–G in this plan.
- [x] **No placeholders:** every step has the actual code or command. No "TBD" / "TODO" / "fill in details".
- [x] **Type consistency:** `setConsent({ analytics, marketing })` — same shape across `consent-store.js`, `consent-provider.jsx`, `cookie-consent.jsx`. `trackEvent(name, props)` — same shape in `track.js` and call sites. `Subscriber` model fields (`email`, `locale`, `source`, `created_at`, `confirmed_at`, `unsubscribed_at`) consistent between model, serializer, admin, tests.
- [x] **Discovered-in-spec extras:** `de` was missing from `WebSiteJsonLd`'s `inLanguage` array and from `research/[slug]/page.jsx`'s `alternates.languages` map; both fixed in Task D3.3 and D4.2.
