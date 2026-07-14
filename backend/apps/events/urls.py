"""URL routes for events API."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.EventListView.as_view(), name="event-list"),
    path("<uuid:id>/", views.EventDetailView.as_view(), name="event-detail"),
    path("<uuid:event_id>/register/", views.EventRegisterView.as_view(), name="event-register"),
]
