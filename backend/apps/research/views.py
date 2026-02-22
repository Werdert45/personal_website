"""
Views for Research, ResearchTranslation, Visualizations, and Image uploads.
"""

import os
import uuid

from django.conf import settings
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS, BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Research, ResearchTranslation, Visualization
from .serializers import (
    ImageUploadSerializer,
    ResearchListSerializer,
    ResearchSerializer,
    ResearchTranslationSerializer,
    VisualizationListSerializer,
    VisualizationSerializer,
)


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Allow read-only access to anyone, but require authentication for write operations.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class ResearchListCreateView(generics.ListCreateAPIView):
    """List all research articles or create a new one."""

    queryset = Research.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ResearchListSerializer
        return ResearchSerializer


    def get_queryset(self):
        queryset = Research.objects.prefetch_related("translations").all()

        # Filter by status if specified
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # Filter by tag
        tag = self.request.query_params.get("tag")
        if tag:
            queryset = queryset.filter(tags__contains=[tag])

        # Filter by has_map
        has_map = self.request.query_params.get("has_map")
        if has_map is not None:
            queryset = queryset.filter(has_map=has_map.lower() == "true")

        return queryset


class ResearchDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a research article."""

    queryset = Research.objects.all()
    serializer_class = ResearchSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Research.objects.prefetch_related("translations").all()




class ResearchTranslationView(generics.GenericAPIView):
    """Create or update translations for a research article."""

    serializer_class = ResearchTranslationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_research(self):
        slug = self.kwargs["slug"]
        return Research.objects.get(slug=slug)

    def get(self, request, slug):
        """List translations for a research article."""
        research = self.get_research()
        translations = research.translations.all()
        serializer = self.get_serializer(translations, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        """Create or update a translation for a research article."""
        research = self.get_research()
        language = request.data.get("language")

        if not language:
            return Response(
                {"language": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        translation, created = ResearchTranslation.objects.update_or_create(
            research=research,
            language=language,
            defaults={
                "title": request.data.get("title", ""),
                "slug": request.data.get("slug", ""),
                "abstract": request.data.get("abstract", ""),
                "content": request.data.get("content", ""),
            },
        )

        serializer = self.get_serializer(translation)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class VisualizationListCreateView(generics.ListCreateAPIView):
    """List all visualizations or create a new one."""

    queryset = Visualization.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return VisualizationListSerializer
        return VisualizationSerializer

    def get_queryset(self):
        queryset = Visualization.objects.all()

        # Filter by status if specified
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        return queryset


class VisualizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a visualization."""

    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Visualization.objects.all()


class ImageUploadView(APIView):
    """Upload an image for use in markdown content or as preview."""

    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
    MAX_SIZE = 10 * 1024 * 1024  # 10MB

    def post(self, request):
        serializer = ImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = serializer.validated_data["image"]

        # Validate extension
        ext = os.path.splitext(image.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return Response(
                {"error": f"Invalid file type. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate size
        if image.size > self.MAX_SIZE:
            return Response(
                {"error": "File size exceeds 10MB limit"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate unique filename
        unique_name = f"{uuid.uuid4().hex}{ext}"
        upload_dir = os.path.join(settings.MEDIA_ROOT, "content", "images")
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, unique_name)
        with open(file_path, "wb+") as dest:
            for chunk in image.chunks():
                dest.write(chunk)

        # Build the URL
        url = f"{settings.MEDIA_URL}content/images/{unique_name}"

        return Response(
            {
                "url": url,
                "filename": unique_name,
                "original_name": image.name,
                "size": image.size,
            },
            status=status.HTTP_201_CREATED,
        )
