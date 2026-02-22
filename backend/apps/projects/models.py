"""
Models for Projects and Map Layers.
"""

from django.db import models


class Project(models.Model):
    """
    Project model for portfolio items.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]

    CATEGORY_CHOICES = [
        ("web", "Web Development"),
        ("data", "Data Analysis"),
        ("gis", "GIS/Mapping"),
        ("ml", "Machine Learning"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    content = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    technologies = models.JSONField(default=list)
    image_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)

    # Map configuration
    map_config = models.JSONField(
        default=dict,
        help_text="Map configuration: {center: [lng, lat], zoom: number, style: string}",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Layer(models.Model):
    """
    Map layer model for GeoJSON and PostGIS data.
    """

    LAYER_TYPES = [
        ("geojson", "GeoJSON"),
        ("postgis", "PostGIS"),
        ("tileset", "Tileset"),
        ("raster", "Raster"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    layer_type = models.CharField(max_length=20, choices=LAYER_TYPES, default="geojson")

    # Source configuration
    source = models.CharField(max_length=255, blank=True, help_text="URL or table name")
    table_name = models.CharField(max_length=255, blank=True, help_text="PostGIS table name")

    # GeoJSON data (for static layers)
    geojson_data = models.JSONField(null=True, blank=True)

    # Layer styling
    style = models.JSONField(default=dict, help_text="Mapbox GL style specification")

    # Display options
    visible = models.BooleanField(default=True)
    min_zoom = models.IntegerField(default=0)
    max_zoom = models.IntegerField(default=22)

    # Relations
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="layers",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "layers"
        ordering = ["name"]

    def __str__(self):
        return self.name
