"""API views for authentication — OTP send/verify, JWT tokens, user info."""

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPVerification, User
from .serializers import (
    RegisterSerializer,
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
        return Response(
            {
                "message": "OTP sent successfully",
                "otp": otp.otp_code if True else None,  # Remove in production
            },
            status=status.HTTP_200_OK,
        )


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
                "user": UserSerializer(user).data,
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
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update current authenticated user."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
