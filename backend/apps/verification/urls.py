"""URL routes for verification API."""

from django.urls import path
from . import views

urlpatterns = [
    path("submit/", views.SubmitVerificationView.as_view(), name="verification-submit"),
    path("my/", views.MyVerificationsView.as_view(), name="my-verifications"),
]
