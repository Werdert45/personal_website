"""
URL patterns for user authentication.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    LoginView,
    MapboxTokenView,
    MeView,
    NewsletterSubscribeView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("mapbox-token/", MapboxTokenView.as_view(), name="mapbox_token"),
    # Newsletter subscription
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), name="newsletter_subscribe"),
]
