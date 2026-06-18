"""Serializers for spirituality app."""

from rest_framework import serializers
from .models import Guru, Sampraday, SpiritualPractice, SpiritualProfile


class SampradaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Sampraday
        fields = ["id", "name", "description"]


class GuruSerializer(serializers.ModelSerializer):
    sampraday_name = serializers.ReadOnlyField(source="sampraday.name")

    class Meta:
        model = Guru
        fields = ["id", "name", "sampraday", "sampraday_name", "temple_name", "location"]


class SpiritualPracticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpiritualPractice
        fields = [
            "chants_mala",
            "mala_rounds_daily",
            "follows_ekadashi",
            "performs_daily_puja",
            "reads_scriptures",
            "attends_temple_regularly",
            "seva_involvement",
            "celebrates_janmashtami",
            "participates_rath_yatra",
            "bhajan_kirtan_participation",
            "overall_level",
        ]


class SpiritualProfileSerializer(serializers.ModelSerializer):
    sampraday_name = serializers.ReadOnlyField(source="sampraday.name")
    guru_name = serializers.ReadOnlyField(source="guru.name")

    class Meta:
        model = SpiritualProfile
        fields = [
            "sampraday",
            "sampraday_name",
            "guru",
            "guru_name",
            "is_initiated",
            "years_in_devotion",
            "temple_association",
            "spiritual_organization",
        ]
