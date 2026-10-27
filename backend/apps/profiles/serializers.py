"""Serializers for profiles app — full profile CRUD + nested data."""

from rest_framework import serializers
from datetime import date

from apps.accounts.serializers import PublicUserSerializer, UserSerializer
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
    missing_fields = serializers.SerializerMethodField()

    def get_missing_fields(self, obj):
        from .completion import evaluate

        return evaluate(obj).missing

    def validate_date_of_birth(self, value):
        if value is None:
            return value
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if value > today:
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old.")
        if age > 100:
            raise serializers.ValidationError("Enter a valid date of birth.")
        return value

    def validate_height_cm(self, value):
        if value is not None and not 100 <= value <= 250:
            raise serializers.ValidationError("Height must be between 100 and 250 cm.")
        return value

    def validate_weight_kg(self, value):
        if value is not None and not 25 <= value <= 250:
            raise serializers.ValidationError("Weight must be between 25 and 250 kg.")
        return value

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
            "missing_fields",
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

        from .completion import refresh

        refresh(instance)
        return instance


class PublicFamilySerializer(FamilyDetailsSerializer):
    """Family info shown to other members: parents' names stay private."""

    class Meta(FamilyDetailsSerializer.Meta):
        fields = [f for f in FamilyDetailsSerializer.Meta.fields if f not in ("father_name", "mother_name")]


class PublicProfileSerializer(ProfileSerializer):
    """Another member's profile: no contact details, address, parents' names or private photos."""

    user = PublicUserSerializer(read_only=True)
    family = PublicFamilySerializer(read_only=True)
    photos = serializers.SerializerMethodField()

    class Meta(ProfileSerializer.Meta):
        fields = [
            f for f in ProfileSerializer.Meta.fields
            if f not in ("permanent_address", "missing_fields", "is_approved")
        ]
        read_only_fields = fields

    def get_photos(self, obj):
        visible = ["public"]
        if self.context.get("is_connected"):
            visible.append("matches_only")
        qs = [p for p in obj.photos.all() if p.visibility in visible]
        return ProfilePhotoSerializer(qs, many=True, context=self.context).data


class ProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results / listing."""

    user = PublicUserSerializer(read_only=True)  # never expose phone/email in lists
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
        photo = next(
            (p for p in obj.photos.all() if p.is_primary and p.visibility == "public"), None
        )
        if photo:
            return ProfilePhotoSerializer(photo).data
        return None
