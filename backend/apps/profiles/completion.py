"""Profile-completion rules: a single source of truth for "is this profile complete?".

A profile is *complete* when every REQUIRED item is filled in. The percentage also
rewards the optional items. The mobile/web onboarding wizard collects exactly these.
"""

from dataclasses import dataclass, field

from django.core.exceptions import ObjectDoesNotExist

MIN_ABOUT_LENGTH = 20


def _rel(profile, name):
    try:
        return getattr(profile, name)
    except ObjectDoesNotExist:
        return None


def _filled(value) -> bool:
    return bool(value) if not isinstance(value, str) else bool(value.strip())


# (key shown to the client, human label, predicate(profile) -> bool)
REQUIRED = [
    ("date_of_birth", "Date of birth", lambda p: p.date_of_birth is not None),
    ("height_cm", "Height", lambda p: bool(p.height_cm)),
    ("about_me", f"About me (at least {MIN_ABOUT_LENGTH} characters)", lambda p: len((p.about_me or "").strip()) >= MIN_ABOUT_LENGTH),
    ("current_city", "Current city", lambda p: _filled(p.current_city)),
    ("state", "State", lambda p: _filled(p.state)),
    ("education", "Highest qualification", lambda p: _filled(getattr(_rel(p, "education"), "highest_qualification", ""))),
    ("career", "Occupation", lambda p: _filled(getattr(_rel(p, "career"), "occupation", ""))),
    ("family_type", "Family type", lambda p: _filled(getattr(_rel(p, "family"), "family_type", ""))),
]

OPTIONAL = [
    ("photo", lambda p: p.photos.exists()),
    ("sampraday", lambda p: getattr(_rel(p, "spiritual_profile"), "sampraday_id", None) is not None),
    ("lifestyle", lambda p: _rel(p, "lifestyle") is not None),
    ("partner_preference", lambda p: _rel(p, "partner_preference") is not None),
    ("weight_kg", lambda p: bool(p.weight_kg)),
    ("blood_group", lambda p: _filled(p.blood_group)),
    ("permanent_address", lambda p: _filled(p.permanent_address)),
]


@dataclass
class Completion:
    percent: int = 0
    complete: bool = False
    missing: list = field(default_factory=list)


def evaluate(profile) -> Completion:
    if profile is None:
        return Completion(0, False, [k for k, _l, _f in REQUIRED])
    missing = [key for key, _label, ok in REQUIRED if not ok(profile)]
    opt_done = sum(1 for _k, ok in OPTIONAL if ok(profile))
    percent = round(70 * (len(REQUIRED) - len(missing)) / len(REQUIRED) + 30 * opt_done / len(OPTIONAL))
    return Completion(percent=percent, complete=not missing, missing=missing)


def refresh(profile) -> Completion:
    """Recompute and persist ``profile.profile_completion``."""
    result = evaluate(profile)
    if profile.profile_completion != result.percent:
        profile.profile_completion = result.percent
        type(profile).objects.filter(pk=profile.pk).update(profile_completion=result.percent)
    return result
