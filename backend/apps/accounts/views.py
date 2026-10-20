"""API views for authentication — OTP send/verify, JWT tokens, user info."""

from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPVerification, User
from .serializers import (
    RegisterSerializer,
    CurrentUserSerializer,
    SendOTPSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)


class SendOTPView(APIView):
    """Send OTP to a mobile number. Creates user if not exists."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data["mobile_number"]

        # Invalidate previous OTPs
        OTPVerification.objects.filter(
            mobile_number=mobile, is_verified=False
        ).delete()

        otp = OTPVerification(mobile_number=mobile)
        otp.save()

        # TODO: Integrate SMS gateway (Twilio / MSG91) to send OTP
        # For development, return OTP in response
        payload = {"message": "OTP sent successfully"}
        if settings.DEBUG:
            # Development convenience only. Never expose the OTP in production:
            # anyone could otherwise log in as any phone number.
            payload["otp"] = otp.otp_code
        return Response(payload, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """Verify OTP and return JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mobile = serializer.validated_data["mobile_number"]
        otp_code = serializer.validated_data["otp_code"]

        try:
            otp = OTPVerification.objects.filter(
                mobile_number=mobile,
                otp_code=otp_code,
                is_verified=False,
            ).latest("created_at")
        except OTPVerification.DoesNotExist:
            return Response(
                {"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST
            )

        if otp.is_expired:
            return Response(
                {"error": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST
            )

        otp.is_verified = True
        otp.save()

        # Get or create user
        user, created = User.objects.get_or_create(
            mobile_number=mobile,
            defaults={"first_name": "User"},
        )
        user.is_verified = True
        user.save(update_fields=["is_verified"])

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "OTP verified successfully",
                "is_new_user": created,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                "user": CurrentUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(generics.CreateAPIView):
    """Complete user registration and return JWT tokens."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_verified = True
        user.save(update_fields=["is_verified"])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "User registered successfully",
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                "user": CurrentUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update current authenticated user."""

    serializer_class = CurrentUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    """Invalidate the refresh token. The client also discards its tokens."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                pass  # already expired/invalid - nothing to revoke
        return Response({"message": "Logged out"}, status=status.HTTP_200_OK)
