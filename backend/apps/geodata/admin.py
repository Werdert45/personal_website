from django.contrib import admin

from .models import GeoDataset


@admin.register(GeoDataset)
class GeoDatasetAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "region", "data_source", "created_at"]
    list_filter = ["region"]
    search_fields = ["name", "slug", "description"]
    prepopulated_fields = {"slug": ("name",)}
