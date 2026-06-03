from django.core.management.base import BaseCommand
from apps.chat.knowledge import seed_kb


class Command(BaseCommand):
    help = "Seed the SQLite FTS5 knowledge base for the chat widget"

    def handle(self, *args, **options):
        n = seed_kb()
        self.stdout.write(self.style.SUCCESS(f"Seeded {n} knowledge chunks into chat_kb.sqlite3"))
