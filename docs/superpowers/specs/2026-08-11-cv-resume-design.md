# CV / Resume redesign — design spec

Date: 2026-08-11
Status: approved in brainstorming session (layout A page, Y4 PDF)

## Goal

One canonical resume, living inside the About page, with the downloadable
PDF generated from the same data — ending the drift between site copy and
the hand-maintained CV (the PDF said "Data Engineer" while the site said
"Data Lead & Engineer").

## Decisions (user-approved)

| Decision | Choice |
|---|---|
| Where the resume lives | Inside `/about` (no separate `/resume` page) |
| Audience framing | Balanced dual-track: Engineering & Leadership + Research & Publications, equal weight |
| Locales | Resume content EN-only in all four site locales; page chrome stays localized |
| Sync mechanism | Approach A: single data source + build-time PDF generation |
| Page layout | Layout A: two parallel columns on desktop, stacked on mobile (engineering first) |
| PDF structure | Single-column hybrid (ATS-optimal): Summary → Tools → Experience → Research & Open Source → Education |
| PDF styling | Y4: deep gold `#8A6D00` for role line + section headings, one `#FFD60A` left-border bar on the summary, black body text on white, no other color |
| Role line | "Data Lead & Engineer · Urban-Dynamics Researcher" (user: fine for now; revisit if positioning shifts) |

## Components

### 1. `frontend/data/resume.js` — single source of truth

Plain-JS exported object; EN strings only, deliberately outside
`messages/*.json`:

```js
export const resume = {
  header: { name, roleLine, location, email, links: [{label, url}], languages, summary },
  engineering: [ { role, org, orgNote, period, bullets: [] } ],
  research:    [ { title, venue, year, result, href } ],   // href → site's own paper pages
  education:   [ { degree, institution, period, note } ],
  stack:       []                                          // ordered, ~12 items max
}
```

Content is ported from the current `About.experience` / `About.education`
locale keys and the existing `ian-ronk-cv.pdf`, with the corrected role
line, and the research entries linking to the live `/research/<slug>`
pages (metro paper, gentrification ABM, voronoi paper).

### 2. About page dual-track section

- Replaces the current "Work History" and "Academic Record" blocks in
  `about-content.jsx` with a new `resume-section.jsx` component rendering
  from `resume.js`.
- Desktop: two columns — Engineering & Leadership (left), Research &
  Publications (right). Mobile: stacked, engineering first.
- Education + Stack render full-width beneath the columns.
- "Download the CV (PDF)" button at the top of the section (existing
  `About.downloadCv` locale key), pointing at `/ian-ronk-cv.pdf` as today.
- The new section headings ("Engineering & Leadership", "Research &
  Publications", "Education", "Stack") are EN constants defined in
  `resume.js`, not locale keys — the whole section is one language by
  design.
- Consequence: this section is EN-only in nl/de/it. The now-unused
  `About.experience`, `About.education`, `About.professionalTitle`,
  `About.academicTitle` and `About.journeyKicker` keys are removed from
  all four locale files (verify each is unreferenced before deleting).

### 3. PDF generation — `frontend/scripts/generate-cv.mjs`

- Uses `@react-pdf/renderer` (pure Node — no headless browser), imports
  `resume.js`, writes `frontend/public/ian-ronk-cv.pdf`.
- Wired as the npm `prebuild` hook so every local and Dokploy build
  regenerates the PDF; the stable public URL keeps working.
- A4, one page, Y4 styling as above. Typography: a single clean sans
  (Helvetica built-in to start; swappable later), 10pt body, uppercase
  letter-spaced section labels.
- Hard one-page budget: the script measures the rendered page count and
  exits non-zero with a clear message if content overflows, failing the
  build rather than shipping a two-page CV silently.
- The hand-maintained PDF is retired (overwritten by the generated one).

## Error handling

- Build fails loudly on: overflow past one page, missing required
  `resume.js` fields (script validates shape before rendering).
- The About section renders nothing-broken if a list is empty (maps over
  arrays; no fixed indices).

## Testing

- `npm run build` locally: PDF regenerates, one page, opens correctly.
- About page: desktop two-column, mobile stacking order, CV button
  downloads the fresh PDF.
- Locale spot-check: nl/de/it About pages render the EN resume section
  without missing-key errors after key removal.
- ATS sanity: paste generated PDF text into a plain-text extractor —
  reading order must be Summary → Tools → Experience → Research →
  Education with no interleaving.

## Out of scope (explicitly)

- The interactive map element for posts/blogs — separate design
  conversation, next.
- Localizing resume content.
- A separate `/resume` route.
- Restyling the rest of the About page.
