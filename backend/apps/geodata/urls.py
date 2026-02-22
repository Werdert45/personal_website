"""
URL patterns for geodata.
"""

from django.urls import path

from .views import (
    GeoDatasetDetailView,
    GeoDatasetListCreateView,
    GeoFileUploadView,
    GeoJSONView,
    GeoUploadedDatasetDetailView,
    GeoUploadedDatasetGeoJSONView,
    GeoUploadedDatasetListView,
)

urlpatterns = [
    # Uploaded PostGIS dataset endpoints (must come before slug patterns)
    path("upload/", GeoFileUploadView.as_view(), name="geo_file_upload"),
    path("datasets/", GeoUploadedDatasetListView.as_view(), name="uploaded_dataset_list"),
    path("datasets/<int:pk>/", GeoUploadedDatasetDetailView.as_view(), name="uploaded_dataset_detail"),
    path("datasets/<int:pk>/geojson/", GeoUploadedDatasetGeoJSONView.as_view(), name="uploaded_dataset_geojson"),

    # Original GeoDataset endpoints (JSON-based) - slug patterns last
    path("", GeoDatasetListCreateView.as_view(), name="geodataset_list"),
    path("<slug:slug>/", GeoDatasetDetailView.as_view(), name="geodataset_detail"),
    path("<slug:slug>/geojson/", GeoJSONView.as_view(), name="geodataset_geojson"),
]
