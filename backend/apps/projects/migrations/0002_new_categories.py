from django.db import migrations, models


CATEGORY_REMAP = {
    "web": "webapp",
    "data": "other",
    "gis": "other",
    "ml": "other",
    "other": "other",
}


def remap_categories(apps, schema_editor):
    Project = apps.get_model("projects", "Project")
    for project in Project.objects.all():
        new_cat = CATEGORY_REMAP.get(project.category, "other")
        if new_cat != project.category:
            project.category = new_cat
            project.save(update_fields=["category"])


def reverse_remap_categories(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(remap_categories, reverse_remap_categories),
        migrations.AlterField(
            model_name="project",
            name="category",
            field=models.CharField(
                choices=[
                    ("webapp", "Web App"),
                    ("simulation", "Simulation"),
                    ("tool", "Tool"),
                    ("other", "Other"),
                ],
                default="other",
                max_length=50,
            ),
        ),
    ]
