"use client";

import dynamic from "next/dynamic";

const MapboxMap = dynamic(
  () => import("@/components/mapbox-map").then((mod) => mod.MapboxMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export function MapboxWrapper({ geojsonData, title, center, zoom }) {
  return (
    <MapboxMap
      geojsonData={geojsonData}
      title={title}
      center={center}
      zoom={zoom}
    />
  );
}
