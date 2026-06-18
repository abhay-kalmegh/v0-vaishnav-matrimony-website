"""URL routes for interests API."""

from django.urls import path
from . import views

urlpatterns = [
    path("sent/", views.SentInterestsView.as_view(), name="interests-sent"),
    path("received/", views.ReceivedInterestsView.as_view(), name="interests-received"),
    path("send/", views.SendInterestView.as_view(), name="interest-send"),
    path("respond/", views.RespondInterestView.as_view(), name="interest-respond"),
    path("shortlist/", views.ShortlistView.as_view(), name="shortlist"),
    path("shortlist/<uuid:pk>/", views.ShortlistDeleteView.as_view(), name="shortlist-delete"),
]
