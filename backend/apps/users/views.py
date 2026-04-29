"""
Views for user authentication and management.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import NewsletterSubscriber, validate_serious_email
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    UserCreateSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new user. Requires authentication (admin only)."""

    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


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
        """Get client IP address from request."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


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
