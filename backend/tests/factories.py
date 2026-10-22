"""Small helpers that build users/profiles in known states."""

import itertools
from datetime import date

from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.profiles.models import Career, Education, FamilyDetails, Profile

_seq = itertools.count(1)


def make_user(gender="male", mobile=None, first_name=None, **extra):
    n = next(_seq)
    mobile = mobile or f"9{n:09d}"
    return User.objects.create_user(
        mobile_number=mobile,
        first_name=first_name or f"User{n}",
        gender=gender,
        email=extra.pop("email", f"user{n}@example.com"),
        **extra,
    )


def complete_profile(profile, dob=date(1996, 5, 5), **fields):
    """Fill every REQUIRED completion item."""
    for k, v in dict(
        date_of_birth=dob, height_cm=170, about_me="A devotee who loves kirtan and seva.",
        current_city="Nagpur", state="Maharashtra",
    ).items():
        setattr(profile, k, fields.pop(k, v))
    for k, v in fields.items():
        setattr(profile, k, v)
    profile.save()
    Education.objects.update_or_create(profile=profile, defaults={"highest_qualification": "B.Tech"})
    Career.objects.update_or_create(profile=profile, defaults={"occupation": "Engineer"})
    FamilyDetails.objects.update_or_create(
        profile=profile, defaults={"family_type": "nuclear", "father_name": "Secret Father", "mother_name": "Secret Mother"}
    )
    return profile


def make_member(gender="male", approved=True, complete=True, **kw):
    """A user whose profile is (optionally) complete and approved."""
    user = make_user(gender=gender, **{k: v for k, v in kw.items() if k in ("mobile", "first_name", "email")})
    profile = Profile.objects.get(user=user)
    if complete:
        complete_profile(profile, **{k: v for k, v in kw.items() if k not in ("mobile", "first_name", "email")})
    Profile.objects.filter(pk=profile.pk).update(is_approved=approved)
    profile.refresh_from_db()
    return user, profile


class _FreshUserClient(APIClient):
    """Re-load the user for every request, as a real server does (no stale cached ``user.profile``)."""

    def request(self, **kwargs):
        if getattr(self, "_uid", None):
            self.handler._force_user = User.objects.get(pk=self._uid)
        return super().request(**kwargs)


def client_for(user):
    c = _FreshUserClient()
    c._uid = user.pk
    c.force_authenticate(user)
    return c
