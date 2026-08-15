"""API views for profiles — create, retrieve, update, search."""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, parsers, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, ProfilePhoto
from .serializers import ProfileListSerializer, ProfilePhotoSerializer, ProfileSerializer


class ProfileCreateView(generics.CreateAPIView):
    """Create a new profile for the authenticated user."""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MyProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _created = Profile.objects.select_related(
            "user", "education", "career", "family", "lifestyle", "partner_preference",
            "spiritual_profile", "spiritual_practices"
        ).prefetch_related("photos").get_or_create(user=self.request.user)
        return profile


class ProfileDetailView(generics.RetrieveAPIView):
    """View another user's profile by ID."""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Profile.objects.select_related(
        "user", "education", "career", "family", "lifestyle", "partner_preference",
        "spiritual_profile", "spiritual_practices"
    ).prefetch_related("photos")
    lookup_field = "id"


class ProfileSearchView(generics.ListAPIView):
    """Search profiles with filters: age, location, sampraday, etc."""

    serializer_class = ProfileListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "marital_status": ["exact"],
        "current_city": ["icontains"],
        "state": ["icontains"],
        "country": ["exact"],
        "user__gender": ["exact"],
    }
    search_fields = ["user__first_name", "user__last_name", "current_city", "state"]
    ordering_fields = ["created_at", "date_of_birth"]

    def get_queryset(self):
        qs = (
            Profile.objects.select_related("user")
            .prefetch_related("photos")
            .exclude(user=self.request.user)
            .filter(is_approved=True)
        )

        # Custom age filtering
        min_age = self.request.query_params.get("min_age")
        max_age = self.request.query_params.get("max_age")
        if min_age or max_age:
            from django.utils import timezone
            from datetime import timedelta

            today = timezone.now().date()
            if max_age:
                qs = qs.filter(date_of_birth__lte=today - timedelta(days=int(max_age) * 365))
            if min_age:
                qs = qs.filter(date_of_birth__gte=today - timedelta(days=int(min_age) * 365))

        # Sampraday filtering
        sampraday = self.request.query_params.get("sampraday")
        if sampraday:
            qs = qs.filter(spiritual_profile__sampraday__id=sampraday)

        return qs


class PhotoUploadView(APIView):
    """Upload photos for the authenticated user's profile."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        profile = request.user.profile
        serializer = ProfilePhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(profile=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        photo_id = request.data.get("photo_id")
        try:
            photo = ProfilePhoto.objects.get(id=photo_id, profile=request.user.profile)
            photo.delete()
            return Response({"message": "Photo deleted"}, status=status.HTTP_204_NO_CONTENT)
        except ProfilePhoto.DoesNotExist:
            return Response({"error": "Photo not found"}, status=status.HTTP_404_NOT_FOUND)
