"""Serializers for accounts app — auth, OTP, user data."""

import re

from rest_framework import serializers

from .models import User

MOBILE_RE = re.compile(r"^\+?[0-9]{10,14}$")
# Roles a member may hold. "admin" is assigned by staff only, never through the API.
SELF_SERVICE_ROLES = [User.Role.BRIDE, User.Role.GROOM, User.Role.PARENT]


def normalize_mobile(value: str) -> str:
    value = re.sub(r"[\s\-()]", "", value or "")
    if not MOBILE_RE.match(value):
        raise serializers.ValidationError("Enter a valid mobile number (10-14 digits).")
    # +91 98765 43210, 919876543210 and 09876543210 are all the same Indian number;
    # without this the same person could end up with several accounts.
    digits = value.lstrip("+")
    if len(digits) == 12 and digits.startswith("91"):
        return digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        return digits[1:]
    return value


class SendOTPSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=20)

    def validate_mobile_number(self, value):
        return normalize_mobile(value)


class VerifyOTPSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=20)
    otp_code = serializers.RegexField(r"^\d{6}$", max_length=6, error_messages={"invalid": "OTP must be 6 digits."})

    def validate_mobile_number(self, value):
        return normalize_mobile(value)


class UserSerializer(serializers.ModelSerializer):
    """The account owner's own view of their account (includes contact details)."""

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
        read_only_fields = ["id", "mobile_number", "date_joined", "is_verified"]


class PublicUserSerializer(serializers.ModelSerializer):
    """What *other* members may see: no phone number, no email."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "full_name", "gender", "is_verified"]
        read_only_fields = fields


class _AccountDetailsMixin:
    def validate_role(self, value):
        if value not in SELF_SERVICE_ROLES:
            current = getattr(self.instance, "role", None)
            if value != current:  # staff keep their existing role; nobody can grant it
                raise serializers.ValidationError("Invalid role.")
        return value

    def validate_email(self, value):
        if not value:
            return None
        qs = User.objects.filter(email__iexact=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()


class RegisterSerializer(_AccountDetailsMixin, serializers.ModelSerializer):
    """Account details collected in step 1 of onboarding (phone is already verified by OTP)."""

    first_name = serializers.CharField(max_length=100)
    gender = serializers.ChoiceField(choices=["male", "female"])
    role = serializers.ChoiceField(choices=[r.value for r in SELF_SERVICE_ROLES], required=False)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "gender", "role"]
        extra_kwargs = {"email": {"required": False, "allow_null": True, "allow_blank": True}}


class CurrentUserSerializer(_AccountDetailsMixin, UserSerializer):
    """The authenticated user's own record, plus onboarding state for the app."""

    profile_completed = serializers.SerializerMethodField()
    is_profile_complete = serializers.SerializerMethodField()
    profile_completion = serializers.SerializerMethodField()
    missing_profile_fields = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            "profile_completed",
            "is_profile_complete",
            "profile_completion",
            "missing_profile_fields",
        ]

    def _result(self, obj):
        from apps.profiles.completion import evaluate

        cache = self.context.setdefault("_completion", {})
        if obj.pk not in cache:
            profile = getattr(obj, "profile", None)
            cache[obj.pk] = evaluate(profile) if profile else evaluate(None)
        return cache[obj.pk]

    def get_profile_completed(self, obj):
        return self._result(obj).complete

    def get_is_profile_complete(self, obj):
        return self._result(obj).complete

    def get_profile_completion(self, obj):
        return self._result(obj).percent

    def get_missing_profile_fields(self, obj):
        return self._result(obj).missing
