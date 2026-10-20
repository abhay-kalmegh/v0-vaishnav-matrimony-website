"""API views for interests — send, receive, respond, shortlist."""

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.messaging.models import Conversation
from apps.profiles.models import Profile
from .models import Interest, Shortlist
from .serializers import (
    InterestSerializer,
    RespondInterestSerializer,
    SendInterestSerializer,
    ShortlistSerializer,
)


class SentInterestsView(generics.ListAPIView):
    """List interests sent by the authenticated user."""

    serializer_class = InterestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Interest.objects.filter(sender=self.request.user.profile).select_related(
            "sender__user", "receiver__user"
        )


class ReceivedInterestsView(generics.ListAPIView):
    """List interests received by the authenticated user."""

    serializer_class = InterestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Interest.objects.filter(receiver=self.request.user.profile).select_related(
            "sender__user", "receiver__user"
        )


class SendInterestView(APIView):
    """Send an interest to another profile."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SendInterestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sender = request.user.profile
        try:
            receiver = Profile.objects.get(id=serializer.validated_data["receiver_id"])
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        if sender == receiver:
            return Response({"error": "Cannot send interest to yourself"}, status=status.HTTP_400_BAD_REQUEST)

        interest, created = Interest.objects.get_or_create(
            sender=sender,
            receiver=receiver,
            defaults={"message": serializer.validated_data.get("message", "")},
        )

        if not created:
            return Response({"error": "Interest already sent"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(InterestSerializer(interest).data, status=status.HTTP_201_CREATED)


class RespondInterestView(APIView):
    """Accept or reject a received interest."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RespondInterestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            interest = Interest.objects.get(
                id=serializer.validated_data["interest_id"],
                receiver=request.user.profile,
                status=Interest.Status.PENDING,
            )
        except Interest.DoesNotExist:
            return Response({"error": "Interest not found or already responded"}, status=status.HTTP_404_NOT_FOUND)

        interest.status = serializer.validated_data["action"]
        interest.responded_at = timezone.now()
        interest.save(update_fields=["status", "responded_at"])

        if interest.status == Interest.Status.ACCEPTED:
            # Chat unlocks on mutual interest; nothing else creates conversations.
            if not Conversation.objects.filter(
                profile_1__in=[interest.sender, interest.receiver],
                profile_2__in=[interest.sender, interest.receiver],
            ).exists():
                Conversation.objects.create(
                    profile_1=interest.sender, profile_2=interest.receiver
                )

        return Response(InterestSerializer(interest).data)


class ShortlistView(generics.ListCreateAPIView):
    """List and add to shortlist."""

    serializer_class = ShortlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shortlist.objects.filter(profile=self.request.user.profile).select_related(
            "shortlisted_profile__user"
        )

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)


class ShortlistDeleteView(generics.DestroyAPIView):
    """Remove from shortlist."""

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shortlist.objects.filter(profile=self.request.user.profile)
