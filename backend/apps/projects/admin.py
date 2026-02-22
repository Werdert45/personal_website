"""
Admin configuration for Project and Layer models.
"""

from django.contrib import admin

from .models import Layer, Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "featured", "created_at"]
    list_filter = ["status", "category", "featured"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ("title",)}
    ordering = ["-created_at"]


@admin.register(Layer)
class LayerAdmin(admin.ModelAdmin):
    list_display = ["name", "layer_type", "project", "visible", "created_at"]
    list_filter = ["layer_type", "visible"]
    search_fields = ["name", "description"]
    ordering = ["name"]
