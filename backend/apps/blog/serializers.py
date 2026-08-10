"""
Serializers for BlogPost and BlogPostTranslation.

Machine-facing fields follow ISO standards: `published_at` is the canonical
ISO 8601 datetime, `date_iso` / `read_time_iso` expose the display fields as
ISO 8601 date / duration, and writes accept ISO input for `date` (YYYY-MM or
YYYY-MM-DD) and `read_time` (PTnHnM), normalized to the stored display form.
Translation languages use ISO 639-1 codes.
"""

import re

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import BlogPost, BlogPostTranslation

ISO_DATE_RE = re.compile(r"^(\d{4})-(\d{2})(?:-(\d{2}))?$")
ISO_DURATION_RE = re.compile(r"^PT(?:(\d+)H)?(?:(\d+)M)?$")
READ_TIME_MINUTES_RE = re.compile(r"(\d+)\s*min", re.IGNORECASE)

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def display_date_from_iso(value):
    """'2026-03' or '2026-03-12' -> 'March 2026'; None if not ISO 8601."""
    match = ISO_DATE_RE.match(value.strip()) if value else None
    if not match:
        return None
    month = int(match.group(2))
    if not 1 <= month <= 12:
        return None
    return f"{MONTH_NAMES[month - 1]} {int(match.group(1))}"


def display_read_time_from_iso(value):
    """'PT6M' or 'PT1H30M' -> '6 min' / '90 min'; None if not an ISO duration."""
    match = ISO_DURATION_RE.match(value.strip()) if value else None
    if not match or not (match.group(1) or match.group(2)):
        return None
    minutes = int(match.group(1) or 0) * 60 + int(match.group(2) or 0)
    return f"{minutes} min"


class BlogPostTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostTranslation
        fields = [
            "id",
            "language",
            "title",
            "slug",
            "excerpt",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class IsoFieldsMixin(serializers.Serializer):
    """ISO 8601 views of the display fields, plus ISO input normalization."""

    date_iso = serializers.SerializerMethodField()
    read_time_iso = serializers.SerializerMethodField()

    @extend_schema_field(serializers.DateField(allow_null=True))
    def get_date_iso(self, obj):
        return obj.published_at.date().isoformat() if obj.published_at else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_read_time_iso(self, obj):
        match = READ_TIME_MINUTES_RE.search(obj.read_time or "")
        return f"PT{int(match.group(1))}M" if match else None

    def validate_date(self, value):
        return display_date_from_iso(value) or value

    def validate_read_time(self, value):
        return display_read_time_from_iso(value) or value


class BlogPostSerializer(IsoFieldsMixin, serializers.ModelSerializer):
    translations = BlogPostTranslationSerializer(many=True, read_only=True)
    cover_image = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "category",
            "status",
            "tags",
            "read_time",
            "read_time_iso",
            "date",
            "date_iso",
            "cover_image",
            "author",
            "featured",
            "is_premium",
            "published_at",
            "translations",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "date_iso", "read_time_iso", "created_at", "updated_at"]

    def validate_cover_image(self, value):
        return value or ""


class BlogPostListSerializer(IsoFieldsMixin, serializers.ModelSerializer):
    translations = BlogPostTranslationSerializer(many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "category",
            "status",
            "tags",
            "read_time",
            "read_time_iso",
            "date",
            "date_iso",
            "cover_image",
            "author",
            "featured",
            "is_premium",
            "published_at",
            "translations",
            "created_at",
        ]
