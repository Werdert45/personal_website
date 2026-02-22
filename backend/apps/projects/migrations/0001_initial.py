from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Project",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(unique=True)),
                ("description", models.TextField()),
                ("content", models.TextField(blank=True)),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("web", "Web Development"),
                            ("data", "Data Analysis"),
                            ("gis", "GIS/Mapping"),
                            ("ml", "Machine Learning"),
                            ("other", "Other"),
                        ],
                        default="other",
                        max_length=50,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("published", "Published"),
                            ("archived", "Archived"),
                        ],
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("technologies", models.JSONField(default=list)),
                ("image_url", models.URLField(blank=True)),
                ("demo_url", models.URLField(blank=True)),
                ("github_url", models.URLField(blank=True)),
                ("featured", models.BooleanField(default=False)),
                (
                    "map_config",
                    models.JSONField(
                        default=dict,
                        help_text="Map configuration: {center: [lng, lat], zoom: number, style: string}",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "projects",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Layer",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                (
                    "layer_type",
                    models.CharField(
                        choices=[
                            ("geojson", "GeoJSON"),
                            ("postgis", "PostGIS"),
                            ("tileset", "Tileset"),
                            ("raster", "Raster"),
                        ],
                        default="geojson",
                        max_length=20,
                    ),
                ),
                (
                    "source",
                    models.CharField(
                        blank=True, help_text="URL or table name", max_length=255
                    ),
                ),
                (
                    "table_name",
                    models.CharField(
                        blank=True, help_text="PostGIS table name", max_length=255
                    ),
                ),
                ("geojson_data", models.JSONField(blank=True, null=True)),
                (
                    "style",
                    models.JSONField(
                        default=dict, help_text="Mapbox GL style specification"
                    ),
                ),
                ("visible", models.BooleanField(default=True)),
                ("min_zoom", models.IntegerField(default=0)),
                ("max_zoom", models.IntegerField(default=22)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "project",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="layers",
                        to="projects.project",
                    ),
                ),
            ],
            options={
                "db_table": "layers",
                "ordering": ["name"],
            },
        ),
    ]
