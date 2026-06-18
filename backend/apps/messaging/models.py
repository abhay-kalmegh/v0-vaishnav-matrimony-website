"""Messaging models — conversations and messages between matched profiles."""

import uuid
from django.db import models
from apps.profiles.models import Profile


class Conversation(models.Model):
    """A chat thread between two profiles (only after mutual interest)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile_1 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="conversations_as_1")
    profile_2 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="conversations_as_2")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["profile_1", "profile_2"]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Chat: {self.profile_1.user.full_name} <-> {self.profile_2.user.full_name}"


class Message(models.Model):
    """Individual message in a conversation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="sent_messages")
    text = models.TextField(max_length=2000)
    media_url = models.URLField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sent_at"]

    def __str__(self):
        return f"Message from {self.sender.user.full_name} at {self.sent_at}"
