// Four input panels (map, doc+LLM, graph, time series) feed a structured
// table via dashed arrows — same animation language as the old Europe map.
const PANELS = [
  { x: 30, label: "SPATIAL" },
  { x: 215, label: "DOCS · LLM" },
  { x: 400, label: "GRAPH" },
  { x: 585, label: "SERIES" },
];

function Panel({ x, label, children }) {
  return (
    <g transform={`translate(${x},30)`}>
      <rect width="145" height="130" fill="var(--paper-2)" stroke="var(--ink)" strokeWidth="0.8" strokeOpacity="0.6" />
      <text x="8" y="120" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink)" opacity="0.75">{label}</text>
      {children}
    </g>
  );
}

export function HeroVisual({ mounted }) {
  const cols = [12, 118, 224, 330, 436];
  return (
    <svg viewBox="0 0 760 560" aria-hidden="true" focusable="false" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <pattern id="hvGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 L0 0 0 30" fill="none" stroke="rgba(15,14,11,.06)" strokeWidth="1" />
        </pattern>
        <radialGradient id="hvGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD60A" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#FFD60A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="760" height="560" fill="url(#hvGrid)" />

      {/* Panel 1 — map: boundary + points */}
      <Panel x={PANELS[0].x} label={PANELS[0].label}>
        <path d="M18 30 L62 18 L112 34 L126 72 L96 96 L40 92 L20 62 Z" fill="none" stroke="var(--ink)" strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="52" cy="46" r="4" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1" />
        <circle cx="88" cy="62" r="3" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1" />
        <circle cx="66" cy="80" r="2.5" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1" />
      </Panel>

      {/* Panel 2 — document + LLM sparkle + scan line */}
      <Panel x={PANELS[1].x} label={PANELS[1].label}>
        <rect x="30" y="16" width="66" height="84" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.9" />
        {[28, 40, 52, 64, 76].map((y, i) => (
          <rect key={y} x="38" y={y} width={i === 2 ? 34 : 50} height="4" fill="var(--ink)" opacity="0.25" />
        ))}
        <path d="M104 26 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="0.8" />
        {mounted && (
          <rect x="30" y="16" width="66" height="3" fill="var(--yellow)" opacity="0.8">
            <animate attributeName="y" values="16;97;16" dur="4s" repeatCount="indefinite" />
          </rect>
        )}
      </Panel>

      {/* Panel 3 — graph/network */}
      <Panel x={PANELS[2].x} label={PANELS[2].label}>
        {[[30, 40, 78, 24], [78, 24, 116, 52], [78, 24, 56, 84], [116, 52, 100, 92], [56, 84, 100, 92]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="0.8" opacity="0.6" />
        ))}
        {[[30, 40], [78, 24], [116, 52], [56, 84], [100, 92]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i === 1 ? 6 : 4} fill={i === 1 ? "var(--yellow)" : "var(--paper)"} stroke="var(--ink)" strokeWidth="1" />
        ))}
      </Panel>

      {/* Panel 4 — time series: actual + dashed nowcast */}
      <Panel x={PANELS[3].x} label={PANELS[3].label}>
        <polyline points="14,86 34,74 50,80 68,58 86,66 104,40 126,48" fill="none" stroke="var(--ink)" strokeWidth="1.4" />
        <polyline points="14,96 34,92 50,95 68,84 86,88 104,74 126,78" fill="none" stroke="var(--yellow-2)" strokeWidth="1.2" strokeDasharray="4 3" />
      </Panel>

      {/* Converging arrows: panel bottoms → table top */}
      {[102, 287, 472, 657].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 165 C ${x} 230, ${380 + (i - 1.5) * 60} 250, ${380 + (i - 1.5) * 60} 300`} fill="none" stroke="var(--ink)" strokeWidth="0.9" strokeDasharray="4 4" opacity="0.55">
            {mounted && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur={`${1.8 + i * 0.35}s`} repeatCount="indefinite" />}
          </path>
          <path d={`M${376 + (i - 1.5) * 60} 294 l4 8 4 -8`} fill="none" stroke="var(--ink)" strokeWidth="0.9" opacity="0.55" />
        </g>
      ))}

      {mounted && (
        <circle cx="380" cy="310" r="70" fill="url(#hvGlow)">
          <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Structured table: header + 4 rows filling in a loop */}
      <g transform="translate(140,310)">
        <rect width="480" height="180" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
        <rect width="480" height="34" fill="var(--ink)" />
        {["id", "geo", "t", "value", "src"].map((h, i) => (
          <text key={h} x={cols[i]} y="22" fontFamily="var(--font-mono)" fontSize="11" fill="var(--yellow)">{h}</text>
        ))}
        {[0, 1, 2, 3].map((r) => (
          <g key={r} opacity={mounted ? 0 : 0.9}>
            {mounted && (
              <animate attributeName="opacity" values="0;0;0.9;0.9" keyTimes={`0;${0.12 + r * 0.18};${0.2 + r * 0.18};1`} dur="6s" repeatCount="indefinite" />
            )}
            {cols.map((x, c) => (
              <rect key={c} x={x} y={46 + r * 34} width={c === 3 ? 84 : 64} height="10" fill={c === 3 ? "var(--yellow)" : "var(--ink)"} opacity={c === 3 ? 0.85 : 0.18} />
            ))}
          </g>
        ))}
        {[34, 68, 102, 136].map((y) => (
          <line key={y} x1="0" y1={y + 34} x2="480" y2={y + 34} stroke="var(--ink)" strokeWidth="0.5" opacity="0.15" />
        ))}
      </g>

      <text x="140" y="516" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink)" opacity="0.6">4 inputs · one structured layer</text>
    </svg>
  );
}
