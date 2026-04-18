"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

const DEFAULT_POSTS = [
  { slug: "against-dashboards", y: "APR 2026", tag: "OPINION", t: "The case against dashboards", i: "dashboards" },
  { slug: "h3-for-real-estate", y: "MAR 2026", tag: "GEODATA", t: "Why we switched to H3 for real-estate geoindexing", i: "H3" },
  { slug: "20m-records-scraping", y: "FEB 2026", tag: "DATA", t: "Scraping at scale: 20M records", i: "20M records" },
];

function renderTitle(p) {
  if (!p.i || !p.t.includes(p.i)) return p.t;
  const [before, ...rest] = p.t.split(p.i);
  const after = rest.join(p.i);
  return (
    <>
      {before}
      <i>{p.i}</i>
      {after}
    </>
  );
}

export function WritingTeaser({ posts }) {
  const locale = useLocale();
  const list = posts || DEFAULT_POSTS;
  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 03</span>
        <span>Writing — recent field notes</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 32, gap: 40, flexWrap: "wrap" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Recent <i style={{ fontStyle: "italic" }}>writing</i>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "34ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Short pieces on tools, pipelines and spatial methods.
        </p>
      </div>

      <div className="writing-teaser">
        {list.slice(0, 3).map((p) => (
          <Link href={`/${locale}/blog/${p.slug}`} key={p.slug} className="wt-card">
            <div className="t">
              <span>{p.tag}</span>
              <span>{p.y}</span>
            </div>
            <h4>{renderTitle(p)}</h4>
            <div className="more">Read →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
