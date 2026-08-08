from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("research", "0009_retire_visualization"),
    ]

    operations = [
        migrations.AlterField(
            model_name="research",
            name="category",
            field=models.CharField(
                choices=[
                    ("research", "Research"),
                    ("analysis", "Analysis"),
                    ("case-study", "Case Study"),
                    ("methodology", "Methodology"),
                    ("working-paper", "Working Paper"),
                    ("preprint", "Preprint"),
                    ("thesis", "Thesis"),
                    ("other", "Other"),
                ],
                default="research",
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name="research",
            name="publication_status",
            field=models.CharField(
                blank=True,
                choices=[
                    ("", "—"),
                    ("in-preparation", "In preparation"),
                    ("working-paper", "Working paper"),
                    ("preprint", "Preprint (arXiv/SSRN)"),
                    ("under-review", "Under review"),
                    ("published", "Published"),
                    ("thesis", "Thesis"),
                ],
                default="",
                help_text="Honest paper status shown to readers (e.g. working paper, preprint)",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="research",
            name="doi",
            field=models.CharField(blank=True, default="", help_text="e.g. 10.5281/zenodo.xxxxxxx", max_length=100),
        ),
        migrations.AddField(
            model_name="research",
            name="arxiv_id",
            field=models.CharField(blank=True, default="", help_text="e.g. 2608.01234", max_length=30),
        ),
        migrations.AddField(
            model_name="research",
            name="repo_url",
            field=models.URLField(blank=True, default="", help_text="Code/data repository URL"),
        ),
        migrations.AddField(
            model_name="research",
            name="cite_as",
            field=models.TextField(blank=True, default="", help_text="Full citation string readers can copy"),
        ),
    ]
