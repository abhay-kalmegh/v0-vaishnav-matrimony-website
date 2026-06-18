"""Spirituality models — Sampraday, Guru, SpiritualProfile, SpiritualPractice."""

import uuid
from django.db import models
from apps.profiles.models import Profile


class Sampraday(models.Model):
    """Master table for Vaishnav Sampraday traditions."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Sampradays"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Guru(models.Model):
    """Spiritual Guru / Acharya master table."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    sampraday = models.ForeignKey(Sampraday, on_delete=models.CASCADE, related_name="gurus")
    temple_name = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.sampraday.name})"


class SpiritualProfile(models.Model):
    """User's spiritual identity — sampraday, guru, initiation status."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(
    "profiles.Profile",
    on_delete=models.CASCADE,
    related_name="spiritual_profile"
    )
    sampraday = models.ForeignKey(Sampraday, on_delete=models.SET_NULL, null=True, blank=True)
    guru = models.ForeignKey(Guru, on_delete=models.SET_NULL, null=True, blank=True)
    is_initiated = models.BooleanField(default=False, help_text="Has taken Diksha")
    years_in_devotion = models.PositiveIntegerField(default=0)
    temple_association = models.CharField(max_length=200, blank=True)
    spiritual_organization = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"Spiritual profile of {self.profile.user.full_name}"


class SpiritualPractice(models.Model):
    """Daily spiritual practices and discipline."""

    class Level(models.TextChoices):
        NONE = "none", "None"
        BEGINNER = "beginner", "Beginner"
        MODERATE = "moderate", "Moderate"
        DEDICATED = "dedicated", "Dedicated"
        ADVANCED = "advanced", "Advanced"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="spiritual_practices")
    chants_mala = models.BooleanField(default=False)
    mala_rounds_daily = models.PositiveIntegerField(default=0)
    follows_ekadashi = models.BooleanField(default=False)
    performs_daily_puja = models.BooleanField(default=False)
    reads_scriptures = models.BooleanField(default=False)
    attends_temple_regularly = models.BooleanField(default=False)
    seva_involvement = models.TextField(blank=True)
    celebrates_janmashtami = models.BooleanField(default=True)
    participates_rath_yatra = models.BooleanField(default=False)
    bhajan_kirtan_participation = models.BooleanField(default=False)
    overall_level = models.CharField(max_length=15, choices=Level.choices, default=Level.BEGINNER)

    def __str__(self):
        return f"Practices of {self.profile.user.full_name}"
