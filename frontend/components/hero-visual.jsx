import { EUROPE_PATH, europeanCities } from "./europe-map-path";

// Four input panels (Europe map, doc+LLM, graph, time series) feed a
// structured table, which feeds an analytics chart — dashed-arrow animation
// language carried over from the old hero map. Near-square viewBox so the
// drawing fills the square .hero-visual container.
const PANELS = [
  { x: 10, label: "SPATIAL" },
  { x: 200, label: "DOCS · LLM" },
  { x: 390, label: "GRAPH" },
  { x: 580, label: "SERIES" },
];

function Panel({ x, label, children }) {
  return (
    <g transform={`translate(${x},20)`}>
      <rect width="170" height="160" fill="var(--paper-2)" stroke="var(--ink)" strokeWidth="0.8" strokeOpacity="0.6" />
      <text x="9" y="150" fontFamily="var(--font-mono)" fontSize="11" fill="var(--ink)" opacity="0.75">{label}</text>
      {children}
    </g>
  );
}

export function HeroVisual({ mounted }) {
  const cols = [12, 118, 224, 330, 436];
  const ams = europeanCities[0];
  const bars = [40, 55, 48, 70, 62, 85, 78, 100, 92];
  return (
    <svg viewBox="0 0 760 780" aria-hidden="true" focusable="false" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <pattern id="hvGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 L0 0 0 30" fill="none" stroke="rgba(15,14,11,.06)" strokeWidth="1" />
        </pattern>
        <radialGradient id="hvGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD60A" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#FFD60A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="760" height="780" fill="url(#hvGrid)" />

      {/* Panel 1 — the Europe map, kept for the spatial seat */}
      <Panel x={PANELS[0].x} label={PANELS[0].label}>
        <g transform="translate(10,14) scale(0.197) translate(-200,-80)">
          <path d={EUROPE_PATH} fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" strokeOpacity="0.5" />
          {mounted && (
            <circle cx={ams.x} cy={ams.y} r="46" fill="url(#hvGlow)">
              <animate attributeName="r" values="38;54;38" dur="4s" repeatCount="indefinite" />
            </circle>
          )}
          {europeanCities.map((city) => (
            <circle key={city.name} cx={city.x} cy={city.y} r={(city.size || 6) * 1.6} fill="var(--yellow)" stroke="var(--ink)" strokeWidth="3" />
          ))}
        </g>
      </Panel>

      {/* Panel 2 — document + LLM sparkle + scan line */}
      <Panel x={PANELS[1].x} label={PANELS[1].label}>
        <rect x="40" y="16" width="80" height="106" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.9" />
        {[30, 45, 60, 75, 90, 105].map((y, i) => (
          <rect key={y} x="50" y={y} width={i === 2 ? 42 : 60} height="5" fill="var(--ink)" opacity="0.25" />
        ))}
        <path d="M132 28 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="0.8" />
        {mounted && (
          <rect x="40" y="16" width="80" height="4" fill="var(--yellow)" opacity="0.8">
            <animate attributeName="y" values="16;118;16" dur="4s" repeatCount="indefinite" />
          </rect>
        )}
      </Panel>

      {/* Panel 3 — graph/network */}
      <Panel x={PANELS[2].x} label={PANELS[2].label}>
        {[[35, 50, 95, 28], [95, 28, 140, 66], [95, 28, 68, 104], [140, 66, 125, 115], [68, 104, 125, 115]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="1" opacity="0.6" />
        ))}
        {[[35, 50], [95, 28], [140, 66], [68, 104], [125, 115]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i === 1 ? 8 : 5.5} fill={i === 1 ? "var(--yellow)" : "var(--paper)"} stroke="var(--ink)" strokeWidth="1.2" />
        ))}
      </Panel>

      {/* Panel 4 — time series: actual + dashed nowcast */}
      <Panel x={PANELS[3].x} label={PANELS[3].label}>
        <polyline points="18,105 42,88 62,96 84,68 106,78 128,45 155,56" fill="none" stroke="var(--ink)" strokeWidth="1.8" />
        <polyline points="18,122 42,116 62,120 84,106 106,111 128,94 155,99" fill="none" stroke="var(--yellow-2)" strokeWidth="1.4" strokeDasharray="5 4" />
      </Panel>

      {/* Converging arrows: panels → table */}
      {[95, 285, 475, 665].map((x, i) => {
        const tx = 380 + (i - 1.5) * 55;
        return (
          <g key={x}>
            <path d={`M${x} 185 C ${x} 240, ${tx} 262, ${tx} 316`} fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="4 4" opacity="0.55">
              {mounted && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur={`${1.8 + i * 0.35}s`} repeatCount="indefinite" />}
            </path>
            <path d={`M${tx - 4} 312 l4 8 4 -8`} fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.55" />
          </g>
        );
      })}

      {mounted && (
        <circle cx="380" cy="345" r="70" fill="url(#hvGlow)">
          <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Structured table: header + 3 rows filling in a loop */}
      <g transform="translate(140,325)">
        <rect width="480" height="145" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
        <rect width="480" height="32" fill="var(--ink)" />
        {["id", "geo", "t", "value", "src"].map((h, i) => (
          <text key={h} x={cols[i]} y="21" fontFamily="var(--font-mono)" fontSize="12" fill="var(--yellow)">{h}</text>
        ))}
        {[0, 1, 2].map((r) => (
          <g key={r} opacity={mounted ? 0 : 0.9}>
            {mounted && (
              <animate attributeName="opacity" values="0;0;0.9;0.9" keyTimes={`0;${0.12 + r * 0.2};${0.2 + r * 0.2};1`} dur="6s" repeatCount="indefinite" />
            )}
            {cols.map((x, c) => (
              <rect key={c} x={x} y={44 + r * 34} width={c === 3 ? 84 : 64} height="11" fill={c === 3 ? "var(--yellow)" : "var(--ink)"} opacity={c === 3 ? 0.85 : 0.18} />
            ))}
          </g>
        ))}
        {[66, 100, 134].map((y) => (
          <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="var(--ink)" strokeWidth="0.5" opacity="0.15" />
        ))}
      </g>

      {/* Arrow: table → analytics */}
      <path d="M380 475 L380 510" fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="4 4" opacity="0.55">
        {mounted && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2s" repeatCount="indefinite" />}
      </path>
      <path d="M376 506 l4 8 4 -8" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.55" />

      {/* Analytics output: bars + index line drawing itself, dashed nowcast tail */}
      <g transform="translate(80,518)">
        <rect width="600" height="242" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
        <text x="12" y="230" fontFamily="var(--font-mono)" fontSize="11" fill="var(--ink)" opacity="0.75">ANALYTICS</text>
        <path d="M42 22 L42 200 L572 200" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.5" />
        {[60, 105, 150].map((y) => (
          <line key={y} x1="42" y1={y} x2="572" y2={y} stroke="var(--ink)" strokeWidth="0.5" opacity="0.12" />
        ))}
        {bars.map((h, i) => (
          <rect
            key={i}
            x={62 + i * 44}
            y={200 - h}
            width="24"
            height={h}
            fill={i === bars.length - 2 ? "var(--yellow)" : "var(--paper-2)"}
            stroke="var(--ink)"
            strokeWidth="0.8"
            opacity="0.9"
          />
        ))}
        <path
          d="M74 152 L118 138 L162 144 L206 118 L250 126 L294 100 L338 108 L382 84 L426 90"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={mounted ? 1 : 0}
        >
          {mounted && <animate attributeName="stroke-dashoffset" values="1;0;0" keyTimes="0;0.55;1" dur="6s" repeatCount="indefinite" />}
        </path>
        <path d="M426 90 L470 70 L514 76 L556 52" fill="none" stroke="var(--yellow-2)" strokeWidth="1.8" strokeDasharray="6 5" />
        {mounted && (
          <circle cx="426" cy="90" r="16" fill="url(#hvGlow)">
            <animate attributeName="r" values="12;22;12" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
        <circle cx="426" cy="90" r="5" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
