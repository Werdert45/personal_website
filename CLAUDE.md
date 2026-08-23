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

Ian also edits content bodies in `/Users/ianronk/Brain/Brain/`: `site-projects-texts.md`, `site-papers-texts.md`, `site-blogs-texts.md` (slug-labeled dumps of the published seed files). When asked to apply content edits: diff those files against `backend/seed_content/`, write edits back to the seed files, regenerate the dumps, deploy and republish the changed slugs.

Content taxonomy (Aug 2026): research entries with `category: project` are project write-ups (theses included) and appear only as project cards; `working-paper`/`preprint` etc. are Papers and appear in the papers lists (/projects list + homepage § 05).
