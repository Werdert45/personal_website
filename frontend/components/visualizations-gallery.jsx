"use client";

import { useEffect, useState } from "react";
import { VizGrid, VizSectionHeader } from "@/components/viz-grid";

function mapApi(viz) {
  return {
    title: viz.title,
    titleItalic: extractItalicToken(viz.title),
    tag: [(viz.category || "VIZ").toUpperCase(), viz.date?.slice?.(-4) || ""],
    dom: viz.region || "",
    p: viz.description,
    kind: hash(viz.slug || viz.title) % 6,
    slug: viz.slug,
  };
}
function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function extractItalicToken(title) {
  const words = (title || "").split(" ");
  return words.length > 1 ? words[Math.floor(words.length / 2)] : words[0];
}

export function VisualizationsGallery() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/django?endpoint=research/visualizations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        const results = data.results || data;
        if (Array.isArray(results) && results.length) setItems(results.map(mapApi));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section className="section-pad">
      <VizSectionHeader
        kicker="Visualizations — full catalogue"
        title={
          <>
            <i style={{ fontStyle: "italic" }}>Field notes,</i>
            <br />
            in <span style={{ color: "var(--yellow-2)" }}>production</span>.
          </>
        }
        sub="Each card below opens an interactive map. Built on PostGIS + Mapbox GL, exposed to analysts through internal tooling."
      />
      <VizGrid count={12} items={items.length ? items : undefined} />
    </section>
  );
}
