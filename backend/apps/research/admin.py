"""
Admin configuration for Research and Visualization models.
"""

from django.contrib import admin

from .models import Research, Visualization


@admin.register(Research)
class ResearchAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "has_map", "is_premium", "created_at"]
    list_filter = ["status", "category", "has_map", "is_premium"]
    search_fields = ["title", "abstract"]
    prepopulated_fields = {"slug": ("title",)}
    ordering = ["-created_at"]


@admin.register(Visualization)
class VisualizationAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "region", "is_premium", "created_at"]
    list_filter = ["status", "category", "is_premium"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ("title",)}
    ordering = ["-created_at"]
