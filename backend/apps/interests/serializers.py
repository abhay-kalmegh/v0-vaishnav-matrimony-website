"""Serializers for interests app."""

from rest_framework import serializers
from apps.profiles.serializers import ProfileListSerializer
from .models import Interest, Shortlist


class InterestSerializer(serializers.ModelSerializer):
    sender_profile = ProfileListSerializer(source="sender", read_only=True)
    receiver_profile = ProfileListSerializer(source="receiver", read_only=True)

    class Meta:
        model = Interest
        fields = ["id", "sender", "receiver", "sender_profile", "receiver_profile", "status", "message", "sent_at", "responded_at"]
        read_only_fields = ["id", "sender", "status", "sent_at", "responded_at"]


class SendInterestSerializer(serializers.Serializer):
    receiver_id = serializers.UUIDField()
    message = serializers.CharField(max_length=500, required=False, default="")


class RespondInterestSerializer(serializers.Serializer):
    interest_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=["accepted", "rejected"])


class ShortlistSerializer(serializers.ModelSerializer):
    shortlisted = ProfileListSerializer(source="shortlisted_profile", read_only=True)

    class Meta:
        model = Shortlist
        fields = ["id", "shortlisted_profile", "shortlisted", "created_at"]
        read_only_fields = ["id", "created_at"]
