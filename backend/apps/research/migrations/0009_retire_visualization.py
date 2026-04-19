from django.db import migrations


def copy_visualizations_to_blog(apps, schema_editor):
    Visualization = apps.get_model("research", "Visualization")
    BlogPost = apps.get_model("blog", "BlogPost")

    for viz in Visualization.objects.all():
        if BlogPost.objects.filter(slug=viz.slug).exists():
            new_slug = f"{viz.slug}-viz"
        else:
            new_slug = viz.slug

        meta = {
            "map_config": viz.map_config or {},
            "geojson_endpoint": viz.geojson_endpoint or "",
            "geojson_data": viz.geojson_data,
            "geodataset_id": viz.geodataset_id,
            "value_field": viz.value_field or "",
            "technologies": viz.technologies or [],
            "data_points": viz.data_points or "",
            "region": viz.region or "",
            "metrics": viz.metrics or [],
        }

        BlogPost.objects.create(
            title=viz.title,
            slug=new_slug,
            excerpt=viz.description or "",
            content=viz.content or "",
            category="visualisation",
            status=viz.status,
            tags=[],
            meta=meta,
            date=viz.date or "",
            cover_image=viz.preview_image or "",
            featured=False,
            is_premium=viz.is_premium,
            published_at=viz.created_at,
            created_at=viz.created_at,
            updated_at=viz.updated_at,
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("research", "0008_allow_blank_text_fields"),
        ("blog", "0002_new_categories_and_meta"),
    ]

    operations = [
        migrations.RunPython(copy_visualizations_to_blog, noop_reverse),
        migrations.DeleteModel(name="Visualization"),
    ]
