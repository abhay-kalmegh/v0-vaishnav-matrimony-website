"""Celery tasks for background match generation."""

from celery import shared_task
from apps.profiles.models import Profile
from .engine import generate_match_suggestions


@shared_task
def generate_matches_for_profile(profile_id):
    """Generate match suggestions for a single profile."""
    try:
        profile = Profile.objects.get(id=profile_id)
        suggestions = generate_match_suggestions(profile)
        return f"Generated {len(suggestions)} matches for {profile.user.full_name}"
    except Profile.DoesNotExist:
        return f"Profile {profile_id} not found"


@shared_task
def generate_all_matches():
    """Regenerate match suggestions for all approved profiles."""
    profiles = Profile.objects.filter(is_approved=True)
    count = 0
    for profile in profiles:
        generate_match_suggestions(profile)
        count += 1
    return f"Generated matches for {count} profiles"
