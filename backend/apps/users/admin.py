"""
Admin configuration for User model.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import NewsletterSubscriber, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "is_admin", "is_active", "created_at"]
    list_filter = ["is_admin", "is_active", "is_staff"]
    search_fields = ["email", "username"]
    ordering = ["-created_at"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("is_admin",)}),
    )


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "locale", "source", "is_verified", "is_active", "subscribed_at")
    list_filter = ("locale", "source", "is_verified", "is_active")
    search_fields = ("email",)
    readonly_fields = ("subscribed_at", "ip_address", "user_agent")
