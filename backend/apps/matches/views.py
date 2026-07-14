"""API views for match suggestions."""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import MatchSuggestion
from .serializers import MatchSuggestionSerializer
from .engine import generate_match_suggestions


class MatchSuggestionListView(generics.ListAPIView):
    """List match suggestions for the authenticated user."""

    serializer_class = MatchSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = self.request.user.profile
        return MatchSuggestion.objects.filter(
            Q(profile_1=profile) | Q(profile_2=profile),
            is_active=True,
        ).select_related(
            "profile_1__user", "profile_2__user"
        ).order_by("-compatibility_score")


class GenerateMatchesView(APIView):
    """Trigger match generation for the authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        suggestions = generate_match_suggestions(profile)
        return Response(
            {"message": f"Generated {len(suggestions)} match suggestions"},
            status=status.HTTP_200_OK,
        )
