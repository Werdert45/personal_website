from django.db import migrations, models


CATEGORY_REMAP = {
    "article": "thought",
    "tutorial": "explanation",
    "note": "note",
    "announcement": "update",
    "other": "thought",
}


def remap_categories(apps, schema_editor):
    BlogPost = apps.get_model("blog", "BlogPost")
    for post in BlogPost.objects.all():
        new_cat = CATEGORY_REMAP.get(post.category, "thought")
        if new_cat != post.category:
            post.category = new_cat
            post.save(update_fields=["category"])


def reverse_remap_categories(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="blogpost",
            name="meta",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Arbitrary metadata (e.g., map_config, geojson_endpoint for visualisation posts).",
            ),
        ),
        migrations.RunPython(remap_categories, reverse_remap_categories),
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
                ],
                default="thought",
                max_length=50,
            ),
        ),
    ]
