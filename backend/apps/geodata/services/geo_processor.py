"""
GeoProcessor service for parsing and ingesting geospatial files into PostGIS.
Supports GeoJSON, GeoPackage (.gpkg), and Shapefile (.shp) formats.
"""

import json
import os
import tempfile
import zipfile
from typing import Any

import fiona
from django.contrib.gis.geos import GEOSGeometry
from django.db import transaction
from shapely.geometry import mapping, shape

from apps.geodata.models import GeoFeature, GeoUploadedDataset


class GeoProcessor:
    """
    Service for processing and ingesting geospatial files.
    """

    SUPPORTED_FORMATS = {
        ".geojson": "geojson",
        ".json": "geojson",
        ".gpkg": "gpkg",
        ".shp": "shp",
        ".zip": "shp",  # Zipped shapefiles
    }

    FIELD_TYPE_MAP = {
        "int": "integer",
        "int32": "integer",
        "int64": "integer",
        "float": "float",
        "float64": "float",
        "str": "string",
        "date": "date",
        "datetime": "datetime",
        "bool": "boolean",
    }

    def __init__(self, file, filename: str, name: str = None, description: str = ""):
        """
        Initialize the processor with an uploaded file.

        Args:
            file: Django UploadedFile or file-like object
            filename: Original filename
            name: Optional dataset name (defaults to filename without extension)
            description: Optional description for the dataset
        """
        self.file = file
        self.filename = filename
        self.name = name or os.path.splitext(filename)[0]
        self.description = description
        self.file_format = self._detect_format()

    def _detect_format(self) -> str:
        """Detect the file format from the filename extension."""
        ext = os.path.splitext(self.filename)[1].lower()
        if ext not in self.SUPPORTED_FORMATS:
            raise ValueError(
                f"Unsupported file format: {ext}. "
                f"Supported formats: {list(self.SUPPORTED_FORMATS.keys())}"
            )
        return self.SUPPORTED_FORMATS[ext]

    def _normalize_field_type(self, fiona_type: str) -> str:
        """Convert Fiona field types to simplified type names."""
        fiona_type_lower = str(fiona_type).lower()
        for key, value in self.FIELD_TYPE_MAP.items():
            if key in fiona_type_lower:
                return value
        return "string"

    def _extract_schema(self, collection) -> tuple[list[str], dict[str, str]]:
        """
        Extract field names and types from a Fiona collection.

        Returns:
            Tuple of (field_names, field_types_dict)
        """
        schema = collection.schema
        properties = schema.get("properties", {})

        field_names = list(properties.keys())
        field_types = {
            name: self._normalize_field_type(ftype)
            for name, ftype in properties.items()
        }

        return field_names, field_types

    def _calculate_bounds(self, collection) -> list[float] | None:
        """Calculate the bounding box from a Fiona collection."""
        try:
            bounds = collection.bounds
            if bounds:
                return list(bounds)  # [minx, miny, maxx, maxy]
        except Exception:
            pass
        return None

    def _process_geojson(self, temp_path: str) -> dict[str, Any]:
        """Process a GeoJSON file."""
        with fiona.open(temp_path, "r") as collection:
            return self._ingest_collection(collection)

    def _process_gpkg(self, temp_path: str) -> dict[str, Any]:
        """Process a GeoPackage file."""
        with fiona.open(temp_path, "r") as collection:
            return self._ingest_collection(collection)

    def _process_shapefile(self, temp_path: str) -> dict[str, Any]:
        """Process a Shapefile (or zipped shapefile)."""
        # Check if it's a zip file
        if zipfile.is_zipfile(temp_path):
            with tempfile.TemporaryDirectory() as extract_dir:
                with zipfile.ZipFile(temp_path, "r") as zip_ref:
                    zip_ref.extractall(extract_dir)

                # Find the .shp file
                shp_file = None
                for root, dirs, files in os.walk(extract_dir):
                    for f in files:
                        if f.lower().endswith(".shp"):
                            shp_file = os.path.join(root, f)
                            break
                    if shp_file:
                        break

                if not shp_file:
                    raise ValueError("No .shp file found in the zip archive")

                with fiona.open(shp_file, "r") as collection:
                    return self._ingest_collection(collection)
        else:
            with fiona.open(temp_path, "r") as collection:
                return self._ingest_collection(collection)

    @transaction.atomic
    def _ingest_collection(self, collection) -> dict[str, Any]:
        """
        Ingest a Fiona collection into the database.

        Returns:
            Dictionary with dataset info and statistics
        """
        # Extract schema information
        field_names, field_types = self._extract_schema(collection)
        bounds = self._calculate_bounds(collection)

        # Create the dataset record
        dataset = GeoUploadedDataset.objects.create(
            name=self.name,
            description=self.description,
            original_filename=self.filename,
            file_format=self.file_format,
            available_fields=field_names,
            field_types=field_types,
            bounds=bounds,
            feature_count=0,  # Will update after processing
        )

        # Bulk create features
        features_to_create = []
        feature_count = 0

        for feature in collection:
            try:
                # Convert geometry to GEOSGeometry
                geom = feature.get("geometry")
                if geom is None:
                    continue

                # Use shapely for geometry conversion
                shapely_geom = shape(geom)
                geos_geom = GEOSGeometry(json.dumps(mapping(shapely_geom)), srid=4326)

                # Get properties
                props = dict(feature.get("properties", {}))

                features_to_create.append(
                    GeoFeature(
                        dataset=dataset,
                        geometry=geos_geom,
                        properties=props,
                    )
                )
                feature_count += 1

                # Bulk insert in batches of 1000
                if len(features_to_create) >= 1000:
                    GeoFeature.objects.bulk_create(features_to_create)
                    features_to_create = []

            except Exception as e:
                # Log but continue processing other features
                print(f"Error processing feature: {e}")
                continue

        # Insert remaining features
        if features_to_create:
            GeoFeature.objects.bulk_create(features_to_create)

        # Update feature count
        dataset.feature_count = feature_count
        dataset.save(update_fields=["feature_count"])

        return {
            "dataset_id": dataset.id,
            "name": dataset.name,
            "file_format": dataset.file_format,
            "feature_count": feature_count,
            "available_fields": field_names,
            "field_types": field_types,
            "bounds": bounds,
        }

    def process(self) -> dict[str, Any]:
        """
        Process the uploaded file and ingest it into PostGIS.

        Returns:
            Dictionary with dataset info and statistics
        """
        # Save the file to a temporary location
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=os.path.splitext(self.filename)[1]
        ) as temp_file:
            for chunk in self.file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        try:
            if self.file_format == "geojson":
                return self._process_geojson(temp_path)
            elif self.file_format == "gpkg":
                return self._process_gpkg(temp_path)
            elif self.file_format == "shp":
                return self._process_shapefile(temp_path)
            else:
                raise ValueError(f"Unsupported format: {self.file_format}")
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
