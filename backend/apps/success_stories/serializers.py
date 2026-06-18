"""Serializers for success stories app."""

from rest_framework import serializers
from .models import SuccessStory


class SuccessStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuccessStory
        fields = [
            "id", "bride_name", "groom_name", "story_text",
            "marriage_date", "photo", "sampraday", "location",
            "is_published", "published_at", "created_at",
        ]
        read_only_fields = ["id", "is_published", "published_at", "created_at"]
