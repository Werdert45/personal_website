"""
Models for Blog posts and translations.
"""

from django.db import models


class BlogPost(models.Model):
    """Blog post with markdown content and optional translations."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]

    CATEGORY_CHOICES = [
        ("article", "Article"),
        ("tutorial", "Tutorial"),
        ("note", "Note"),
        ("announcement", "Announcement"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(blank=True, help_text="Short summary shown in listings")
    content = models.TextField(blank=True, help_text="Markdown content")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="article")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    tags = models.JSONField(default=list)

    read_time = models.CharField(max_length=20, blank=True, help_text="e.g., '5 min'")
    date = models.CharField(max_length=50, blank=True, help_text="Display date, e.g., 'March 2026'")

    cover_image = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="URL path for the cover/preview image",
    )

    author = models.CharField(max_length=100, blank=True, default="")
    featured = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "blog_post"
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title


class BlogPostTranslation(models.Model):
    """Translation of a BlogPost into another language."""

    LANGUAGE_CHOICES = [
        ("nl", "Dutch"),
        ("it", "Italian"),
    ]

    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE,
        related_name="translations",
    )
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES)
    title = models.CharField(max_length=255)
    slug = models.SlugField(blank=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text="Markdown content in the target language")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "blog_post_translation"
        unique_together = [("post", "language")]

    def __str__(self):
        return f"{self.post.title} ({self.get_language_display()})"
