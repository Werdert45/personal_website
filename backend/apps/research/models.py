"""
Models for Research articles.
"""

from django.db import models

from apps.geodata.models import GeoUploadedDataset


class Research(models.Model):
    """
    Research article model for academic/research content.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]

    CATEGORY_CHOICES = [
        ("research", "Research"),
        ("analysis", "Analysis"),
        ("case-study", "Case Study"),
        ("methodology", "Methodology"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    abstract = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text="Markdown content for the article")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="research")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    tags = models.JSONField(default=list)

    # Article metadata
    read_time = models.CharField(max_length=20, blank=True, help_text="e.g., '15 min'")
    date = models.CharField(max_length=50, blank=True, help_text="Display date, e.g., 'January 2025'")

    # PDF file upload
    pdf_file = models.FileField(
        upload_to="research/pdfs/",
        null=True,
        blank=True,
        help_text="PDF version of the research article",
    )

    # Preview image (URL path from upload endpoint)
    preview_image = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="URL path for the preview/thumbnail image",
    )

    # Map configuration (for articles with maps)
    has_map = models.BooleanField(default=False)
    map_config = models.JSONField(
        default=dict,
        help_text="Map configuration: {center: [lng, lat], zoom: number, style: string}",
    )
    geojson_endpoint = models.CharField(
        max_length=500,
        blank=True,
        help_text="Django API endpoint for GeoJSON data, e.g., 'geodata/amsterdam-properties'",
    )
    geojson_data = models.JSONField(
        null=True,
        blank=True,
        help_text="GeoJSON data for the article's map (legacy, prefer geojson_endpoint)",
    )

    # PostGIS dataset reference (for uploaded geodata)
    geodataset = models.ForeignKey(
        GeoUploadedDataset,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="research_articles",
        help_text="Reference to uploaded PostGIS dataset",
    )
    value_field = models.CharField(
        max_length=100,
        blank=True,
        help_text="Field name to use for visualization values",
    )

    # Premium content gating
    is_premium = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "research"
        ordering = ["-created_at"]
        verbose_name_plural = "Research"

    def __str__(self):
        return self.title


class ResearchTranslation(models.Model):
    """
    Translation of a Research article into another language.
    """

    LANGUAGE_CHOICES = [
        ("nl", "Dutch"),
        ("it", "Italian"),
    ]

    research = models.ForeignKey(
        Research,
        on_delete=models.CASCADE,
        related_name="translations",
    )
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES)
    title = models.CharField(max_length=255)
    slug = models.SlugField(blank=True)
    abstract = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text="Markdown content in the target language")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "research_translation"
        unique_together = [("research", "language")]

    def __str__(self):
        return f"{self.research.title} ({self.get_language_display()})"


class Visualization(models.Model):
    """
    Visualization model for data visualizations.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]

    CATEGORY_CHOICES = [
        ("heatmap", "Heatmap"),
        ("choropleth", "Choropleth"),
        ("scatter", "Scatter Plot"),
        ("time-series", "Time Series"),
        ("network", "Network"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text="Markdown content for the visualization")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # Preview image (URL path from upload endpoint)
    preview_image = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="URL path for the preview/thumbnail image",
    )

    # Visualization metadata
    technologies = models.JSONField(default=list)
    data_points = models.CharField(max_length=100, blank=True, help_text="e.g., '45,000+ properties'")
    region = models.CharField(max_length=100, blank=True, help_text="e.g., 'Amsterdam, NL'")
    date = models.CharField(max_length=50, blank=True)
    metrics = models.JSONField(default=list, help_text="Key metrics to display")

    # Map configuration
    map_config = models.JSONField(
        default=dict,
        help_text="Map configuration: {center: [lng, lat], zoom: number, style: string}",
    )
    geojson_endpoint = models.CharField(
        max_length=500,
        blank=True,
        help_text="Django API endpoint for GeoJSON data, e.g., 'geodata/amsterdam-heatmap'",
    )
    geojson_data = models.JSONField(
        null=True,
        blank=True,
        help_text="GeoJSON data for the visualization (legacy, prefer geojson_endpoint)",
    )

    # PostGIS dataset reference (for uploaded geodata)
    geodataset = models.ForeignKey(
        GeoUploadedDataset,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="visualizations",
        help_text="Reference to uploaded PostGIS dataset",
    )
    value_field = models.CharField(
        max_length=100,
        blank=True,
        help_text="Field name to use for visualization values",
    )

    # Premium content gating
    is_premium = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "visualizations"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
