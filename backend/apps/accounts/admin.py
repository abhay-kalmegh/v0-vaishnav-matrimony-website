"""Admin registration for accounts models."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import OTPVerification, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["mobile_number", "first_name", "last_name", "role", "is_verified", "date_joined"]
    list_filter = ["role", "is_verified", "is_active", "gender"]
    search_fields = ["mobile_number", "first_name", "last_name", "email"]
    ordering = ["-date_joined"]
    fieldsets = (
        (None, {"fields": ("mobile_number", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email", "gender", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_verified")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("mobile_number", "first_name", "role", "password1", "password2")}),
    )


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ["mobile_number", "otp_code", "is_verified", "created_at", "expires_at"]
    list_filter = ["is_verified"]
    search_fields = ["mobile_number"]
