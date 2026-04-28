"""
Test settings — swaps PostGIS/GeoDjango for SQLite so tests run without GDAL.
"""

from .settings import *  # noqa: F401, F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    # Local apps: only users needed for newsletter tests
    # (research imports apps.geodata which requires GDAL; excluded here)
    "apps.users",
]

ROOT_URLCONF = "config.urls_test"

# Strip whitenoise from middleware — not installed in this conda env
MIDDLEWARE = [m for m in MIDDLEWARE if "whitenoise" not in m.lower()]  # noqa: F405

# Silence drf_spectacular if not installed in test env
try:
    import drf_spectacular  # noqa: F401
except ImportError:
    REST_FRAMEWORK = {k: v for k, v in REST_FRAMEWORK.items() if k != "DEFAULT_SCHEMA_CLASS"}  # noqa: F405
