"""URL routes for profiles API."""

from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.ProfileCreateView.as_view(), name="profile-create"),
    path("me/", views.MyProfileView.as_view(), name="profile-me"),
    path("search/", views.ProfileSearchView.as_view(), name="profile-search"),
    path("photos/", views.PhotoUploadView.as_view(), name="photo-upload"),
    path("<uuid:id>/", views.ProfileDetailView.as_view(), name="profile-detail"),
]
