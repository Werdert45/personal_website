"""
URL patterns for research, translations, visualizations, and image uploads.
"""

from django.urls import path

from .views import (
    ImageUploadView,
    ResearchDetailView,
    ResearchListCreateView,
    ResearchTranslationView,
    VisualizationDetailView,
    VisualizationListCreateView,
)

urlpatterns = [
    path("", ResearchListCreateView.as_view(), name="research_list"),
    path("upload-image/", ImageUploadView.as_view(), name="image_upload"),
    path("visualizations/", VisualizationListCreateView.as_view(), name="visualization_list"),
    path("visualizations/<slug:slug>/", VisualizationDetailView.as_view(), name="visualization_detail"),
    path("<slug:slug>/translations/", ResearchTranslationView.as_view(), name="research_translations"),
    path("<slug:slug>/", ResearchDetailView.as_view(), name="research_detail"),
]
