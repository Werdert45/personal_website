"use client";

import { useId } from "react";

// Bespoke per-project mini-visualizations for the Projects & Papers cards.
// House style: technical blueprint on paper — thin ink strokes, mono
// micro-labels, one yellow accent per viz; deterministic, static, 320x180.

export function VizLanguage() {
  const uid = useId();
  const gridId = `${uid}-grid`;
  const arrowId = `${uid}-arrow`;
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="LanguageBuddy learning loop: a flagged word in conversation is lemmatized into an SM-2 spaced-repetition queue, scheduled onto tomorrow's lesson, and loops back into conversation" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 H 0 V 20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
        <marker id={arrowId} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 1 1 L 7 4 L 1 7" fill="none" stroke="#111110" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      <rect x="0" y="0" width="320" height="180" fill={`url(#${gridId})`} />

      {/* ---- stage 1: conversation ---- */}
      <text x="16" y="28" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">conversation</text>

      {/* tutor bubble */}
      <path d="M 22 59 l -5 7 l 11 -3 z" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" strokeLinejoin="round" />
      <rect x="16" y="34" width="88" height="26" rx="4" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" />
      <line x1="24" y1="42" x2="94" y2="42" stroke="#8A8676" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="24" y1="48" x2="78" y2="48" stroke="#8A8676" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="24" y1="54" x2="88" y2="54" stroke="#8A8676" strokeWidth="1.4" strokeLinecap="round" />

      {/* learner bubble with flagged word */}
      <path d="M 112 97 l 5 7 l -11 -3 z" fill="#FCFBF7" stroke="#111110" strokeWidth="0.9" strokeLinejoin="round" />
      <rect x="30" y="68" width="88" height="30" rx="4" fill="#FCFBF7" stroke="#111110" strokeWidth="0.9" />
      <line x1="38" y1="77" x2="110" y2="77" stroke="#8A8676" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="38" y1="86" x2="58" y2="86" stroke="#8A8676" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="63" y="81" width="28" height="9" rx="1.5" fill="#FFD60A" stroke="#E6BE00" strokeWidth="0.8" />
      <line x1="68" y1="85.5" x2="86" y2="85.5" stroke="#111110" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="96" y1="86" x2="110" y2="86" stroke="#8A8676" strokeWidth="1.4" strokeLinecap="round" />

      {/* capture -> lemmatize arrow */}
      <text x="110" y="66" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">lemmatize</text>
      <line x1="121" y1="78" x2="146" y2="75" stroke="#111110" strokeWidth="0.9" markerEnd={`url(#${arrowId})`} />

      {/* ---- stage 2: SM-2 queue ---- */}
      <text x="150" y="42" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">SM-2</text>
      <rect x="150" y="46" width="54" height="34" rx="2" fill="#F6F4EE" stroke="#111110" strokeWidth="0.7" />
      <rect x="155" y="51" width="54" height="34" rx="2" fill="#F6F4EE" stroke="#111110" strokeWidth="0.7" />
      <rect x="160" y="56" width="54" height="34" rx="2" fill="#FCFBF7" stroke="#111110" strokeWidth="1.1" />
      <rect x="166" y="62" width="24" height="8" rx="1.5" fill="#FFD60A" stroke="#E6BE00" strokeWidth="0.7" />
      <line x1="170" y1="66" x2="185" y2="66" stroke="#111110" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="166" y1="76" x2="206" y2="76" stroke="#8A8676" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="166" y1="82" x2="192" y2="82" stroke="#8A8676" strokeWidth="1.2" strokeLinecap="round" />

      {/* SM-2 review-interval timeline */}
      <line x1="150" y1="106" x2="232" y2="106" stroke="#111110" strokeWidth="0.8" />
      <circle cx="153" cy="106" r="2.6" fill="#FFD60A" stroke="#E6BE00" strokeWidth="1" />
      <circle cx="168" cy="106" r="1.7" fill="#111110" />
      <circle cx="190" cy="106" r="1.7" fill="#111110" />
      <circle cx="226" cy="106" r="1.7" fill="#111110" />
      <text y="116" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">
        <tspan x="149">1d</tspan>
        <tspan x="164">6d</tspan>
        <tspan x="184">15d</tspan>
      </text>

      {/* queue -> calendar arrow */}
      <line x1="217" y1="72" x2="235" y2="64" stroke="#111110" strokeWidth="0.9" markerEnd={`url(#${arrowId})`} />

      {/* ---- stage 3: next-day lesson calendar ---- */}
      <text x="240" y="40" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">next-day</text>
      <rect x="240" y="44" width="63" height="36" fill="#FCFBF7" stroke="#111110" strokeWidth="0.9" />
      <line x1="249" y1="44" x2="249" y2="80" stroke="#111110" strokeWidth="0.6" />
      <line x1="258" y1="44" x2="258" y2="80" stroke="#111110" strokeWidth="0.6" />
      <line x1="267" y1="44" x2="267" y2="80" stroke="#111110" strokeWidth="0.6" />
      <line x1="276" y1="44" x2="276" y2="80" stroke="#111110" strokeWidth="0.6" />
      <line x1="285" y1="44" x2="285" y2="80" stroke="#111110" strokeWidth="0.6" />
      <line x1="294" y1="44" x2="294" y2="80" stroke="#111110" strokeWidth="0.6" />
      <line x1="240" y1="53" x2="303" y2="53" stroke="#111110" strokeWidth="0.6" />
      <line x1="240" y1="62" x2="303" y2="62" stroke="#111110" strokeWidth="0.6" />
      <line x1="240" y1="71" x2="303" y2="71" stroke="#111110" strokeWidth="0.6" />
      <circle cx="244.5" cy="48.5" r="1.1" fill="#8A8676" />
      <circle cx="253.5" cy="48.5" r="1.1" fill="#8A8676" />
      <circle cx="271.5" cy="48.5" r="1.1" fill="#8A8676" />
      <circle cx="244.5" cy="57.5" r="1.1" fill="#8A8676" />
      <rect x="258.5" y="53.5" width="8" height="8" fill="#FFD60A" />
      <path d="M 260.5 57.5 l 2 2.3 l 3.6 -4.3" fill="none" stroke="#111110" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

      {/* closing the loop: tomorrow's exercises feed back into conversation */}
      <path d="M 271 84 C 278 136, 150 152, 76 106" fill="none" stroke="#111110" strokeWidth="0.9" strokeDasharray="4 3" markerEnd={`url(#${arrowId})`} />

      {/* footer facts */}
      <text x="16" y="170" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">6,200 vocab · A1–C1</text>
    </svg>
  );
}

export function VizABM() {
  const uid = useId();
  const arrowId = uid + "-arrow";
  const gridId = uid + "-grid";
  const cols = 13;
  const rows = 8;
  const cs = 12;
  const pitch = 13.5;
  const gx = 16;
  const gy = 34;
  const frontX = (base, t, y) => base + 9 * Math.sin(y * 0.055 + t * 0.25);
  const fronts = [
    { t: 0, base: 46, w: 0.8, dash: "3 3", op: 0.55 },
    { t: 5, base: 98, w: 0.8, dash: "3 3", op: 0.55 },
    { t: 10, base: 152, w: 1.3, dash: null, op: 1 },
  ];
  const frontPath = (f) => {
    let d = "";
    for (let i = 0; i <= 16; i++) {
      const y = gy + (i * rows * pitch) / 16;
      d += (i === 0 ? "M" : "L") + frontX(f.base, f.t, y).toFixed(1) + " " + y.toFixed(1);
    }
    return d;
  };
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gx + c * pitch;
      const y = gy + r * pitch;
      const mx = x + cs / 2;
      const my = y + cs / 2;
      let fill = "#F6F4EE";
      let op = 1;
      if (mx < frontX(46, 0, my)) {
        fill = "#E6BE00";
        op = 0.9;
      } else if (mx < frontX(98, 5, my)) {
        fill = "#FFD60A";
        op = 0.8;
      } else if (mx < frontX(152, 10, my)) {
        fill = "#FFD60A";
        op = 0.38;
      }
      cells.push(
        <rect key={r + "-" + c} x={x} y={y} width={cs} height={cs} rx="1" fill={fill} fillOpacity={op} stroke="#111110" strokeOpacity="0.22" strokeWidth="0.6" />
      );
    }
  }
  const t0x = frontX(46, 0, gy);
  const t10x = frontX(152, 10, gy);
  const hh = [[170.5, 53.5], [184, 67], [170.5, 80.5], [170.5, 107.5], [184, 121]];
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="Agent-based model of gentrification: a wave front of households and landlords advancing across a parcel grid from t=0 to t=10 years, with displaced households and an attractiveness-affordability feedback loop, on parcel data for Amsterdam, Utrecht and Milan" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
        <marker id={arrowId} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6" fill="none" stroke="#111110" strokeWidth="1" />
        </marker>
      </defs>
      <rect x="0" y="0" width="320" height="180" fill={"url(#" + gridId + ")"} />
      {cells}
      {fronts.map((f) => (
        <path key={f.t} d={frontPath(f)} fill="none" stroke="#111110" strokeWidth={f.w} strokeDasharray={f.dash || undefined} strokeOpacity={f.op} />
      ))}
      <circle cx="22" cy="88" r="3" fill="none" stroke="#111110" strokeWidth="0.8" />
      <circle cx="22" cy="88" r="0.8" fill="#111110" />
      <line x1={t0x} y1="27" x2={t0x} y2="32" stroke="#111110" strokeWidth="0.7" />
      <line x1={t10x} y1="27" x2={t10x} y2="32" stroke="#111110" strokeWidth="0.7" />
      <text x={t0x} y="24" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">t=0</text>
      <text x={t10x} y="24" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">t=10y</text>
      <path d="M 144 57 L 163 54" fill="none" stroke="#111110" strokeWidth="0.9" strokeDasharray="3 2.5" markerEnd={"url(#" + arrowId + ")"} />
      <path d="M 142 111 L 163 108" fill="none" stroke="#111110" strokeWidth="0.9" strokeDasharray="3 2.5" markerEnd={"url(#" + arrowId + ")"} />
      {hh.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill="#111110" fillOpacity="0.75" />
      ))}
      <text x="262" y="74" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">attractiveness &#8593;</text>
      <text x="262" y="120" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">affordability &#8595;</text>
      <path d="M 288 79 C 305 87 305 107 288 113" fill="none" stroke="#111110" strokeWidth="0.9" markerEnd={"url(#" + arrowId + ")"} />
      <path d="M 236 113 C 219 105 219 85 236 79" fill="none" stroke="#111110" strokeWidth="0.9" markerEnd={"url(#" + arrowId + ")"} />
      <path d="M 218 96 L 198 96" fill="none" stroke="#111110" strokeWidth="0.8" strokeDasharray="2.5 2.5" markerEnd={"url(#" + arrowId + ")"} />
      <text x="16" y="157" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">parcels: AMS &#183; UTRECHT &#183; MILAN</text>
    </svg>
  );
}

export function VizConnectivity() {
  const uid = useId();
  const gridId = uid + "-grid";

  // Best-scoring parcel: rect at (157,73) 22x16, center (168,81)
  const CX = 168;
  const CY = 81;

  // Parcel grid: 9 cols x 5 rows, odd rows nudged +5 (organic block offsets).
  // Score = deterministic distance decay from the scored point, 0-100 style.
  const parcels = [];
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 9; i++) {
      if (i === 4 && j === 1) continue; // the highlighted parcel, drawn separately
      const x = 28 + i * 31 + (j % 2) * 5;
      const y = 48 + j * 25;
      const d = Math.hypot(x + 11 - CX, y + 8 - CY);
      const s = Math.max(12, Math.round(94 - 0.5 * d));
      parcels.push({ x, y, s });
    }
  }

  // Street network: edges with varying weights (thicker = higher weight)
  const streets = [
    { d: "M14 44 L306 41", w: 0.7 },
    { d: "M12 69 L308 66", w: 0.8 },
    { d: "M10 95 L310 92", w: 1.4 },
    { d: "M14 119 L306 122", w: 0.7 },
    { d: "M12 144 L308 147", w: 0.6 },
    { d: "M55 34 L52 168", w: 0.7 },
    { d: "M117 32 L114 170", w: 0.9 },
    { d: "M179 30 L177 172", w: 1.1 },
    { d: "M241 32 L244 170", w: 0.7 },
    { d: "M272 36 L276 168", w: 0.6 },
  ];

  // Network nodes at street intersections
  const nodeXs = [54, 116, 178, 242, 274];
  const nodeYs = [43, 68, 94, 120, 145];
  const nodes = [];
  for (let a = 0; a < nodeXs.length; a++) {
    for (let b = 0; b < nodeYs.length; b++) {
      nodes.push({ x: nodeXs[a], y: nodeYs[b] });
    }
  }

  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-label="Parcel-resolution walkability scoring: isochrone rings over a weighted street network, parcels shaded by score, best parcel highlighted"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* faint blueprint grid */}
      <rect width="320" height="180" fill={"url(#" + gridId + ")"} />

      {/* parcels shaded by score (sequential: one hue, light to dark) */}
      {parcels.map((p, k) => (
        <rect
          key={k}
          x={p.x}
          y={p.y}
          width="22"
          height="16"
          fill="#111110"
          fillOpacity={0.04 + (p.s / 100) * 0.28}
          stroke="#8A8676"
          strokeOpacity="0.35"
          strokeWidth="0.6"
        />
      ))}

      {/* street network overlay: weighted edges */}
      {streets.map((s, k) => (
        <path key={k} d={s.d} fill="none" stroke="#111110" strokeOpacity="0.8" strokeWidth={s.w} />
      ))}
      {nodes.map((n, k) => (
        <circle key={k} cx={n.x} cy={n.y} r="0.9" fill="#111110" fillOpacity="0.45" />
      ))}

      {/* isochrone rings around the scored point */}
      <circle cx={CX} cy={CY} r="24" fill="none" stroke="#111110" strokeOpacity="0.6" strokeWidth="0.8" strokeDasharray="3 2.5" />
      <circle cx={CX} cy={CY} r="48" fill="none" stroke="#111110" strokeOpacity="0.45" strokeWidth="0.7" strokeDasharray="3 2.5" />
      <circle cx={CX} cy={CY} r="72" fill="none" stroke="#111110" strokeOpacity="0.3" strokeWidth="0.7" strokeDasharray="3 2.5" />

      {/* the single yellow accent: best parcel */}
      <rect x="157" y="73" width="22" height="16" fill="#FFD60A" stroke="#111110" strokeWidth="1" />
      <circle cx={CX} cy="76.5" r="1.6" fill="#111110" />
      <text
        x={CX}
        y="87"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7.5"
        fontWeight="600"
        fill="#111110"
      >
        94
      </text>

      {/* ring label chips */}
      <rect x="180.5" y="57.5" width="21" height="8" fill="#FCFBF7" fillOpacity="0.85" stroke="#8A8676" strokeWidth="0.4" />
      <text x="191" y="63.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">
        5 min
      </text>
      <rect x="206" y="26" width="25" height="8" fill="#FCFBF7" fillOpacity="0.85" stroke="#8A8676" strokeWidth="0.4" />
      <text x="218.5" y="32" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">
        15 min
      </text>

      {/* header fact */}
      <text x="12" y="17" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.4" fill="#111110">
        38 markets · EU/NA/APAC
      </text>

      {/* score legend: same ramp as the parcels */}
      {[0, 1, 2, 3, 4].map((k) => (
        <rect
          key={k}
          x={12 + k * 13}
          y="169"
          width="12"
          height="5"
          fill="#111110"
          fillOpacity={0.04 + k * 0.07}
          stroke="#8A8676"
          strokeOpacity="0.35"
          strokeWidth="0.5"
        />
      ))}
      <text x="82" y="174" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">
        parcel score 0–100
      </text>
    </svg>
  );
}

export function VizHedonic() {
  const uid = useId();
  const gridId = "grid-" + uid;
  const x0 = 74;
  const x1 = 298;
  const X = (m) => x0 + (m * (x1 - x0)) / 23;
  const Y = (v) => 158 - (v - 95) * 6.5;
  const val = (m) => 100 + 0.42 * m + 1.6 * Math.sin(0.9 * m) + 0.8 * Math.sin(2.3 * m);
  const pts = [];
  for (let m = 0; m <= 23; m++) pts.push([X(m), Y(val(m))]);
  const monthlyPath = pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
  const stepCmds = [];
  for (let q = 0; q < 8; q++) {
    const v = (val(3 * q) + val(3 * q + 1) + val(3 * q + 2)) / 3;
    const y = Y(v).toFixed(1);
    const xa = X(3 * q).toFixed(1);
    const xb = (q === 7 ? X(23) : X(3 * q + 3)).toFixed(1);
    stepCmds.push((q === 0 ? "M" : "L") + xa + " " + y + " L" + xb + " " + y);
  }
  const stepPath = stepCmds.join(" ");
  const feedYs = [];
  for (let i = 0; i < 13; i++) feedYs.push(36 + i * 9);
  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-label="Monthly hedonic house-price index for 13 EU countries overlaid on Eurostat quarterly HPI steps, base 100"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="180" fill={"url(#" + gridId + ")"} />

      {feedYs.map((y, i) => (
        <g key={"feed-" + i}>
          <line x1="12" y1={y} x2="19" y2={y} stroke="#111110" strokeWidth="0.8" />
          <line x1="19" y1={y} x2="54" y2="122" stroke="#8A8676" strokeWidth="0.6" strokeOpacity="0.45" />
        </g>
      ))}
      <line x1="54" y1="122" x2="66" y2="124" stroke="#111110" strokeWidth="0.9" />
      <polygon points="66,121.6 71.5,124.4 66,127.2" fill="#111110" />

      <line x1="74" y1="30" x2="74" y2="150" stroke="#111110" strokeWidth="0.9" />
      <line x1="74" y1="150" x2="298" y2="150" stroke="#111110" strokeWidth="0.9" />
      {pts.map((p, i) => (
        <line
          key={"tx-" + i}
          x1={p[0].toFixed(1)}
          y1="150"
          x2={p[0].toFixed(1)}
          y2={i % 3 === 0 ? "154.5" : "152.3"}
          stroke="#111110"
          strokeWidth={i % 3 === 0 ? "0.9" : "0.6"}
        />
      ))}
      {[100, 105, 110].map((v) => (
        <line
          key={"ty-" + v}
          x1="70.5"
          y1={Y(v).toFixed(1)}
          x2="74"
          y2={Y(v).toFixed(1)}
          stroke="#111110"
          strokeWidth="0.6"
        />
      ))}

      <line
        x1="74"
        y1={Y(100).toFixed(1)}
        x2="298"
        y2={Y(100).toFixed(1)}
        stroke="#8A8676"
        strokeWidth="0.7"
        strokeDasharray="3 3"
      />

      <path d={stepPath} fill="none" stroke="#111110" strokeWidth="1.1" />
      <path d={monthlyPath} fill="none" stroke="#FFD60A" strokeWidth="1.4" />
      {pts.map((p, i) => (
        <circle key={"pt-" + i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="1" fill="#E6BE00" />
      ))}
      <circle
        cx={pts[23][0].toFixed(1)}
        cy={pts[23][1].toFixed(1)}
        r="2"
        fill="#FFD60A"
        stroke="#111110"
        strokeWidth="0.8"
      />

      <line x1="80" y1="32" x2="96" y2="32" stroke="#FFD60A" strokeWidth="1.4" />
      <circle cx="88" cy="32" r="1" fill="#E6BE00" />
      <path d="M80 46.5 L87 46.5 L87 42.5 L94 42.5" fill="none" stroke="#111110" strokeWidth="1" />
      <text x="100" y="34.5" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">
        monthly
      </text>
      <text x="100" y="47" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">
        Eurostat Q
      </text>
      <text x="296" y="121.5" textAnchor="end" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">
        base=100
      </text>
      <text x="6" y="157.5" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">
        13 countries
      </text>
    </svg>
  );
}

export function VizPipelines() {
  const uid = useId();
  const gridId = `${uid}-grid`;
  const arrowId = `${uid}-arrow`;
  const arrowMuteId = `${uid}-arrow-m`;
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="Airflow DAG: 726 GB ingest passes a SHA-256 guard, a running task fans out to Celery worker queues" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
        <marker id={arrowId} viewBox="0 0 6 6" refX="5.5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0L6 3L0 6Z" fill="#111110" />
        </marker>
        <marker id={arrowMuteId} viewBox="0 0 6 6" refX="5.5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0L6 3L0 6Z" fill="#8A8676" />
        </marker>
      </defs>

      <rect x="0" y="0" width="320" height="180" fill={`url(#${gridId})`} />

      <text x="14" y="20" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="2" fill="#111110">DAG</text>
      <line x1="14" y1="25" x2="46" y2="25" stroke="#8A8676" strokeWidth="0.6" />

      <line x1="6" y1="96" x2="20" y2="96" stroke="#8A8676" strokeWidth="0.8" strokeDasharray="2 2" />

      <rect x="22" y="86" width="46" height="20" rx="2" fill="#F6F4EE" stroke="#111110" strokeWidth="0.9" />
      <text x="45" y="98.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">ingest</text>
      <text x="45" y="118" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">726 GB</text>

      <line x1="68" y1="96" x2="90" y2="96" stroke="#111110" strokeWidth="0.9" markerEnd={`url(#${arrowId})`} />

      <path d="M114 80L134 96L114 112L94 96Z" fill="#FCFBF7" stroke="#111110" strokeWidth="0.9" />
      <path d="M108.5 96.5L112.5 100.5L120 90.5" fill="none" stroke="#111110" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <text x="114" y="74" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">guard</text>

      <line x1="134" y1="96" x2="154" y2="96" stroke="#111110" strokeWidth="0.9" markerEnd={`url(#${arrowId})`} />

      <rect x="158" y="86" width="48" height="20" rx="2" fill="#FFD60A" stroke="#111110" strokeWidth="1.1" />
      <text x="182" y="98.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">transform</text>

      <path d="M114 112C114 140 184 142 210 103" fill="none" stroke="#8A8676" strokeWidth="0.8" strokeDasharray="3 2" markerEnd={`url(#${arrowMuteId})`} />

      <line x1="206" y1="96" x2="217" y2="96" stroke="#111110" strokeWidth="0.9" />

      <rect x="219" y="87" width="10" height="4" fill="#F6F4EE" stroke="#111110" strokeWidth="0.7" />
      <rect x="219" y="93" width="10" height="4" fill="#F6F4EE" stroke="#111110" strokeWidth="0.7" />
      <rect x="219" y="99" width="10" height="4" fill="#F6F4EE" stroke="#111110" strokeWidth="0.7" />
      <text x="222" y="118" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">queue</text>

      <path d="M231 90L246 59" fill="none" stroke="#111110" strokeWidth="0.8" markerEnd={`url(#${arrowId})`} />
      <line x1="231" y1="96" x2="246" y2="96" stroke="#111110" strokeWidth="0.8" markerEnd={`url(#${arrowId})`} />
      <path d="M231 102L246 133" fill="none" stroke="#111110" strokeWidth="0.8" markerEnd={`url(#${arrowId})`} />

      <rect x="250" y="48" width="52" height="16" rx="2" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" />
      <line x1="256" y1="54" x2="290" y2="54" stroke="#8A8676" strokeWidth="0.6" />
      <line x1="256" y1="58" x2="278" y2="58" stroke="#8A8676" strokeWidth="0.6" />

      <rect x="250" y="88" width="52" height="16" rx="2" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" />
      <line x1="256" y1="94" x2="290" y2="94" stroke="#8A8676" strokeWidth="0.6" />
      <line x1="256" y1="98" x2="278" y2="98" stroke="#8A8676" strokeWidth="0.6" />

      <rect x="250" y="128" width="52" height="16" rx="2" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" />
      <line x1="256" y1="134" x2="290" y2="134" stroke="#8A8676" strokeWidth="0.6" />
      <line x1="256" y1="138" x2="278" y2="138" stroke="#8A8676" strokeWidth="0.6" />

      <text x="276" y="156" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">celery workers</text>
    </svg>
  );
}

export function VizTransfer() {
  const uid = useId();
  const gridId = `${uid}-grid`;
  const hatchId = `${uid}-hatch`;
  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-label="Fine-tuning transfer matrix for autonomous driving detection: EU fine-tuned gains +0.153 mAP on the EU test set, US fine-tuned only +0.001"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
        <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M 0 5 L 5 0" stroke="#8A8676" strokeWidth="0.5" opacity="0.55" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="320" height="180" fill={`url(#${gridId})`} />

      {/* supporting detail: camera frame with detections, one missed (dashed) box */}
      <rect x="22" y="76" width="56" height="36" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" />
      <line x1="22" y1="96" x2="78" y2="96" stroke="#8A8676" strokeWidth="0.5" />
      <path d="M 36 112 L 48 96" fill="none" stroke="#8A8676" strokeWidth="0.5" />
      <path d="M 66 112 L 55 96" fill="none" stroke="#8A8676" strokeWidth="0.5" />
      <rect x="30" y="90.5" width="13" height="8.5" fill="none" stroke="#111110" strokeWidth="0.8" />
      <rect x="47" y="88" width="9" height="7" fill="none" stroke="#111110" strokeWidth="0.8" />
      <rect x="62" y="91" width="10" height="12" fill="none" stroke="#8A8676" strokeWidth="0.8" strokeDasharray="2 1.6" />

      {/* column headers (test domain) */}
      <text x="175" y="42" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">US test</text>
      <text x="245" y="42" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">EU test</text>

      {/* row labels (training regime) */}
      <text x="133" y="66.5" textAnchor="end" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">zero-shot</text>
      <text x="133" y="98.5" textAnchor="end" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">US-ft</text>
      <text x="133" y="130.5" textAnchor="end" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">EU-ft</text>

      {/* matrix cells */}
      <rect x="140" y="48" width="70" height="32" fill={`url(#${hatchId})`} stroke="#111110" strokeWidth="0.7" />
      <rect x="210" y="48" width="70" height="32" fill={`url(#${hatchId})`} stroke="#111110" strokeWidth="0.7" />
      <rect x="140" y="80" width="70" height="32" fill="#111110" fillOpacity="0.28" stroke="#111110" strokeWidth="0.7" />
      <rect x="210" y="80" width="70" height="32" fill="#F6F4EE" stroke="#111110" strokeWidth="0.7" />
      <rect x="140" y="112" width="70" height="32" fill="#111110" fillOpacity="0.06" stroke="#111110" strokeWidth="0.7" />
      <rect x="210" y="112" width="70" height="32" fill="#FFD60A" stroke="#111110" strokeWidth="1.2" />
      <rect x="140" y="48" width="140" height="96" fill="none" stroke="#111110" strokeWidth="1" />

      {/* the two measured deltas on the EU test set */}
      <text x="245" y="98.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="#8A8676">+0.001</text>
      <text x="245" y="131" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fontWeight="600" fill="#111110">+0.153</text>

      <text x="210" y="157" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">Δ mAP vs zero-shot</text>
    </svg>
  );
}

export function VizSponsor() {
  const gid = useId().replace(/:/g, "");
  const ticks = [];
  for (let x = 26; x <= 302; x += 6) ticks.push(x);
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="Video timeline with a detected sponsor segment from 4:32 to 6:05, per-sentence sponsor probability curve spiking over the segment, and transcript sentence tick marks" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id={gid} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill={"url(#" + gid + ")"} />

      {/* probability chart frame */}
      <line x1="24" y1="34" x2="24" y2="102" stroke="#8A8676" strokeWidth="0.6" />
      <line x1="24" y1="102" x2="304" y2="102" stroke="#8A8676" strokeWidth="0.6" />
      {/* decision threshold */}
      <line x1="24" y1="70" x2="304" y2="70" stroke="#8A8676" strokeWidth="0.7" strokeDasharray="3 3" />

      {/* yellow accent: the detected sponsor span (area under spike + timeline segment) */}
      <path d="M148,102 L148,46 H160 V42 H172 V44 H184 V41 H192 L192,102 Z" fill="#FFD60A" fillOpacity="0.28" />

      {/* per-sentence step curve (BiLSTM tags, one step per sentence) */}
      <path
        d="M24,100 H34 V98 H46 V101 H58 V96 H70 V100 H82 V99 H94 V94 H106 V100 H118 V97 H130 V92 H140 V78 H148 V46 H160 V42 H172 V44 H184 V41 H192 V74 H200 V96 H212 V100 H224 V97 H236 V101 H248 V95 H260 V99 H272 V100 H284 V96 H296 V100 H304"
        fill="none" stroke="#111110" strokeWidth="1.2" strokeLinejoin="round"
      />

      {/* segment boundaries mapped back to the timeline */}
      <line x1="148" y1="46" x2="148" y2="116" stroke="#111110" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.55" />
      <line x1="192" y1="41" x2="192" y2="116" stroke="#111110" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.55" />

      {/* video timeline */}
      <rect x="24" y="116" width="280" height="12" rx="2" fill="#F6F4EE" stroke="#111110" strokeWidth="0.9" />
      <rect x="148" y="116" width="44" height="12" fill="#FFD60A" stroke="#E6BE00" strokeWidth="0.9" />

      {/* transcript sentence ticks */}
      {ticks.map((x) => {
        const inSeg = x >= 148 && x <= 192;
        return (
          <line
            key={x}
            x1={x} y1="133" x2={x} y2={inSeg ? 139 : 137}
            stroke={inSeg ? "#111110" : "#8A8676"}
            strokeWidth={inSeg ? 0.9 : 0.6}
          />
        );
      })}

      {/* labels */}
      <text x="24" y="30" fontFamily="var(--font-mono)" fontSize="7" fill="#111110">p(sponsor)</text>
      <text x="304" y="30" textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="#111110">86% F1</text>
      <text x="304" y="67" textAnchor="end" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">0.5</text>
      <text x="148" y="149" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">4:32</text>
      <text x="192" y="149" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">6:05</text>
      <text x="24" y="162" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">sentence-T5 → BiLSTM · 38,600 videos</text>
    </svg>
  );
}

export function VizFish() {
  const uid = useId();
  const gridId = `${uid}-grid`;
  const fish =
    "M0,0 C4,-6.5 14,-11.5 26,-12.5 C38,-13.2 50,-8.5 58,-3.5 L71,-12 L65.5,0 L71,12 L58,3.5 C50,8.5 38,12.5 26,12.5 C14,11.5 4,6.5 0,0 Z";
  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-label="FishFinder pipeline: photo with click point, SAM mask outline, 224 pixel crop, ResNet50, species label one of 63, 8.8 megabytes on-device"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="180" fill={`url(#${gridId})`} />

      {/* photo frame */}
      <rect x="16" y="36" width="110" height="110" fill="#FCFBF7" stroke="#111110" strokeWidth="1" />
      <path
        d="M16,44 V36 H24 M118,36 H126 V44 M126,138 V146 H118 M24,146 H16 V138"
        fill="none"
        stroke="#111110"
        strokeWidth="1.4"
      />
      <path
        d="M22,52 q10,-2.5 20,0 t20,0 t20,0 t20,0"
        fill="none"
        stroke="#8A8676"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <path
        d="M24,132 q10,-2.5 20,0 t20,0 t20,0 t18,0"
        fill="none"
        stroke="#8A8676"
        strokeWidth="0.6"
        opacity="0.5"
      />

      {/* fish silhouette */}
      <g transform="translate(28,91)">
        <path d={fish} fill="#111110" />
        <circle cx="10" cy="-3.5" r="1.6" fill="#FCFBF7" />
      </g>

      {/* SAM mask outline (dashed) */}
      <g transform="translate(22.3,91) scale(1.16)">
        <path d={fish} fill="none" stroke="#111110" strokeWidth="0.75" strokeDasharray="3 2.2" />
      </g>

      {/* the one human click point (yellow accent) */}
      <circle cx="66" cy="90" r="6" fill="none" stroke="#E6BE00" strokeWidth="0.8" />
      <circle cx="66" cy="90" r="3.2" fill="#FFD60A" stroke="#111110" strokeWidth="0.8" />
      <path
        d="M66,81 V85 M66,95 V99 M57,90 H61 M71,90 H75"
        stroke="#FCFBF7"
        strokeWidth="0.7"
      />

      {/* arrow: photo -> crop, via SAM */}
      <line x1="130" y1="91" x2="150" y2="91" stroke="#111110" strokeWidth="1" />
      <path d="M156,91 L150,88.5 L150,93.5 Z" fill="#111110" />
      <text
        x="143"
        y="85.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="#111110"
      >
        SAM
      </text>

      {/* 224x224 crop square */}
      <rect x="158" y="64" width="54" height="54" fill="#F6F4EE" stroke="#111110" strokeWidth="0.9" />
      <path
        d="M158,69 V64 H163 M207,64 H212 V69 M212,113 V118 H207 M163,118 H158 V113"
        fill="none"
        stroke="#111110"
        strokeWidth="1.3"
      />
      <g transform="translate(163.5,91) scale(0.62)">
        <path d={fish} fill="#111110" />
        <circle cx="10" cy="-3.5" r="1.6" fill="#FCFBF7" />
      </g>
      <path d="M158,121 V125 M212,121 V125 M158,123 H212" fill="none" stroke="#8A8676" strokeWidth="0.6" />
      <text
        x="185"
        y="131.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6.5"
        fill="#8A8676"
      >
        224px
      </text>

      {/* arrow: crop -> label, via ResNet50 */}
      <line x1="216" y1="91" x2="234" y2="91" stroke="#111110" strokeWidth="1" />
      <path d="M240,91 L234,88.5 L234,93.5 Z" fill="#111110" />
      <text
        x="228"
        y="84.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6.5"
        fill="#8A8676"
      >
        ResNet50
      </text>

      {/* species label chip */}
      <rect x="244" y="81" width="60" height="20" rx="3" fill="#FCFBF7" stroke="#111110" strokeWidth="1.1" />
      <text
        x="274"
        y="94.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8.5"
        fill="#111110"
      >
        1/63
      </text>
      <text
        x="274"
        y="112"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6.5"
        fill="#8A8676"
      >
        8.8 MB on-device
      </text>
    </svg>
  );
}

export function VizFlood() {
  const uid = useId();
  const gridId = uid + "-grid";
  const hatchId = uid + "-hatch";
  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-label="Terrain cross-section: flood risk predicted from relative height, distance to river, and imperviousness; random forest 97.5% accuracy"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,14,11,.07)" strokeWidth="1" />
        </pattern>
        <pattern id={hatchId} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 0 4 L 4 0" fill="none" stroke="#111110" strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="320" height="180" fill={"url(#" + gridId + ")"} />

      <path
        d="M 12 64 L 40 66 L 56 74 L 92 74 L 128 112 L 144 113 L 152 130 L 172 132 L 180 114 L 210 112 L 244 100 L 276 92 L 308 86 L 308 180 L 12 180 Z"
        fill="#F6F4EE"
      />

      <path
        d="M 121.4 105 L 229.8 105 L 210 112 L 180 114 L 172 132 L 152 130 L 128 112 Z"
        fill="#FFD60A"
        opacity="0.3"
      />
      <path d="M 154 112 L 168 112 M 150 119 L 173 119" stroke="#E6BE00" strokeWidth="1" fill="none" />

      <path
        d="M 12 64 L 40 66 L 56 74 L 92 74 L 128 112 L 144 113 L 152 130 L 172 132 L 180 114 L 210 112 L 244 100 L 276 92 L 308 86"
        fill="none"
        stroke="#111110"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      <line x1="110" y1="105" x2="248" y2="105" stroke="#111110" strokeWidth="0.9" strokeDasharray="4 3" />

      <path
        d="M 44 68 L 56 74 L 92 74 L 104 86.7 L 104 92.7 L 92 80 L 56 80 L 44 74 Z"
        fill={"url(#" + hatchId + ")"}
        stroke="#8A8676"
        strokeWidth="0.6"
      />

      <rect x="60" y="58" width="22" height="16" fill="#FCFBF7" stroke="#111110" strokeWidth="1" />
      <path d="M 58 58 L 71 50 L 84 58" fill="#FCFBF7" stroke="#111110" strokeWidth="1" strokeLinejoin="round" />
      <path d="M 68 74 L 68 66 L 74 66 L 74 74" fill="none" stroke="#111110" strokeWidth="0.7" />

      <line x1="94" y1="74" x2="148" y2="74" stroke="#8A8676" strokeWidth="0.7" strokeDasharray="2 2" />
      <line x1="136" y1="76" x2="136" y2="103" stroke="#111110" strokeWidth="0.9" />
      <path d="M 133 79 L 136 75 L 139 79" fill="none" stroke="#111110" strokeWidth="0.9" />
      <path d="M 133 100 L 136 104 L 139 100" fill="none" stroke="#111110" strokeWidth="0.9" />

      <path d="M 71 47 L 71 42 L 162 42 L 162 47" fill="none" stroke="#111110" strokeWidth="0.9" />
      <line x1="162" y1="47" x2="162" y2="102" stroke="#8A8676" strokeWidth="0.6" strokeDasharray="2 2" />

      <line x1="48" y1="82" x2="38" y2="93" stroke="#8A8676" strokeWidth="0.6" />

      <g fontFamily="var(--font-mono)">
        <text x="306" y="18" textAnchor="end" fontSize="8" fill="#111110">RF 97.5%</text>
        <text x="306" y="27" textAnchor="end" fontSize="6.5" fill="#8A8676">33 features</text>
        <text x="116" y="38" textAnchor="middle" fontSize="7" fill="#111110">d(river)</text>
        <text x="141" y="92" fontSize="7" fill="#111110">Δh</text>
        <text x="12" y="101" fontSize="6.5" fill="#8A8676">imperv. 500m–5km</text>
        <text x="251" y="107.5" fontSize="6.5" fill="#8A8676">w.l.</text>
      </g>
    </svg>
  );
}
