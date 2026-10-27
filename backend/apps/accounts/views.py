"""API views for authentication — OTP send/verify, JWT tokens, user info."""

import hmac
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPVerification, User
from .serializers import (
    RegisterSerializer,
    CurrentUserSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
)


def _too_many(message, retry_after=None):
    body = {"error": message}
    if retry_after is not None:
        body["retry_after"] = int(retry_after)
    resp = Response(body, status=status.HTTP_429_TOO_MANY_REQUESTS)
    if retry_after is not None:
        resp["Retry-After"] = str(int(retry_after))
    return resp


class SendOTPView(APIView):
    """Send an OTP to a mobile number (rate limited per IP and per number)."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp_send"

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data["mobile_number"]
        now = timezone.now()

        last_hour = OTPVerification.objects.filter(
            mobile_number=mobile, created_at__gte=now - timedelta(hours=1)
        )
        if last_hour.count() >= settings.OTP_MAX_SENDS_PER_HOUR:
            return _too_many("Too many OTP requests for this number. Try again later.", 3600)
        latest = last_hour.order_by("-created_at").first()
        if latest:
            wait = settings.OTP_RESEND_COOLDOWN_SECONDS - (now - latest.created_at).total_seconds()
            if wait > 0:
                return _too_many(f"Please wait {int(wait) + 1}s before requesting another OTP.", wait + 1)

        # Burn earlier codes (rows are kept so the hourly cap can count them).
        OTPVerification.objects.filter(mobile_number=mobile, is_verified=False).update(expires_at=now)

        otp = OTPVerification(mobile_number=mobile)
        otp.save()

        # TODO(production): deliver via an SMS gateway (MSG91/Twilio). Until one is
        # configured, a non-DEBUG deployment can issue codes nobody can receive.
        payload = {"message": "OTP sent successfully"}
        if settings.DEBUG:
            # Development convenience only - exposing this in production would let
            # anyone log in as any phone number.
            payload["otp"] = otp.otp_code
        return Response(payload, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """Verify an OTP (limited attempts) and return JWT tokens."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp_verify"

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data["mobile_number"]
        code = serializer.validated_data["otp_code"]

        with transaction.atomic():
            otp = (
                OTPVerification.objects.select_for_update()
                .filter(mobile_number=mobile, is_verified=False)
                .order_by("-created_at")
                .first()
            )
            if otp is None or otp.is_expired:
                return Response(
                    {"error": "OTP has expired or was not requested. Request a new one."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
                return _too_many("Too many incorrect attempts. Request a new OTP.")
            if not hmac.compare_digest(otp.otp_code, code):
                otp.attempts += 1
                otp.save(update_fields=["attempts"])
                left = max(settings.OTP_MAX_ATTEMPTS - otp.attempts, 0)
                return Response(
                    {"error": "Invalid OTP", "attempts_left": left},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            otp.is_verified = True
            otp.save(update_fields=["is_verified"])

        user, created = User.objects.get_or_create(mobile_number=mobile, defaults={"first_name": "User"})
        if not user.is_active:
            return Response({"error": "This account is disabled."}, status=status.HTTP_403_FORBIDDEN)
        if not user.is_verified:
            user.is_verified = True  # phone ownership proven
            user.save(update_fields=["is_verified"])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "OTP verified successfully",
                "is_new_user": created,
                "tokens": {"access": str(refresh.access_token), "refresh": str(refresh)},
                "user": CurrentUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(APIView):
    """Save the account details for the *signed-in* (OTP-verified) user.

    Registration is: 1) verify the phone by OTP (creates the account), 2) POST the
    account details here, 3) fill the profile via PATCH /profile/me/.
    Requiring a verified session means nobody can register a phone number they do
    not own, and re-submitting after a failure just updates the same account
    (no duplicates).
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RegisterSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if "role" not in request.data:
            user.role = User.Role.BRIDE if user.gender == "female" else User.Role.GROOM
            user.save(update_fields=["role"])
        return Response(
            {"message": "Account details saved", "user": CurrentUserSerializer(user).data},
            status=status.HTTP_200_OK,
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
