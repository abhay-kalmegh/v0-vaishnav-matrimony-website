"""API views for profile verification."""

from rest_framework import generics, parsers, permissions
from .models import ProfileVerification
from .serializers import ProfileVerificationSerializer


class SubmitVerificationView(generics.CreateAPIView):
    """Submit documents for profile verification."""

    serializer_class = ProfileVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)


class MyVerificationsView(generics.ListAPIView):
    """List verification submissions for the current user."""

    serializer_class = ProfileVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProfileVerification.objects.filter(profile=self.request.user.profile)
