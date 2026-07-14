"""Admin registration for spirituality models."""

from django.contrib import admin
from .models import Guru, Sampraday, SpiritualPractice, SpiritualProfile


@admin.register(Sampraday)
class SampradayAdmin(admin.ModelAdmin):
    list_display = ["name", "description"]
    search_fields = ["name"]


@admin.register(Guru)
class GuruAdmin(admin.ModelAdmin):
    list_display = ["name", "sampraday", "temple_name", "location"]
    list_filter = ["sampraday"]
    search_fields = ["name", "temple_name"]


@admin.register(SpiritualProfile)
class SpiritualProfileAdmin(admin.ModelAdmin):
    list_display = ["profile", "sampraday", "guru", "is_initiated", "years_in_devotion"]
    list_filter = ["sampraday", "is_initiated"]


@admin.register(SpiritualPractice)
class SpiritualPracticeAdmin(admin.ModelAdmin):
    list_display = ["profile", "chants_mala", "mala_rounds_daily", "follows_ekadashi", "overall_level"]
    list_filter = ["overall_level", "chants_mala"]
