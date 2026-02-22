"""
URL patterns for projects and layers.
"""

from django.urls import path

from .views import (
    LayerDetailView,
    LayerListCreateView,
    ProjectDetailView,
    ProjectListCreateView,
)

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project_list"),
    path("<slug:slug>/", ProjectDetailView.as_view(), name="project_detail"),
    path("layers/", LayerListCreateView.as_view(), name="layer_list"),
    path("layers/<int:pk>/", LayerDetailView.as_view(), name="layer_detail"),
]
