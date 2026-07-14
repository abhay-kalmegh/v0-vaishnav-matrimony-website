from django.contrib import admin
from django.utils import timezone
from .models import SuccessStory


@admin.register(SuccessStory)
class SuccessStoryAdmin(admin.ModelAdmin):
    list_display = ["bride_name", "groom_name", "sampraday", "is_published", "published_at"]
    list_filter = ["is_published", "sampraday"]
    search_fields = ["bride_name", "groom_name"]
    actions = ["publish_stories"]

    def publish_stories(self, request, queryset):
        queryset.update(is_published=True, published_at=timezone.now())
    publish_stories.short_description = "Publish selected stories"
