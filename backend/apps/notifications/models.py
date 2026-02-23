"""Notification models for in-app alerts."""

import uuid
from django.db import models
from apps.profiles.models import Profile


class Notification(models.Model):
    """In-app notification for a user."""

    class NotificationType(models.TextChoices):
        INTEREST_RECEIVED = "interest_received", "Interest Received"
        INTEREST_ACCEPTED = "interest_accepted", "Interest Accepted"
        NEW_MESSAGE = "new_message", "New Message"
        NEW_MATCH = "new_match", "New Match"
        PROFILE_VIEWED = "profile_viewed", "Profile Viewed"
        EVENT_REMINDER = "event_reminder", "Event Reminder"
        SYSTEM = "system", "System"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField(max_length=500)
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    related_id = models.UUIDField(null=True, blank=True, help_text="ID of related object")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.notification_type}: {self.title}"
