from django.contrib import admin
from .models import Event, EventRegistration


class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "event_type", "event_date", "location", "organizer", "is_active"]
    list_filter = ["event_type", "is_active"]
    search_fields = ["title", "organizer"]
    inlines = [EventRegistrationInline]
