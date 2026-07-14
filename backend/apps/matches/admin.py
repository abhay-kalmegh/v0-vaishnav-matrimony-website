from django.contrib import admin
from .models import MatchSuggestion


@admin.register(MatchSuggestion)
class MatchSuggestionAdmin(admin.ModelAdmin):
    list_display = ["profile_1", "profile_2", "compatibility_score", "spiritual_score", "generated_at"]
    list_filter = ["is_active"]
    ordering = ["-compatibility_score"]
