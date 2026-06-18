"""URL routes for success stories API."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.SuccessStoryListView.as_view(), name="success-story-list"),
    path("submit/", views.SubmitSuccessStoryView.as_view(), name="success-story-submit"),
    path("<uuid:id>/", views.SuccessStoryDetailView.as_view(), name="success-story-detail"),
]
