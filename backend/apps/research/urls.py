"""
URL patterns for research, translations, and image uploads.
"""

from django.urls import path

from .views import (
    ImageUploadView,
    ResearchDetailView,
    ResearchListCreateView,
    ResearchTranslationView,
)

urlpatterns = [
    path("", ResearchListCreateView.as_view(), name="research_list"),
    path("upload-image/", ImageUploadView.as_view(), name="image_upload"),
    path("<slug:slug>/translations/", ResearchTranslationView.as_view(), name="research_translations"),
    path("<slug:slug>/", ResearchDetailView.as_view(), name="research_detail"),
]
