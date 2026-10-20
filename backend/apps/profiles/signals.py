"""Create an (empty) Profile for every new User.

Many endpoints (interests, matches, messaging, events, photos...) read
``request.user.profile``. Without this, a freshly OTP-verified user who has
not yet opened /profile/me/ gets a 500 (RelatedObjectDoesNotExist).
"""

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile_for_new_user(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
