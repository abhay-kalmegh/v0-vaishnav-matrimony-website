from django.contrib import admin
from .models import Interest, Shortlist


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ["sender", "receiver", "status", "sent_at", "responded_at"]
    list_filter = ["status"]
    search_fields = ["sender__user__first_name", "receiver__user__first_name"]


@admin.register(Shortlist)
class ShortlistAdmin(admin.ModelAdmin):
    list_display = ["profile", "shortlisted_profile", "created_at"]
