"""URL routes for spirituality API."""

from django.urls import path
from . import views

urlpatterns = [
    path("sampraday/", views.SampradayListView.as_view(), name="sampraday-list"),
    path("gurus/", views.GuruListView.as_view(), name="guru-list"),
    path("me/", views.MySpiritualProfileView.as_view(), name="spiritual-me"),
]
