from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("research", "0012_research_category_project"),
    ]

    operations = [
        migrations.AlterField(
            model_name="research",
            name="publication_status",
            field=models.CharField(
                blank=True,
                choices=[
                    ("", "\u2014"),
                    ("in-preparation", "In preparation"),
                    ("working-paper", "Working paper"),
                    ("first-version", "First version"),
                    ("preprint", "Preprint (arXiv/SSRN)"),
                    ("under-review", "Under review"),
                    ("published", "Published"),
                    ("thesis", "Thesis"),
                ],
                default="",
                max_length=30,
            ),
        ),
    ]
