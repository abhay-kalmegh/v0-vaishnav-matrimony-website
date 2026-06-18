"""Events and Satsang models."""

import uuid
from django.db import models
from apps.profiles.models import Profile


class Event(models.Model):
    """Spiritual events, satsangs, and meetups."""

    class EventType(models.TextChoices):
        SATSANG = "satsang", "Satsang"
        MEETUP = "meetup", "Matrimony Meetup"
        WORKSHOP = "workshop", "Workshop"
        FESTIVAL = "festival", "Festival Celebration"
        ONLINE = "online", "Online Event"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=15, choices=EventType.choices)
    location = models.CharField(max_length=300)
    event_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    organizer = models.CharField(max_length=200)
    banner_image = models.ImageField(upload_to="event_banners/", blank=True, null=True)
    max_participants = models.PositiveIntegerField(default=0, help_text="0 = unlimited")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-event_date"]

    def __str__(self):
        return f"{self.title} ({self.event_date.strftime('%d %b %Y')})"

    @property
    def registration_count(self):
        return self.registrations.count()


class EventRegistration(models.Model):
    """Registration of a profile for an event."""

    class AttendanceStatus(models.TextChoices):
        REGISTERED = "registered", "Registered"
        ATTENDED = "attended", "Attended"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="event_registrations")
    status = models.CharField(max_length=15, choices=AttendanceStatus.choices, default=AttendanceStatus.REGISTERED)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["event", "profile"]
        ordering = ["-registered_at"]

    def __str__(self):
        return f"{self.profile.user.full_name} -> {self.event.title}"
