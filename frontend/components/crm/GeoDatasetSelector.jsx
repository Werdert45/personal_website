"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, MapPin, Calendar, Loader2 } from "lucide-react";

export function GeoDatasetSelector({
  value,
  onChange,
  onDatasetLoad,
  label = "Select Dataset",
  placeholder = "Choose an uploaded dataset",
}) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/geodata/datasets/");
      if (!response.ok) {
        throw new Error("Failed to fetch datasets");
      }
      const data = await response.json();
      setDatasets(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (datasetId) => {
    onChange(datasetId);

    // Find the selected dataset and pass its info
    const selectedDataset = datasets.find(
      (d) => d.id.toString() === datasetId
    );
    if (selectedDataset && onDatasetLoad) {
      onDatasetLoad(selectedDataset);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileType = (format) => {
    const formats = {
      geojson: "GeoJSON",
      gpkg: "GeoPackage",
      shp: "Shapefile",
    };
    return formats[format] || format;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading datasets...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <div className="text-sm text-red-400">{error}</div>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <div className="text-sm text-slate-500 italic">
          No datasets uploaded yet. Upload a geospatial file first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <Select value={value?.toString() || ""} onValueChange={handleChange}>
        <SelectTrigger className="w-full bg-slate-800 border-slate-600">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600 max-h-[300px]">
          {datasets.map((dataset) => (
            <SelectItem
              key={dataset.id}
              value={dataset.id.toString()}
              className="focus:bg-slate-700"
            >
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{dataset.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 ml-6">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {dataset.feature_count} features
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-slate-700 text-slate-300 text-xs"
                  >
                    {formatFileType(dataset.file_format)}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(dataset.created_at)}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
