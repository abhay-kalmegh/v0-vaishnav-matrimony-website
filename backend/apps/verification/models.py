"""Profile verification models — document upload and admin review."""

import uuid
from django.conf import settings
from django.db import models
from apps.profiles.models import Profile


class ProfileVerification(models.Model):
    """Document-based profile verification."""

    class DocType(models.TextChoices):
        AADHAAR = "aadhaar", "Aadhaar Card"
        PAN = "pan", "PAN Card"
        PASSPORT = "passport", "Passport"
        DRIVING_LICENSE = "driving_license", "Driving License"
        VOTER_ID = "voter_id", "Voter ID"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="verifications")
    document_type = models.CharField(max_length=20, choices=DocType.choices)
    document_front = models.ImageField(upload_to="verification_docs/%Y/%m/")
    document_back = models.ImageField(upload_to="verification_docs/%Y/%m/", blank=True, null=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="verified_documents"
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.profile.user.full_name} - {self.document_type} ({self.status})"
