"""
Serializers for Research and ResearchTranslation models.
"""

from rest_framework import serializers

from .models import Research, ResearchTranslation


class ResearchTranslationSerializer(serializers.ModelSerializer):
    """Serializer for ResearchTranslation model."""

    class Meta:
        model = ResearchTranslation
        fields = [
            "id",
            "language",
            "title",
            "slug",
            "abstract",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ResearchSerializer(serializers.ModelSerializer):
    """Serializer for Research model."""

    geodataset_id = serializers.IntegerField(
        source="geodataset.id",
        read_only=True,
        allow_null=True,
    )
    translations = ResearchTranslationSerializer(many=True, read_only=True)
    preview_image = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")
    value_field = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")

    class Meta:
        model = Research
        fields = [
            "id",
            "title",
            "slug",
            "abstract",
            "content",
            "category",
            "status",
            "tags",
            "read_time",
            "date",
            "has_map",
            "map_config",
            "geojson_endpoint",
            "geojson_data",
            "geodataset",
            "geodataset_id",
            "value_field",
            "is_premium",
            "pdf_file",
            "preview_image",
            "translations",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "geodataset_id"]

    def validate_preview_image(self, value):
        return value or ""

    def validate_value_field(self, value):
        return value or ""


class ResearchListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for research listings."""

    geodataset_id = serializers.IntegerField(
        source="geodataset.id",
        read_only=True,
        allow_null=True,
    )
    translations = ResearchTranslationSerializer(many=True, read_only=True)

    class Meta:
        model = Research
        fields = [
            "id",
            "title",
            "slug",
            "abstract",
            "category",
            "status",
            "tags",
            "read_time",
            "date",
            "has_map",
            "geodataset_id",
            "value_field",
            "is_premium",
            "pdf_file",
            "preview_image",
            "translations",
            "created_at",
        ]


class ImageUploadSerializer(serializers.Serializer):
    """Serializer for content image uploads."""

    image = serializers.ImageField()
