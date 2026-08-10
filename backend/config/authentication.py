"""
Service-key authentication for programmatic content management.

Allows an automation client (e.g. an agent editing draft posts) to
authenticate with a static key instead of the interactive JWT flow:

    X-API-Key: <value of CONTENT_API_KEY>

The key is configured via the CONTENT_API_KEY environment variable on the
host. When the variable is unset, this class is inert and requests fall
through to JWT authentication unchanged.
"""

import hmac

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

SERVICE_ACCOUNT_USERNAME = "content-agent"


class ContentApiKeyAuthentication(BaseAuthentication):
    """Authenticate write access via a constant-time X-API-Key comparison."""

    def authenticate(self, request):
        provided = request.headers.get("X-API-Key")
        if not provided:
            return None

        configured = getattr(settings, "CONTENT_API_KEY", "")
        if not configured:
            # Key auth disabled on this host; never match against an empty key.
            raise AuthenticationFailed("API key authentication is not enabled.")

        if not hmac.compare_digest(provided, configured):
            raise AuthenticationFailed("Invalid API key.")

        user, created = get_user_model().objects.get_or_create(
            username=SERVICE_ACCOUNT_USERNAME,
            defaults={"is_active": True},
        )
        if created:
            user.set_unusable_password()
            user.save(update_fields=["password"])
        return (user, None)

    def authenticate_header(self, request):
        return "Api-Key"
