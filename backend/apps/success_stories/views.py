"""API views for success stories."""

from rest_framework import generics, permissions

from .models import SuccessStory
from .serializers import SuccessStorySerializer


class SuccessStoryListView(generics.ListAPIView):
    """List published success stories (public)."""

    queryset = SuccessStory.objects.filter(is_published=True)
    serializer_class = SuccessStorySerializer
    permission_classes = [permissions.AllowAny]


class SuccessStoryDetailView(generics.RetrieveAPIView):
    """Get a single success story."""

    queryset = SuccessStory.objects.filter(is_published=True)
    serializer_class = SuccessStorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"


class SubmitSuccessStoryView(generics.CreateAPIView):
    """Submit a success story for review."""

    serializer_class = SuccessStorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(is_published=False)
