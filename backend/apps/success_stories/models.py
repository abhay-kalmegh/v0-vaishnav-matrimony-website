"""Success Story models — published stories of couples matched through the platform."""

import uuid
from django.db import models
from apps.profiles.models import Profile


class SuccessStory(models.Model):
    """A published success story of a couple."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bride = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, related_name="success_as_bride")
    groom = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, related_name="success_as_groom")
    bride_name = models.CharField(max_length=100)
    groom_name = models.CharField(max_length=100)
    story_text = models.TextField()
    marriage_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to="success_stories/", blank=True, null=True)
    sampraday = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Success Stories"
        ordering = ["-published_at"]

    def __str__(self):
        return f"{self.bride_name} & {self.groom_name}"
