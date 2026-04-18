"use client";

import { useTranslations } from "next-intl";

function SkillViz({ index }) {
  if (index === 0) {
    // ML line chart
    return (
      <svg viewBox="0 0 320 100" style={{ width: "100%", height: "100%" }}>
        <path d="M10 80 L40 70 L70 76 L100 52 L130 58 L160 40 L190 48 L220 26 L250 34 L280 18 L310 28 L310 96 L10 96 Z" fill="#FFD60A" opacity="0.4" />
        <path d="M10 80 L40 70 L70 76 L100 52 L130 58 L160 40 L190 48 L220 26 L250 34 L280 18 L310 28" fill="none" stroke="#111110" strokeWidth="1.4" />
        <g fill="#FFD60A" stroke="#111110" strokeWidth="1">
          <circle cx="100" cy="52" r="3" />
          <circle cx="190" cy="48" r="3" />
          <circle cx="280" cy="18" r="3" />
        </g>
      </svg>
    );
  }
  if (index === 1) {
    // Engineering DAG
    return (
      <svg viewBox="0 0 320 100" style={{ width: "100%", height: "100%" }}>
        <g fontFamily="var(--font-mono)" fontSize="9" fill="#111110">
          <rect x="10" y="10" width="54" height="26" fill="#F6F4EE" stroke="#111110" />
          <text x="20" y="27">source</text>
          <rect x="80" y="10" width="54" height="26" fill="#FFD60A" stroke="#111110" />
          <text x="92" y="27">ingest</text>
          <rect x="150" y="10" width="54" height="26" fill="#F6F4EE" stroke="#111110" />
          <text x="162" y="27">model</text>
          <rect x="80" y="58" width="54" height="26" fill="#F6F4EE" stroke="#111110" />
          <text x="94" y="75">tests</text>
          <rect x="220" y="34" width="54" height="26" fill="#111110" stroke="#111110" />
          <text x="232" y="51" fill="#FFD60A">ship</text>
        </g>
        <g stroke="#111110" strokeWidth="1" fill="none">
          <path d="M64 23 L80 23" />
          <path d="M134 23 L150 23" />
          <path d="M107 36 L107 58" />
          <path d="M134 71 L190 71 L190 48" />
          <path d="M204 33 L220 44" />
        </g>
      </svg>
    );
  }
  if (index === 2) {
    // Hex heat
    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 10; c++) {
        const x = 20 + c * 28 + (r % 2 ? 14 : 0);
        const y = 20 + r * 24;
        const o = (Math.sin(c + r * 1.4) + 1) / 2;
        cells.push(
          <polygon
            key={`${r}-${c}`}
            points={`${x},${y} ${x + 12},${y - 7} ${x + 24},${y} ${x + 24},${y + 14} ${x + 12},${y + 21} ${x},${y + 14}`}
            fill="#FFD60A"
            fillOpacity={o.toFixed(2)}
            stroke="#111110"
            strokeWidth="0.4"
          />
        );
      }
    }
    return (
      <svg viewBox="0 0 320 100" style={{ width: "100%", height: "100%" }}>
        {cells}
      </svg>
    );
  }
  // Scraping — browser window
  return (
    <svg viewBox="0 0 320 100" style={{ width: "100%", height: "100%" }}>
      <g fontFamily="var(--font-mono)" fontSize="8" fill="#111110">
        <rect x="10" y="10" width="300" height="80" fill="#F6F4EE" stroke="#111110" />
        <rect x="10" y="10" width="300" height="14" fill="#111110" />
        <circle cx="18" cy="17" r="2" fill="#FFD60A" />
        <circle cx="26" cy="17" r="2" fill="#FFD60A" />
        <circle cx="34" cy="17" r="2" fill="#FFD60A" />
        <text x="20" y="38" fill="#111110">GET /listings?p=</text>
        <rect x="20" y="46" width="150" height="6" fill="#FFD60A" />
        <rect x="20" y="58" width="240" height="6" fill="#111110" opacity="0.15" />
        <rect x="20" y="70" width="200" height="6" fill="#111110" opacity="0.15" />
        <text x="230" y="85" fill="#111110">20M+ rec</text>
      </g>
    </svg>
  );
}

const stacks = [
  ["SAM", "LVMs", "XGBoost", "PyTorch", "scikit-learn"],
  ["Airflow", "Docker", "Python", "Postgres", "PostGIS", "dbt"],
  ["PostGIS", "GeoPandas", "H3", "CV", "Agent-based"],
  ["Selenium", "Proxies", "Captcha", "Playwright", "ETL"],
];

const shortTags = ["ML", "ENG", "GEO", "SCR"];

function splitTitle(title) {
  const parts = title.split(" ");
  if (parts.length === 1) return { first: title, rest: "" };
  return { first: parts[0], rest: parts.slice(1).join(" ") };
}

export function SkillsGrid() {
  const t = useTranslations("About");
  const expertise = t.raw("expertise");

  return (
    <section className="section-pad" style={{ paddingBottom: 200 }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 01</span>
        <span>Expertise — four core competencies</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end", marginBottom: 80 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          <i style={{ fontStyle: "italic", color: "var(--yellow-2)" }}>Core</i> competencies.
        </h2>
        <p style={{ fontSize: 17, maxWidth: "52ch", color: "var(--ink-2)" }}>
          {t("expertiseSubtitle")}
        </p>
      </div>

      <div className="skill-grid">
        {expertise.map((item, i) => {
          const { first, rest } = splitTitle(item.title);
          return (
            <div key={i} className="skill">
              <div className="skill-top">
                <span>§ 01.{String(i + 1).padStart(2, "0")}</span>
                <span>{shortTags[i]}</span>
              </div>
              <div className="skill-num serif">{String(i + 1).padStart(2, "0")}</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <h3>
                  {first}
                  {rest && (
                    <>
                      <br />
                      <i>{rest}</i>
                    </>
                  )}
                </h3>
                <p>{item.description}</p>
                <div className="viz">
                  <SkillViz index={i} />
                </div>
                <div className="stack">
                  {(stacks[i] || []).map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
