"""
Management command to seed the database with sample data.
Creates a GeoJSON file and processes it through GeoProcessor into PostGIS.
"""

import io
import json
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand

from apps.geodata.models import GeoDataset, GeoFeature, GeoUploadedDataset
from apps.geodata.services.geo_processor import GeoProcessor
from apps.projects.models import Project
from apps.research.models import Research, Visualization


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
            Research.objects.all().delete()
            Visualization.objects.all().delete()
            GeoDataset.objects.all().delete()
            GeoUploadedDataset.objects.all().delete()
            Project.objects.all().delete()
            self.stdout.write(self.style.WARNING("All existing data deleted."))

        dataset = self.upload_geojson()
        self.create_research(dataset)
        self.create_visualization(dataset)
        self.create_project()
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

    def create_visualization(self, dataset):
        """Create a visualization linked to the uploaded PostGIS dataset."""
        self.stdout.write("Creating Visualization...")

        defaults = {
            "title": "European Capital Property Price Comparison",
            "description": (
                "Interactive map comparing residential property prices per square meter "
                "across 12 major European capital cities with market status indicators."
            ),
            "category": "choropleth",
            "status": "published",
            "technologies": ["PostGIS", "Mapbox GL JS", "Python", "Django"],
            "data_points": "12 capital cities",
            "region": "Europe",
            "date": "2025",
            "metrics": [
                {"label": "Cities", "value": "12"},
                {"label": "Avg Price/m2", "value": "5,854"},
                {"label": "Top Market", "value": "London"},
            ],
            "map_config": {"center": [10, 50], "zoom": 4},
            "geodataset": dataset,
            "value_field": "avg_price_sqm",
        }

        viz, created = Visualization.objects.get_or_create(
            slug="european-capital-prices",
            defaults=defaults,
        )
        status = "Created" if created else "Already exists"
        self.stdout.write(f"  {status}: {viz.title}")

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
            "category": "web",
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
