from django.contrib import admin
from .models import Payment, Subscription, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ["name", "price", "duration_days", "can_message", "priority_listing", "is_active"]
    list_filter = ["is_active"]


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["profile", "plan", "start_date", "end_date", "is_active"]
    list_filter = ["is_active", "plan"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["subscription", "amount", "payment_gateway", "status", "paid_at"]
    list_filter = ["status", "payment_gateway"]
