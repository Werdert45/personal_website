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

Content is the user-approved v6 render (brainstorm session 2026-08-11),
canonical below — not the old locale keys or the retired PDF. Research
entries link to the live `/research/<slug>` pages where one exists.

#### Canonical content (approved v6)

- **Role line:** Data Lead & Engineer · Independent Researcher
- **Summary:** Production data systems and the data engineering behind
  research: Airflow, DuckDB and PostGIS pipelines that turn open spatial
  data into papers. Leads a team of 4 as Head of Data; publishes
  independent research on urban dynamics.
- **Tools:** Python · SQL · PostGIS · Airflow · DuckDB · PyTorch ·
  MLflow · Bash · LLM pipelines
- **Experience** (no em dashes, no parentheticals in KR&A titles):
  - *Head of Data, KR&A, Amsterdam* (Jul 2025 – present): team of 4 +
    product-offering transformation for pension funds and leading
    FinTechs; pipelines (weekly scrape of 300k records) and spatial big
    data products; global connectivity score, 1TB+ across 13 servers
    into a production API; client-facing (defending methodology against
    PhD-level scrutiny, presenting to portfolio managers and senior
    stakeholders); AI adoption (OCR, LLM document extraction, agentic
    pipeline monitoring, agent-assisted development).
  - *Independent Researcher, urban dynamics* (2025 – present): two
    working papers and a method paper in preparation, each backed by an
    open, reproducible pipeline.
  - *Medior Data Scientist, KR&A* (Jun 2022 – Jul 2025): project lead
    for two multi-year projects incl. the 3-year Eurostat hedonic HPI
    project; legacy-to-Airflow/Iceberg/FastAPI restructure; client
    contact with CBS, Eurostat, pension funds.
  - *Junior Data Scientist, KR&A* (Oct 2021 – Jun 2022): flood
    prediction thesis, 90%+ accuracy; tenfold API-efficiency
    improvement via spatial optimisations.
  - *Junior Full-Stack Developer, Exact (former SRXP), part-time*
    (Sep 2019 – Sep 2022): EmberJS/PHP under CI/CD and testing.
- **Research:** Voronoi paper (preprint, arXiv 2026); metro paper
  (working paper, n = 42,004); connectivity-score method paper (in
  preparation); gentrification ABM by research title with
  "(MSc thesis, 8/8)". No data-orchestration repo entry.
- **Education:** MSc Bocconi · 107/110, focus Finance · Econometrics ·
  Statistics · NLP; BSc AI UvA with sub-entries Minor in Linguistics
  (UvA) and Erasmus minor (UNIBO).
- **Languages & Soft Skills:** Dutch C2 · English C2 · Italian B2/C1 ·
  German B2 · Spanish A2; Team leadership · Multi-year project
  management · Client & stakeholder communication · Presenting and
  defending methodology to technical and senior audiences.
- Open item (non-blocking): optional performance number for the
  connectivity-score bullet.

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
