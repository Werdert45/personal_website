from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("research", "0011_research_excerpt"),
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
                    ("project", "Project"),
                    ("other", "Other"),
                ],
                default="research",
                max_length=50,
            ),
        ),
    ]
