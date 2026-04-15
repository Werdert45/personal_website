from django.contrib import admin

from .models import BlogPost, BlogPostTranslation


class BlogPostTranslationInline(admin.StackedInline):
    model = BlogPostTranslation
    extra = 0


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "featured", "is_premium", "published_at", "created_at"]
    list_filter = ["status", "category", "featured", "is_premium"]
    search_fields = ["title", "excerpt", "content"]
    prepopulated_fields = {"slug": ("title",)}
    ordering = ["-published_at", "-created_at"]
    inlines = [BlogPostTranslationInline]
