"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

function rand(seed) {
  // deterministic pseudo-random based on seed
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function VizSVG({ kind }) {
  if (kind === 0) {
    const cells = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 11; c++) {
        const x = 30 + c * 34 + (r % 2 ? 17 : 0);
        const y = 30 + r * 28;
        const o = (Math.sin(r * 1.3 + c) + 1) / 2;
        cells.push(
          <polygon
            key={`${r}-${c}`}
            points={`${x},${y} ${x + 15},${y - 9} ${x + 30},${y} ${x + 30},${y + 18} ${x + 15},${y + 27} ${x},${y + 18}`}
            fill="#FFD60A"
            fillOpacity={o.toFixed(2)}
            stroke="#111110"
            strokeWidth="0.5"
          />
        );
      }
    }
    return (
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="260" fill="#EDEAE0" />
        {cells}
        <text x="16" y="248" fontFamily="var(--font-mono)" fontSize="9" fill="#111110">H3 · RES 8 · EU METROS</text>
      </svg>
    );
  }
  if (kind === 1) {
    const rnd = rand(42);
    const cells = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 16; c++) {
        const x = 20 + c * 24;
        const y = 20 + r * 22;
        const v = rnd();
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={x} y={y} width={22} height={20}
            fill={v > 0.7 ? "#FFD60A" : v > 0.5 ? "#D4A017" : "#EDEAE0"}
            stroke="#111110"
            strokeWidth="0.4"
          />
        );
      }
    }
    return (
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="260" fill="#EDEAE0" />
        {cells}
        <text x="16" y="250" fontFamily="var(--font-mono)" fontSize="9" fill="#111110">ABM · T=10Y · AMS</text>
      </svg>
    );
  }
  if (kind === 2) {
    return (
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="260" fill="#EDEAE0" />
        <g fill="none" stroke="#111110" strokeWidth="0.8">
          {Array.from({ length: 7 }).map((_, k) => (
            <path key={k} d={`M${20 + k * 4} ${200 - k * 18} Q 200 ${180 - k * 15} ${380 - k * 4} ${220 - k * 22}`} opacity={0.25 + k * 0.1} />
          ))}
        </g>
        <path d="M0 220 Q 100 190 200 210 T 400 200 L 400 260 L 0 260 Z" fill="#FFD60A" opacity="0.45" />
        <text x="16" y="248" fontFamily="var(--font-mono)" fontSize="9" fill="#111110">AHN3 · 50cm DEM</text>
      </svg>
    );
  }
  if (kind === 3) {
    const rnd = rand(7);
    const tiles = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        const x = 16 + c * 48;
        const y = 16 + r * 48;
        const v = rnd();
        tiles.push(
          <rect key={`${r}-${c}`} x={x} y={y} width="44" height="44" fill={v > 0.75 ? "#FFD60A" : "#2A2822"} stroke="#FFD60A" strokeWidth="0.5" strokeOpacity="0.3" />
        );
      }
    }
    return (
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="260" fill="#111110" />
        {tiles}
        <text x="16" y="250" fontFamily="var(--font-mono)" fontSize="9" fill="#FFD60A">CV · STREET-LEVEL · 4M FRAMES</text>
      </svg>
    );
  }
  if (kind === 4) {
    return (
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="260" fill="#EDEAE0" />
        <g transform="translate(200,130)">
          {[110, 85, 62, 40].map((r, k) => (
            <circle key={k} cx="0" cy="0" r={r} fill="#FFD60A" fillOpacity={0.12 + k * 0.15} stroke="#111110" strokeWidth="0.6" />
          ))}
          <circle cx="0" cy="0" r="4" fill="#111110" />
          {Array.from({ length: 12 }).map((_, a) => {
            const ang = (a * Math.PI) / 6;
            return <line key={a} x1="0" y1="0" x2={Math.cos(ang) * 110} y2={Math.sin(ang) * 110} stroke="#111110" strokeWidth="0.3" opacity="0.4" />;
          })}
        </g>
        <text x="16" y="248" fontFamily="var(--font-mono)" fontSize="9" fill="#111110">ISO · 5/10/15/20 MIN · BIKE</text>
      </svg>
    );
  }
  // kind 5 — cadastre
  const rnd = rand(99);
  const rects = [];
  for (let k = 0; k < 40; k++) {
    const x = 10 + rnd() * 370;
    const y = 10 + rnd() * 220;
    const w = 18 + rnd() * 50;
    const h = 18 + rnd() * 50;
    rects.push(
      <rect key={k} x={x} y={y} width={w} height={h} transform={`rotate(${rnd() * 8 - 4} ${x + w / 2} ${y + h / 2})`} />
    );
  }
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="260" fill="#EDEAE0" />
      <g stroke="#111110" strokeWidth="0.6" fill="#FFD60A" fillOpacity="0.35">
        {rects}
      </g>
      <text x="16" y="250" fontFamily="var(--font-mono)" fontSize="9" fill="#111110">CADASTRE · 6 COUNTRIES · OSS</text>
    </svg>
  );
}

const DEFAULT_VIZ = [
  { title: "European Rent Heatmap", titleItalic: "Rent", tag: ["GEODATA", "2025"], dom: "Rent prediction · 15 markets", p: "Predicted-vs-observed rent per m² across 15 EU metros, H3 resolution 8, weekly refresh.", kind: 0, slug: "european-rent-heatmap" },
  { title: "Amsterdam Gentrification Model", titleItalic: "Gentrification", tag: ["ABM", "2024"], dom: "Agent-based modelling", p: "Agent-based simulation of neighbourhood turnover over 10 years, calibrated on CBS + Kadaster data.", kind: 1, slug: "amsterdam-gentrification-model" },
  { title: "EU Flood-risk Atlas", titleItalic: "Flood-risk", tag: ["ML + GEO", "2023"], dom: "Parcel-level flood risk", p: "90%+ accuracy on insurable-loss classification — built from LiDAR, rainfall radar and cadastre.", kind: 2, slug: "eu-flood-risk-atlas" },
  { title: "Street-level CV: façade signals", titleItalic: "CV", tag: ["CV", "2024"], dom: "Street-view imagery", p: "Computer-vision extraction of maintenance/commerce signals from 4M street-view frames, 6 cities.", kind: 3, slug: "street-level-cv" },
  { title: "Intracity Mobility Isochrones", titleItalic: "Mobility", tag: ["GEO", "2025"], dom: "OSRM + GTFS", p: "Sub-200ms API for walk / bike / transit isochrones for any EU point — replaces three paid vendors.", kind: 4, slug: "intracity-mobility-isochrones" },
  { title: "Cadastre-as-Code", titleItalic: "Cadastre-as-Code", tag: ["OSS", "2021—"], dom: "6 countries · MIT", p: "Library that homogenises cadastral dumps from NL, DE, BE, FR, IT, ES into a single canonical schema.", kind: 5, slug: "cadastre-as-code" },
];

function renderTitle(v) {
  // Italicize the titleItalic token inside title
  if (!v.titleItalic || !v.title.includes(v.titleItalic)) return v.title;
  const [before, ...rest] = v.title.split(v.titleItalic);
  const after = rest.join(v.titleItalic);
  return (
    <>
      {before}
      <i>{v.titleItalic}</i>
      {after}
    </>
  );
}

export function VizGrid({ count = 6, items }) {
  const locale = useLocale();
  const list = (items || DEFAULT_VIZ).slice(0, count);
  return (
    <div className="viz-grid">
      {list.map((v, i) => (
        <div key={i} className="viz-card">
          <div className="v">
            <VizSVG kind={v.kind ?? i % 6} />
          </div>
          <div className="meta">
            <div className="tag">
              <span>{v.tag[0]}</span>
              <span>{v.tag[1]}</span>
            </div>
            <h4>{renderTitle(v)}</h4>
            <p>{v.p}</p>
            <div className="foot">
              <span>{v.dom}</span>
              <Link className="op" href={`/${locale}/visualizations/${v.slug || ""}`}>Open ↗</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function VizSectionHeader({ kicker = "Visualizations — featured spatial analyses", title, sub, rightLink }) {
  return (
    <>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 02</span>
        <span>{kicker}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 64, gap: 80, flexWrap: "wrap" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "34ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {sub}
          {rightLink && (
            <>
              {" "}
              <a href={rightLink.href} style={{ borderBottom: "1px solid" }}>{rightLink.label}</a>
            </>
          )}
        </p>
      </div>
    </>
  );
}
