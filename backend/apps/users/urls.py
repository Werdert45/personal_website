"""
URL patterns for user authentication.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    CheckSubscriptionView,
    LoginView,
    MapboxTokenView,
    MeView,
    NewsletterSubscribeView,
    RegisterView,
    VerifyMapAccessView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("mapbox-token/", MapboxTokenView.as_view(), name="mapbox_token"),
    # Newsletter subscription for map access
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), name="newsletter_subscribe"),
    path("newsletter/verify-access/", VerifyMapAccessView.as_view(), name="verify_map_access"),
    path("newsletter/check/", CheckSubscriptionView.as_view(), name="check_subscription"),
]
