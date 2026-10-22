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

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        # No payment gateway is integrated, so a paid plan can never be *verified*.
        # Trusting a client-supplied transaction_id would let anyone grant themselves
        # a paid subscription for free, so paid plans are refused until a gateway
        # (create-order + signed webhook verification) is implemented.
        if plan.price > 0:
            return Response(
                {"error": "Online payments are not enabled yet."},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        profile = request.user.profile

        # Deactivate existing subscriptions
        Subscription.objects.filter(profile=profile, is_active=True).update(is_active=False)

        # Create new subscription
        subscription = Subscription.objects.create(
            profile=profile,
            plan=plan,
            end_date=timezone.now() + timedelta(days=plan.duration_days),
        )

        return Response(
            SubscriptionSerializer(subscription).data,
            status=status.HTTP_201_CREATED,
        )
