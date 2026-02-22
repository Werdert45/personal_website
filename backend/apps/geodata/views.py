"""
Views for GeoData API.
"""

import json

from django.contrib.gis.geos import GEOSGeometry
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS, BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView
from shapely.geometry import mapping


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Allow read-only access to anyone, but require authentication for write operations.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

from .models import GeoDataset, GeoFeature, GeoUploadedDataset
from .serializers import (
    GeoDatasetListSerializer,
    GeoDatasetSerializer,
    GeoFileUploadSerializer,
    GeoJSONSerializer,
    GeoUploadedDatasetDetailSerializer,
    GeoUploadedDatasetListSerializer,
    GeoUploadResponseSerializer,
)
from .services import GeoProcessor


class GeoDatasetListCreateView(generics.ListCreateAPIView):
    """List all geodatasets or create a new one."""

    queryset = GeoDataset.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return GeoDatasetListSerializer
        return GeoDatasetSerializer


class GeoDatasetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a geodataset."""

    queryset = GeoDataset.objects.all()
    serializer_class = GeoDatasetSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"


class GeoJSONView(generics.RetrieveAPIView):
    """
    Returns only the GeoJSON data for a dataset.
    This is the endpoint that visualizations and research articles reference.
    """

    queryset = GeoDataset.objects.all()
    serializer_class = GeoJSONSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Return GeoJSON directly without wrapper
        return Response(instance.geojson)


# Views for uploaded PostGIS datasets


class GeoUploadedDatasetListView(generics.ListAPIView):
    """List all uploaded geodatasets."""

    queryset = GeoUploadedDataset.objects.all()
    serializer_class = GeoUploadedDatasetListSerializer
    permission_classes = [AllowAny]


class GeoUploadedDatasetDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve or delete an uploaded geodataset."""

    queryset = GeoUploadedDataset.objects.all()
    serializer_class = GeoUploadedDatasetDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class GeoFileUploadView(APIView):
    """
    Upload a geospatial file (GeoJSON, GeoPackage, or Shapefile).
    The file will be parsed and ingested into PostGIS.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GeoFileUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        name = serializer.validated_data.get("name") or None
        description = serializer.validated_data.get("description", "")

        try:
            processor = GeoProcessor(
                file=uploaded_file,
                filename=uploaded_file.name,
                name=name,
                description=description,
            )
            result = processor.process()

            response_serializer = GeoUploadResponseSerializer(data=result)
            response_serializer.is_valid(raise_exception=True)

            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Failed to process file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GeoUploadedDatasetGeoJSONView(APIView):
    """
    Returns GeoJSON for an uploaded dataset with a selected value field.
    The value_field query parameter specifies which property to include as 'value'.
    """

    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            dataset = GeoUploadedDataset.objects.get(pk=pk)
        except GeoUploadedDataset.DoesNotExist:
            return Response(
                {"error": "Dataset not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        value_field = request.query_params.get("value_field")

        # Build GeoJSON FeatureCollection
        features = []
        for feature in dataset.features.all():
            # Convert PostGIS geometry to GeoJSON
            geom_json = json.loads(feature.geometry.geojson)

            # Build properties - include all, plus a 'value' key for the selected field
            props = feature.properties.copy()
            if value_field and value_field in feature.properties:
                props["value"] = feature.properties[value_field]

            features.append({
                "type": "Feature",
                "geometry": geom_json,
                "properties": props,
            })

        geojson = {
            "type": "FeatureCollection",
            "features": features,
        }

        return Response(geojson)
