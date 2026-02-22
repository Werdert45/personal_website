"""
Management command to create an admin user.
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create an admin user if one doesn't exist"

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            default="admin@example.com",
            help="Admin email address",
        )
        parser.add_argument(
            "--username",
            default="admin",
            help="Admin username",
        )
        parser.add_argument(
            "--password",
            default="admin",
            help="Admin password",
        )

    def handle(self, *args, **options):
        email = options["email"]
        username = options["username"]
        password = options["password"]

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"User with email {email} already exists"))
            return

        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            is_admin=True,
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Created admin user: {email}"))
