from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Research",
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
                ("abstract", models.TextField()),
                (
                    "content",
                    models.TextField(help_text="Markdown content for the article"),
                ),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("research", "Research"),
                            ("analysis", "Analysis"),
                            ("case-study", "Case Study"),
                            ("methodology", "Methodology"),
                            ("other", "Other"),
                        ],
                        default="research",
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
                ("tags", models.JSONField(default=list)),
                (
                    "read_time",
                    models.CharField(
                        blank=True, help_text="e.g., '15 min'", max_length=20
                    ),
                ),
                (
                    "date",
                    models.CharField(
                        blank=True,
                        help_text="Display date, e.g., 'January 2025'",
                        max_length=50,
                    ),
                ),
                ("has_map", models.BooleanField(default=False)),
                (
                    "map_config",
                    models.JSONField(
                        default=dict,
                        help_text="Map configuration: {center: [lng, lat], zoom: number, style: string}",
                    ),
                ),
                (
                    "geojson_data",
                    models.JSONField(
                        blank=True,
                        help_text="GeoJSON data for the article's map",
                        null=True,
                    ),
                ),
                ("is_premium", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name_plural": "Research",
                "db_table": "research",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Visualization",
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
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("heatmap", "Heatmap"),
                            ("choropleth", "Choropleth"),
                            ("scatter", "Scatter Plot"),
                            ("time-series", "Time Series"),
                            ("network", "Network"),
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
                (
                    "data_points",
                    models.CharField(
                        blank=True,
                        help_text="e.g., '45,000+ properties'",
                        max_length=100,
                    ),
                ),
                (
                    "region",
                    models.CharField(
                        blank=True, help_text="e.g., 'Amsterdam, NL'", max_length=100
                    ),
                ),
                ("date", models.CharField(blank=True, max_length=50)),
                (
                    "metrics",
                    models.JSONField(default=list, help_text="Key metrics to display"),
                ),
                (
                    "map_config",
                    models.JSONField(
                        default=dict,
                        help_text="Map configuration: {center: [lng, lat], zoom: number, style: string}",
                    ),
                ),
                (
                    "geojson_data",
                    models.JSONField(
                        blank=True,
                        help_text="GeoJSON data for the visualization",
                        null=True,
                    ),
                ),
                ("is_premium", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "visualizations",
                "ordering": ["-created_at"],
            },
        ),
    ]
