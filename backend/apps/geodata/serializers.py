"""
Serializers for GeoData.
"""

from rest_framework import serializers

from .models import GeoDataset, GeoUploadedDataset


class GeoDatasetListSerializer(serializers.ModelSerializer):
    """Serializer for listing geodatasets (without full geojson)."""

    class Meta:
        model = GeoDataset
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "region",
            "data_source",
            "last_updated",
            "default_center",
            "default_zoom",
            "created_at",
        ]


class GeoDatasetSerializer(serializers.ModelSerializer):
    """Full serializer for geodataset including geojson data."""

    class Meta:
        model = GeoDataset
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "geojson",
            "region",
            "data_source",
            "last_updated",
            "default_center",
            "default_zoom",
            "created_at",
            "updated_at",
        ]


class GeoJSONSerializer(serializers.ModelSerializer):
    """Serializer that returns only the GeoJSON data."""

    class Meta:
        model = GeoDataset
        fields = ["geojson"]

    def to_representation(self, instance):
        """Return just the GeoJSON data directly."""
        return instance.geojson


# Serializers for uploaded PostGIS datasets


class GeoUploadedDatasetListSerializer(serializers.ModelSerializer):
    """Serializer for listing uploaded geodatasets."""

    class Meta:
        model = GeoUploadedDataset
        fields = [
            "id",
            "name",
            "description",
            "original_filename",
            "file_format",
            "available_fields",
            "field_types",
            "feature_count",
            "bounds",
            "created_at",
        ]


class GeoUploadedDatasetDetailSerializer(serializers.ModelSerializer):
    """Full serializer for uploaded geodataset."""

    class Meta:
        model = GeoUploadedDataset
        fields = [
            "id",
            "name",
            "description",
            "original_filename",
            "file_format",
            "available_fields",
            "field_types",
            "feature_count",
            "bounds",
            "created_at",
            "updated_at",
        ]


class GeoFileUploadSerializer(serializers.Serializer):
    """Serializer for file upload requests."""

    file = serializers.FileField(required=True)
    name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_file(self, value):
        """Validate the uploaded file."""
        allowed_extensions = [".geojson", ".json", ".gpkg", ".shp", ".zip"]
        ext = "." + value.name.split(".")[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
            )
        return value


class GeoUploadResponseSerializer(serializers.Serializer):
    """Serializer for upload response."""

    dataset_id = serializers.IntegerField()
    name = serializers.CharField()
    file_format = serializers.CharField()
    feature_count = serializers.IntegerField()
    available_fields = serializers.ListField(child=serializers.CharField())
    field_types = serializers.DictField()
    bounds = serializers.ListField(child=serializers.FloatField(), allow_null=True)
