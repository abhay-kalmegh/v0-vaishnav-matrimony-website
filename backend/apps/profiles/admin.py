"""Admin registration for profiles models."""

from django.contrib import admin
from .models import Career, Education, FamilyDetails, Lifestyle, PartnerPreference, Profile, ProfilePhoto


class ProfilePhotoInline(admin.TabularInline):
    model = ProfilePhoto
    extra = 0


class EducationInline(admin.StackedInline):
    model = Education
    extra = 0


class CareerInline(admin.StackedInline):
    model = Career
    extra = 0


class FamilyDetailsInline(admin.StackedInline):
    model = FamilyDetails
    extra = 0


class LifestyleInline(admin.StackedInline):
    model = Lifestyle
    extra = 0


class PartnerPreferenceInline(admin.StackedInline):
    model = PartnerPreference
    extra = 0


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "date_of_birth", "current_city", "marital_status", "profile_completion", "is_approved"]
    list_filter = ["marital_status", "is_approved", "country", "state"]
    search_fields = ["user__first_name", "user__last_name", "user__mobile_number", "current_city"]
    inlines = [
        ProfilePhotoInline,
        EducationInline,
        CareerInline,
        FamilyDetailsInline,
        LifestyleInline,
        PartnerPreferenceInline,
    ]
