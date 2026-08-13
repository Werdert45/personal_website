from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("research", "0010_citation_metadata"),
    ]

    operations = [
        migrations.AddField(
            model_name="research",
            name="excerpt",
            field=models.TextField(
                blank=True,
                help_text="Plain-language dek shown in list rows (abstract stays on the detail page)",
            ),
        ),
    ]
