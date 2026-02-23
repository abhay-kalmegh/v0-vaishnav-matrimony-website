"""Serializers for verification app."""

from rest_framework import serializers
from .models import ProfileVerification


class ProfileVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileVerification
        fields = [
            "id", "document_type", "document_front", "document_back",
            "status", "rejection_reason", "submitted_at", "verified_at",
        ]
        read_only_fields = ["id", "status", "rejection_reason", "submitted_at", "verified_at"]
