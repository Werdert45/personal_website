from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("research", "0003_research_geodataset_research_value_field_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="ResearchTranslation",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "language",
                    models.CharField(
                        choices=[("nl", "Dutch"), ("it", "Italian")],
                        max_length=5,
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(blank=True)),
                ("abstract", models.TextField(blank=True)),
                (
                    "content",
                    models.TextField(
                        blank=True,
                        help_text="Markdown content in the target language",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "research",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="translations",
                        to="research.research",
                    ),
                ),
            ],
            options={
                "db_table": "research_translation",
                "unique_together": {("research", "language")},
            },
        ),
    ]
