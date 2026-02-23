"""
Matching Engine — calculates compatibility scores between profiles.
Considers: Sampraday, spiritual practices, lifestyle, family, education, location.
"""

from apps.profiles.models import Profile
from apps.spirituality.models import SpiritualPractice, SpiritualProfile
from .models import MatchSuggestion


def calculate_spiritual_score(profile_a: Profile, profile_b: Profile) -> float:
    """Calculate spiritual compatibility (0-100). Highest weight."""
    score = 0.0
    try:
        sp_a = profile_a.spiritual_profile
        sp_b = profile_b.spiritual_profile
    except SpiritualProfile.DoesNotExist:
        return 0.0

    # Same Sampraday = 40 points
    if sp_a.sampraday_id and sp_a.sampraday_id == sp_b.sampraday_id:
        score += 40.0

    # Both initiated = 15 points
    if sp_a.is_initiated and sp_b.is_initiated:
        score += 15.0

    # Same guru = 15 points
    if sp_a.guru_id and sp_a.guru_id == sp_b.guru_id:
        score += 15.0

    # Similar years of devotion = up to 10 points
    diff = abs(sp_a.years_in_devotion - sp_b.years_in_devotion)
    if diff <= 2:
        score += 10.0
    elif diff <= 5:
        score += 5.0

    # Practices comparison
    try:
        pr_a = profile_a.spiritual_practices
        pr_b = profile_b.spiritual_practices
        practice_fields = [
            "chants_mala", "follows_ekadashi", "performs_daily_puja",
            "reads_scriptures", "attends_temple_regularly",
        ]
        matching = sum(1 for f in practice_fields if getattr(pr_a, f) == getattr(pr_b, f))
        score += (matching / len(practice_fields)) * 20.0
    except SpiritualPractice.DoesNotExist:
        pass

    return min(score, 100.0)


def calculate_lifestyle_score(profile_a: Profile, profile_b: Profile) -> float:
    """Calculate lifestyle compatibility (0-100)."""
    score = 0.0
    try:
        ls_a = profile_a.lifestyle
        ls_b = profile_b.lifestyle
    except Exception:
        return 0.0

    if ls_a.is_vegetarian == ls_b.is_vegetarian:
        score += 30.0
    if ls_a.onion_garlic == ls_b.onion_garlic:
        score += 20.0
    if ls_a.alcohol == ls_b.alcohol:
        score += 20.0
    if ls_a.smoking == ls_b.smoking:
        score += 15.0
    if ls_a.prasad_only_diet == ls_b.prasad_only_diet:
        score += 15.0

    return min(score, 100.0)


def calculate_family_score(profile_a: Profile, profile_b: Profile) -> float:
    """Calculate family background compatibility (0-100)."""
    score = 50.0  # Base score
    try:
        fm_a = profile_a.family
        fm_b = profile_b.family
    except Exception:
        return score

    if fm_a.family_type == fm_b.family_type:
        score += 25.0
    if fm_a.family_sampraday and fm_a.family_sampraday == fm_b.family_sampraday:
        score += 25.0

    return min(score, 100.0)


def calculate_education_score(profile_a: Profile, profile_b: Profile) -> float:
    """Calculate education/career compatibility (0-100)."""
    score = 50.0
    try:
        ed_a = profile_a.education
        ed_b = profile_b.education
    except Exception:
        return score

    if ed_a.highest_qualification == ed_b.highest_qualification:
        score += 25.0
    if ed_a.field_of_study and ed_a.field_of_study == ed_b.field_of_study:
        score += 25.0

    return min(score, 100.0)


def generate_match_suggestions(profile: Profile, limit: int = 50):
    """
    Generate match suggestions for a given profile.
    Weights: Spiritual 40%, Lifestyle 25%, Family 20%, Education 15%.
    """
    opposite_gender = "female" if profile.user.gender == "male" else "male"
    candidates = (
        Profile.objects.filter(user__gender=opposite_gender, is_approved=True)
        .exclude(id=profile.id)
        .select_related(
            "user", "spiritual_profile", "spiritual_practices",
            "lifestyle", "family", "education",
        )
    )

    suggestions = []
    for candidate in candidates[:200]:  # Cap at 200 for performance
        spiritual = calculate_spiritual_score(profile, candidate)
        lifestyle = calculate_lifestyle_score(profile, candidate)
        family = calculate_family_score(profile, candidate)
        education = calculate_education_score(profile, candidate)

        overall = (spiritual * 0.40) + (lifestyle * 0.25) + (family * 0.20) + (education * 0.15)

        suggestions.append({
            "candidate": candidate,
            "compatibility_score": round(overall, 1),
            "spiritual_score": round(spiritual, 1),
            "lifestyle_score": round(lifestyle, 1),
            "family_score": round(family, 1),
            "education_score": round(education, 1),
        })

    suggestions.sort(key=lambda x: x["compatibility_score"], reverse=True)

    # Store top suggestions in DB
    for s in suggestions[:limit]:
        MatchSuggestion.objects.update_or_create(
            profile_1=profile,
            profile_2=s["candidate"],
            defaults={
                "compatibility_score": s["compatibility_score"],
                "spiritual_score": s["spiritual_score"],
                "lifestyle_score": s["lifestyle_score"],
                "family_score": s["family_score"],
                "education_score": s["education_score"],
            },
        )

    return suggestions[:limit]
