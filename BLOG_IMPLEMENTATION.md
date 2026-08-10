# Blog API — Implementation Guide

New `apps.blog` Django app with REST endpoints for blog posts and translations. Mirrors the existing `apps.research` pattern so the editing UI can reuse the same workflow.

## Deployment

After pulling this branch on the Dokploy host (or anywhere the backend runs):

```bash
python manage.py migrate
```

This creates the `blog_post` and `blog_post_translation` tables. No other changes to environment variables, Docker images, or settings are required.

## Endpoints

Base path: `/api/blog/`

All list/detail endpoints follow Django REST Framework conventions and use the same JWT auth as the rest of the backend (`Authorization: Bearer <token>`).

| Method | URL | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/blog/` | List posts | Public (published only) / Auth (all) |
| `POST` | `/api/blog/` | Create post | Auth |
| `GET` | `/api/blog/<slug>/` | Retrieve post | Public if published |
| `PUT` / `PATCH` | `/api/blog/<slug>/` | Update post | Auth |
| `DELETE` | `/api/blog/<slug>/` | Delete post | Auth |
| `GET` | `/api/blog/<slug>/translations/` | List translations | Public |
| `POST` | `/api/blog/<slug>/translations/` | Upsert a translation | Auth |

### List filters (query params)

- `status` — `draft`, `published`, `archived` (auth only; public callers always get `published`)
- `category` — `article`, `tutorial`, `note`, `announcement`, `other`
- `tag` — matches a tag inside the `tags` JSON array
- `featured` — `true` / `false`

Results are paginated (`PAGE_SIZE=20`) with DRF's standard envelope: `{ count, next, previous, results }`.

### Post shape

```json
{
  "id": 1,
  "title": "On spatial indexes",
  "slug": "on-spatial-indexes",
  "excerpt": "Why GiST beats B-tree for bbox queries.",
  "content": "# Markdown body...",
  "category": "article",
  "status": "published",
  "tags": ["postgis", "performance"],
  "read_time": "6 min",
  "date": "March 2026",
  "cover_image": "/media/content/images/abc.webp",
  "author": "Ian Ronk",
  "featured": false,
  "is_premium": false,
  "published_at": "2026-03-12T10:00:00Z",
  "translations": [
    {
      "id": 3,
      "language": "nl",
      "title": "Over ruimtelijke indexen",
      "slug": "over-ruimtelijke-indexen",
      "excerpt": "...",
      "content": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

### Translation upsert

`POST /api/blog/<slug>/translations/`

```json
{
  "language": "nl",
  "title": "Over ruimtelijke indexen",
  "slug": "over-ruimtelijke-indexen",
  "excerpt": "Waarom GiST sneller is dan B-tree voor bbox queries.",
  "content": "# Markdown in Dutch..."
}
```

Returns `201` on first insert, `200` on subsequent updates for the same `(post, language)` pair. Supported languages: `nl`, `it`.

## Using from the editing setup

The CRM / admin-portal talks to the Django API via the Next.js proxy at `/api/django?endpoint=...`. The proxy forwards any endpoint name directly, so these work out of the box:

```ts
// List posts
fetch("/api/django?endpoint=blog")

// Filter by tag
fetch("/api/django?endpoint=blog&tag=postgis&status=draft", {
  headers: { Authorization: `Bearer ${token}` },
})

// Fetch one
fetch("/api/django?endpoint=blog/on-spatial-indexes")

// Create
fetch("/api/django?endpoint=blog", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ title: "...", slug: "...", content: "...", status: "draft" }),
})

// Update
fetch("/api/django?endpoint=blog&id=on-spatial-indexes", {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ status: "published" }),
})
```

> Note: the proxy's `PUT` / `DELETE` use `id` for the URL segment, so pass the **slug** as `id` (the backend uses slug as its lookup field — the proxy just appends it to the URL).

## Image uploads

Blog cover images and inline markdown images reuse the existing endpoint:

```
POST /api/research/upload-image/   (multipart: image=<file>)
```

Returns `{ "url": "/media/content/images/<hash>.<ext>", ... }`. Store that URL string in `cover_image` or embed it in markdown via `![alt](/media/content/images/...)`.

## Admin

Posts are editable via the Django admin at `/admin/` with a `BlogPost` list view, inline translation editor, and `slug` auto-population from the title.

## Seeding beta content (`seed_beta_content`)

Beta pieces live as markdown files with YAML frontmatter in `backend/seed_content/` (`blog/*.md` → `BlogPost`, `research/*.md` → `Research`; the body becomes `content`, research files also carry `abstract` in the frontmatter). The command is opt-in — it runs only when invoked manually and is wired into no entrypoint, migration, CI step, or startup hook:

```bash
python manage.py seed_beta_content            # seed everything
python manage.py seed_beta_content --dry-run  # report create/update/skip, write nothing
python manage.py seed_beta_content --only when-metro-capitalizes-fixed-effects
```

Rules it enforces:

- **Upsert by slug.** The frontmatter `slug` must equal the filename stem; the command errors on mismatch to prevent slug drift.
- **Always draft on create.** `status` is forced to `draft` for new rows; a `status` key in frontmatter is ignored with a warning. Drafts stay hidden from anonymous readers by the existing API visibility rules.
- **Never downgrades.** A row whose status was manually changed to `published` or `archived` is skipped entirely with a warning — the command never overwrites it and never flips it back to draft. Rows still in `draft` get all seeded fields refreshed.
- **`read_time`** is computed as `ceil(wordcount/200)` (e.g. `7 min`) when blank in frontmatter; **`date`** is never invented — it stays blank until set by hand.
- **No new dependencies.** Frontmatter is hand-parsed (scalars, quoted strings, JSON-style lists, booleans, and `key: |` blocks) — no PyYAML required.

Figures and PDFs referenced in the seeded content are `<!-- asset: ... -->` placeholders: upload them via `POST /api/research/upload-image/` (or the admin, for `pdf_file`) and rewrite the paths before publishing.

## Direct API access for automation (`X-API-Key`)

Automation clients (agents, scripts, CI) can skip the interactive JWT flow and authenticate any write endpoint with a static service key:

```
X-API-Key: <value of CONTENT_API_KEY>
```

- Set `CONTENT_API_KEY` as an env var on the host (Dokploy backend service). Unset = the mechanism is disabled and only JWT works.
- Requests authenticate as the `content-agent` service account (created on first use, no password login).
- Works on all blog, research, and image-upload endpoints; comparison is constant-time (`config/authentication.py`).
- Rotate by changing the env var and restarting the backend.

## ISO 8601 field handling

`published_at`, `created_at`, `updated_at` are canonical ISO 8601 datetimes. The display fields stay for the frontend, with machine-readable views alongside:

- `date_iso` (read-only): ISO 8601 date derived from `published_at`, `null` while unpublished.
- `read_time_iso` (read-only): ISO 8601 duration parsed from `read_time` (`"6 min"` → `"PT6M"`), `null` if unparseable.
- Writes accept ISO input and normalize it to the stored display form: `date: "2026-03"` → `"March 2026"`, `read_time: "PT6M"` → `"6 min"`. Non-ISO input is stored as-is.
- Translation `language` codes are ISO 639-1 (`nl`, `it`).

The OpenAPI schema at `/api/schema/` (Swagger UI at `/api/docs/`) documents all of this and is the contract automation clients should read first.

## Adding further content types later

To add (e.g.) a `Page` or `Note` model, follow the same shape:

1. Create `apps/<name>/` with `models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py`, `apps.py`, and `migrations/__init__.py`.
2. Register the app in `config/settings.py` (`INSTALLED_APPS`) and the URL in `config/urls.py` (`path("api/<name>/", include("apps.<name>.urls"))`).
3. Run `python manage.py makemigrations <name> && python manage.py migrate`.
4. The Next.js proxy already forwards arbitrary endpoints — no frontend wiring needed beyond the UI.
