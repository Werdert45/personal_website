"""
Serializers for BlogPost and BlogPostTranslation.
"""

from rest_framework import serializers

from .models import BlogPost, BlogPostTranslation


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


class BlogPostSerializer(serializers.ModelSerializer):
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
            "date",
            "cover_image",
            "author",
            "featured",
            "is_premium",
            "published_at",
            "translations",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_cover_image(self, value):
        return value or ""


class BlogPostListSerializer(serializers.ModelSerializer):
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
            "date",
            "cover_image",
            "author",
            "featured",
            "is_premium",
            "published_at",
            "translations",
            "created_at",
        ]
