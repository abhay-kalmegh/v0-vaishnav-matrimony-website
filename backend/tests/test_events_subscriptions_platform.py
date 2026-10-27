import subprocess
import sys
from datetime import timedelta
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.events.models import Event, EventRegistration
from apps.subscriptions.models import Subscription, SubscriptionPlan

from .factories import client_for, make_member, make_user

BACKEND = Path(__file__).resolve().parent.parent


class EventTests(TestCase):
    def setUp(self):
        self.user, self.profile = make_member("male")
        self.api = client_for(self.user)
        kind = Event.EventType.choices[0][0]
        self.mk = lambda **kw: Event.objects.create(
            title=kw.pop("title", "Kirtan Night"), description="d", event_type=kind, location="Nagpur",
            event_date=kw.pop("event_date", timezone.now() + timedelta(days=3)), organizer="ISKCON", **kw,
        )

    def test_listing_is_public_and_upcoming_only(self):
        up, past = self.mk(), self.mk(title="Old", event_date=timezone.now() - timedelta(days=3))
        hidden = self.mk(title="Hidden", is_active=False)
        titles = [e["title"] for e in APIClient().get("/api/events/").json()["results"]]
        self.assertIn("Kirtan Night", titles)
        self.assertNotIn("Hidden", titles)
        self.assertEqual(APIClient().get(f"/api/events/{up.id}/").status_code, 200)

    def test_register_flow_and_is_registered_flag(self):
        e = self.mk()
        self.assertFalse(self.api.get("/api/events/").json()["results"][0]["is_registered"])
        self.assertEqual(self.api.post(f"/api/events/{e.id}/register/").status_code, 201)
        self.assertTrue(self.api.get("/api/events/").json()["results"][0]["is_registered"])
        self.assertEqual(self.api.post(f"/api/events/{e.id}/register/").status_code, 400)  # no duplicates
        self.assertEqual(EventRegistration.objects.count(), 1)

    def test_requires_login_and_valid_event(self):
        e = self.mk()
        self.assertEqual(APIClient().post(f"/api/events/{e.id}/register/").status_code, 401)
        self.assertEqual(self.api.post("/api/events/00000000-0000-0000-0000-000000000000/register/").status_code, 404)

    def test_full_and_past_events_refuse_registration(self):
        full = self.mk(max_participants=1)
        other, other_profile = make_member("female")
        EventRegistration.objects.create(event=full, profile=other_profile)
        self.assertEqual(self.api.post(f"/api/events/{full.id}/register/").status_code, 400)
        past = self.mk(title="Past", event_date=timezone.now() - timedelta(hours=1))
        self.assertEqual(self.api.post(f"/api/events/{past.id}/register/").status_code, 400)


class SubscriptionTests(TestCase):
    """No payment gateway exists, so paid plans must never be granted by a client claim."""

    def setUp(self):
        self.user, _p = make_member("male")
        self.api = client_for(self.user)
        fields = {f.name for f in SubscriptionPlan._meta.get_fields()}
        base = dict(name="Plan", price=0, duration_days=30)
        base.update({k: v for k, v in dict(description="d", features="x", is_active=True).items() if k in fields})
        self.free = SubscriptionPlan.objects.create(**{**base, "name": "Free"})
        self.paid = SubscriptionPlan.objects.create(**{**base, "name": "Gold", "price": 999})

    def test_paid_plan_cannot_be_self_granted(self):
        r = self.api.post("/api/subscriptions/subscribe/", {"plan_id": str(self.paid.id), "transaction_id": "fake-123"}, format="json")
        self.assertEqual(r.status_code, 501)
        self.assertEqual(Subscription.objects.count(), 0)

    def test_free_plan_works(self):
        r = self.api.post("/api/subscriptions/subscribe/", {"plan_id": str(self.free.id)}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Subscription.objects.filter(is_active=True).count(), 1)

    def test_requires_auth_and_valid_plan(self):
        self.assertEqual(APIClient().post("/api/subscriptions/subscribe/", {"plan_id": str(self.free.id)}, format="json").status_code, 401)
        self.assertEqual(self.api.post("/api/subscriptions/subscribe/", {"plan_id": "00000000-0000-0000-0000-000000000000"}, format="json").status_code, 404)


class PlatformTests(TestCase):
    def test_health_endpoint_is_public(self):
        r = APIClient().get("/api/health/")
        self.assertEqual((r.status_code, r.json()), (200, {"status": "ok"}))

    def test_no_missing_migrations(self):
        call_command("makemigrations", check=True, dry_run=True, verbosity=0)

    def test_api_docs_not_exposed_outside_debug(self):
        # Test runs with DEBUG=False at URL-conf load time for the docs routes.
        self.assertIn(APIClient().get("/api/schema/").status_code, (404,))

    def _boot(self, **env):
        import os

        full = {k: v for k, v in os.environ.items() if k not in ("SECRET_KEY", "DEBUG", "ALLOWED_HOSTS")}
        full.update(env, DATABASE_URL="sqlite:////tmp/boot_check.db", DJANGO_SETTINGS_MODULE="config.settings")
        code = "import django; django.setup(); from django.conf import settings; print('OK', settings.DEBUG, settings.ALLOWED_HOSTS)"
        return subprocess.run([sys.executable, "-c", code], cwd=BACKEND, env=full, capture_output=True, text=True)

    def test_production_refuses_to_boot_without_a_real_secret_key(self):
        r = self._boot(DEBUG="False")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("SECRET_KEY", r.stderr)
        r = self._boot(DEBUG="False", SECRET_KEY="short")
        self.assertNotEqual(r.returncode, 0)
        r = self._boot(DEBUG="False", SECRET_KEY="insecure-development-key-do-not-use-in-production")
        self.assertNotEqual(r.returncode, 0)

    def test_production_boots_with_explicit_config_and_no_wildcard_hosts(self):
        r = self._boot(DEBUG="False", SECRET_KEY="k" * 50, ALLOWED_HOSTS="api.example.com")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("['api.example.com']", r.stdout)
        r = self._boot(DEBUG="False", SECRET_KEY="k" * 50)
        self.assertNotIn("'*'", r.stdout)  # production never defaults to a wildcard host
