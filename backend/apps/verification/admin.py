from django.contrib import admin
from django.utils import timezone
from .models import ProfileVerification


@admin.register(ProfileVerification)
class ProfileVerificationAdmin(admin.ModelAdmin):
    list_display = ["profile", "document_type", "status", "submitted_at", "verified_at"]
    list_filter = ["status", "document_type"]
    search_fields = ["profile__user__first_name", "profile__user__mobile_number"]
    actions = ["approve_verification", "reject_verification"]

    def approve_verification(self, request, queryset):
        queryset.update(
            status=ProfileVerification.Status.APPROVED,
            verified_by=request.user,
            verified_at=timezone.now(),
        )
        # Also mark profile as approved
        for verification in queryset:
            verification.profile.is_approved = True
            verification.profile.save(update_fields=["is_approved"])
    approve_verification.short_description = "Approve selected verifications"

    def reject_verification(self, request, queryset):
        queryset.update(
            status=ProfileVerification.Status.REJECTED,
            verified_by=request.user,
            verified_at=timezone.now(),
        )
    reject_verification.short_description = "Reject selected verifications"
