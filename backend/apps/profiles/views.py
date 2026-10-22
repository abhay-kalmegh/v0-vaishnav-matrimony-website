"""API views for profiles — create, retrieve, update, search."""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, parsers, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, ProfilePhoto
import uuid as _uuid

from django.conf import settings
from django.db.models import Q
from rest_framework.exceptions import NotFound, ValidationError

from .completion import refresh as refresh_completion
from .serializers import (
    ProfileListSerializer,
    ProfilePhotoSerializer,
    ProfileSerializer,
    PublicProfileSerializer,
)


class ProfileCreateView(generics.CreateAPIView):
    """Create a new profile for the authenticated user."""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # A profile is created automatically with the account (one per user);
        # use PATCH /profile/me/ to edit it.
        if Profile.objects.filter(user=self.request.user).exists():
            raise ValidationError({"error": "A profile already exists. Update it with PATCH /profile/me/."})
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
    """View a profile by ID.

    Your own profile is returned in full. Other members' profiles are only
    visible once approved, and never include contact details, the permanent
    address, parents' names or non-public photos.
    """

    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return (
            Profile.objects.select_related(
                "user", "education", "career", "family", "lifestyle", "partner_preference",
                "spiritual_profile", "spiritual_practices",
            )
            .prefetch_related("photos")
            .filter(Q(is_approved=True) | Q(user=self.request.user))
        )

    def get_serializer_class(self):
        obj = getattr(self, "_obj", None)
        if obj is not None and obj.user_id == self.request.user.id:
            return ProfileSerializer
        return PublicProfileSerializer

    def get_object(self):
        self._obj = super().get_object()
        return self._obj

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        obj = getattr(self, "_obj", None)
        if obj is not None and obj.user_id != self.request.user.id:
            from apps.interests.models import Interest

            ctx["is_connected"] = Interest.objects.filter(
                status=Interest.Status.ACCEPTED,
            ).filter(
                Q(sender=self.request.user.profile, receiver=obj) | Q(sender=obj, receiver=self.request.user.profile)
            ).exists()
        return ctx


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

    def _int_param(self, name, lo, hi):
        raw = self.request.query_params.get(name)
        if raw in (None, ""):
            return None
        try:
            value = int(raw)
        except ValueError:
            raise ValidationError({name: ["Must be a whole number."]})
        return min(max(value, lo), hi)

    def get_queryset(self):
        qs = (
            Profile.objects.select_related("user")
            .prefetch_related("photos")
            .exclude(user=self.request.user)
            .filter(is_approved=True)
        )

        # Custom age filtering
        min_age = self._int_param("min_age", 18, 100)
        max_age = self._int_param("max_age", 18, 100)
        if min_age is not None or max_age is not None:
            from django.utils import timezone
            from datetime import timedelta

            today = timezone.now().date()
            if max_age is not None:
                # age <= max_age  <=>  born on or after (today - (max_age+1) years)
                qs = qs.filter(date_of_birth__gt=today - timedelta(days=(int(max_age) + 1) * 365))
            if min_age is not None:
                # age >= min_age  <=>  born on or before (today - min_age years)
                qs = qs.filter(date_of_birth__lte=today - timedelta(days=int(min_age) * 365))

        # Gender filtering (the app sends ?gender=male|female)
        gender = self.request.query_params.get("gender")
        if gender:
            qs = qs.filter(user__gender=gender)

        # Sampraday filtering
        sampraday = self.request.query_params.get("sampraday")
        if sampraday:
            qs = qs.filter(spiritual_profile__sampraday__id=sampraday)

        return qs


class PhotoUploadView(APIView):
    """Upload photos for the authenticated user's profile."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request):
        profile = request.user.profile
        if profile.photos.count() >= settings.MAX_PHOTOS_PER_PROFILE:
            raise ValidationError({"error": f"You can upload at most {settings.MAX_PHOTOS_PER_PROFILE} photos."})
        upload = request.FILES.get("photo")
        if upload is not None and upload.size > settings.MAX_PHOTO_BYTES:
            raise ValidationError({"photo": [f"Photo must be smaller than {settings.MAX_PHOTO_BYTES // (1024 * 1024)} MB."]})

        serializer = ProfilePhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        make_primary = serializer.validated_data.get("is_primary") or not profile.photos.exists()
        photo = serializer.save(profile=profile, is_primary=make_primary)
        if make_primary:
            profile.photos.exclude(pk=photo.pk).update(is_primary=False)
        refresh_completion(profile)
        return Response(ProfilePhotoSerializer(photo, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        profile = request.user.profile
        try:
            photo_id = _uuid.UUID(str(request.data.get("photo_id")))
        except (ValueError, AttributeError):
            raise ValidationError({"photo_id": ["A valid photo id is required."]})
        try:
            photo = ProfilePhoto.objects.get(id=photo_id, profile=profile)  # only your own photos
        except ProfilePhoto.DoesNotExist:
            raise NotFound("Photo not found")
        was_primary = photo.is_primary
        photo.delete()
        if was_primary:
            nxt = profile.photos.first()
            if nxt:
                nxt.is_primary = True
                nxt.save(update_fields=["is_primary"])
        refresh_completion(profile)
        return Response(status=status.HTTP_204_NO_CONTENT)
