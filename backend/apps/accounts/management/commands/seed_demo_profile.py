"""Development helper: fill in (and approve) the profile of a test account.

    python manage.py seed_demo_profile 9876543210

Refuses to run unless DEBUG=True. It writes ordinary profile data - the app's real
completion rules (apps/profiles/completion.py) still decide whether the profile is complete.
"""

from datetime import date

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.accounts.models import User
from apps.profiles.completion import evaluate, refresh
from apps.profiles.models import Career, Education, FamilyDetails, Profile


class Command(BaseCommand):
    help = "DEBUG only: fill the required profile fields of a test account and approve it."

    def add_arguments(self, parser):
        parser.add_argument("mobile_number")
        parser.add_argument("--no-approve", action="store_true", help="leave the profile unapproved")

    def handle(self, *args, **opts):
        if not settings.DEBUG:
            raise CommandError("seed_demo_profile only runs with DEBUG=True.")
        try:
            user = User.objects.get(mobile_number=opts["mobile_number"])
        except User.DoesNotExist:
            raise CommandError("No account with that mobile number. Log in once with it first.")

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.date_of_birth = profile.date_of_birth or date(1996, 5, 5)
        profile.height_cm = profile.height_cm or 170
        profile.about_me = profile.about_me if len((profile.about_me or "").strip()) >= 20 else "A devotee who loves kirtan and seva."
        profile.current_city = profile.current_city or "Nagpur"
        profile.state = profile.state or "Maharashtra"
        if not opts["no_approve"]:
            profile.is_approved = True
        profile.save()
        Education.objects.get_or_create(profile=profile, defaults={"highest_qualification": "B.Tech"})
        Career.objects.get_or_create(profile=profile, defaults={"occupation": "Engineer"})
        FamilyDetails.objects.get_or_create(profile=profile, defaults={"family_type": "nuclear"})
        for model, field, value in ((Education, "highest_qualification", "B.Tech"), (Career, "occupation", "Engineer"), (FamilyDetails, "family_type", "nuclear")):
            obj = model.objects.get(profile=profile)
            if not getattr(obj, field):
                setattr(obj, field, value)
                obj.save()
        if not user.first_name or user.first_name == "User":
            user.first_name = "Demo"
            user.save(update_fields=["first_name"])

        result = refresh(profile)
        state = "COMPLETE" if result.complete else f"still missing: {', '.join(result.missing)}"
        self.stdout.write(self.style.SUCCESS(f"{user.mobile_number}: profile {state} ({result.percent}%), approved={profile.is_approved}"))
