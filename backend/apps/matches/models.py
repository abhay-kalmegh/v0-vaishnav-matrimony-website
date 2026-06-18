"""Match suggestion models with compatibility scoring."""

import uuid
from django.db import models
from apps.profiles.models import Profile


class MatchSuggestion(models.Model):
    """A computed match suggestion between two profiles."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile_1 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="matches_as_profile1")
    profile_2 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="matches_as_profile2")
    compatibility_score = models.FloatField(default=0.0, help_text="Overall score 0-100")
    spiritual_score = models.FloatField(default=0.0)
    lifestyle_score = models.FloatField(default=0.0)
    family_score = models.FloatField(default=0.0)
    education_score = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["profile_1", "profile_2"]
        ordering = ["-compatibility_score"]

    def __str__(self):
        return f"{self.profile_1.user.full_name} <-> {self.profile_2.user.full_name} ({self.compatibility_score}%)"
