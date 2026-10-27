"""The exact payloads the onboarding wizard sends (see lib/registration.ts), step by step."""

from django.core.cache import cache
from django.test import TestCase, override_settings

from apps.spirituality.models import Sampraday

from .factories import client_for, make_user

STEPS = {
    1: {"date_of_birth": "1996-05-05", "height_cm": 168, "marital_status": "never_married", "manglik_status": "dont_know",
        "about_me": "A devotee who loves kirtan and seva."},
    2: {"country": "India", "state": "Maharashtra", "current_city": "Nagpur", "permanent_address": "12 Temple Road"},
    3: {"education": {"highest_qualification": "Bachelor's Degree", "field_of_study": "CS"},
        "career": {"occupation": "Private Sector", "employment_type": "salaried", "company_name": "Acme",
                   "annual_income_range": "5 - 10 Lakhs", "work_location": "Pune"}},
    4: {"family": {"father_name": "A", "father_occupation": "Teacher", "mother_name": "B", "mother_occupation": "Homemaker",
                   "siblings_count": 2, "family_type": "joint", "family_spiritual_background": "Vaishnav family"}},
}


class OnboardingPayloadTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = make_user()
        self.api = client_for(self.user)
        self.sampraday = Sampraday.objects.create(name="Gaudiya Test")

    def patch(self, body):
        r = self.api.patch("/api/profile/me/", body, format="json")
        self.assertEqual(r.status_code, 200, r.json())
        return r.json()

    def test_every_step_is_accepted_and_persisted(self):
        for n, body in STEPS.items():
            data = self.patch(body)
        self.assertEqual(data["education"]["highest_qualification"], "Bachelor's Degree")
        self.assertEqual(data["career"]["annual_income_range"], "5 - 10 Lakhs")
        self.assertEqual(data["family"]["family_type"], "joint")
        self.assertEqual(data["family"]["siblings_count"], 2)
        self.assertEqual(data["missing_fields"], [])
        self.assertTrue(self.api.get("/api/auth/me/").json()["profile_completed"])

    def test_step5_spiritual_and_lifestyle_payload(self):
        data = self.patch({
            "spiritual_profile": {"sampraday": str(self.sampraday.id), "is_initiated": True, "temple_association": "ISKCON Nagpur", "years_in_devotion": 8},
            "spiritual_practices": {"chants_mala": True, "mala_rounds_daily": 16, "follows_ekadashi": True, "performs_daily_puja": False},
            "lifestyle": {"is_vegetarian": True, "onion_garlic": "occasionally", "alcohol": "no", "smoking": "no", "prasad_only_diet": True},
        })
        self.assertEqual(data["spiritual_profile"]["sampraday"], str(self.sampraday.id))
        self.assertEqual(data["spiritual_practices"]["mala_rounds_daily"], 16)
        self.assertEqual(data["lifestyle"]["onion_garlic"], "occasionally")

    def test_step6_partner_preference_payload(self):
        data = self.patch({"partner_preference": {
            "preferred_sampraday": str(self.sampraday.id), "min_spiritual_level": "very-strict", "dietary_expectation": "pure-vegetarian",
            "min_age": 24, "max_age": 30, "min_height_cm": 152, "max_height_cm": 183, "preferred_education": "masters",
            "preferred_location": "Maharashtra", "marital_status_preference": "never-married"}})
        self.assertEqual((data["partner_preference"]["min_age"], data["partner_preference"]["max_age"]), (24, 30))

    def test_steps_are_incremental_and_repeatable(self):
        for _ in range(2):  # retrying a step must not duplicate or fail
            for body in STEPS.values():
                self.patch(body)
        self.assertEqual(self.user.profile.__class__.objects.filter(user=self.user).count(), 1)

    def test_partial_section_updates_keep_the_rest(self):
        self.patch(STEPS[3])
        data = self.patch({"career": {"company_name": "NewCo"}})
        self.assertEqual(data["career"]["occupation"], "Private Sector")
        self.assertEqual(data["education"]["highest_qualification"], "Bachelor's Degree")
