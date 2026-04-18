"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
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

export function ProjectsPreview() {
  const [items, setItems] = useState([]);
  const t = useTranslations("Projects");
  const locale = useLocale();

  useEffect(() => {
    let alive = true;
    fetch("/api/django?endpoint=research/visualizations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        const results = data.results || data;
        if (Array.isArray(results) && results.length) {
          setItems(results.slice(0, 3).map(mapApi));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section className="section-pad" style={{ paddingBottom: 200 }}>
      <VizSectionHeader
        kicker="Visualizations — featured spatial analyses"
        title={
          <>
            Featured data <span className="y" style={{ color: "var(--yellow-2)" }}><i style={{ fontStyle: "italic" }}>visualizations</i></span>.
          </>
        }
        sub={<>Interactive map-based analyses showcasing spatial insights for the European real estate market.</>}
        rightLink={{ href: `/${locale}/visualizations`, label: "View all →" }}
      />
      <VizGrid count={3} items={items.length ? items : undefined} />
    </section>
  );
}
