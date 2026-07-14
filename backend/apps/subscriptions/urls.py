"""URL routes for subscriptions API."""

from django.urls import path
from . import views

urlpatterns = [
    path("plans/", views.PlanListView.as_view(), name="plan-list"),
    path("my/", views.MySubscriptionView.as_view(), name="my-subscription"),
    path("subscribe/", views.SubscribeView.as_view(), name="subscribe"),
]
