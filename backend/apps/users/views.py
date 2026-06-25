"""
Views for user authentication and management.
"""

import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import NewsletterSubscriber, validate_serious_email
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    UserSerializer,
)

User = get_user_model()


def _client_ip(request):
    """Real client IP, honouring the trusted-proxy contract.

    When INTERNAL_PROXY_SECRET is configured and the request carries the matching
    x-internal-proxy-secret header, trust the leftmost x-forwarded-for value the
    proxy forwarded (the real client). Otherwise fall back to REMOTE_ADDR; never
    trust attacker-supplied XFF without a valid secret.
    """
    secret = os.environ.get("INTERNAL_PROXY_SECRET", "")
    if secret and request.META.get("HTTP_X_INTERNAL_PROXY_SECRET", "") == secret:
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class NewsletterRateThrottle(ScopedRateThrottle):
    """ScopedRateThrottle that buckets by the real client IP (proxy-aware).

    The scope ("newsletter") is taken from the view's `throttle_scope`; this
    subclass only changes the identity used for bucketing so the rate applies
    per real client rather than per proxy hop.
    """

    def get_ident(self, request):
        return _client_ip(request) or super().get_ident(request)


class LoginView(APIView):
    """Login with email/username and password."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        username = serializer.validated_data.get("username")
        password = serializer.validated_data["password"]

        # Find user by email or username
        user = None
        if email:
            user = User.objects.filter(email=email).first()
        elif username:
            user = User.objects.filter(username=username).first()

        if not user or not user.check_password(password):
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "Account is disabled"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change the current user's password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"message": "Password updated successfully"})


class MapboxTokenView(APIView):
    """Get the Mapbox access token."""

    permission_classes = [AllowAny]

    def get(self, request):
        token = settings.MAPBOX_ACCESS_TOKEN
        if not token:
            return Response(
                {"error": "Mapbox token not configured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"token": token})


class NewsletterSubscribeView(APIView):
    """Subscribe to the public newsletter."""

    permission_classes = [AllowAny]
    throttle_classes = [NewsletterRateThrottle]
    throttle_scope = "newsletter"

    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        locale = request.data.get("locale", "en")
        source = request.data.get("source", "other")

        # Validate email
        try:
            email = validate_serious_email(email)
        except ValidationError as e:
            return Response(
                {"error": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Coerce to allowed choices; silently fall back if a bad client sends garbage
        if locale not in dict(NewsletterSubscriber.LOCALE_CHOICES):
            locale = "en"
        if source not in dict(NewsletterSubscriber.SOURCE_CHOICES):
            source = "other"

        ip_address = self.get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

        subscriber = NewsletterSubscriber.objects.filter(email=email).first()

        if subscriber:
            if not subscriber.is_active:
                subscriber.is_active = True
                subscriber.unsubscribed_at = None
                subscriber.save(update_fields=["is_active", "unsubscribed_at"])
            # Existing subscriber: leave locale/source unchanged (preserve original signup context).
            # Idempotent 200 — do not reveal existence.
            return Response({"ok": True}, status=status.HTTP_200_OK)

        # New subscriber
        NewsletterSubscriber.objects.create(
            email=email,
            locale=locale,
            source=source,
            ip_address=ip_address,
            user_agent=user_agent,
            is_verified=True,  # Auto-verify until double-opt-in is wired
            verified_at=timezone.now(),
        )

        return Response({"ok": True}, status=status.HTTP_201_CREATED)

    def get_client_ip(self, request):
        """Get client IP address from request (proxy-aware, see _client_ip)."""
        return _client_ip(request)


class ValidateEmailView(APIView):
    """Public stateless email-quality check. No persistence side-effect.

    Accepts {"email": "..."}. Returns 200 {"valid": true} on pass,
    400 {"valid": false, "reason": "..."} on fail.
    Used by the Next.js contact route to silently drop spam submissions.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").lower().strip()
        try:
            validate_serious_email(email)
            return Response({"valid": True})
        except ValidationError as e:
            return Response(
                {"valid": False, "reason": getattr(e, "message", str(e))},
                status=status.HTTP_400_BAD_REQUEST,
            )
