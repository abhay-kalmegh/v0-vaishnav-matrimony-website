"""Serializers for profiles app — full profile CRUD + nested data."""

from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.spirituality.serializers import SpiritualPracticeSerializer, SpiritualProfileSerializer
from .models import (
    Career,
    Education,
    FamilyDetails,
    Lifestyle,
    PartnerPreference,
    Profile,
    ProfilePhoto,
)


class ProfilePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilePhoto
        fields = ["id", "photo", "is_primary", "visibility", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["highest_qualification", "field_of_study", "institution_name"]


class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = [
            "occupation",
            "company_name",
            "employment_type",
            "annual_income_range",
            "work_location",
        ]


class FamilyDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyDetails
        fields = [
            "father_name",
            "father_occupation",
            "mother_name",
            "mother_occupation",
            "siblings_count",
            "family_type",
            "family_spiritual_background",
            "family_sampraday",
        ]


class LifestyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lifestyle
        fields = [
            "is_vegetarian",
            "onion_garlic",
            "alcohol",
            "smoking",
            "tea_coffee",
            "prasad_only_diet",
            "personality_type",
            "hobbies",
        ]


class PartnerPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerPreference
        fields = [
            "preferred_sampraday",
            "min_spiritual_level",
            "dietary_expectation",
            "temple_participation",
            "min_age",
            "max_age",
            "min_height_cm",
            "max_height_cm",
            "preferred_education",
            "preferred_location",
            "marital_status_preference",
            "willingness_to_relocate",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    """Full profile with all nested relations."""

    user = UserSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    education = EducationSerializer(required=False)
    career = CareerSerializer(required=False)
    family = FamilyDetailsSerializer(required=False)
    lifestyle = LifestyleSerializer(required=False)
    partner_preference = PartnerPreferenceSerializer(required=False)
    spiritual_profile = SpiritualProfileSerializer(required=False)
    spiritual_practices = SpiritualPracticeSerializer(required=False)
    photos = ProfilePhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "date_of_birth",
            "age",
            "height_cm",
            "weight_kg",
            "marital_status",
            "manglik_status",
            "blood_group",
            "about_me",
            "current_city",
            "permanent_address",
            "country",
            "state",
            "profile_completion",
            "is_approved",
            "education",
            "career",
            "family",
            "lifestyle",
            "partner_preference",
            "spiritual_profile",
            "spiritual_practices",
            "photos",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "profile_completion", "is_approved", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        """Handle nested updates for education, career, family, lifestyle, preferences."""
        from apps.spirituality.models import SpiritualPractice, SpiritualProfile
        nested_fields = {
            "education": (Education, EducationSerializer),
            "career": (Career, CareerSerializer),
            "family": (FamilyDetails, FamilyDetailsSerializer),
            "lifestyle": (Lifestyle, LifestyleSerializer),
            "partner_preference": (PartnerPreference, PartnerPreferenceSerializer),
            "spiritual_profile": (SpiritualProfile, SpiritualProfileSerializer),
            "spiritual_practices": (SpiritualPractice, SpiritualPracticeSerializer),
        }

        for field_name, (ModelClass, _SerializerClass) in nested_fields.items():
            nested_data = validated_data.pop(field_name, None)
            if nested_data is not None:
                obj, _created = ModelClass.objects.get_or_create(profile=instance)
                for attr, value in nested_data.items():
                    setattr(obj, attr, value)
                obj.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results / listing."""

    user = UserSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    primary_photo = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "age",
            "height_cm",
            "marital_status",
            "current_city",
            "state",
            "primary_photo",
            "profile_completion",
        ]

    def get_primary_photo(self, obj):
        photo = obj.photos.filter(is_primary=True).first()
        if photo:
            return ProfilePhotoSerializer(photo).data
        return None
