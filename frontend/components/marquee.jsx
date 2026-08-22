export function Marquee({ items }) {
  const defaults = [
    "Urban dynamics",
    "Geospatial methods",
    "Spatial forecasting",
    "Data engineering",
    "AI Engineering",
  ];
  const list = items || defaults;
  const row = (
    <span>
      {list.map((w, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 60 }}>
          {w}
          <span className="dot" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
