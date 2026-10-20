"""Serializers for accounts app — auth, OTP, user data."""

from rest_framework import serializers
from .models import User


class SendOTPSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=15)


class VerifyOTPSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=15)
    otp_code = serializers.CharField(max_length=6)


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "mobile_number",
            "email",
            "first_name",
            "last_name",
            "gender",
            "role",
        ]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "mobile_number",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "gender",
            "role",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "is_verified"]


class CurrentUserSerializer(UserSerializer):
    """The authenticated user's own record (adds onboarding state for the app).

    ``profile_completed`` drives the app's ProtectedRoute: a profile counts as
    complete once the user has filled in the "about me" text and height - the
    fields the app's profile editor collects.
    """

    profile_completed = serializers.SerializerMethodField()
    is_profile_complete = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ["profile_completed", "is_profile_complete"]

    def get_profile_completed(self, obj):
        profile = getattr(obj, "profile", None)  # RelatedObjectDoesNotExist is an AttributeError
        return bool(profile and profile.about_me and profile.height_cm)

    def get_is_profile_complete(self, obj):
        return self.get_profile_completed(obj)
