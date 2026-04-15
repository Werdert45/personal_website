"""
URL patterns for blog posts and translations.
"""

from django.urls import path

from .views import (
    BlogPostDetailView,
    BlogPostListCreateView,
    BlogPostTranslationView,
)

urlpatterns = [
    path("", BlogPostListCreateView.as_view(), name="blogpost_list"),
    path("<slug:slug>/translations/", BlogPostTranslationView.as_view(), name="blogpost_translations"),
    path("<slug:slug>/", BlogPostDetailView.as_view(), name="blogpost_detail"),
]
