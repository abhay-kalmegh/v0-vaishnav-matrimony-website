"""Serializers for events app."""

from rest_framework import serializers
from .models import Event, EventRegistration


class EventSerializer(serializers.ModelSerializer):
    registration_count = serializers.ReadOnlyField()
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "event_type", "location",
            "event_date", "end_date", "organizer", "banner_image",
            "max_participants", "registration_count", "is_registered",
            "is_active", "created_at",
        ]

    def get_is_registered(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            try:
                return obj.registrations.filter(profile=request.user.profile).exists()
            except Exception:
                return False
        return False


class EventRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source="event.title")

    class Meta:
        model = EventRegistration
        fields = ["id", "event", "event_title", "status", "registered_at"]
        read_only_fields = ["id", "status", "registered_at"]
