"""Management command to seed Sampraday and Guru master data."""

from django.core.management.base import BaseCommand
from apps.spirituality.models import Guru, Sampraday


SAMPRADAY_DATA = [
    {
        "name": "Pushtimarg",
        "description": "Founded by Shri Vallabhacharya. Focuses on Krishna bhakti through grace (pushti) and devotion to Shrinathji.",
        "gurus": [
            {"name": "Shri Vallabhacharya", "temple_name": "Shrinathji Temple", "location": "Nathdwara, Rajasthan"},
            {"name": "Shri Vitthalnathji", "temple_name": "Shrinathji Temple", "location": "Nathdwara, Rajasthan"},
        ],
    },
    {
        "name": "Gaudiya Vaishnav",
        "description": "Founded by Shri Chaitanya Mahaprabhu. Emphasizes devotional love for Radha-Krishna through kirtan and nama-sankirtan.",
        "gurus": [
            {"name": "Shri Chaitanya Mahaprabhu", "temple_name": "Radha Damodar Temple", "location": "Vrindavan, UP"},
            {"name": "Shri Rupa Goswami", "temple_name": "Radha Damodar Temple", "location": "Vrindavan, UP"},
        ],
    },
    {
        "name": "ISKCON",
        "description": "International Society for Krishna Consciousness, founded by A.C. Bhaktivedanta Swami Prabhupada. Follows Gaudiya Vaishnav tradition globally.",
        "gurus": [
            {"name": "A.C. Bhaktivedanta Swami Prabhupada", "temple_name": "ISKCON Temple", "location": "Mumbai, Maharashtra"},
            {"name": "Radhanath Swami", "temple_name": "ISKCON Chowpatty", "location": "Mumbai, Maharashtra"},
            {"name": "Gaur Gopal Das", "temple_name": "ISKCON Chowpatty", "location": "Mumbai, Maharashtra"},
        ],
    },
    {
        "name": "Vallabh Sampraday",
        "description": "Also known as Pushtimarg, following the path of Shri Vallabhacharya with deep devotion to Shri Krishna as Shrinathji.",
        "gurus": [
            {"name": "Shri Vallabhacharya", "temple_name": "Shrinathji Temple", "location": "Nathdwara, Rajasthan"},
        ],
    },
    {
        "name": "Ramanandi",
        "description": "Founded by Ramananda, following the devotional tradition of Lord Rama within the Vaishnav framework.",
        "gurus": [
            {"name": "Swami Ramananda", "temple_name": "Hanuman Garhi", "location": "Ayodhya, UP"},
        ],
    },
    {
        "name": "Swaminarayan",
        "description": "Founded by Bhagwan Swaminarayan. Follows strict dharmic discipline and devotion to Krishna.",
        "gurus": [
            {"name": "Bhagwan Swaminarayan", "temple_name": "Akshardham Temple", "location": "Gandhinagar, Gujarat"},
            {"name": "Pramukh Swami Maharaj", "temple_name": "BAPS Swaminarayan Temple", "location": "Ahmedabad, Gujarat"},
        ],
    },
    {
        "name": "Nimbark Sampraday",
        "description": "Founded by Shri Nimbarkacharya. Follows Dvaitadvaita philosophy with devotion to Radha-Krishna.",
        "gurus": [
            {"name": "Shri Nimbarkacharya", "temple_name": "Nimbark Peeth", "location": "Vrindavan, UP"},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed Sampraday and Guru master data"

    def handle(self, *args, **options):
        created_sampradays = 0
        created_gurus = 0

        for data in SAMPRADAY_DATA:
            sampraday, created = Sampraday.objects.get_or_create(
                name=data["name"],
                defaults={"description": data["description"]},
            )
            if created:
                created_sampradays += 1
                self.stdout.write(f"  Created Sampraday: {sampraday.name}")

            for guru_data in data.get("gurus", []):
                guru, created = Guru.objects.get_or_create(
                    name=guru_data["name"],
                    sampraday=sampraday,
                    defaults={
                        "temple_name": guru_data.get("temple_name", ""),
                        "location": guru_data.get("location", ""),
                    },
                )
                if created:
                    created_gurus += 1
                    self.stdout.write(f"    Created Guru: {guru.name}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {created_sampradays} sampradays and {created_gurus} gurus."
            )
        )
