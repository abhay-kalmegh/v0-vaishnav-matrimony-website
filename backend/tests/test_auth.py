from datetime import timedelta

from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import OTPVerification, User

from .factories import client_for, make_member, make_user

MOBILE = "9876543210"


class AuthBase(TestCase):
    def setUp(self):
        cache.clear()
        self.api = APIClient()
        # The test runner forces DEBUG=False (production-like), which hides the OTP.
        # Tests that need to read the dev-only OTP opt in explicitly.
        self.enterContext(override_settings(DEBUG=True))

    def send(self, mobile=MOBILE):
        return self.api.post("/api/auth/send-otp/", {"mobile_number": mobile}, format="json")

    def verify(self, code, mobile=MOBILE):
        return self.api.post("/api/auth/verify-otp/", {"mobile_number": mobile, "otp_code": code}, format="json")

    def login(self, mobile=MOBILE):
        otp = self.send(mobile).json()["otp"]
        return self.verify(otp, mobile).json()


@override_settings(OTP_RESEND_COOLDOWN_SECONDS=0)
class OTPTests(AuthBase):
    def test_send_returns_otp_only_in_debug(self):
        self.assertIn("otp", self.send().json())
        cache.clear()
        with override_settings(DEBUG=False):
            body = self.send("9876543211").json()
        self.assertNotIn("otp", body)
        self.assertEqual(body["message"], "OTP sent successfully")

    def test_otp_is_six_digits(self):
        for i in range(20):
            self.assertRegex(self.send(f"98765432{i:02d}").json()["otp"], r"^[1-9]\d{5}$")

    def test_invalid_mobile_rejected(self):
        for bad in ["", "abc", "123", "98765x3210", "1" * 30]:
            self.assertEqual(self.send(bad).status_code, 400, bad)

    def test_mobile_is_normalised(self):
        self.assertEqual(self.send("+91 98765-43210").status_code, 200)
        self.assertTrue(OTPVerification.objects.filter(mobile_number="9876543210").exists())

    def test_indian_number_formats_map_to_one_account(self):
        ids = set()
        for fmt in ("9876543210", "+919876543210", "919876543210", "09876543210", "+91 98765 43210"):
            otp = self.send(fmt).json()["otp"]
            ids.add(self.verify(otp, fmt).json()["user"]["id"])
        self.assertEqual(len(ids), 1)
        self.assertEqual(User.objects.filter(mobile_number__endswith="9876543210").count(), 1)

    def test_verify_success_creates_user_and_tokens(self):
        data = self.login()
        self.assertTrue(data["is_new_user"])
        self.assertIn("access", data["tokens"])
        self.assertTrue(data["user"]["is_verified"])
        self.assertFalse(data["user"]["profile_completed"])
        self.assertTrue(User.objects.filter(mobile_number=MOBILE).exists())
        self.assertFalse(self.login()["is_new_user"])  # second login = same account

    def test_wrong_code_counts_attempts_then_locks_even_correct_code(self):
        otp = self.send().json()["otp"]
        wrong = "000000" if otp != "000000" else "111111"
        for left in (4, 3, 2, 1, 0):
            r = self.verify(wrong)
            self.assertEqual(r.status_code, 400)
            self.assertEqual(r.json()["attempts_left"], left)
        self.assertEqual(self.verify(otp).status_code, 429)  # locked: brute force cannot continue
        self.assertFalse(User.objects.filter(mobile_number=MOBILE).exists())

    def test_otp_cannot_be_reused(self):
        otp = self.send().json()["otp"]
        self.assertEqual(self.verify(otp).status_code, 200)
        self.assertEqual(self.verify(otp).status_code, 400)

    def test_expired_otp_rejected(self):
        otp = self.send().json()["otp"]
        OTPVerification.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.verify(otp).status_code, 400)

    def test_resending_burns_the_previous_code(self):
        first = self.send().json()["otp"]
        second = self.send().json()["otp"]
        if first != second:
            self.assertEqual(self.verify(first).status_code, 400)
        self.assertEqual(self.verify(second).status_code, 200)

    def test_verify_without_request_fails(self):
        self.assertEqual(self.verify("123456").status_code, 400)

    def test_verify_requires_six_digits(self):
        self.send()
        self.assertEqual(self.verify("12ab56").status_code, 400)


class OTPRateLimitTests(AuthBase):
    @override_settings(OTP_RESEND_COOLDOWN_SECONDS=60)
    def test_resend_cooldown(self):
        self.assertEqual(self.send().status_code, 200)
        r = self.send()
        self.assertEqual(r.status_code, 429)
        self.assertIn("retry_after", r.json())
        self.assertIn("Retry-After", r.headers)

    @override_settings(OTP_RESEND_COOLDOWN_SECONDS=0, OTP_MAX_SENDS_PER_HOUR=3)
    def test_hourly_cap_per_number(self):
        for _ in range(3):
            self.assertEqual(self.send().status_code, 200)
        self.assertEqual(self.send().status_code, 429)
        self.assertEqual(self.send("9000000099").status_code, 200)  # other numbers unaffected

    def test_inactive_user_cannot_log_in(self):
        make_user(mobile=MOBILE)
        User.objects.filter(mobile_number=MOBILE).update(is_active=False)
        with override_settings(OTP_RESEND_COOLDOWN_SECONDS=0):
            otp = self.send().json()["otp"]
            self.assertEqual(self.verify(otp).status_code, 403)


@override_settings(OTP_RESEND_COOLDOWN_SECONDS=0)
class TokenTests(AuthBase):
    def test_protected_endpoints_require_auth(self):
        for url in ["/api/auth/me/", "/api/profile/me/", "/api/interests/received/", "/api/messages/", "/api/matches/"]:
            self.assertEqual(self.api.get(url).status_code, 401, url)

    def test_garbage_token_rejected(self):
        self.api.credentials(HTTP_AUTHORIZATION="Bearer not-a-token")
        self.assertEqual(self.api.get("/api/auth/me/").status_code, 401)

    def test_access_token_works_and_refresh_rotates(self):
        t = self.login()["tokens"]
        self.api.credentials(HTTP_AUTHORIZATION=f"Bearer {t['access']}")
        self.assertEqual(self.api.get("/api/auth/me/").status_code, 200)
        self.api.credentials()
        r = self.api.post("/api/auth/token/refresh/", {"refresh": t["refresh"]}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertIn("access", r.json())
        self.assertNotEqual(r.json().get("refresh"), t["refresh"])  # rotation
        # the old refresh token was blacklisted by rotation
        self.assertEqual(self.api.post("/api/auth/token/refresh/", {"refresh": t["refresh"]}, format="json").status_code, 401)

    def test_logout_revokes_refresh_token(self):
        t = self.login()["tokens"]
        self.api.credentials(HTTP_AUTHORIZATION=f"Bearer {t['access']}")
        self.assertEqual(self.api.post("/api/auth/logout/", {"refresh": t["refresh"]}, format="json").status_code, 200)
        self.api.credentials()
        self.assertEqual(self.api.post("/api/auth/token/refresh/", {"refresh": t["refresh"]}, format="json").status_code, 401)

    def test_logout_requires_auth(self):
        self.assertEqual(self.api.post("/api/auth/logout/", {}, format="json").status_code, 401)

    def test_account_switching_returns_own_data(self):
        a = self.login("9111111111")
        b = self.login("9222222222")
        for data, mobile in ((a, "9111111111"), (b, "9222222222")):
            self.api.credentials(HTTP_AUTHORIZATION=f"Bearer {data['tokens']['access']}")
            self.assertEqual(self.api.get("/api/auth/me/").json()["mobile_number"], mobile)
            self.assertEqual(self.api.get("/api/profile/me/").json()["user"]["mobile_number"], mobile)


@override_settings(OTP_RESEND_COOLDOWN_SECONDS=0)
class RegistrationTests(AuthBase):
    payload = {"first_name": "Arjun", "last_name": "Das", "gender": "male", "email": "Arjun@Example.com"}

    def authed(self):
        t = self.login()["tokens"]["access"]
        self.api.credentials(HTTP_AUTHORIZATION=f"Bearer {t}")

    def test_registration_requires_a_verified_session(self):
        # Without proving ownership of the phone, nobody can create/modify an account.
        r = self.api.post("/api/auth/register/", {**self.payload, "mobile_number": "9999999999"}, format="json")
        self.assertEqual(r.status_code, 401)
        self.assertFalse(User.objects.filter(mobile_number="9999999999").exists())

    def test_saves_account_details(self):
        self.authed()
        r = self.api.post("/api/auth/register/", self.payload, format="json")
        self.assertEqual(r.status_code, 200)
        u = r.json()["user"]
        self.assertEqual((u["first_name"], u["gender"], u["role"], u["email"]), ("Arjun", "male", "groom", "arjun@example.com"))
        self.assertEqual(r.json()["user"]["mobile_number"], MOBILE)  # taken from the session, not the body

    def test_role_defaults_from_gender(self):
        self.authed()
        r = self.api.post("/api/auth/register/", {**self.payload, "gender": "female"}, format="json")
        self.assertEqual(r.json()["user"]["role"], "bride")

    def test_admin_role_cannot_be_self_assigned(self):
        self.authed()
        r = self.api.post("/api/auth/register/", {**self.payload, "role": "admin"}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(User.objects.get(mobile_number=MOBILE).role, "groom")

    def test_parent_role_allowed(self):
        self.authed()
        r = self.api.post("/api/auth/register/", {**self.payload, "role": "parent"}, format="json")
        self.assertEqual(r.json()["user"]["role"], "parent")

    def test_validation_errors(self):
        self.authed()
        for bad in ({"gender": "male"}, {**self.payload, "gender": "robot"}, {**self.payload, "email": "nope"}, {**self.payload, "first_name": ""}):
            self.assertEqual(self.api.post("/api/auth/register/", bad, format="json").status_code, 400, bad)

    def test_duplicate_email_rejected_case_insensitively(self):
        make_user(email="taken@example.com")
        self.authed()
        r = self.api.post("/api/auth/register/", {**self.payload, "email": "TAKEN@example.com"}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("email", r.json())

    def test_retry_is_idempotent_and_never_duplicates_accounts(self):
        self.authed()
        before = User.objects.count()
        for _ in range(3):
            self.assertEqual(self.api.post("/api/auth/register/", self.payload, format="json").status_code, 200)
        self.assertEqual(User.objects.count(), before)

    def test_own_email_can_be_resubmitted(self):
        self.authed()
        self.api.post("/api/auth/register/", self.payload, format="json")
        self.assertEqual(self.api.post("/api/auth/register/", self.payload, format="json").status_code, 200)


class MeEndpointTests(TestCase):
    def setUp(self):
        self.user = make_user()
        self.api = client_for(self.user)

    def test_cannot_change_phone_verification_or_escalate_role(self):
        r = self.api.patch("/api/auth/me/", {"mobile_number": "9000000000", "is_verified": False, "first_name": "New"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.mobile_number, "9000000000")  # phone changes would bypass OTP
        self.assertTrue(self.user.first_name == "New")
        self.assertEqual(self.api.patch("/api/auth/me/", {"role": "admin"}, format="json").status_code, 400)
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.role, "admin")
        self.assertFalse(self.user.is_staff)

    def test_can_set_non_admin_role(self):
        self.assertEqual(self.api.patch("/api/auth/me/", {"role": "parent"}, format="json").status_code, 200)

    def test_cannot_use_another_users_email(self):
        make_user(email="x@example.com")
        self.assertEqual(self.api.patch("/api/auth/me/", {"email": "X@example.com"}, format="json").status_code, 400)
