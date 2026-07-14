"""Serializers for subscriptions app."""

from rest_framework import serializers
from .models import Payment, Subscription, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id", "name", "price", "duration_days", "features",
            "max_contacts_per_day", "can_see_photos", "can_message",
            "priority_listing", "is_active",
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_details = SubscriptionPlanSerializer(source="plan", read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "plan", "plan_details", "start_date", "end_date", "is_active"]
        read_only_fields = ["id", "start_date", "end_date", "is_active"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "subscription", "amount", "payment_gateway", "transaction_id", "status", "paid_at", "created_at"]
        read_only_fields = ["id", "created_at"]
