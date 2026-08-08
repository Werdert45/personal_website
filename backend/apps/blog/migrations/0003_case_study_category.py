from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0002_new_categories_and_meta"),
    ]

    operations = [
        migrations.AlterField(
            model_name="blogpost",
            name="category",
            field=models.CharField(
                choices=[
                    ("visualisation", "Visualisation"),
                    ("update", "Update"),
                    ("explanation", "Explanation"),
                    ("thought", "Thought"),
                    ("note", "Note"),
                    ("case-study", "Case Study"),
                ],
                default="thought",
                max_length=50,
            ),
        ),
    ]
