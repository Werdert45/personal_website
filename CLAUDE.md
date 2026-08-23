# personal-website

## Site copy editing workflow

The full English site copy (every user-facing string, grouped by page, each labeled with its source key) lives in two places:

- **`/Users/ianronk/Brain/Brain/site-copy-en.md`** — Ian's editable copy. This is where Ian rewrites text in his own voice. Treat it as the source of truth for copy changes.
- **`docs/copy/site-copy-en.md`** — the generated snapshot of what is currently deployed (same format).

When asked to apply copy changes: diff the Brain file against the repo snapshot, write the changed strings back to their keys (`frontend/messages/en.json`, `frontend/data/resume.js`, page metadata files, `frontend/components/marquee.jsx`), re-derive NL/DE/IT translations from the new English, regenerate the repo snapshot so both files match again, then commit and deploy.

Locale JSON files must only be edited via python scripts (`json.dump(..., ensure_ascii=False, indent=2)` + trailing newline); the Edit tool corrupts them.

## Copy style rules

- No em dashes anywhere in user-facing text (titles use colon form, e.g. "FishFinder: photo-to-species ID"). En dashes in numeric ranges are fine.
- Canonical role line: "Head of Data · Engineer & Researcher". Niche line: "Head of Data: data systems, analytics, and urban-dynamics research".

## Content publishing

Blog/research content lives in `backend/seed_content/`; publish changed slugs to production via `scripts/publish_content_api.py` inside the backend container (see memory: project-content-api-publishing). Deploy = push to master (Dokploy).
