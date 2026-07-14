"""API views for subscriptions."""

from datetime import timedelta
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment, Subscription, SubscriptionPlan
from .serializers import PaymentSerializer, SubscriptionPlanSerializer, SubscriptionSerializer


class PlanListView(generics.ListAPIView):
    """List all available subscription plans."""

    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class MySubscriptionView(generics.ListAPIView):
    """List current user's subscriptions."""

    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(
            profile=self.request.user.profile
        ).select_related("plan")


class SubscribeView(APIView):
    """Create a subscription (after payment verification)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        transaction_id = request.data.get("transaction_id", "")
        payment_gateway = request.data.get("payment_gateway", "razorpay")

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        profile = request.user.profile

        # Deactivate existing subscriptions
        Subscription.objects.filter(profile=profile, is_active=True).update(is_active=False)

        # Create new subscription
        subscription = Subscription.objects.create(
            profile=profile,
            plan=plan,
            end_date=timezone.now() + timedelta(days=plan.duration_days),
        )

        # Record payment
        Payment.objects.create(
            subscription=subscription,
            amount=plan.price,
            payment_gateway=payment_gateway,
            transaction_id=transaction_id,
            status=Payment.PaymentStatus.SUCCESS,
            paid_at=timezone.now(),
        )

        return Response(
            SubscriptionSerializer(subscription).data,
            status=status.HTTP_201_CREATED,
        )
