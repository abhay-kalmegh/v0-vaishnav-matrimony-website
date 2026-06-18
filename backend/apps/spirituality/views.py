"""API views for spirituality — sampraday list, guru list, update spiritual details."""

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Guru, Sampraday, SpiritualPractice, SpiritualProfile
from .serializers import (
    GuruSerializer,
    SampradaySerializer,
    SpiritualPracticeSerializer,
    SpiritualProfileSerializer,
)


class SampradayListView(generics.ListAPIView):
    """List all Sampraday traditions."""

    queryset = Sampraday.objects.all()
    serializer_class = SampradaySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class GuruListView(generics.ListAPIView):
    """List gurus, optionally filtered by sampraday."""

    serializer_class = GuruSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = Guru.objects.select_related("sampraday").all()
        sampraday_id = self.request.query_params.get("sampraday")
        if sampraday_id:
            qs = qs.filter(sampraday_id=sampraday_id)
        return qs


class MySpiritualProfileView(APIView):
    """Get or update the current user's spiritual profile + practices."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        sp, _ = SpiritualProfile.objects.get_or_create(profile=profile)
        practices, _ = SpiritualPractice.objects.get_or_create(profile=profile)
        return Response({
            "spiritual_profile": SpiritualProfileSerializer(sp).data,
            "practices": SpiritualPracticeSerializer(practices).data,
        })

    def patch(self, request):
        profile = request.user.profile

        sp_data = request.data.get("spiritual_profile")
        if sp_data:
            sp, _ = SpiritualProfile.objects.get_or_create(profile=profile)
            ser = SpiritualProfileSerializer(sp, data=sp_data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()

        practices_data = request.data.get("practices")
        if practices_data:
            practices, _ = SpiritualPractice.objects.get_or_create(profile=profile)
            ser = SpiritualPracticeSerializer(practices, data=practices_data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()

        return Response({"message": "Spiritual details updated"})
