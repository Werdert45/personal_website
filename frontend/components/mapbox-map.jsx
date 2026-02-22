"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function getFeatureBounds(geojsonData) {
  const bounds = new mapboxgl.LngLatBounds();

  function extendWithCoords(coords, type) {
    if (type === "Point") {
      bounds.extend(coords);
    } else if (type === "LineString" || type === "MultiPoint") {
      coords.forEach((c) => bounds.extend(c));
    } else if (type === "Polygon" || type === "MultiLineString") {
      coords.forEach((ring) => ring.forEach((c) => bounds.extend(c)));
    } else if (type === "MultiPolygon") {
      coords.forEach((poly) =>
        poly.forEach((ring) => ring.forEach((c) => bounds.extend(c)))
      );
    }
  }

  (geojsonData.features || []).forEach((f) => {
    if (f.geometry?.coordinates) {
      extendWithCoords(f.geometry.coordinates, f.geometry.type);
    }
  });

  return bounds;
}

function hasGeometryType(geojsonData, ...types) {
  return (geojsonData.features || []).some((f) =>
    types.includes(f.geometry?.type)
  );
}

function formatLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(key, val) {
  if (typeof val === "number") {
    if (key.includes("price") || key.includes("income")) return `€${val.toLocaleString()}`;
    if (key.includes("change")) return `${val > 0 ? "+" : ""}${val}%`;
    return val.toLocaleString();
  }
  return val;
}

function getPopupHTML(properties) {
  const entries = Object.entries(properties || {}).filter(
    ([k]) => k !== "value"
  );
  if (entries.length === 0) return null;
  return `<div style="padding: 8px; font-size: 13px; max-height: 200px; overflow-y: auto; line-height: 1.6;">
    ${entries.map(([k, v]) => `<strong>${formatLabel(k)}:</strong> ${formatValue(k, v)}`).join("<br/>")}
  </div>`;
}

export function MapboxMap({
  geojsonData,
  title,
  center = [4.9, 52.37],
  zoom = 10,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapRef.current) return;
    if (!mapContainer.current) return;

    let isCancelled = false;

    const initializeMap = async () => {
      try {
        const res = await fetch("/api/mapbox");
        const data = await res.json();

        if (isCancelled) return;

        if (!data.token) {
          setError("No Mapbox token");
          return;
        }

        mapboxgl.accessToken = data.token;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: center,
          zoom: zoom,
        });

        mapRef.current = mapInstance;

        mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

        mapInstance.on("load", () => {
          if (isCancelled) return;
          setLoading(false);

          if (!geojsonData?.features || geojsonData.features.length === 0)
            return;

          const hasPolygons = hasGeometryType(
            geojsonData,
            "Polygon",
            "MultiPolygon"
          );
          const hasLines = hasGeometryType(
            geojsonData,
            "LineString",
            "MultiLineString"
          );
          const hasPoints = hasGeometryType(geojsonData, "Point", "MultiPoint");

          // Add GeoJSON as a source for polygon/line rendering
          if (hasPolygons || hasLines) {
            mapInstance.addSource("geojson-data", {
              type: "geojson",
              data: geojsonData,
            });

            if (hasPolygons) {
              // Check if features have a numeric "value" property for choropleth
              const values = geojsonData.features
                .map((f) => f.properties?.value)
                .filter((v) => typeof v === "number");
              const hasValues = values.length > 0;

              if (hasValues) {
                const minVal = Math.min(...values);
                const maxVal = Math.max(...values);
                const midVal = (minVal + maxVal) / 2;

                mapInstance.addLayer({
                  id: "geojson-fill",
                  type: "fill",
                  source: "geojson-data",
                  filter: [
                    "any",
                    ["==", ["geometry-type"], "Polygon"],
                    ["==", ["geometry-type"], "MultiPolygon"],
                  ],
                  paint: {
                    "fill-color": [
                      "interpolate",
                      ["linear"],
                      ["coalesce", ["get", "value"], 0],
                      minVal,
                      "#d97706",
                      midVal,
                      "#7c3aed",
                      maxVal,
                      "#dc2626",
                    ],
                    "fill-opacity": 0.6,
                  },
                });
              } else {
                mapInstance.addLayer({
                  id: "geojson-fill",
                  type: "fill",
                  source: "geojson-data",
                  filter: [
                    "any",
                    ["==", ["geometry-type"], "Polygon"],
                    ["==", ["geometry-type"], "MultiPolygon"],
                  ],
                  paint: {
                    "fill-color": "#eab308",
                    "fill-opacity": 0.4,
                  },
                });
              }

              mapInstance.addLayer({
                id: "geojson-outline",
                type: "line",
                source: "geojson-data",
                filter: [
                  "any",
                  ["==", ["geometry-type"], "Polygon"],
                  ["==", ["geometry-type"], "MultiPolygon"],
                ],
                paint: {
                  "line-color": "#fbbf24",
                  "line-width": 1,
                  "line-opacity": 0.8,
                },
              });

              // Click popup for polygons
              mapInstance.on("click", "geojson-fill", (e) => {
                if (e.features && e.features.length > 0) {
                  const html = getPopupHTML(e.features[0].properties);
                  if (html) {
                    new mapboxgl.Popup()
                      .setLngLat(e.lngLat)
                      .setHTML(html)
                      .addTo(mapInstance);
                  }
                }
              });

              mapInstance.on("mouseenter", "geojson-fill", () => {
                mapInstance.getCanvas().style.cursor = "pointer";
              });
              mapInstance.on("mouseleave", "geojson-fill", () => {
                mapInstance.getCanvas().style.cursor = "";
              });
            }

            if (hasLines) {
              mapInstance.addLayer({
                id: "geojson-lines",
                type: "line",
                source: "geojson-data",
                filter: [
                  "any",
                  ["==", ["geometry-type"], "LineString"],
                  ["==", ["geometry-type"], "MultiLineString"],
                ],
                paint: {
                  "line-color": "#eab308",
                  "line-width": 2,
                },
              });
            }
          }

          // Add markers for point features
          if (hasPoints) {
            geojsonData.features.forEach((feature) => {
              const geom = feature.geometry;
              if (!geom) return;

              let coords;
              if (geom.type === "Point") {
                coords = [geom.coordinates];
              } else if (geom.type === "MultiPoint") {
                coords = geom.coordinates;
              } else {
                return;
              }

              coords.forEach((coord) => {
                const el = document.createElement("div");
                el.style.cssText = `
                  width: 24px;
                  height: 24px;
                  background: #eab308;
                  border: 3px solid white;
                  border-radius: 50%;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                `;

                const html = getPopupHTML(feature.properties);
                const marker = new mapboxgl.Marker(el).setLngLat(coord);

                if (html) {
                  marker.setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(html)
                  );
                }

                marker.addTo(mapInstance);
                markersRef.current.push(marker);
              });
            });
          }

          // Fit bounds
          const bounds = getFeatureBounds(geojsonData);
          if (!bounds.isEmpty()) {
            mapInstance.fitBounds(bounds, { padding: 50, maxZoom: 14 });
          }
        });

        mapInstance.on("error", (e) => {
          console.error("Map error:", e);
          if (!isCancelled) {
            setError("Map failed to load");
          }
        });
      } catch (err) {
        console.error("Init error:", err);
        if (!isCancelled) {
          setError("Failed to initialize map");
        }
      }
    };

    initializeMap();

    return () => {
      isCancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, geojsonData]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
