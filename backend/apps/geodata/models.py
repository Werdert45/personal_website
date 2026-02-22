"""
Models for GeoData - stores GeoJSON datasets for visualizations and research.
"""

from django.db import models
from django.contrib.gis.db import models as gis_models


class GeoDataset(models.Model):
    """
    GeoJSON dataset model for storing map data.
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    # GeoJSON data
    geojson = models.JSONField(
        help_text="GeoJSON FeatureCollection data"
    )

    # Metadata
    region = models.CharField(max_length=100, blank=True, help_text="e.g., 'Amsterdam, NL'")
    data_source = models.CharField(max_length=255, blank=True, help_text="Source of the data")
    last_updated = models.DateField(null=True, blank=True, help_text="When the data was last updated")

    # Default map view settings
    default_center = models.JSONField(
        default=list,
        help_text="Default center coordinates [lng, lat]"
    )
    default_zoom = models.IntegerField(default=10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "geodatasets"
        ordering = ["name"]
        verbose_name = "GeoDataset"
        verbose_name_plural = "GeoDatasets"

    def __str__(self):
        return self.name


class GeoUploadedDataset(models.Model):
    """
    Represents an uploaded geospatial dataset stored in PostGIS.
    Supports GeoJSON, GeoPackage, and Shapefile uploads.
    """

    FILE_FORMAT_CHOICES = [
        ("geojson", "GeoJSON"),
        ("gpkg", "GeoPackage"),
        ("shp", "Shapefile"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    original_filename = models.CharField(max_length=255)
    file_format = models.CharField(max_length=20, choices=FILE_FORMAT_CHOICES)

    # Schema information
    available_fields = models.JSONField(
        default=list,
        help_text="List of field names available in the dataset"
    )
    field_types = models.JSONField(
        default=dict,
        help_text="Mapping of field names to their data types"
    )
    feature_count = models.IntegerField(default=0)

    # Bounding box for the dataset
    bounds = models.JSONField(
        null=True,
        blank=True,
        help_text="Bounding box [minx, miny, maxx, maxy]"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "geo_uploaded_datasets"
        ordering = ["-created_at"]
        verbose_name = "Uploaded GeoDataset"
        verbose_name_plural = "Uploaded GeoDatasets"

    def __str__(self):
        return f"{self.name} ({self.feature_count} features)"


class GeoFeature(models.Model):
    """
    Individual features from uploaded geospatial datasets.
    Uses PostGIS geometry field for spatial operations.
    """

    dataset = models.ForeignKey(
        GeoUploadedDataset,
        on_delete=models.CASCADE,
        related_name="features"
    )
    geometry = gis_models.GeometryField(srid=4326)
    properties = models.JSONField(
        default=dict,
        help_text="All attribute data from the original feature"
    )

    class Meta:
        db_table = "geo_features"
        indexes = [
            models.Index(fields=["dataset"]),
        ]
        verbose_name = "GeoFeature"
        verbose_name_plural = "GeoFeatures"

    def __str__(self):
        return f"Feature {self.id} from {self.dataset.name}"
