"""URL routes for matches API."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.MatchSuggestionListView.as_view(), name="match-list"),
    path("generate/", views.GenerateMatchesView.as_view(), name="generate-matches"),
]
