"""Profile models — core matrimony data, family, education, career, photos, lifestyle, preferences."""

import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    """Main matrimony profile linked to a User."""

    class MaritalStatus(models.TextChoices):
        NEVER_MARRIED = "never_married", "Never Married"
        DIVORCED = "divorced", "Divorced"
        WIDOWED = "widowed", "Widowed"
        ANNULLED = "annulled", "Annulled"

    class ManglikStatus(models.TextChoices):
        YES = "yes", "Yes"
        NO = "no", "No"
        PARTIAL = "partial", "Partial (Anshik)"
        DONT_KNOW = "dont_know", "Don't Know"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")

    date_of_birth = models.DateField(null=True, blank=True)
    height_cm = models.PositiveIntegerField(null=True, blank=True, help_text="Height in centimeters")
    weight_kg = models.PositiveIntegerField(null=True, blank=True)
    marital_status = models.CharField(max_length=20, choices=MaritalStatus.choices, default=MaritalStatus.NEVER_MARRIED)
    manglik_status = models.CharField(max_length=15, choices=ManglikStatus.choices, default=ManglikStatus.DONT_KNOW)
    blood_group = models.CharField(max_length=5, blank=True)
    about_me = models.TextField(max_length=1000, blank=True)

    current_city = models.CharField(max_length=100, blank=True)
    permanent_address = models.TextField(blank=True)
    country = models.CharField(max_length=60, default="India")
    state = models.CharField(max_length=60, blank=True)

    profile_completion = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Profile of {self.user.full_name}"

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = timezone.now().date()
        born = self.date_of_birth
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


class ProfilePhoto(models.Model):
    """Profile photos with visibility controls."""

    class Visibility(models.TextChoices):
        PUBLIC = "public", "Public"
        PRIVATE = "private", "Private"
        MATCHES_ONLY = "matches_only", "Matches Only"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="photos")
    photo = models.ImageField(upload_to="profile_photos/%Y/%m/")
    is_primary = models.BooleanField(default=False)
    visibility = models.CharField(max_length=15, choices=Visibility.choices, default=Visibility.PUBLIC)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "-uploaded_at"]

    def __str__(self):
        return f"Photo of {self.profile.user.full_name}"


class Education(models.Model):
    """Education details."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="education")
    highest_qualification = models.CharField(max_length=100, blank=True)
    field_of_study = models.CharField(max_length=100, blank=True)
    institution_name = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.highest_qualification} - {self.profile.user.full_name}"


class Career(models.Model):
    """Career / Employment details."""

    class EmploymentType(models.TextChoices):
        SALARIED = "salaried", "Salaried"
        SELF_EMPLOYED = "self_employed", "Self Employed"
        BUSINESS = "business", "Business"
        NOT_WORKING = "not_working", "Not Working"
        STUDENT = "student", "Student"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="career")
    occupation = models.CharField(max_length=100, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, blank=True)
    annual_income_range = models.CharField(max_length=50, blank=True, help_text="e.g. 5-10 LPA")
    work_location = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.occupation} - {self.profile.user.full_name}"


class FamilyDetails(models.Model):
    """Family information."""

    class FamilyType(models.TextChoices):
        JOINT = "joint", "Joint Family"
        NUCLEAR = "nuclear", "Nuclear Family"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="family")
    father_name = models.CharField(max_length=100, blank=True)
    father_occupation = models.CharField(max_length=100, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)
    mother_occupation = models.CharField(max_length=100, blank=True)
    siblings_count = models.PositiveIntegerField(default=0)
    family_type = models.CharField(max_length=10, choices=FamilyType.choices, blank=True)
    family_spiritual_background = models.TextField(blank=True)
    family_sampraday = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name_plural = "Family Details"

    def __str__(self):
        return f"Family of {self.profile.user.full_name}"


class Lifestyle(models.Model):
    """Lifestyle and dietary habits."""

    class Consumption(models.TextChoices):
        YES = "yes", "Yes"
        NO = "no", "No"
        OCCASIONALLY = "occasionally", "Occasionally"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="lifestyle")
    is_vegetarian = models.BooleanField(default=True)
    onion_garlic = models.CharField(max_length=15, choices=Consumption.choices, default=Consumption.NO)
    alcohol = models.CharField(max_length=15, choices=Consumption.choices, default=Consumption.NO)
    smoking = models.CharField(max_length=15, choices=Consumption.choices, default=Consumption.NO)
    tea_coffee = models.CharField(max_length=15, choices=Consumption.choices, default=Consumption.YES)
    prasad_only_diet = models.BooleanField(default=False)
    personality_type = models.CharField(max_length=50, blank=True)
    hobbies = models.TextField(blank=True)

    def __str__(self):
        return f"Lifestyle of {self.profile.user.full_name}"


class PartnerPreference(models.Model):
    """What the user is looking for in a partner."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="partner_preference")

    # Spiritual
    preferred_sampraday = models.ForeignKey(
        "spirituality.Sampraday", on_delete=models.SET_NULL, null=True, blank=True
    )
    min_spiritual_level = models.CharField(max_length=50, blank=True)
    dietary_expectation = models.CharField(max_length=50, blank=True)
    temple_participation = models.CharField(max_length=50, blank=True)

    # Personal
    min_age = models.PositiveIntegerField(null=True, blank=True)
    max_age = models.PositiveIntegerField(null=True, blank=True)
    min_height_cm = models.PositiveIntegerField(null=True, blank=True)
    max_height_cm = models.PositiveIntegerField(null=True, blank=True)
    preferred_education = models.CharField(max_length=100, blank=True)
    preferred_location = models.CharField(max_length=100, blank=True)
    marital_status_preference = models.CharField(max_length=50, blank=True)
    willingness_to_relocate = models.BooleanField(default=False)

    def __str__(self):
        return f"Preferences of {self.profile.user.full_name}"
