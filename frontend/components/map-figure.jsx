"use client";

// Focused map figure for posts and papers — MapFigure design spec,
// docs/superpowers/specs/2026-08-11-map-figure-design.md.
//
// Built on the mapbox-map.jsx patterns (token via /api/mapbox, light-v11
// style, fitBounds, site choropleth ramp). Interactions are capped at the
// focused-figure set: pan/zoom, hover tooltip, legend, at most one layer
// toggle. Every failure path lands on a quiet bordered placeholder that
// still shows the caption — never a crashed post body.

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const IS_DEV = process.env.NODE_ENV !== "production";

// Site's existing choropleth ramp and accents (see mapbox-map.jsx).
const RAMP = ["#d97706", "#7c3aed", "#dc2626"];
const NEUTRAL_FILL = "#eab308";
const OUTLINE_COLOR = "#fbbf24";
const CATEGORY_COLORS = [
  "#eab308",
  "#7c3aed",
  "#dc2626",
  "#d97706",
  "#0e7490",
  "#4d7c0f",
  "#9333ea",
  "#b45309",
];
const FALLBACK_COLOR = "#9ca3af";
const EXTRA_LAYER_COLOR = "#475569";

const MONO = "var(--font-mono, ui-monospace, monospace)";

function getFeatureBounds(...collections) {
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

  collections.forEach((geojson) => {
    (geojson?.features || []).forEach((f) => {
      if (f.geometry?.coordinates) {
        extendWithCoords(f.geometry.coordinates, f.geometry.type);
      }
    });
  });

  return bounds;
}

function hasGeometryType(geojson, ...types) {
  return (geojson.features || []).some((f) => types.includes(f.geometry?.type));
}

function formatLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(key, val) {
  if (typeof val === "number") {
    const k = String(key);
    if (k.includes("price") || k.includes("income")) return `€${val.toLocaleString()}`;
    if (k.includes("change")) return `${val > 0 ? "+" : ""}${val}%`;
    return val.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
  return String(val);
}

function formatTick(n) {
  return Math.abs(n) >= 1000
    ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function escapeHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tooltipHTML(properties, names) {
  const rows = names.map((name) => {
    const v = properties?.[name];
    const shown = v === undefined || v === null ? "—" : formatValue(name, v);
    return `<strong>${escapeHTML(formatLabel(name))}:</strong> ${escapeHTML(shown)}`;
  });
  return `<div style="padding:6px 8px;font-size:12px;line-height:1.6;">${rows.join("<br/>")}</div>`;
}

// Classify value_field values: numeric → continuous ramp, anything else →
// categorical swatches, absent/empty → neutral fill without a legend.
function analyzeValues(features, valueField) {
  if (!valueField) return { kind: "none" };
  const values = features
    .map((f) => f.properties?.[valueField])
    .filter((v) => v !== null && v !== undefined);
  if (values.length === 0) return { kind: "none" };
  if (values.every((v) => typeof v === "number")) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { kind: "continuous", min, max, mid: (min + max) / 2 };
  }
  const categories = [];
  values.map(String).forEach((v) => {
    if (!categories.includes(v)) categories.push(v);
  });
  return {
    kind: "categorical",
    categories: categories.slice(0, CATEGORY_COLORS.length),
    truncated: categories.length > CATEGORY_COLORS.length,
  };
}

function colorExpression(valueField, scale) {
  if (scale.kind === "continuous") {
    if (scale.min === scale.max) return RAMP[1];
    return [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", valueField], scale.min],
      scale.min,
      RAMP[0],
      scale.mid,
      RAMP[1],
      scale.max,
      RAMP[2],
    ];
  }
  if (scale.kind === "categorical") {
    const expr = ["match", ["to-string", ["get", valueField]]];
    scale.categories.forEach((c, i) => {
      expr.push(c, CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    });
    expr.push(FALLBACK_COLOR);
    return expr;
  }
  return NEUTRAL_FILL;
}

// Returns the ids of hover-interactive layers.
function addDataLayers(map, data, valueField, scale) {
  const color = colorExpression(valueField, scale);
  const interactive = [];

  map.addSource("figure-data", { type: "geojson", data });

  if (hasGeometryType(data, "Polygon", "MultiPolygon")) {
    const polygonFilter = [
      "any",
      ["==", ["geometry-type"], "Polygon"],
      ["==", ["geometry-type"], "MultiPolygon"],
    ];
    map.addLayer({
      id: "figure-fill",
      type: "fill",
      source: "figure-data",
      filter: polygonFilter,
      paint: {
        "fill-color": color,
        "fill-opacity": scale.kind === "none" ? 0.4 : 0.6,
      },
    });
    map.addLayer({
      id: "figure-outline",
      type: "line",
      source: "figure-data",
      filter: polygonFilter,
      paint: {
        "line-color": OUTLINE_COLOR,
        "line-width": 1,
        "line-opacity": 0.8,
      },
    });
    interactive.push("figure-fill");
  }

  if (hasGeometryType(data, "LineString", "MultiLineString")) {
    map.addLayer({
      id: "figure-lines",
      type: "line",
      source: "figure-data",
      filter: [
        "any",
        ["==", ["geometry-type"], "LineString"],
        ["==", ["geometry-type"], "MultiLineString"],
      ],
      paint: {
        "line-color": color,
        "line-width": 2,
      },
    });
    interactive.push("figure-lines");
  }

  if (hasGeometryType(data, "Point", "MultiPoint")) {
    map.addLayer({
      id: "figure-points",
      type: "circle",
      source: "figure-data",
      filter: [
        "any",
        ["==", ["geometry-type"], "Point"],
        ["==", ["geometry-type"], "MultiPoint"],
      ],
      paint: {
        "circle-radius": 6,
        "circle-color": color,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });
    interactive.push("figure-points");
  }

  return interactive;
}

// The single optional extra layer renders as a quiet dashed outline (plus
// small circles for points) so it reads as reference context, not data.
function addExtraLayers(map, data) {
  map.addSource("figure-extra", { type: "geojson", data });
  map.addLayer({
    id: "figure-extra-line",
    type: "line",
    source: "figure-extra",
    filter: [
      "any",
      ["==", ["geometry-type"], "Polygon"],
      ["==", ["geometry-type"], "MultiPolygon"],
      ["==", ["geometry-type"], "LineString"],
      ["==", ["geometry-type"], "MultiLineString"],
    ],
    layout: { visibility: "none" },
    paint: {
      "line-color": EXTRA_LAYER_COLOR,
      "line-width": 1.5,
      "line-dasharray": [2, 2],
    },
  });
  if (hasGeometryType(data, "Point", "MultiPoint")) {
    map.addLayer({
      id: "figure-extra-points",
      type: "circle",
      source: "figure-extra",
      filter: [
        "any",
        ["==", ["geometry-type"], "Point"],
        ["==", ["geometry-type"], "MultiPoint"],
      ],
      layout: { visibility: "none" },
      paint: {
        "circle-radius": 4,
        "circle-color": EXTRA_LAYER_COLOR,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.5,
      },
    });
  }
}

function wireTooltip(map, layerIds, names) {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    maxWidth: "280px",
  });
  layerIds.forEach((id) => {
    map.on("mousemove", id, (e) => {
      if (!e.features?.length) return;
      map.getCanvas().style.cursor = "pointer";
      popup
        .setLngLat(e.lngLat)
        .setHTML(tooltipHTML(e.features[0].properties, names))
        .addTo(map);
    });
    map.on("mouseleave", id, () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
  });
}

function Placeholder({ caption, reason }) {
  return (
    <figure style={{ margin: "24px 0" }}>
      <div
        style={{
          border: "1px solid var(--rule, #d4d4d4)",
          borderRadius: 8,
          padding: "28px 24px",
          display: "grid",
          gap: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--mute, #8a8a8a)",
            fontStyle: "italic",
          }}
        >
          {caption || "Map figure unavailable."}
        </p>
        {IS_DEV && reason && (
          <p
            style={{
              margin: 0,
              fontFamily: MONO,
              fontSize: 12,
              lineHeight: 1.5,
              color: "#92400e",
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: 6,
              padding: "8px 12px",
            }}
          >
            MapFigure (dev only): {reason}
          </p>
        )}
      </div>
    </figure>
  );
}

function LegendBox({ scale, label }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        bottom: 12,
        zIndex: 2,
        background: "rgba(255,255,255,0.92)",
        border: "1px solid #e5e5e5",
        borderRadius: 6,
        padding: "8px 10px",
        fontFamily: MONO,
        fontSize: 11,
        lineHeight: 1.4,
        color: "#404040",
        maxWidth: 220,
      }}
    >
      {label && <div style={{ marginBottom: 6, letterSpacing: "0.04em" }}>{label}</div>}
      {scale.kind === "continuous" ? (
        <div style={{ minWidth: 120 }}>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: `linear-gradient(to right, ${RAMP.join(", ")})`,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, gap: 12 }}>
            <span>{formatTick(scale.min)}</span>
            <span>{formatTick(scale.max)}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 3 }}>
          {scale.categories.map((cat, i) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span>{cat}</span>
            </div>
          ))}
          {scale.truncated && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: FALLBACK_COLOR,
                  flexShrink: 0,
                }}
              />
              <span>other</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MapFigure({
  dataset,
  value_field: valueField,
  legend,
  tooltip,
  layers,
  center,
  zoom,
  height = 420,
  caption,
  configError,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [failure, setFailure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(null);
  const [extraLayer, setExtraLayer] = useState(null);
  const [extraVisible, setExtraVisible] = useState(false);

  const configFailure =
    configError ||
    (!dataset || typeof dataset !== "string"
      ? 'map fence is missing a required "dataset" slug'
      : null);
  const reason = configFailure || failure;

  // Stable key so parent re-renders (which re-parse the fence into fresh
  // arrays) don't tear the map down and rebuild it.
  const configKey = useMemo(
    () => JSON.stringify({ dataset, valueField, tooltip, layers, center, zoom }),
    [dataset, valueField, tooltip, layers, center, zoom]
  );

  useEffect(() => {
    if (reason) console.warn(`MapFigure: ${reason}`);
  }, [reason]);

  useEffect(() => {
    if (configFailure || failure || !containerRef.current) return undefined;

    let cancelled = false;

    const fail = (why) => {
      if (!cancelled) {
        setFailure(why);
        setLoading(false);
      }
    };

    const fetchGeoJSON = async (slug) => {
      const res = await fetch(
        `/api/django?endpoint=geodata/datasets/${encodeURIComponent(slug)}/geojson`
      );
      if (!res.ok) throw new Error(`dataset "${slug}" returned ${res.status}`);
      return res.json();
    };

    const init = async () => {
      try {
        const tokenRes = await fetch("/api/mapbox");
        const tokenData = await tokenRes.json().catch(() => ({}));
        if (cancelled) return;
        if (!tokenData.token) return fail("no Mapbox token available");

        const data = await fetchGeoJSON(dataset);
        if (cancelled) return;
        if (
          data?.type !== "FeatureCollection" ||
          !Array.isArray(data.features) ||
          data.features.length === 0
        ) {
          return fail(`dataset "${dataset}" is not a non-empty FeatureCollection`);
        }

        // Optional single extra layer; its failure degrades to "no toggle",
        // never to a broken figure.
        let extraData = null;
        const extra = Array.isArray(layers) && layers.length > 0 ? layers[0] : null;
        if (extra?.dataset) {
          try {
            const d = await fetchGeoJSON(extra.dataset);
            if (d?.type === "FeatureCollection" && d.features?.length) {
              extraData = d;
            } else {
              console.warn(
                `MapFigure: extra layer "${extra.dataset}" is empty — toggle omitted`
              );
            }
          } catch (err) {
            console.warn(`MapFigure: extra layer failed (${err.message}) — toggle omitted`);
          }
        }
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = tokenData.token;
        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: Array.isArray(center) && center.length === 2 ? center : [4.9, 52.37],
          zoom: typeof zoom === "number" ? zoom : 10,
        });
        mapRef.current = map;
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.on("load", () => {
          if (cancelled) return;

          const valueScale = analyzeValues(data.features, valueField);
          const interactive = addDataLayers(map, data, valueField, valueScale);

          if (extraData) {
            addExtraLayers(map, extraData);
            setExtraLayer({ label: extra.label || extra.dataset });
          }

          const names = Array.isArray(tooltip)
            ? tooltip.filter((t) => typeof t === "string")
            : [];
          if (names.length) wireTooltip(map, interactive, names);

          if (!Array.isArray(center)) {
            const bounds = getFeatureBounds(data, extraData);
            if (!bounds.isEmpty()) {
              map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
            }
          }

          setScale(valueScale);
          setLoading(false);
        });

        // Style/tile hiccups are not on the spec's failure list — warn only.
        map.on("error", (e) => console.warn("MapFigure map error:", e?.error || e));
      } catch (err) {
        fail(err?.message || "failed to initialize map");
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, configFailure, failure]);

  if (reason) {
    return <Placeholder caption={caption} reason={reason} />;
  }

  const toggleExtra = (visible) => {
    setExtraVisible(visible);
    const map = mapRef.current;
    if (!map) return;
    ["figure-extra-line", "figure-extra-points"].forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      }
    });
  };

  return (
    <figure style={{ margin: "24px 0" }}>
      <div
        style={{
          position: "relative",
          height: typeof height === "number" ? height : 420,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--rule, #d4d4d4)",
        }}
      >
        <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <p style={{ fontFamily: MONO, fontSize: 12, color: "var(--mute, #8a8a8a)" }}>
              Loading map…
            </p>
          </div>
        )}
        {!loading && scale && scale.kind !== "none" && (
          <LegendBox scale={scale} label={legend || (valueField ? formatLabel(valueField) : null)} />
        )}
        {!loading && extraLayer && (
          <label
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.92)",
              border: "1px solid #e5e5e5",
              borderRadius: 6,
              padding: "6px 10px",
              fontFamily: MONO,
              fontSize: 11,
              color: "#404040",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={extraVisible}
              onChange={(e) => toggleExtra(e.target.checked)}
              style={{ accentColor: "#7c3aed", margin: 0 }}
            />
            {extraLayer.label}
          </label>
        )}
      </div>
      {caption && (
        <figcaption
          style={{
            marginTop: 10,
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--mute, #8a8a8a)",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default MapFigure;
