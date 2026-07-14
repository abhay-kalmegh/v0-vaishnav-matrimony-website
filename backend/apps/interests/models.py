"""Interest and Shortlist models."""

import uuid
from django.db import models
from apps.profiles.models import Profile


class Interest(models.Model):
    """Expression of interest from one profile to another."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="sent_interests")
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="received_interests")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    message = models.TextField(blank=True, max_length=500)
    sent_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["sender", "receiver"]
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.sender.user.full_name} -> {self.receiver.user.full_name} ({self.status})"


class Shortlist(models.Model):
    """Bookmarked / shortlisted profiles."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="my_shortlist")
    shortlisted_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="shortlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["profile", "shortlisted_profile"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.profile.user.full_name} shortlisted {self.shortlisted_profile.user.full_name}"
