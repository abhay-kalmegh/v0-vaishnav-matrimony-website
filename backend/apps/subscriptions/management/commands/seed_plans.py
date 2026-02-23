"""Management command to seed subscription plans."""

from django.core.management.base import BaseCommand
from apps.subscriptions.models import SubscriptionPlan


PLANS = [
    {
        "name": "Free",
        "price": 0,
        "duration_days": 365,
        "max_contacts_per_day": 3,
        "can_see_photos": True,
        "can_message": False,
        "priority_listing": False,
        "features": {
            "profile_views": 10,
            "search": True,
            "basic_matching": True,
        },
    },
    {
        "name": "Silver",
        "price": 999,
        "duration_days": 90,
        "max_contacts_per_day": 10,
        "can_see_photos": True,
        "can_message": True,
        "priority_listing": False,
        "features": {
            "profile_views": 50,
            "search": True,
            "advanced_matching": True,
            "contact_unlock": 20,
        },
    },
    {
        "name": "Gold",
        "price": 2499,
        "duration_days": 180,
        "max_contacts_per_day": 25,
        "can_see_photos": True,
        "can_message": True,
        "priority_listing": True,
        "features": {
            "profile_views": "unlimited",
            "search": True,
            "advanced_matching": True,
            "contact_unlock": 50,
            "verified_badge": True,
            "kundli_matching": True,
        },
    },
    {
        "name": "Diamond",
        "price": 4999,
        "duration_days": 365,
        "max_contacts_per_day": 100,
        "can_see_photos": True,
        "can_message": True,
        "priority_listing": True,
        "features": {
            "profile_views": "unlimited",
            "search": True,
            "advanced_matching": True,
            "contact_unlock": "unlimited",
            "verified_badge": True,
            "kundli_matching": True,
            "dedicated_relationship_manager": True,
        },
    },
]


class Command(BaseCommand):
    help = "Seed subscription plans"

    def handle(self, *args, **options):
        created = 0
        for plan_data in PLANS:
            _, was_created = SubscriptionPlan.objects.get_or_create(
                name=plan_data["name"],
                defaults=plan_data,
            )
            if was_created:
                created += 1
                self.stdout.write(f"  Created plan: {plan_data['name']}")

        self.stdout.write(self.style.SUCCESS(f"\nDone! Created {created} plans."))
