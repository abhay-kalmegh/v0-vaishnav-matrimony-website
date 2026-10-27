import io
from datetime import date, timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from apps.interests.models import Interest
from apps.profiles.completion import evaluate
from apps.profiles.models import Profile, ProfilePhoto

from .factories import client_for, make_member, make_user


def png(size=(20, 20)):
    buf = io.BytesIO()
    Image.new("RGB", size, "red").save(buf, "PNG")
    return SimpleUploadedFile("p.png", buf.getvalue(), content_type="image/png")


CONTACT_KEYS = ("mobile_number", "email", "permanent_address", "father_name", "mother_name")


def contains_key(obj, keys):
    """True if any of ``keys`` appears anywhere in a nested JSON structure."""
    if isinstance(obj, dict):
        return any(k in keys or contains_key(v, keys) for k, v in obj.items())
    if isinstance(obj, list):
        return any(contains_key(v, keys) for v in obj)
    return False


class OwnProfileTests(TestCase):
    def setUp(self):
        self.user = make_user()
        self.api = client_for(self.user)

    def test_profile_exists_for_every_new_user(self):
        self.assertTrue(Profile.objects.filter(user=self.user).exists())
        self.assertEqual(self.api.get("/api/profile/me/").status_code, 200)

    def test_create_endpoint_cannot_make_a_second_profile(self):
        self.assertEqual(self.api.post("/api/profile/create/", {"about_me": "x"}, format="json").status_code, 400)
        self.assertEqual(Profile.objects.filter(user=self.user).count(), 1)

    def test_validation(self):
        today = date.today()
        cases = {
            "date_of_birth": [str(today + timedelta(days=1)), str(today.replace(year=today.year - 17)), "1800-01-01", "not-a-date"],
            "height_cm": [50, 300],
            "weight_kg": [5, 999],
        }
        for field, values in cases.items():
            for v in values:
                r = self.api.patch("/api/profile/me/", {field: v}, format="json")
                self.assertEqual(r.status_code, 400, (field, v))
                self.assertIn(field, r.json())

    def test_exactly_18_is_allowed(self):
        today = date.today()
        dob = today.replace(year=today.year - 18)
        self.assertEqual(self.api.patch("/api/profile/me/", {"date_of_birth": str(dob)}, format="json").status_code, 200)

    def test_user_cannot_approve_or_self_score_their_profile(self):
        r = self.api.patch("/api/profile/me/", {"is_approved": True, "profile_completion": 100}, format="json")
        self.assertEqual(r.status_code, 200)
        p = Profile.objects.get(user=self.user)
        self.assertFalse(p.is_approved)
        self.assertLess(p.profile_completion, 100)  # computed by the server, not the client

    def test_nested_sections_and_incremental_completion(self):
        steps = [
            {"date_of_birth": "1996-05-05", "height_cm": 170, "about_me": "A devotee who loves kirtan and seva."},
            {"current_city": "Nagpur", "state": "Maharashtra", "country": "India"},
            {"education": {"highest_qualification": "B.Tech", "field_of_study": "CS"}, "career": {"occupation": "Engineer"}},
            {"family": {"family_type": "joint", "father_name": "A", "siblings_count": 2}},
        ]
        last = 0
        for i, step in enumerate(steps):
            r = self.api.patch("/api/profile/me/", step, format="json")
            self.assertEqual(r.status_code, 200, r.json())
            pct = r.json()["profile_completion"]
            self.assertGreater(pct, last)  # percentage rises as sections are saved
            last = pct
            me = self.api.get("/api/auth/me/").json()
            self.assertEqual(me["profile_completed"], i == len(steps) - 1)
        self.assertEqual(r.json()["missing_fields"], [])
        self.assertEqual(Profile.objects.get(user=self.user).profile_completion, last)

    def test_two_fields_are_not_enough_to_be_complete(self):
        self.api.patch("/api/profile/me/", {"about_me": "A devotee who loves kirtan and seva.", "height_cm": 170}, format="json")
        me = self.api.get("/api/auth/me/").json()
        self.assertFalse(me["profile_completed"])
        self.assertIn("date_of_birth", me["missing_profile_fields"])

    def test_short_about_me_does_not_count(self):
        profile = Profile.objects.get(user=self.user)
        profile.about_me = "hi"
        self.assertIn("about_me", evaluate(profile).missing)

    def test_unauthenticated_cannot_read_or_write(self):
        from rest_framework.test import APIClient

        anon = APIClient()
        self.assertEqual(anon.get("/api/profile/me/").status_code, 401)
        self.assertEqual(anon.patch("/api/profile/me/", {"about_me": "x"}, format="json").status_code, 401)


class PrivacyTests(TestCase):
    def setUp(self):
        self.viewer_user, self.viewer = make_member("male")
        self.other_user, self.other = make_member("female", first_name="Radha")
        self.api = client_for(self.viewer_user)

    def test_other_members_profile_hides_contact_details(self):
        r = self.api.get(f"/api/profile/{self.other.id}/")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["user"]["first_name"], "Radha")
        self.assertFalse(contains_key(body, CONTACT_KEYS), body)
        self.assertNotIn(self.other_user.mobile_number, r.content.decode())
        self.assertNotIn(self.other_user.email, r.content.decode())
        self.assertNotIn("Secret Father", r.content.decode())

    def test_own_profile_shows_everything(self):
        r = self.client_own = client_for(self.other_user).get("/api/profile/me/")
        self.assertEqual(r.json()["user"]["mobile_number"], self.other_user.mobile_number)
        self.assertEqual(r.json()["family"]["father_name"], "Secret Father")
        r = client_for(self.other_user).get(f"/api/profile/{self.other.id}/")
        self.assertEqual(r.json()["user"]["mobile_number"], self.other_user.mobile_number)

    def test_unapproved_profiles_are_invisible_to_others_but_visible_to_owner(self):
        _u, hidden = make_member("female", approved=False)
        self.assertEqual(self.api.get(f"/api/profile/{hidden.id}/").status_code, 404)
        self.assertEqual(client_for(_u).get(f"/api/profile/{hidden.id}/").status_code, 200)

    def test_search_results_never_contain_contact_details(self):
        r = self.api.get("/api/profile/search/")
        self.assertEqual(r.json()["count"], 1)
        self.assertFalse(contains_key(r.json(), CONTACT_KEYS))
        self.assertNotIn(self.other_user.mobile_number, r.content.decode())

    def test_nested_profiles_in_interests_shortlist_matches_and_messages_hide_contacts(self):
        from apps.messaging.models import Conversation

        i = self.api.post("/api/interests/send/", {"receiver_id": str(self.other.id)}, format="json")
        self.assertEqual(i.status_code, 201, i.json())
        self.assertFalse(contains_key(i.json(), CONTACT_KEYS))
        self.api.post("/api/interests/shortlist/", {"shortlisted_profile": str(self.other.id)}, format="json")
        recv = client_for(self.other_user)
        resp = recv.get("/api/interests/received/")
        self.assertFalse(contains_key(resp.json(), CONTACT_KEYS))
        recv.post("/api/interests/respond/", {"interest_id": i.json()["id"], "action": "accepted"}, format="json")
        self.assertTrue(Conversation.objects.exists())
        for url in ("/api/interests/shortlist/", "/api/interests/sent/", "/api/messages/"):
            r = self.api.get(url)
            self.assertEqual(r.status_code, 200, url)
            self.assertFalse(contains_key(r.json(), CONTACT_KEYS), url)
        self.api.post("/api/matches/generate/")
        self.assertFalse(contains_key(self.api.get("/api/matches/").json(), CONTACT_KEYS))

    def test_photo_visibility_rules(self):
        for vis in ("public", "matches_only", "private"):
            ProfilePhoto.objects.create(profile=self.other, photo=png(), visibility=vis)
        names = lambda r: sorted(p["visibility"] for p in r.json()["photos"])  # noqa: E731
        self.assertEqual(names(self.api.get(f"/api/profile/{self.other.id}/")), ["public"])
        Interest.objects.create(sender=self.viewer, receiver=self.other, status=Interest.Status.ACCEPTED)
        self.assertEqual(names(self.api.get(f"/api/profile/{self.other.id}/")), ["matches_only", "public"])
        own = client_for(self.other_user).get("/api/profile/me/")
        self.assertEqual(names(own), ["matches_only", "private", "public"])

    def test_list_primary_photo_only_if_public(self):
        ProfilePhoto.objects.create(profile=self.other, photo=png(), visibility="private", is_primary=True)
        r = self.api.get("/api/profile/search/")
        self.assertIsNone(r.json()["results"][0]["primary_photo"])


class PhotoTests(TestCase):
    def setUp(self):
        self.user = make_user()
        self.api = client_for(self.user)
        self.profile = Profile.objects.get(user=self.user)

    def upload(self, f=None, **extra):
        return self.api.post("/api/profile/photos/", {"photo": f or png(), **extra}, format="multipart")

    def test_upload_first_photo_becomes_primary_and_counts_toward_completion(self):
        before = evaluate(self.profile).percent
        r = self.upload()
        self.assertEqual(r.status_code, 201, r.content)
        self.assertTrue(r.json()["is_primary"])
        self.profile.refresh_from_db()
        self.assertGreater(self.profile.profile_completion, before)

    def test_only_one_primary(self):
        self.upload()
        self.upload(is_primary="true")
        self.assertEqual(self.profile.photos.filter(is_primary=True).count(), 1)

    def test_rejects_non_image(self):
        r = self.upload(SimpleUploadedFile("x.png", b"not an image", content_type="image/png"))
        self.assertEqual(r.status_code, 400)

    @override_settings(MAX_PHOTO_BYTES=10)
    def test_rejects_oversized(self):
        self.assertEqual(self.upload().status_code, 400)

    @override_settings(MAX_PHOTOS_PER_PROFILE=2)
    def test_photo_count_limit(self):
        self.assertEqual(self.upload().status_code, 201)
        self.assertEqual(self.upload().status_code, 201)
        self.assertEqual(self.upload().status_code, 400)

    def test_delete_own_photo_promotes_next_primary(self):
        a = self.upload().json()["id"]
        self.upload()
        r = self.api.delete("/api/profile/photos/", {"photo_id": a}, format="json")
        self.assertEqual(r.status_code, 204)
        self.assertEqual(self.profile.photos.filter(is_primary=True).count(), 1)

    def test_cannot_delete_someone_elses_photo(self):
        other_user, other = make_member("female")
        photo = ProfilePhoto.objects.create(profile=other, photo=png())
        r = self.api.delete("/api/profile/photos/", {"photo_id": str(photo.id)}, format="json")
        self.assertEqual(r.status_code, 404)
        self.assertTrue(ProfilePhoto.objects.filter(id=photo.id).exists())

    def test_invalid_photo_id_is_400_not_500(self):
        for bad in ("nope", "", None):
            self.assertEqual(self.api.delete("/api/profile/photos/", {"photo_id": bad}, format="json").status_code, 400)


class SearchTests(TestCase):
    def setUp(self):
        self.me_user, self.me = make_member("male")
        today = date.today()

        def born(years, extra_days=0):
            return today.replace(year=today.year - years) - timedelta(days=extra_days)

        self.people = {}
        for name, years, extra in [("p20", 20, 0), ("p27", 27, 0), ("p27b", 27, 200), ("p40", 40, 0), ("p41", 41, 5)]:
            _u, p = make_member("female", first_name=name, dob=born(years, extra), current_city="Pune" if name == "p27" else "Nagpur")
            self.people[name] = p
        make_member("female", first_name="hidden", approved=False)
        make_member("male", first_name="otherman")
        self.api = client_for(self.me_user)

    def names(self, **params):
        r = self.api.get("/api/profile/search/", params)
        self.assertEqual(r.status_code, 200, r.content)
        return sorted(p["user"]["first_name"] for p in r.json()["results"])

    def test_excludes_self_and_unapproved(self):
        got = self.names()
        self.assertNotIn("hidden", got)
        self.assertEqual(len([n for n in got if n.startswith("User")]), 0)

    def test_gender_filter(self):
        self.assertEqual(self.names(gender="male"), ["otherman"])
        self.assertNotIn("otherman", self.names(gender="female"))

    def test_age_range_boundaries(self):
        self.assertEqual(self.names(gender="female", min_age=20, max_age=40), ["p20", "p27", "p27b", "p40"])  # inclusive both ends
        self.assertEqual(self.names(gender="female", min_age=28, max_age=40), ["p40"])
        self.assertEqual(self.names(gender="female", min_age=20, max_age=26), ["p20"])
        self.assertEqual(self.names(gender="female", min_age=41), ["p41"])
        self.assertEqual(self.names(gender="female", max_age=19), [])

    def test_min_age_alone_and_max_age_alone(self):
        self.assertEqual(self.names(gender="female", min_age=40), ["p40", "p41"])
        self.assertEqual(self.names(gender="female", max_age=20), ["p20"])

    def test_city_and_text_filters(self):
        self.assertEqual(self.names(gender="female", current_city__icontains="pun"), ["p27"])
        self.assertEqual(self.names(gender="female", search="p41"), ["p41"])

    def test_pagination_shape(self):
        r = self.api.get("/api/profile/search/", {"gender": "female"}).json()
        self.assertEqual({"count", "next", "previous", "results"}, set(r))

    def test_non_numeric_age_does_not_crash(self):
        for bad in ("abc", "1.5", "-"):
            r = self.api.get("/api/profile/search/", {"min_age": bad})
            self.assertEqual(r.status_code, 400, bad)
            self.assertIn("min_age", r.json())
