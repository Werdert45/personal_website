"""
Views for Projects and Layers.
"""

from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Layer, Project
from .serializers import LayerSerializer, ProjectListSerializer, ProjectSerializer


class ProjectListCreateView(generics.ListCreateAPIView):
    """List all projects or create a new one."""

    queryset = Project.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ProjectListSerializer
        return ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.all()

        # Filter by status (only show published for non-authenticated users)
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status="published")
        else:
            status_filter = self.request.query_params.get("status")
            if status_filter:
                queryset = queryset.filter(status=status_filter)

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # Filter by featured
        featured = self.request.query_params.get("featured")
        if featured is not None:
            queryset = queryset.filter(featured=featured.lower() == "true")

        return queryset


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a project."""

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Project.objects.filter(status="published")
        return Project.objects.all()


class LayerListCreateView(generics.ListCreateAPIView):
    """List all layers or create a new one."""

    queryset = Layer.objects.all()
    serializer_class = LayerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Layer.objects.all()

        # Filter by project
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        # Filter by type
        layer_type = self.request.query_params.get("type")
        if layer_type:
            queryset = queryset.filter(layer_type=layer_type)

        # Filter by visibility
        visible = self.request.query_params.get("visible")
        if visible is not None:
            queryset = queryset.filter(visible=visible.lower() == "true")

        return queryset


class LayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a layer."""

    queryset = Layer.objects.all()
    serializer_class = LayerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
