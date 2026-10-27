"""API views for events — list, detail, register."""

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, EventRegistration
from .serializers import EventRegistrationSerializer, EventSerializer


class EventListView(generics.ListAPIView):
    """List all active events."""

    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Event.objects.filter(is_active=True)
        upcoming = self.request.query_params.get("upcoming")
        if upcoming:
            qs = qs.filter(event_date__gte=timezone.now())
        return qs


class EventDetailView(generics.RetrieveAPIView):
    """Get event details."""

    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"


class EventRegisterView(APIView):
    """Register for an event."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        with transaction.atomic():
            try:
                # Lock the row so two simultaneous requests cannot both take the last seat.
                event = Event.objects.select_for_update().get(id=event_id, is_active=True)
            except Event.DoesNotExist:
                return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

            if event.event_date < timezone.now():
                return Response({"error": "This event has already taken place"}, status=status.HTTP_400_BAD_REQUEST)

            if event.max_participants > 0 and event.registration_count >= event.max_participants:
                return Response({"error": "Event is full"}, status=status.HTTP_400_BAD_REQUEST)

            registration, created = EventRegistration.objects.get_or_create(
                event=event, profile=request.user.profile
            )

            if not created:
                return Response({"error": "Already registered"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(EventRegistrationSerializer(registration).data, status=status.HTTP_201_CREATED)
