"""
Serializers for Project and Layer models.
"""

from rest_framework import serializers

from .models import Layer, Project


class LayerSerializer(serializers.ModelSerializer):
    """Serializer for Layer model."""

    class Meta:
        model = Layer
        fields = [
            "id",
            "name",
            "description",
            "layer_type",
            "source",
            "table_name",
            "geojson_data",
            "style",
            "visible",
            "min_zoom",
            "max_zoom",
            "project",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""

    layers = LayerSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "content",
            "category",
            "status",
            "technologies",
            "image_url",
            "demo_url",
            "github_url",
            "featured",
            "map_config",
            "layers",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project listings."""

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "category",
            "status",
            "technologies",
            "image_url",
            "featured",
            "created_at",
        ]
