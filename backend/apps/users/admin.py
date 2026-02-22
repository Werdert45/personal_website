"""
Admin configuration for User model.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "is_admin", "is_active", "created_at"]
    list_filter = ["is_admin", "is_active", "is_staff"]
    search_fields = ["email", "username"]
    ordering = ["-created_at"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("is_admin",)}),
    )
