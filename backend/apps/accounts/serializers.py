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
