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

    def validate_shortlisted_profile(self, profile):
        request = self.context.get("request")
        if request is not None and profile.user_id == request.user.id:
            raise serializers.ValidationError("You cannot shortlist your own profile.")
        if not profile.is_approved:
            raise serializers.ValidationError("This profile is not available.")
        return profile

    def validate(self, attrs):
        request = self.context.get("request")
        if request is not None and self.instance is None:
            if Shortlist.objects.filter(
                profile=request.user.profile, shortlisted_profile=attrs["shortlisted_profile"]
            ).exists():
                raise serializers.ValidationError({"error": "Already in your shortlist."})
        return attrs
