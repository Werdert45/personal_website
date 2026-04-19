"""
Admin configuration for Research.
"""

from django.contrib import admin

from .models import Research


@admin.register(Research)
class ResearchAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "has_map", "is_premium", "created_at"]
    list_filter = ["status", "category", "has_map", "is_premium"]
    search_fields = ["title", "abstract"]
    prepopulated_fields = {"slug": ("title",)}
    ordering = ["-created_at"]
