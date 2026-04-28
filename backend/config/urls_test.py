"""
URL configuration for testing — only includes apps.users (no GDAL dependency).
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
]
