from django.db import migrations


def backfill_profiles(apps, schema_editor):
    """Give every pre-existing user a Profile (new users get one via signal)."""
    User = apps.get_model("accounts", "User")
    Profile = apps.get_model("profiles", "Profile")
    existing = set(Profile.objects.values_list("user_id", flat=True))
    Profile.objects.bulk_create(
        [Profile(user_id=u) for u in User.objects.exclude(pk__in=existing).values_list("pk", flat=True)]
    )


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0002_initial"),
        ("accounts", "0001_initial"),
    ]

    operations = [migrations.RunPython(backfill_profiles, migrations.RunPython.noop)]
