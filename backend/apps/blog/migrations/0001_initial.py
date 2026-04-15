from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="BlogPost",
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
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(unique=True)),
                (
                    "excerpt",
                    models.TextField(
                        blank=True,
                        help_text="Short summary shown in listings",
                    ),
                ),
                (
                    "content",
                    models.TextField(blank=True, help_text="Markdown content"),
                ),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("article", "Article"),
                            ("tutorial", "Tutorial"),
                            ("note", "Note"),
                            ("announcement", "Announcement"),
                            ("other", "Other"),
                        ],
                        default="article",
                        max_length=50,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("published", "Published"),
                            ("archived", "Archived"),
                        ],
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("tags", models.JSONField(default=list)),
                (
                    "read_time",
                    models.CharField(
                        blank=True,
                        help_text="e.g., '5 min'",
                        max_length=20,
                    ),
                ),
                (
                    "date",
                    models.CharField(
                        blank=True,
                        help_text="Display date, e.g., 'March 2026'",
                        max_length=50,
                    ),
                ),
                (
                    "cover_image",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text="URL path for the cover/preview image",
                        max_length=500,
                    ),
                ),
                ("author", models.CharField(blank=True, default="", max_length=100)),
                ("featured", models.BooleanField(default=False)),
                ("is_premium", models.BooleanField(default=False)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "blog_post",
                "ordering": ["-published_at", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="BlogPostTranslation",
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
                ("excerpt", models.TextField(blank=True)),
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
                    "post",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="translations",
                        to="blog.blogpost",
                    ),
                ),
            ],
            options={
                "db_table": "blog_post_translation",
                "unique_together": {("post", "language")},
            },
        ),
    ]
