# Content Simplification & Thoughts Rename — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse content to three types (Research / Projects / Thoughts), retire the standalone `Visualization` model, rename Blog → Thoughts (route + label), and swap the "Scraping" competence for "Internal Processes".

**Architecture:** Backend stays Django with three content apps (`blog`, `projects`, `research`). `Visualization` rows are data-migrated into `BlogPost` with `category="visualisation"` and map/PostGIS config preserved in a new `BlogPost.meta` JSONField. Frontend renames the `/blog` route to `/thoughts` (with 301 redirects), updates all four locale files, rewrites the 4th `SkillsGrid` card, and removes the old `/visualizations` route.

**Tech Stack:** Django 5 + DRF (backend), Next.js 15 App Router + next-intl (frontend), Postgres/PostGIS.

**Spec:** `docs/superpowers/specs/2026-04-19-content-simplification-and-thoughts-rename-design.md`

**Branch:** `playful-restyle` (continue on the current branch — do not create a new one)

**Testing convention:** This codebase has no first-party test suite. Verification uses `python manage.py check`, `python manage.py migrate --plan`, `curl` against the dev server, `next build`, and `grep` for stale references — called out explicitly in each task.

---

## Task 1: Backend — Blog model new categories + `meta` field

**Goal:** Update `BlogPost.CATEGORY_CHOICES` to `visualisation / update / explanation / thought / note` and add a `meta` JSONField for migrated visualisation config. Data-migrate existing category values.

**Files:**
- Modify: `backend/apps/blog/models.py`
- Create: `backend/apps/blog/migrations/0002_new_categories_and_meta.py`

- [ ] **Step 1: Update the model**

Edit `backend/apps/blog/models.py`:

```python
"""
Models for Blog posts and translations.
"""

from django.db import models


class BlogPost(models.Model):
    """Blog post with markdown content and optional translations."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]

    CATEGORY_CHOICES = [
        ("visualisation", "Visualisation"),
        ("update", "Update"),
        ("explanation", "Explanation"),
        ("thought", "Thought"),
        ("note", "Note"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(blank=True, help_text="Short summary shown in listings")
    content = models.TextField(blank=True, help_text="Markdown content")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="thought")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    tags = models.JSONField(default=list)

    meta = models.JSONField(
        default=dict,
        blank=True,
        help_text="Arbitrary metadata (e.g., map_config, geojson_endpoint for visualisation posts).",
    )

    read_time = models.CharField(max_length=20, blank=True, help_text="e.g., '5 min'")
    date = models.CharField(max_length=50, blank=True, help_text="Display date, e.g., 'March 2026'")

    cover_image = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="URL path for the cover/preview image",
    )

    author = models.CharField(max_length=100, blank=True, default="")
    featured = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "blog_post"
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title


class BlogPostTranslation(models.Model):
    """Translation of a BlogPost into another language."""

    LANGUAGE_CHOICES = [
        ("nl", "Dutch"),
        ("it", "Italian"),
    ]

    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE,
        related_name="translations",
    )
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES)
    title = models.CharField(max_length=255)
    slug = models.SlugField(blank=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text="Markdown content in the target language")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "blog_post_translation"
        unique_together = [("post", "language")]

    def __str__(self):
        return f"{self.post.title} ({self.get_language_display()})"
```

- [ ] **Step 2: Generate and hand-edit the migration**

Run from `backend/`:

```bash
cd backend && python manage.py makemigrations blog
```

Expected output: `Migrations for 'blog': 0002_blogpost_meta_alter_blogpost_category.py` (or similar name).

Rename the file to `0002_new_categories_and_meta.py` and replace its body with:

```python
from django.db import migrations, models


CATEGORY_REMAP = {
    "article": "thought",
    "tutorial": "explanation",
    "note": "note",
    "announcement": "update",
    "other": "thought",
}


def remap_categories(apps, schema_editor):
    BlogPost = apps.get_model("blog", "BlogPost")
    for post in BlogPost.objects.all():
        new_cat = CATEGORY_REMAP.get(post.category, "thought")
        if new_cat != post.category:
            post.category = new_cat
            post.save(update_fields=["category"])


def reverse_remap_categories(apps, schema_editor):
    # One-way migration. Old categories cannot be recovered losslessly.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="blogpost",
            name="meta",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Arbitrary metadata (e.g., map_config, geojson_endpoint for visualisation posts).",
            ),
        ),
        migrations.RunPython(remap_categories, reverse_remap_categories),
        migrations.AlterField(
            model_name="blogpost",
            name="category",
            field=models.CharField(
                choices=[
                    ("visualisation", "Visualisation"),
                    ("update", "Update"),
                    ("explanation", "Explanation"),
                    ("thought", "Thought"),
                    ("note", "Note"),
                ],
                default="thought",
                max_length=50,
            ),
        ),
    ]
```

- [ ] **Step 3: Verify migration plan**

Run from `backend/`:

```bash
python manage.py migrate --plan blog
```

Expected: shows the three operations in order (AddField meta → RunPython remap → AlterField category). No errors.

- [ ] **Step 4: Apply migration**

```bash
python manage.py migrate blog
```

Expected: `Applying blog.0002_new_categories_and_meta... OK`.

- [ ] **Step 5: Verify data remap in a Django shell**

```bash
python manage.py shell -c "from apps.blog.models import BlogPost; print(sorted({p.category for p in BlogPost.objects.all()}))"
```

Expected: the set is a subset of `['explanation', 'note', 'thought', 'update', 'visualisation']` with no `article/tutorial/announcement/other` values remaining.

- [ ] **Step 6: Commit**

```bash
git add backend/apps/blog/models.py backend/apps/blog/migrations/0002_new_categories_and_meta.py
git commit -m "Blog: new category set (visualisation/update/explanation/thought/note) + meta JSONField"
```

---

## Task 2: Backend — Project model new categories

**Goal:** Change `Project.CATEGORY_CHOICES` from `web/data/gis/ml/other` to `webapp/simulation/tool/other`. Data-migrate existing rows: `web → webapp`; `data/gis/ml/other → other`.

**Files:**
- Modify: `backend/apps/projects/models.py`
- Create: `backend/apps/projects/migrations/0002_new_categories.py`

- [ ] **Step 1: Update the model**

In `backend/apps/projects/models.py`, replace `CATEGORY_CHOICES` and `category` default:

```python
    CATEGORY_CHOICES = [
        ("webapp", "Web App"),
        ("simulation", "Simulation"),
        ("tool", "Tool"),
        ("other", "Other"),
    ]
    ...
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
```

- [ ] **Step 2: Generate and hand-edit the migration**

```bash
cd backend && python manage.py makemigrations projects
```

Rename the generated file to `0002_new_categories.py` and set its contents to:

```python
from django.db import migrations, models


CATEGORY_REMAP = {
    "web": "webapp",
    "data": "other",
    "gis": "other",
    "ml": "other",
    "other": "other",
}


def remap_categories(apps, schema_editor):
    Project = apps.get_model("projects", "Project")
    for project in Project.objects.all():
        new_cat = CATEGORY_REMAP.get(project.category, "other")
        if new_cat != project.category:
            project.category = new_cat
            project.save(update_fields=["category"])


def reverse_remap_categories(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(remap_categories, reverse_remap_categories),
        migrations.AlterField(
            model_name="project",
            name="category",
            field=models.CharField(
                choices=[
                    ("webapp", "Web App"),
                    ("simulation", "Simulation"),
                    ("tool", "Tool"),
                    ("other", "Other"),
                ],
                default="other",
                max_length=50,
            ),
        ),
    ]
```

- [ ] **Step 3: Apply and verify**

```bash
python manage.py migrate projects
python manage.py shell -c "from apps.projects.models import Project; print(sorted({p.category for p in Project.objects.all()}))"
```

Expected: only values from `['webapp', 'simulation', 'tool', 'other']` present.

- [ ] **Step 4: Commit**

```bash
git add backend/apps/projects/models.py backend/apps/projects/migrations/0002_new_categories.py
git commit -m "Projects: new category set (webapp/simulation/tool/other)"
```

---

## Task 3: Backend — Retire `Visualization` model

**Goal:** Copy all `Visualization` rows into `BlogPost` (category `visualisation`, map config into `BlogPost.meta`), then drop the model, admin, serializer, view, and URL route.

**Files:**
- Modify: `backend/apps/research/models.py`
- Modify: `backend/apps/research/admin.py`
- Modify: `backend/apps/research/serializers.py`
- Modify: `backend/apps/research/views.py`
- Modify: `backend/apps/research/urls.py`
- Create: `backend/apps/research/migrations/0009_retire_visualization.py`

- [ ] **Step 1: Write the data-copy migration FIRST (before removing the model)**

Create `backend/apps/research/migrations/0009_retire_visualization.py`:

```python
from django.db import migrations


def copy_visualizations_to_blog(apps, schema_editor):
    Visualization = apps.get_model("research", "Visualization")
    BlogPost = apps.get_model("blog", "BlogPost")

    for viz in Visualization.objects.all():
        if BlogPost.objects.filter(slug=viz.slug).exists():
            # Slug collision — append suffix so we never clobber a real blog post.
            new_slug = f"{viz.slug}-viz"
        else:
            new_slug = viz.slug

        meta = {
            "map_config": viz.map_config or {},
            "geojson_endpoint": viz.geojson_endpoint or "",
            "geojson_data": viz.geojson_data,
            "geodataset_id": viz.geodataset_id,
            "value_field": viz.value_field or "",
            "technologies": viz.technologies or [],
            "data_points": viz.data_points or "",
            "region": viz.region or "",
            "metrics": viz.metrics or [],
        }

        BlogPost.objects.create(
            title=viz.title,
            slug=new_slug,
            excerpt=viz.description or "",
            content=viz.content or "",
            category="visualisation",
            status=viz.status,
            tags=[],
            meta=meta,
            date=viz.date or "",
            cover_image=viz.preview_image or "",
            featured=False,
            is_premium=viz.is_premium,
            published_at=viz.created_at,
            created_at=viz.created_at,
            updated_at=viz.updated_at,
        )


def noop_reverse(apps, schema_editor):
    # Reversal is not supported: removing Visualization is destructive and
    # the schema change must be rolled back by restoring from backup.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("research", "0008_allow_blank_text_fields"),
        ("blog", "0002_new_categories_and_meta"),
    ]

    operations = [
        migrations.RunPython(copy_visualizations_to_blog, noop_reverse),
        migrations.DeleteModel(name="Visualization"),
    ]
```

- [ ] **Step 2: Run the data-copy migration BEFORE editing Python code that imports Visualization**

```bash
cd backend && python manage.py migrate research
```

Expected: `Applying research.0009_retire_visualization... OK`. Check the blog table has new rows:

```bash
python manage.py shell -c "from apps.blog.models import BlogPost; print(BlogPost.objects.filter(category='visualisation').values_list('slug', 'title'))"
```

Expected: lists the migrated visualisation(s), e.g. `[('european-capital-prices', '...')]`.

- [ ] **Step 3: Remove `Visualization` from `models.py`**

In `backend/apps/research/models.py`, delete the entire `class Visualization(models.Model): ...` block (lines ~136 to end of file). The file should end with the `ResearchTranslation` class.

- [ ] **Step 4: Remove Visualization from `admin.py`**

Replace `backend/apps/research/admin.py` with:

```python
"""
Admin configuration for Research.
"""

from django.contrib import admin

from .models import Research


@admin.register(Research)
class ResearchAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "has_map", "is_premium", "created_at"]
    list_filter = ["status", "category", "has_map", "is_premium"]
    search_fields = ["title", "abstract"]
    prepopulated_fields = {"slug": ("title",)}
    ordering = ["-created_at"]
```

- [ ] **Step 5: Remove Visualization serializers**

In `backend/apps/research/serializers.py`, delete:
- `from .models import Research, ResearchTranslation, Visualization` → change to `from .models import Research, ResearchTranslation`
- The entire `class VisualizationSerializer(...)` block
- The entire `class VisualizationListSerializer(...)` block

The file should only contain `ResearchTranslationSerializer`, `ResearchSerializer`, `ResearchListSerializer`, and `ImageUploadSerializer`.

- [ ] **Step 6: Remove Visualization views**

In `backend/apps/research/views.py`:
- Change `from .models import Research, ResearchTranslation, Visualization` → `from .models import Research, ResearchTranslation`
- Change the serializer imports to drop `VisualizationListSerializer, VisualizationSerializer`:

```python
from .serializers import (
    ImageUploadSerializer,
    ResearchListSerializer,
    ResearchSerializer,
    ResearchTranslationSerializer,
)
```

- Delete the `class VisualizationListCreateView(...)` and `class VisualizationDetailView(...)` blocks (lines ~135-172).

- [ ] **Step 7: Remove Visualization URL routes**

Replace `backend/apps/research/urls.py` with:

```python
"""
URL patterns for research, translations, and image uploads.
"""

from django.urls import path

from .views import (
    ImageUploadView,
    ResearchDetailView,
    ResearchListCreateView,
    ResearchTranslationView,
)

urlpatterns = [
    path("", ResearchListCreateView.as_view(), name="research_list"),
    path("upload-image/", ImageUploadView.as_view(), name="image_upload"),
    path("<slug:slug>/translations/", ResearchTranslationView.as_view(), name="research_translations"),
    path("<slug:slug>/", ResearchDetailView.as_view(), name="research_detail"),
]
```

- [ ] **Step 8: Run Django check**

```bash
python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 9: Verify Visualization endpoint is gone**

Start the dev server (`python manage.py runserver` in another terminal) and:

```bash
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:8000/api/research/visualizations/
```

Expected: `404`.

Also verify research still works:

```bash
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:8000/api/research/
```

Expected: `200`.

- [ ] **Step 10: Commit**

```bash
git add backend/apps/research/
git commit -m "Retire Visualization model: migrate rows to BlogPost, drop model/admin/api"
```

---

## Task 4: Backend — Update `seed_data.py`

**Goal:** Stop seeding Visualization rows; seed the old visualisation content as a `BlogPost` with `category="visualisation"`; update seeded blog/project categories to the new choices.

**Files:**
- Modify: `backend/apps/research/management/commands/seed_data.py`

- [ ] **Step 1: Drop the `Visualization` import and usages**

In `backend/apps/research/management/commands/seed_data.py`:

- Change line 17 from `from apps.research.models import Research, Visualization` → `from apps.research.models import Research`
- In `handle()` (around line 198), remove the line `Visualization.objects.all().delete()`.
- Remove the call `self.create_visualization(dataset)` inside `handle()` (around line 206).
- Delete the entire `def create_visualization(self, dataset):` method (around lines 332-363).

- [ ] **Step 2: Replace it with a seeded `visualisation` blog post**

Inside the existing `create_blog_post` method (after the `announcement` block, before the method ends), add:

```python
        # --- Visualisation (migrated from Visualization model) ---
        viz_post, created = BlogPost.objects.get_or_create(
            slug="european-capital-prices",
            defaults={
                "title": "European Capital Property Price Comparison",
                "excerpt": (
                    "Interactive map comparing residential property prices per square metre "
                    "across 12 major European capital cities with market status indicators."
                ),
                "content": (
                    "A choropleth map across 12 European capital cities, built on a live PostGIS "
                    "dataset and rendered with Mapbox GL JS. Price/m² ranges from ~2.8k in Warsaw "
                    "to ~12.4k in London."
                ),
                "category": "visualisation",
                "status": "published",
                "tags": ["mapbox", "postgis", "choropleth"],
                "meta": {
                    "map_config": {"center": [10, 50], "zoom": 4},
                    "region": "Europe",
                    "data_points": "12 capital cities",
                    "technologies": ["PostGIS", "Mapbox GL JS", "Python", "Django"],
                    "value_field": "avg_price_sqm",
                    "metrics": [
                        {"label": "Cities", "value": "12"},
                        {"label": "Avg Price/m2", "value": "5,854"},
                        {"label": "Top Market", "value": "London"},
                    ],
                },
                "read_time": "3 min",
                "date": "2025",
                "author": "Ian Ronk",
                "featured": False,
                "published_at": "2025-11-15T09:00:00Z",
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Already exists'}: {viz_post.title}")
```

- [ ] **Step 3: Update seeded category values to the new vocabulary**

Search `seed_data.py` for the remaining `"category": "article"`, `"tutorial"`, `"note"`, `"announcement"`, `"other"` values inside `create_blog_post` and remap:

```bash
cd backend && python -c "
import re
path = 'apps/research/management/commands/seed_data.py'
text = open(path).read()
for old, new in [('\"category\": \"article\"', '\"category\": \"thought\"'),
                 ('\"category\": \"tutorial\"', '\"category\": \"explanation\"'),
                 ('\"category\": \"announcement\"', '\"category\": \"update\"')]:
    text = text.replace(old, new)
open(path, 'w').write(text)
"
```

(`"category": "note"` keeps its value.)

Also update the project's seeded category: change `"category": "web"` (around line 380) to `"category": "webapp"`.

- [ ] **Step 4: Re-run the seed idempotently**

```bash
cd backend && python manage.py seed_data
```

Expected: all `"Created"` or `"Already exists"` lines, no tracebacks. No `"Creating Visualization..."` line should appear.

- [ ] **Step 5: Confirm the seeded state**

```bash
python manage.py shell -c "
from apps.blog.models import BlogPost
from apps.projects.models import Project
print('Blog categories:', sorted({p.category for p in BlogPost.objects.all()}))
print('Viz count:', BlogPost.objects.filter(category='visualisation').count())
print('Project categories:', sorted({p.category for p in Project.objects.all()}))
"
```

Expected:
```
Blog categories: ['explanation', 'note', 'thought', 'update', 'visualisation']
Viz count: 1
Project categories: ['webapp']
```

- [ ] **Step 6: Commit**

```bash
git add backend/apps/research/management/commands/seed_data.py
git commit -m "Seed: drop Visualization, seed visualisation as BlogPost, update categories"
```

---

## Task 5: Frontend — Rename `/blog` route to `/thoughts`

**Goal:** Move the `app/[locale]/blog/` directory to `app/[locale]/thoughts/`, and add 301 redirects from `/blog` and `/blog/:slug` to `/thoughts` and `/thoughts/:slug`.

**Files:**
- Move: `frontend/app/[locale]/blog/` → `frontend/app/[locale]/thoughts/`
- Modify: `frontend/next.config.mjs`

- [ ] **Step 1: Move the directory**

```bash
git mv 'frontend/app/[locale]/blog' 'frontend/app/[locale]/thoughts'
```

Verify:

```bash
ls 'frontend/app/[locale]/thoughts/'
```

Expected: `[slug]  page.jsx`.

- [ ] **Step 2: Add redirects in `next.config.mjs`**

Replace `frontend/next.config.mjs` with:

```javascript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const LOCALES = ["en", "nl", "it", "de"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return LOCALES.flatMap((locale) => [
      {
        source: `/${locale}/blog`,
        destination: `/${locale}/thoughts`,
        permanent: true,
      },
      {
        source: `/${locale}/blog/:slug`,
        destination: `/${locale}/thoughts/:slug`,
        permanent: true,
      },
    ]);
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Commit (the rest of the file moves happen in later tasks)**

```bash
git add frontend/next.config.mjs 'frontend/app/[locale]/thoughts/'
git commit -m "Route: rename /blog to /thoughts with 301 redirects"
```

---

## Task 6: Frontend — Navigation component

**Goal:** Update the nav entry to label "Thoughts" and route to `/thoughts`.

**Files:**
- Modify: `frontend/components/navigation.jsx`

- [ ] **Step 1: Update the fallback translations and the link**

In `frontend/components/navigation.jsx`:

Replace the fallback object (around line 27) from:

```javascript
      const fallback = { home: "Home", about: "About", visualizations: "Visualizations", research: "Research", contact: "Contact", blog: "Blog", brand: "Ian Ronk" };
```

to:

```javascript
      const fallback = { home: "Home", about: "About", visualizations: "Thoughts", research: "Research", contact: "Contact", brand: "Ian Ronk" };
```

Replace the nav-link row (around line 38) from:

```javascript
    { href: `/${locale}/blog`, label: t("visualizations"), idx: "03", routeKey: "/blog" },
```

to:

```javascript
    { href: `/${locale}/thoughts`, label: t("visualizations"), idx: "03", routeKey: "/thoughts" },
```

(The JSON key `visualizations` stays — it now holds the string "Thoughts". See the spec for rationale.)

- [ ] **Step 2: Commit**

```bash
git add frontend/components/navigation.jsx
git commit -m "Navigation: point to /thoughts with Thoughts label"
```

---

## Task 7: Frontend — Translation files (all four locales)

**Goal:** Change the nav label to "Thoughts" (localized), rewrite the 4th competence to "Internal Processes", and scrub "scraping" references in user-facing copy.

**Files:**
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/nl.json`
- Modify: `frontend/messages/it.json`
- Modify: `frontend/messages/de.json`

- [ ] **Step 1: Update English (`en.json`)**

In `frontend/messages/en.json`:

Change `Navigation.visualizations` value from `"Blog"` to `"Thoughts"`.

Replace the 4th entry of `About.expertise` (the one titled `"Scraping and Data Mining"`) with:

```json
      {
        "title": "Internal Processes",
        "description": "Automating the machinery teams rely on — orchestrating data pipelines, building internal tooling, and replacing manual workflows with reliable systems."
      }
```

- [ ] **Step 2: Update Dutch (`nl.json`)**

- `Navigation.visualizations` → `"Gedachten"`
- Replace the 4th `About.expertise` entry with:

```json
      {
        "title": "Interne Processen",
        "description": "Het automatiseren van de motor waar teams op draaien — pipelines orchestreren, interne tools bouwen en handmatig werk vervangen door betrouwbare systemen."
      }
```

- [ ] **Step 3: Update Italian (`it.json`)**

- `Navigation.visualizations` → `"Pensieri"`
- Replace the 4th `About.expertise` entry with:

```json
      {
        "title": "Processi Interni",
        "description": "Automatizzare la macchina su cui fanno affidamento i team — orchestrare pipeline di dati, costruire strumenti interni e sostituire i flussi manuali con sistemi affidabili."
      }
```

- [ ] **Step 4: Update German (`de.json`)**

- `Navigation.visualizations` → `"Gedanken"`
- Replace the 4th `About.expertise` entry with:

```json
      {
        "title": "Interne Prozesse",
        "description": "Automatisierung der Maschinerie, auf die Teams angewiesen sind — Datenpipelines orchestrieren, interne Tools bauen und manuelle Workflows durch verlässliche Systeme ersetzen."
      }
```

- [ ] **Step 5: Scrub remaining "scraping" copy**

Scan for any leftover user-facing `scraping` / `Scraping` / `Data Mining` strings in the four locale files:

```bash
grep -ni "scrap\|data mining" frontend/messages/*.json
```

Expected: no matches. If any remain (e.g., inside `Hero.description`), rewrite to remove the reference, matching the tone of surrounding copy. Preserve all other content.

- [ ] **Step 6: Validate JSON**

```bash
for f in frontend/messages/*.json; do python -c "import json; json.load(open('$f'))" && echo "$f OK"; done
```

Expected: four `OK` lines.

- [ ] **Step 7: Commit**

```bash
git add frontend/messages/
git commit -m "i18n: Thoughts label + Internal Processes competence across en/nl/it/de"
```

---

## Task 8: Frontend — `SkillsGrid` card #04 (Internal Processes)

**Goal:** Replace the scraping browser SVG with a closed-loop automation diagram; update the card's stack chips and short tag.

**Files:**
- Modify: `frontend/components/skills-grid.jsx`

- [ ] **Step 1: Update the 4th SVG**

In `frontend/components/skills-grid.jsx`, replace the last `return` inside `SkillViz` (the scraping browser SVG, currently at lines ~72-89) with:

```jsx
  // Internal Processes — closed-loop automation diagram
  return (
    <svg viewBox="0 0 320 100" style={{ width: "100%", height: "100%" }}>
      <g fontFamily="var(--font-mono)" fontSize="9" fill="#111110">
        <rect x="14" y="34" width="72" height="30" fill="#F6F4EE" stroke="#111110" />
        <text x="28" y="53">trigger</text>

        <rect x="124" y="34" width="72" height="30" fill="#FFD60A" stroke="#111110" />
        <text x="146" y="53">run</text>

        <rect x="234" y="34" width="72" height="30" fill="#111110" stroke="#111110" />
        <text x="250" y="53" fill="#FFD60A">report</text>
      </g>
      <g stroke="#111110" strokeWidth="1.2" fill="none">
        <path d="M86 49 L124 49" />
        <path d="M196 49 L234 49" />
        <path d="M270 34 C 270 10, 50 10, 50 34" strokeDasharray="3 3" />
        <path d="M54 34 L50 30 L46 34" />
        <path d="M118 45 L124 49 L118 53" />
        <path d="M228 45 L234 49 L228 53" />
      </g>
    </svg>
  );
```

- [ ] **Step 2: Update the 4th stack chips and short tag**

In the same file, replace the `stacks` and `shortTags` arrays:

```javascript
const stacks = [
  ["SAM", "LVMs", "XGBoost", "PyTorch", "scikit-learn"],
  ["Airflow", "Docker", "Python", "Postgres", "PostGIS", "dbt"],
  ["PostGIS", "GeoPandas", "H3", "CV", "Agent-based"],
  ["Airflow", "dbt", "Docker", "FastAPI", "Streamlit", "Postgres"],
];

const shortTags = ["ML", "ENG", "GEO", "OPS"];
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/skills-grid.jsx
git commit -m "SkillsGrid: card 4 swap to Internal Processes (SVG + stack + tag)"
```

---

## Task 9: Frontend — Marquee defaults

**Goal:** Replace the scrolling yellow-banner default list to lead with the four competences.

**Files:**
- Modify: `frontend/components/marquee.jsx`

- [ ] **Step 1: Update defaults**

In `frontend/components/marquee.jsx`, replace the `defaults` array:

```javascript
  const defaults = [
    "Machine Learning",
    "Data Engineering",
    "Geospatial Analysis",
    "Internal Processes",
    "REITs · Funds · Eurostat",
  ];
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/marquee.jsx
git commit -m "Marquee: four competences + domain tail"
```

---

## Task 10: Frontend — `WritingTeaser` (home teaser)

**Goal:** Rename heading to "Recent thoughts.", point "View all" to `/thoughts`, and drop the "scraping" sample post.

**Files:**
- Modify: `frontend/components/writing-teaser.jsx`

- [ ] **Step 1: Update `DEFAULT_POSTS`**

In `frontend/components/writing-teaser.jsx`, replace `DEFAULT_POSTS` (currently 3 entries including `20m-records-scraping`) with:

```javascript
const DEFAULT_POSTS = [
  { slug: "against-dashboards", date: "2026-04", category: "THOUGHT", title: "The case against dashboards", italic: "dashboards" },
  { slug: "h3-for-real-estate", date: "2026-03", category: "EXPLANATION", title: "Why we switched to H3 for real-estate geoindexing", italic: "H3" },
  { slug: "internal-tools-beat-dashboards", date: "2026-02", category: "UPDATE", title: "Internal tools that quietly replaced our dashboards", italic: "tools" },
];
```

- [ ] **Step 2: Update heading text and `View all` link**

Replace the `<h2>` block:

```jsx
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Recent <i style={{ fontStyle: "italic" }}>thoughts</i>.
        </h2>
```

Replace the "View all" `Link`:

```jsx
          <Link href={`/${locale}/thoughts`} style={{ borderBottom: "1px solid" }}>
            View all →
          </Link>
```

Replace the card `Link` to use `/thoughts`:

```jsx
            <Link href={`/${locale}/thoughts/${p.slug}`} key={p.slug} className="wt-card">
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/writing-teaser.jsx
git commit -m "WritingTeaser: Recent thoughts heading + /thoughts links, drop scraping default"
```

---

## Task 11: Frontend — `BlogList` (now the Thoughts list)

**Goal:** Update section label and heading to reflect Thoughts, point all links to `/thoughts/:slug`, scrub "scraping" defaults.

**Files:**
- Modify: `frontend/components/blog-list.jsx`

- [ ] **Step 1: Update section label + heading + subtitle**

In `frontend/components/blog-list.jsx`:

Replace the section-label span text:

```jsx
        <span>Thoughts — essays, updates, notes</span>
```

Replace the `<h2>` block:

```jsx
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Recent <i style={{ fontStyle: "italic" }}>thoughts</i>.
        </h2>
```

(Subtitle `<p>` copy can stay as-is — it already reads tool-agnostic.)

- [ ] **Step 2: Update both `Link` hrefs**

Replace:

```jsx
        <Link href={`/${locale}/blog/${featured.slug}`} style={{ display: "block" }}>
```

with:

```jsx
        <Link href={`/${locale}/thoughts/${featured.slug}`} style={{ display: "block" }}>
```

And:

```jsx
          <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} style={{ display: "block" }}>
```

with:

```jsx
          <Link key={post.slug} href={`/${locale}/thoughts/${post.slug}`} style={{ display: "block" }}>
```

- [ ] **Step 3: Replace `DEFAULT_POSTS` with the new category vocabulary and no "scraping" entry**

Replace the `DEFAULT_POSTS` array (currently 6 entries) with:

```javascript
const DEFAULT_POSTS = [
  { slug: "against-dashboards", category: "THOUGHT", date: "2026-04", title: "The case against dashboards", excerpt: "Why opinionated internal tools outperform generic dashboards for real estate teams — with five examples from the past year." },
  { slug: "h3-for-real-estate", category: "EXPLANATION", date: "2026-03", title: "Why we switched to H3 for real-estate geoindexing", excerpt: "Trading quadkeys for hexagons: what changed in query latency, cache hit-rate, and analyst ergonomics." },
  { slug: "internal-tools-beat-dashboards", category: "UPDATE", date: "2026-02", title: "Internal tools that quietly replaced our dashboards", excerpt: "A field report on building three small apps that retired a 40-tab dashboard farm over six months." },
  { slug: "postgis-vs-duckdb", category: "EXPLANATION", date: "2026-01", title: "PostGIS vs DuckDB for analyst queries", excerpt: "When each wins, and how we route analyst notebooks to the right backend without them noticing." },
  { slug: "cadastre-as-code", category: "UPDATE", date: "2025-12", title: "Cadastre-as-Code, one year in", excerpt: "Notes from maintaining an MIT-licensed library that normalises cadastral dumps across six EU countries." },
  { slug: "isochrone-api", category: "EXPLANATION", date: "2025-11", title: "Replacing three paid isochrone vendors", excerpt: "How we built a sub-200ms in-house isochrone API on OSRM + GTFS and retired three recurring contracts." },
];
```

- [ ] **Step 4: Update the fallback label**

In the two places where `getField(post, "category", locale, "ARTICLE").toUpperCase()` appears, change `"ARTICLE"` → `"THOUGHT"` so unknown categories fall back to the new default:

```javascript
getField(featured, "category", locale, "THOUGHT").toUpperCase()
...
getField(post, "category", locale, "THOUGHT").toUpperCase()
```

- [ ] **Step 5: Commit**

```bash
git add frontend/components/blog-list.jsx
git commit -m "Thoughts list: update label/heading/links/defaults to new vocabulary"
```

---

## Task 12: Frontend — `BlogPost` reader

**Goal:** Ensure the reader's internal links (if any) point to `/thoughts`. Verify no `/blog` literal strings remain in the component.

**Files:**
- Modify: `frontend/components/blog-post.jsx` (only if it contains `/blog` references)

- [ ] **Step 1: Audit for `/blog` links**

```bash
grep -n "/blog" frontend/components/blog-post.jsx
```

- [ ] **Step 2: Replace any matches with `/thoughts`**

For each match (e.g., a "Back to list" link or breadcrumb), change `/${locale}/blog` → `/${locale}/thoughts` and `/${locale}/blog/${slug}` → `/${locale}/thoughts/${slug}`. If there are no matches, skip step 3.

- [ ] **Step 3: Commit (only if changes made)**

```bash
git add frontend/components/blog-post.jsx
git commit -m "BlogPost reader: point internal links to /thoughts"
```

---

## Task 13: Frontend — `ResearchList` drops category filter row

**Goal:** Remove the category filter chips from the research page so it renders as a flat paper list.

**Files:**
- Modify: `frontend/components/research-list.jsx`

- [ ] **Step 1: Remove the category state and filter UI**

In `frontend/components/research-list.jsx`:

- Delete the line `const [activeCategory, setActiveCategory] = useState("all");`
- Delete the `const categories = [...]` block (around lines 42-49).
- In the filter UI block (around lines 109-150), delete the entire `<div>` containing the `{categories.map(...)}` — keep the `<input type="search" ...>` search box; remove only the outer category-chip `<div>` that wraps those buttons.
- In `filteredItems`, remove the `matchesCategory` condition:

Replace:

```javascript
  const filteredItems = source.filter((item) => {
    const title = getTranslated(item, "title", locale) || "";
    const abstract = getTranslated(item, "abstract", locale) || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      activeCategory === "all" || (item.category || "").toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });
```

with:

```javascript
  const filteredItems = source.filter((item) => {
    const title = getTranslated(item, "title", locale) || "";
    const abstract = getTranslated(item, "abstract", locale) || "";
    const q = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      abstract.toLowerCase().includes(q) ||
      (item.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  });
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/research-list.jsx
git commit -m "Research: flat paper list, remove category filter chips"
```

---

## Task 14: Frontend — Remove legacy `/visualizations` route

**Goal:** Delete the orphaned `app/[locale]/visualizations/` directory so its route stops being generated.

**Files:**
- Delete: `frontend/app/[locale]/visualizations/`

- [ ] **Step 1: Verify nothing else imports from that directory**

```bash
grep -r "visualizations" frontend/app frontend/components | grep -v "messages/" | grep -v "visualizations\":"
```

Expected: no results, or only the `visualizations` translation key usage (which stays intentionally).

- [ ] **Step 2: Delete the directory**

```bash
git rm -r 'frontend/app/[locale]/visualizations/'
```

- [ ] **Step 3: Commit**

```bash
git commit -m "Remove legacy /visualizations route (migrated to Thoughts)"
```

---

## Task 15: Frontend — Delete orphaned components & update sitemap

**Goal:** Remove three frontend components that are now unused (`visualizations-gallery.jsx`, `visualization-detail.jsx`, `projects-preview.jsx`) and update the sitemap to generate `/thoughts` URLs instead of `/visualizations`.

**Files:**
- Delete: `frontend/components/visualizations-gallery.jsx`
- Delete: `frontend/components/visualization-detail.jsx`
- Delete: `frontend/components/projects-preview.jsx`
- Modify: `frontend/app/sitemap.ts`

- [ ] **Step 1: Verify the components are unused (after Task 14 deleted their only callers)**

```bash
grep -rn "VisualizationsGallery\|VisualizationDetail\|ProjectsPreview" frontend/app frontend/components 2>/dev/null
```

Expected: matches only inside the component files themselves (self-references). If any `app/` file still imports them, stop and update it first.

- [ ] **Step 2: Delete the orphaned components**

```bash
git rm frontend/components/visualizations-gallery.jsx frontend/components/visualization-detail.jsx frontend/components/projects-preview.jsx
```

- [ ] **Step 3: Update `sitemap.ts` — emit `/thoughts` URLs**

Replace `frontend/app/sitemap.ts` with:

```typescript
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ianronk.com'
  const locales = ['en', 'nl', 'it', 'de']

  const staticPages = ['', '/research', '/thoughts', '/contact', '/privacy-policy', '/terms-of-service', '/cookie-policy']

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/research' ? 0.9 : 0.7,
    }))
  )

  const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'

  let researchEntries: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${djangoUrl}/api/research/`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const articles = await res.json()
      researchEntries = (articles || []).flatMap((article: any) =>
        locales.map((locale) => ({
          url: `${siteUrl}/${locale}/research/${article.slug}`,
          lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
      )
    }
  } catch {
    // Backend might not be available during build
  }

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${djangoUrl}/api/blog/`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const posts = await res.json()
      const list = Array.isArray(posts) ? posts : posts.results || []
      blogEntries = list.flatMap((post: any) =>
        locales.map((locale) => ({
          url: `${siteUrl}/${locale}/thoughts/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      )
    }
  } catch {
    // Backend might not be available during build
  }

  return [...staticEntries, ...researchEntries, ...blogEntries]
}
```

Note: adds `de` locale to the list (the four-locale site supports it). Replaces the `/visualizations` section with the missing `/thoughts` dynamic entries.

- [ ] **Step 4: Commit**

```bash
git add frontend/components frontend/app/sitemap.ts
git commit -m "Delete orphaned viz components; sitemap emits /thoughts URLs"
```

---

## Task 16: Frontend — Remove Visualizations tab from CRM

**Goal:** The CRM manages Research and Translations only. The Visualizations tab fetches a retired endpoint and must be removed. Visualisation blog posts are authored via Django admin going forward.

**Files:**
- Modify: `frontend/app/crm/page.jsx`

- [ ] **Step 1: Audit the CRM for Visualization references**

```bash
grep -n "visualization\|Visualization" frontend/app/crm/page.jsx | head -40
```

- [ ] **Step 2: Remove visualizations state, fetcher, and tab**

In `frontend/app/crm/page.jsx`, apply the following edits. Preserve all other CRM functionality:

1. Drop state + loader:
   - Remove the line `const [visualizations, setVisualizations] = useState([]);`
   - Remove the line `const [loadingVisualizations, setLoadingVisualizations] = useState(true);`
   - Remove the `fetchVisualizations` function (the full `async function fetchVisualizations() { ... }` block — it fetches `/api/django?endpoint=research/visualizations`).
   - Remove any call to `fetchVisualizations()` inside the initial `useEffect`.

2. Drop `formMode === "visualization"` branches:
   - In the create-handler (`openNewVisualization` or similar, around line 198), remove the whole function.
   - In `handleSave` (around line 238), collapse the `if/else` on `formMode` so it handles only `"research"`. Drop the `else` branch that targets `research/visualizations`.
   - In `handleDelete` (around line 336) and `handleSaveTranslation` (around line 396), change the endpoint expression from `type === "research" ? ... : research/visualizations/...` to just the research endpoint (delete the ternary's viz branch).
   - Wherever `formMode` is rendered (titles, field labels), simplify to the research-only path.

3. Drop the UI tab:
   - In the `TabsList` at line ~1076, change `grid-cols-3` to `grid-cols-2` and remove the `<TabsTrigger value="visualizations">...</TabsTrigger>` line.
   - Delete the entire `<TabsContent value="visualizations" ...>...</TabsContent>` block (around lines 1212-1340).

- [ ] **Step 3: Build check**

```bash
cd frontend && node node_modules/next/dist/bin/next build 2>&1 | tail -20
```

Expected: build succeeds, `/crm` route compiles without type errors or "undefined function" errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/crm/page.jsx
git commit -m "CRM: remove Visualizations tab (retired model)"
```

---

## Task 17: Verification — builds, grep, manual smoke

**Goal:** Prove the whole stack still boots, the route rename is live, no stale references remain, and no page fetches the retired `/research/visualizations/` endpoint.

- [ ] **Step 1: Backend check**

```bash
cd backend && python manage.py check && python manage.py migrate --plan
```

Expected: `System check identified no issues` and `[X] No planned migration operations.` (all migrations applied).

- [ ] **Step 2: Frontend build**

```bash
cd frontend && node node_modules/next/dist/bin/next build 2>&1 | tail -25
```

Expected: `✓ Compiled successfully`, a route table that includes `/[locale]/thoughts` and `/[locale]/thoughts/[slug]` and does NOT include `/[locale]/blog` or `/[locale]/visualizations`.

- [ ] **Step 3: Grep for stale `/blog` in frontend source**

```bash
grep -rn "/blog" frontend/components frontend/app 2>/dev/null | grep -v node_modules
```

Expected: no results (redirects live in `next.config.mjs` which references `/blog` — that's the only allowed match, and it's in a different file).

- [ ] **Step 4: Grep for scraping in user-facing copy**

```bash
grep -rni "scraping\|scrape\|data mining" frontend/components frontend/messages frontend/app 2>/dev/null | grep -v node_modules
```

Expected: no results (the seed_data.py backend file is allowed to keep any internal references).

- [ ] **Step 4b: Grep for the retired visualizations endpoint**

```bash
grep -rn "research/visualizations\|endpoint=visualizations\|VisualizationsGallery\|VisualizationDetail\|ProjectsPreview" frontend/app frontend/components 2>/dev/null | grep -v node_modules
```

Expected: no results.

- [ ] **Step 5: Start dev server and spot-check in the browser**

```bash
cd frontend && node node_modules/next/dist/bin/next dev
```

In a browser, verify:
- `http://localhost:3000/en` — home page: nav shows "Thoughts" (pos 03), marquee reads `Machine Learning · Data Engineering · Geospatial Analysis · Internal Processes · …`, 4th skill card titled "Internal Processes" with the closed-loop SVG, home teaser heading "Recent **thoughts**.", "View all →" links to `/en/thoughts`.
- `http://localhost:3000/en/thoughts` — loads the list, featured post at top.
- `http://localhost:3000/en/blog` — 301 redirects to `/en/thoughts`.
- `http://localhost:3000/en/research` — flat paper list with search box but no category chip row.
- `http://localhost:3000/en/visualizations` — 404.
- Switch to `/nl`, `/it`, `/de` and confirm nav label is localized (`Gedachten`, `Pensieri`, `Gedanken`) and the 4th expertise card reads the localized Internal Processes title.

- [ ] **Step 6: Commit verification artifacts only if any fixes were made**

If any step found a regression, fix it and commit:

```bash
git commit -m "Fix: <describe>"
```

Otherwise, this task has no commit of its own.

- [ ] **Step 7: Push branch**

```bash
git push origin playful-restyle
```

Then the user reviews on Dokploy and opens a PR.

---

## Rollback notes

- `BlogPost.meta` JSONField is additive and safe.
- Category remaps are one-way. A rollback requires restoring from DB backup to recover the pre-migration string values.
- `Visualization` table drop is destructive. The data-copy migration (Task 3 step 1) preserves all content inside `BlogPost`, so no information is lost, but the `visualizations` table itself cannot be reconstructed without a backup.
- `/blog` redirects are 301 permanent; any inbound link gets rewritten by the browser/CDN cache. If we ever need `/blog` back, remove the redirect — but that also means serving it.

## Done when

All boxes in Tasks 1-17 are checked, Step 5 of Task 17 passes in the browser for all four locales, and the branch has been pushed.
