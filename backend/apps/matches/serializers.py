"""Serializers for matches app."""

from rest_framework import serializers
from apps.profiles.serializers import ProfileListSerializer
from .models import MatchSuggestion


class MatchSuggestionSerializer(serializers.ModelSerializer):
    matched_profile = serializers.SerializerMethodField()

    class Meta:
        model = MatchSuggestion
        fields = [
            "id",
            "matched_profile",
            "compatibility_score",
            "spiritual_score",
            "lifestyle_score",
            "family_score",
            "education_score",
            "generated_at",
        ]

    def get_matched_profile(self, obj):
        request_user_profile = self.context["request"].user.profile
        other_profile = obj.profile_2 if obj.profile_1 == request_user_profile else obj.profile_1
        return ProfileListSerializer(other_profile, context=self.context).data
