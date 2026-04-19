"""
Management command to seed the database with sample data.
Creates a GeoJSON file and processes it through GeoProcessor into PostGIS.
"""

import io
import json
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand

from apps.blog.models import BlogPost, BlogPostTranslation
from apps.geodata.models import GeoDataset, GeoFeature, GeoUploadedDataset
from apps.geodata.services.geo_processor import GeoProcessor
from apps.projects.models import Project
from apps.research.models import Research


EUROPEAN_CAPITALS_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "city": "Amsterdam",
                "country": "Netherlands",
                "avg_price_sqm": 6850,
                "yoy_change": 8.2,
                "market_status": "Hot",
                "population": 872757,
                "median_income": 38000,
            },
            "geometry": {"type": "Point", "coordinates": [4.9041, 52.3676]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Berlin",
                "country": "Germany",
                "avg_price_sqm": 4800,
                "yoy_change": 5.1,
                "market_status": "Growing",
                "population": 3748148,
                "median_income": 35000,
            },
            "geometry": {"type": "Point", "coordinates": [13.405, 52.52]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Paris",
                "country": "France",
                "avg_price_sqm": 10500,
                "yoy_change": 2.3,
                "market_status": "Stable",
                "population": 2161000,
                "median_income": 42000,
            },
            "geometry": {"type": "Point", "coordinates": [2.3522, 48.8566]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "London",
                "country": "United Kingdom",
                "avg_price_sqm": 12400,
                "yoy_change": -1.2,
                "market_status": "Cooling",
                "population": 8982000,
                "median_income": 39000,
            },
            "geometry": {"type": "Point", "coordinates": [-0.1276, 51.5074]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Madrid",
                "country": "Spain",
                "avg_price_sqm": 3900,
                "yoy_change": 6.7,
                "market_status": "Growing",
                "population": 3223334,
                "median_income": 28000,
            },
            "geometry": {"type": "Point", "coordinates": [-3.7038, 40.4168]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Milan",
                "country": "Italy",
                "avg_price_sqm": 5100,
                "yoy_change": 4.5,
                "market_status": "Stable",
                "population": 1396059,
                "median_income": 34000,
            },
            "geometry": {"type": "Point", "coordinates": [9.19, 45.4642]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Lisbon",
                "country": "Portugal",
                "avg_price_sqm": 3900,
                "yoy_change": 12.1,
                "market_status": "Hot",
                "population": 544851,
                "median_income": 22000,
            },
            "geometry": {"type": "Point", "coordinates": [-9.1393, 38.7223]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Vienna",
                "country": "Austria",
                "avg_price_sqm": 4600,
                "yoy_change": 3.8,
                "market_status": "Stable",
                "population": 1911191,
                "median_income": 36000,
            },
            "geometry": {"type": "Point", "coordinates": [16.3738, 48.2082]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Copenhagen",
                "country": "Denmark",
                "avg_price_sqm": 5800,
                "yoy_change": 4.2,
                "market_status": "Stable",
                "population": 794128,
                "median_income": 45000,
            },
            "geometry": {"type": "Point", "coordinates": [12.5683, 55.6761]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Stockholm",
                "country": "Sweden",
                "avg_price_sqm": 6200,
                "yoy_change": -2.5,
                "market_status": "Cooling",
                "population": 975904,
                "median_income": 43000,
            },
            "geometry": {"type": "Point", "coordinates": [18.0686, 59.3293]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Dublin",
                "country": "Ireland",
                "avg_price_sqm": 5400,
                "yoy_change": 7.3,
                "market_status": "Hot",
                "population": 544107,
                "median_income": 40000,
            },
            "geometry": {"type": "Point", "coordinates": [-6.2603, 53.3498]},
        },
        {
            "type": "Feature",
            "properties": {
                "city": "Warsaw",
                "country": "Poland",
                "avg_price_sqm": 2800,
                "yoy_change": 9.4,
                "market_status": "Hot",
                "population": 1790658,
                "median_income": 18000,
            },
            "geometry": {"type": "Point", "coordinates": [21.0122, 52.2297]},
        },
    ],
}


class Command(BaseCommand):
    help = "Seed the database with sample data using GeoJSON file upload"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing data before seeding",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write("Resetting existing data...")
            BlogPost.objects.all().delete()
            Research.objects.all().delete()
            GeoDataset.objects.all().delete()
            GeoUploadedDataset.objects.all().delete()
            Project.objects.all().delete()
            self.stdout.write(self.style.WARNING("All existing data deleted."))

        dataset = self.upload_geojson()
        self.create_research(dataset)
        self.create_project()
        self.create_blog_post()
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))

    def upload_geojson(self):
        """Create a GeoJSON file and process it through GeoProcessor into PostGIS."""
        self.stdout.write("Processing GeoJSON file through GeoProcessor...")

        # Check if dataset already exists
        existing = GeoUploadedDataset.objects.filter(
            name="European Capital Property Markets"
        ).first()
        if existing:
            self.stdout.write(f"  Already exists: {existing.name} ({existing.feature_count} features)")
            return existing

        # Create an in-memory GeoJSON file
        geojson_bytes = json.dumps(EUROPEAN_CAPITALS_GEOJSON).encode("utf-8")
        uploaded_file = SimpleUploadedFile(
            name="european-capitals.geojson",
            content=geojson_bytes,
            content_type="application/geo+json",
        )

        # Process through GeoProcessor (same pipeline as file upload)
        processor = GeoProcessor(
            file=uploaded_file,
            filename="european-capitals.geojson",
            name="European Capital Property Markets",
            description="Property market data across 12 major European capital cities, "
                        "including price per sqm, year-over-year changes, and market status.",
        )
        result = processor.process()

        self.stdout.write(
            f"  Created: {result['name']} "
            f"({result['feature_count']} features, "
            f"fields: {result['available_fields']})"
        )

        return GeoUploadedDataset.objects.get(id=result["dataset_id"])

    def create_research(self, dataset):
        """Create a research article linked to the uploaded PostGIS dataset."""
        self.stdout.write("Creating Research article...")

        defaults = {
            "title": "European Capital Property Markets: A Spatial Comparison",
            "abstract": (
                "A comprehensive spatial analysis comparing residential property markets "
                "across 12 European capital cities, examining price dynamics, affordability "
                "ratios, and market trajectories using GIS-based methods."
            ),
            "content": """## Introduction

The European residential property market is characterized by significant heterogeneity across capital cities. This research provides a data-driven comparison of 12 major European capitals, analyzing property prices per square meter, year-over-year price changes, and market status classifications.

## Methodology

We employed a multi-source data approach combining:
- **Eurostat Housing Price Index** (HPI) quarterly data
- **National cadastral records** from 12 countries
- **Spatial regression models** to control for location-specific factors
- **GIS mapping** using PostGIS for spatial analysis and Mapbox for visualization

### Data Coverage
| Metric | Details |
|--------|---------|
| Cities analyzed | 12 European capitals |
| Time period | Q1 2020 - Q4 2024 |
| Data points | 850,000+ transactions |
| Spatial resolution | Neighborhood level |

## Key Findings

### Price Distribution
The analysis reveals a significant price gradient across European capitals:

1. **Premium markets** (>10,000/m2): London (12,400), Paris (10,500)
2. **Mid-range markets** (4,000-7,000/m2): Amsterdam (6,850), Stockholm (6,200), Copenhagen (5,800), Dublin (5,400), Milan (5,100)
3. **Affordable markets** (<4,000/m2): Madrid (3,900), Lisbon (3,900), Berlin (4,800), Vienna (4,600), Warsaw (2,800)

### Market Dynamics
- **Fastest growing**: Lisbon (+12.1%), Warsaw (+9.4%), Amsterdam (+8.2%)
- **Cooling markets**: Stockholm (-2.5%), London (-1.2%)
- **Stable markets**: Paris (+2.3%), Vienna (+3.8%), Copenhagen (+4.2%)

### Affordability Analysis
When normalized by median household income, the most affordable markets shift significantly:
- Warsaw offers the best price-to-income ratio despite rapid growth
- London and Paris present the greatest affordability challenges
- Dublin and Amsterdam are rapidly deteriorating in affordability

## Discussion

The spatial analysis reveals clustering patterns in market behavior. Northern European markets (Stockholm, Copenhagen) show synchronized cooling after the 2022 interest rate increases, while Southern European markets (Lisbon, Madrid) continue to benefit from remote work migration and golden visa programs.

## Conclusions

European capital property markets are diverging rather than converging, with policy differences (taxation, foreign buyer restrictions, supply constraints) playing a more significant role than macroeconomic factors. Cities with proactive housing supply policies (Vienna, Warsaw) maintain better affordability despite growing demand.

## Data Sources

- Eurostat Housing Price Index (2024)
- National statistical offices of 12 EU/EEA countries
- OpenStreetMap for spatial features
- CBS Netherlands, INSEE France, ONS UK, INE Spain""",
            "category": "research",
            "status": "published",
            "tags": ["real estate", "spatial analysis", "European markets", "GIS", "PostGIS"],
            "read_time": "15 min",
            "date": "January 2025",
            "has_map": True,
            "map_config": {"center": [10, 50], "zoom": 4},
            "geodataset": dataset,
            "value_field": "avg_price_sqm",
        }

        research, created = Research.objects.get_or_create(
            slug="european-capital-property-markets",
            defaults=defaults,
        )
        status = "Created" if created else "Already exists"
        self.stdout.write(f"  {status}: {research.title}")

    def create_project(self):
        """Create a sample project."""
        self.stdout.write("Creating Project...")

        defaults = {
            "title": "European Property Market Dashboard",
            "description": (
                "Interactive dashboard for comparing residential property markets "
                "across European capitals using PostGIS and Mapbox."
            ),
            "content": (
                "A full-stack geospatial application combining Django, PostGIS, and "
                "Mapbox GL JS to visualize and analyze property market data across "
                "12 European capital cities."
            ),
            "category": "webapp",
            "status": "published",
            "technologies": ["Python", "Django", "PostGIS", "Mapbox GL JS", "Next.js"],
            "featured": True,
            "map_config": {"center": [10, 50], "zoom": 4},
        }

        project, created = Project.objects.get_or_create(
            slug="european-property-dashboard",
            defaults=defaults,
        )
        status = "Created" if created else "Already exists"
        self.stdout.write(f"  {status}: {project.title}")

    def create_blog_post(self):
        """Create sample blog posts covering all category types."""
        self.stdout.write("Creating Blog posts (all categories)...")

        defaults = {
            "title": "Why PostGIS Beats a Plain Postgres Index for Spatial Queries",
            "excerpt": (
                "If you are storing coordinates in Postgres and querying them with bounding boxes, "
                "you are probably leaving a lot of performance on the table. Here is what switching "
                "to PostGIS GiST indexes changed for me."
            ),
            "content": """## The problem

I had a Django app storing property coordinates as plain `FloatField` columns — `lat` and `lng`. Querying "all properties within this bounding box" meant:

```sql
SELECT * FROM properties
WHERE lat BETWEEN 52.30 AND 52.45
  AND lng BETWEEN 4.80 AND 5.02;
```

With a compound B-tree index on `(lat, lng)` this was fast enough at 10,000 rows. At 500,000 rows it started hurting. At 2 million rows it became unusable.

## What PostGIS adds

PostGIS extends Postgres with a `geometry` column type and a **GiST** (Generalized Search Tree) index that understands spatial relationships. Instead of two scalar comparisons, the database evaluates a single spatial predicate:

```sql
SELECT * FROM properties
WHERE ST_Within(location, ST_MakeEnvelope(4.80, 52.30, 5.02, 52.45, 4326));
```

The GiST index uses R-tree decomposition: it groups geometries into nested bounding boxes, so the planner can prune huge swaths of the table with a single comparison rather than scanning row-by-row.

## Benchmarks on my dataset

| Rows | B-tree (ms) | GiST (ms) | Speedup |
|------|-------------|-----------|---------|
| 10k  | 3           | 4         | —       |
| 100k | 28          | 6         | 4.7×    |
| 500k | 190         | 9         | 21×     |
| 2M   | 980         | 14        | 70×     |

The crossover point is somewhere around 50,000 rows. Below that, B-tree is competitive because its lower per-row overhead wins out.

## Setting it up in Django

```python
# models.py
from django.contrib.gis.db import models

class Property(models.Model):
    location = models.PointField(srid=4326)
    price_sqm = models.FloatField()
    # ...
```

```python
# In settings.py, add to INSTALLED_APPS:
"django.contrib.gis",

# And use the PostGIS backend:
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        ...
    }
}
```

Django's GeoDjango layer generates the `CREATE INDEX USING GIST` automatically on first migration.

## Querying from Django

```python
from django.contrib.gis.geos import Polygon

bbox = Polygon.from_bbox((4.80, 52.30, 5.02, 52.45))
properties = Property.objects.filter(location__within=bbox)
```

GeoDjango translates the `__within` lookup to `ST_Within` under the hood, using the GiST index automatically.

## Takeaway

If you are working with any spatial data at scale — property listings, POIs, vehicle tracks, sensor readings — PostGIS GiST indexes are not a nice-to-have. The 70× speedup at 2M rows is the difference between a usable product and one that needs a caching layer bolted on to hide a broken query plan.
""",
            "category": "thought",
            "status": "published",
            "tags": ["postgis", "django", "spatial", "performance", "database"],
            "read_time": "6 min",
            "date": "March 2026",
            "author": "Ian Ronk",
            "featured": True,
            "published_at": "2026-03-12T10:00:00Z",
        }

        post, created = BlogPost.objects.get_or_create(
            slug="postgis-gist-vs-btree",
            defaults=defaults,
        )
        status = "Created" if created else "Already exists"
        self.stdout.write(f"  {status}: {post.title}")

        # Dutch translation for the article
        if created:
            BlogPostTranslation.objects.get_or_create(
                post=post,
                language="nl",
                defaults={
                    "title": "Waarom PostGIS beter is dan een gewone Postgres-index voor ruimtelijke queries",
                    "slug": "postgis-gist-vs-btree-nl",
                    "excerpt": (
                        "Als je coördinaten opslaat in Postgres en queried met bounding boxes, "
                        "laat je waarschijnlijk veel prestaties liggen. Hier is wat het overstappen "
                        "naar PostGIS GiST-indexen voor mij veranderde."
                    ),
                    "content": "*(Volledige Nederlandse vertaling beschikbaar)*",
                },
            )
            self.stdout.write("  Created Dutch translation")

        # --- Tutorial ---
        tutorial, created = BlogPost.objects.get_or_create(
            slug="django-geojson-api-tutorial",
            defaults={
                "title": "Building a GeoJSON API with Django and GeoDjango",
                "excerpt": "Step-by-step guide to exposing PostGIS data as a GeoJSON endpoint using Django REST Framework and GeoDjango — ready to consume by Mapbox GL JS.",
                "content": """## Prerequisites

- Django 4.2+, Python 3.11+
- PostGIS database (see the docker-compose in this repo)
- `djangorestframework`, `django.contrib.gis`

## Step 1 — Install GeoDjango

Add to `INSTALLED_APPS`:

```python
"django.contrib.gis",
```

Switch the database backend:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        ...
    }
}
```

## Step 2 — Define a spatial model

```python
from django.contrib.gis.db import models

class Property(models.Model):
    address = models.CharField(max_length=255)
    price_sqm = models.FloatField()
    location = models.PointField(srid=4326)
```

## Step 3 — Serializer with GeoJSON output

```python
from rest_framework_gis.serializers import GeoFeatureModelSerializer

class PropertyGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Property
        geo_field = "location"
        fields = ["id", "address", "price_sqm"]
```

## Step 4 — View

```python
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

class PropertyGeoView(ListAPIView):
    serializer_class = PropertyGeoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Property.objects.all()
```

## Step 5 — Wire up and test

```bash
curl https://yourapp.com/api/properties/geo/ | python -m json.tool
```

The response is a valid `FeatureCollection` you can pass directly to `map.addSource()` in Mapbox GL JS.
""",
                "category": "explanation",
                "status": "published",
                "tags": ["django", "geojson", "mapbox", "geodjango", "tutorial"],
                "read_time": "10 min",
                "date": "February 2026",
                "author": "Ian Ronk",
                "featured": False,
                "published_at": "2026-02-10T09:00:00Z",
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Already exists'}: {tutorial.title}")

        # --- Note ---
        note, created = BlogPost.objects.get_or_create(
            slug="quick-note-srid-4326-vs-3857",
            defaults={
                "title": "Quick note: SRID 4326 vs 3857 — when it matters",
                "excerpt": "A two-minute explainer on which coordinate system to use and why mixing them silently gives you wrong distances.",
                "content": """**SRID 4326** is WGS 84 — degrees of latitude/longitude. It's what GPS gives you and what GeoJSON expects.

**SRID 3857** is Web Mercator — metres projected onto a flat surface. It's what Mapbox, Google Maps, and OpenStreetMap tiles use internally.

### The trap

If you store points in 4326 and call `ST_Distance` without transforming, Postgres returns degrees, not metres. `ST_Distance(a, b) < 0.01` does not mean "within 10 metres" — it means "within 0.01°", which is roughly 1 km near the equator and 500 m near Amsterdam.

### The fix

```sql
-- Returns metres
SELECT ST_Distance(
  ST_Transform(location, 3857),
  ST_Transform(ST_SetSRID(ST_MakePoint(4.90, 52.37), 4326), 3857)
)
FROM properties;
```

Or use `ST_DWithin` with `use_spheroid=true` on geography columns — it works in metres natively.

**Rule of thumb**: store in 4326 (universal), transform to 3857 for distance/area calculations, transform back to 4326 for GeoJSON output.
""",
                "category": "note",
                "status": "published",
                "tags": ["postgis", "coordinate-systems", "gis"],
                "read_time": "2 min",
                "date": "April 2026",
                "author": "Ian Ronk",
                "featured": False,
                "published_at": "2026-04-01T08:00:00Z",
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Already exists'}: {note.title}")

        # --- Announcement ---
        announcement, created = BlogPost.objects.get_or_create(
            slug="new-visualizations-section-live",
            defaults={
                "title": "New: Interactive Visualizations Section Now Live",
                "excerpt": "The visualizations gallery is now live — explore interactive spatial analyses of European property markets built with PostGIS and Mapbox GL JS.",
                "content": """I've just launched the visualizations section of this site. It's been a few months in the making and I'm happy to finally ship it.

## What's there

- **European Capital Property Prices** — a choropleth map comparing price/m² across 12 capitals
- **Amsterdam Housing Heatmap** — transaction density across Amsterdam neighbourhoods
- **Berlin Commercial Growth** — a time-series showing district-level commercial activity 2018–2024

Each visualization is backed by a live PostGIS database and rendered with Mapbox GL JS. Data updates weekly from public cadastral sources.

## What's coming

- Paris rental vs. ownership split (choropleth)
- Transit accessibility isochrones for Amsterdam
- Price trajectory forecasts using spatial regression

If there's a market or dataset you'd like to see, [get in touch](/contact).
""",
                "category": "update",
                "status": "published",
                "tags": ["announcement", "visualizations", "mapbox"],
                "read_time": "2 min",
                "date": "April 2026",
                "author": "Ian Ronk",
                "featured": True,
                "published_at": "2026-04-16T07:00:00Z",
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Already exists'}: {announcement.title}")

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
