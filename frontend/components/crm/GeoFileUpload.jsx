"use client";

import { useState, useCallback } from "react";
import { Upload, File, Check, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function GeoFileUpload({ onUploadComplete, token }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const allowedExtensions = [".geojson", ".json", ".gpkg", ".shp", ".zip"];

  const validateFile = (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`;
    }
    // 100MB limit
    if (file.size > 100 * 1024 * 1024) {
      return "File size exceeds 100MB limit";
    }
    return null;
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setUploadResult(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    setError(null);
    setUploadResult(null);

    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/geodata/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      setUploadResult(result);

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setUploadResult(null);
    setProgress(0);
  };

  // Success state
  if (uploadResult) {
    return (
      <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-yellow-400">Upload successful</p>
            <p className="text-sm text-slate-400 mt-1">
              {uploadResult.name} • {uploadResult.feature_count} features •{" "}
              {uploadResult.available_fields.length} fields
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {uploadResult.available_fields.slice(0, 5).map((field) => (
                <span
                  key={field}
                  className="text-xs bg-slate-700 px-2 py-0.5 rounded"
                >
                  {field}
                </span>
              ))}
              {uploadResult.available_fields.length > 5 && (
                <span className="text-xs text-slate-500">
                  +{uploadResult.available_fields.length - 5} more
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${
            isDragging
              ? "border-yellow-500 bg-yellow-500/10"
              : "border-slate-600 hover:border-slate-500"
          }
          ${error ? "border-red-500/50" : ""}
        `}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <File className="w-8 h-8 text-yellow-500" />
            <div className="text-left">
              <p className="font-medium text-slate-200">{file.name}</p>
              <p className="text-sm text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-300 mb-1">
              Drop your geospatial file here, or{" "}
              <label className="text-yellow-500 hover:text-yellow-400 cursor-pointer">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept=".geojson,.json,.gpkg,.shp,.zip"
                  onChange={handleFileSelect}
                />
              </label>
            </p>
            <p className="text-xs text-slate-500">
              GeoJSON, GeoPackage, or Shapefile (max 100MB)
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-slate-400 text-center">
            Processing file... {progress}%
          </p>
        </div>
      )}

      {/* Upload button */}
      {file && !uploading && (
        <Button
          onClick={handleUpload}
          className="w-full bg-yellow-600 hover:bg-yellow-700"
          disabled={!token}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Process
            </>
          )}
        </Button>
      )}
    </div>
  );
}
