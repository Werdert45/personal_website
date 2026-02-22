"""
Views for user authentication and management.
"""

import secrets
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

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
    """Subscribe to newsletter to gain map access."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()

        # Validate email
        try:
            email = validate_serious_email(email)
        except ValidationError as e:
            return Response(
                {"error": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get client info for tracking
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

        # Check if already subscribed
        subscriber = NewsletterSubscriber.objects.filter(email=email).first()

        if subscriber:
            if subscriber.is_active:
                # Already subscribed - generate new access token
                subscriber.verification_token = secrets.token_urlsafe(32)
                subscriber.save(update_fields=["verification_token"])
                return Response({
                    "message": "Welcome back! You already have access.",
                    "access_token": subscriber.verification_token,
                    "is_business_email": subscriber.is_business_email,
                })
            else:
                # Reactivate subscription
                subscriber.is_active = True
                subscriber.unsubscribed_at = None
                subscriber.verification_token = secrets.token_urlsafe(32)
                subscriber.save()
                return Response({
                    "message": "Your subscription has been reactivated!",
                    "access_token": subscriber.verification_token,
                    "is_business_email": subscriber.is_business_email,
                })

        # Create new subscriber
        verification_token = secrets.token_urlsafe(32)
        subscriber = NewsletterSubscriber.objects.create(
            email=email,
            verification_token=verification_token,
            ip_address=ip_address,
            user_agent=user_agent,
            is_verified=True,  # Auto-verify for now
            verified_at=timezone.now(),
        )

        return Response({
            "message": "Successfully subscribed! You now have access to all maps.",
            "access_token": subscriber.verification_token,
            "is_business_email": subscriber.is_business_email,
        }, status=status.HTTP_201_CREATED)

    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class VerifyMapAccessView(APIView):
    """Verify if a user has map access via their access token."""

    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token", "")
        email = request.data.get("email", "").lower().strip()

        if not access_token and not email:
            return Response(
                {"error": "Access token or email required", "has_access": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find subscriber by token or email
        subscriber = None
        if access_token:
            subscriber = NewsletterSubscriber.objects.filter(
                verification_token=access_token,
                is_active=True
            ).first()
        elif email:
            subscriber = NewsletterSubscriber.objects.filter(
                email=email,
                is_active=True
            ).first()

        if not subscriber:
            return Response({
                "has_access": False,
                "error": "No active subscription found. Please subscribe to view maps."
            })

        # Check rate limiting
        can_access, error_message = subscriber.can_access_map()
        if not can_access:
            return Response({
                "has_access": False,
                "error": error_message,
                "rate_limited": True,
            })

        # Record access and return success
        subscriber.record_map_access()

        return Response({
            "has_access": True,
            "access_token": subscriber.verification_token,
            "is_business_email": subscriber.is_business_email,
            "access_count": subscriber.access_count,
            "hourly_remaining": subscriber.get_hourly_remaining(),
        })


class CheckSubscriptionView(APIView):
    """Check subscription status without recording access."""

    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get("email", "").lower().strip()
        access_token = request.query_params.get("token", "")

        if not email and not access_token:
            return Response({
                "subscribed": False,
            })

        subscriber = None
        if access_token:
            subscriber = NewsletterSubscriber.objects.filter(
                verification_token=access_token,
                is_active=True
            ).first()
        elif email:
            subscriber = NewsletterSubscriber.objects.filter(
                email=email,
                is_active=True
            ).first()

        if subscriber:
            return Response({
                "subscribed": True,
                "access_token": subscriber.verification_token,
                "is_business_email": subscriber.is_business_email,
                "hourly_remaining": subscriber.get_hourly_remaining(),
            })

        return Response({
            "subscribed": False,
        })
