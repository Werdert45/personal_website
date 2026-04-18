"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { EUROPE_PATH, europeanCities, dataConnections } from "./europe-map-path";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [inview, setInview] = useState(false);
  const t = useTranslations("Hero");
  const locale = useLocale();

  const heroRef = useRef(null);
  const spotRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setInview(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const spot = spotRef.current;
    if (!hero || !spot) return;
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      spot.style.transform = `translate(${e.clientX - r.left - 260}px, ${e.clientY - r.top - 260}px)`;
    };
    spot.style.transform = "translate(40%, 30%)";
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const vis = visualRef.current;
      const y = window.scrollY;
      if (vis && y < 900) {
        vis.style.transform = `translateY(calc(-50% + ${y * 0.12}px)) rotate(${y * 0.02}deg)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero"
      id="home"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        padding: "180px 50px 120px",
      }}
    >
      <div ref={spotRef} className="spot" />

      {/* Meta strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 40,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--mute)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          flexWrap: "wrap",
          gap: 16,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <span><span style={{ color: "var(--ink)" }}>◎</span> {t("location")}</span>
          <span><span style={{ color: "var(--ink)" }}>◆</span> {t("role")}</span>
          <span><span style={{ color: "var(--ink)" }}>⏱</span> Open to selective work</span>
        </div>
        <div>Portfolio / 2026 —</div>
      </div>

      {/* Title */}
      <h1
        className={`hero-title${inview ? " inview" : ""}`}
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(72px, 13vw, 210px)",
          lineHeight: 0.92,
          letterSpacing: "-0.03em",
          fontWeight: 400,
          color: "var(--ink)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {t("title").trim()} <i style={{ fontStyle: "italic" }}>Engineer</i>
        <br />
        &amp; <span className="y">{t("titleHighlight")}</span>
        <br />
        Data <i style={{ fontStyle: "italic" }}>Scientist</i>.
      </h1>

      {/* Sub / side */}
      <div
        className="hero-sub"
        style={{
          marginTop: 56,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "start",
          position: "relative",
          zIndex: 2,
        }}
      >
        <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: "48ch", color: "var(--ink-2)" }}>
          {t("description")}
        </p>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--mute)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            justifySelf: "end",
            textAlign: "right",
          }}
        >
          <span>↳ Currently</span>
          <b style={{ color: "var(--ink)", fontWeight: 500 }}>{t("role")} · FinTech</b>
          <span>↳ Previously</span>
          <b style={{ color: "var(--ink)", fontWeight: 500 }}>Data Scientist · Full-Stack Dev</b>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ marginTop: 56, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
        <Link href={`/${locale}/visualizations`} className="btn primary">
          <span>{t("viewProjects")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
        <Link href={`/${locale}/contact`} className="btn ghost">
          <span>{t("getInTouch")}</span>
        </Link>
      </div>

      {/* Stats + expertise */}
      <div
        style={{
          marginTop: 72,
          display: "grid",
          gridTemplateColumns: "repeat(3, auto) 1fr",
          gap: 0,
          borderTop: "1px solid var(--ink)",
          borderBottom: "1px solid var(--ink)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ padding: "24px 40px 24px 0", borderRight: "1px solid var(--rule)", marginRight: 40 }}>
          <b style={{ fontFamily: "var(--font-serif)", fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--yellow-2)", display: "block" }}>4+</b>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)", marginTop: 8, display: "block" }}>{t("yearsExperience")}</span>
        </div>
        <div style={{ padding: "24px 40px 24px 0", borderRight: "1px solid var(--rule)", marginRight: 40 }}>
          <b style={{ fontFamily: "var(--font-serif)", fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--yellow-2)", display: "block" }}>15+</b>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)", marginTop: 8, display: "block" }}>{t("marketsMapped")}</span>
        </div>
        <div style={{ padding: "24px 40px 24px 0", borderRight: "1px solid var(--rule)", marginRight: 40 }}>
          <b style={{ fontFamily: "var(--font-serif)", fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--yellow-2)", display: "block" }}>10+</b>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)", marginTop: 8, display: "block" }}>{t("geoProjects")}</span>
        </div>
        <div style={{ padding: "24px 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)", marginRight: 8 }}>{t("expertise")}</span>
          <span className="chip">{t("dataEngineering")}</span>
          <span className="chip">{t("machineLearning")}</span>
          <span className="chip">Python</span>
          <span className="chip">Airflow</span>
          <span className="chip">PostGIS</span>
          <span className="chip">Mapbox</span>
        </div>
      </div>

      {/* Hero visual — Europe map, restyled */}
      <div
        ref={visualRef}
        aria-hidden
        style={{
          position: "absolute",
          right: 50,
          top: "52%",
          transform: "translateY(-50%)",
          width: "min(44vw, 620px)",
          aspectRatio: "1 / 1",
          pointerEvents: "none",
          opacity: 0.95,
          zIndex: 1,
        }}
      >
        <svg viewBox="200 80 760 560" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <pattern id="gridp" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M30 0 L0 0 0 30" fill="none" stroke="rgba(15,14,11,.05)" strokeWidth="1" />
            </pattern>
            <radialGradient id="amsGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD60A" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#FFD60A" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="200" y="80" width="760" height="560" fill="url(#gridp)" />

          {/* Europe outline */}
          <g fill="var(--paper-2)" stroke="var(--ink)" strokeWidth="0.6" strokeOpacity="0.5">
            <path d={EUROPE_PATH} />
          </g>

          {/* Ams glow */}
          {mounted && (
            <circle cx={europeanCities[0].x} cy={europeanCities[0].y} r="60" fill="url(#amsGlow)">
              <animate attributeName="r" values="50;70;50" dur="4s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Connections */}
          {mounted && dataConnections.map((c, i) => {
            const a = europeanCities[c.from];
            const b = europeanCities[c.to];
            return (
              <line
                key={`ln-${i}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="var(--ink)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.55"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-12" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
              </line>
            );
          })}

          {/* City markers */}
          {europeanCities.map((city, i) => (
            <g key={city.name}>
              {city.primary && (
                <circle cx={city.x} cy={city.y} r={city.size + 6} fill="none" stroke="var(--yellow-2)" strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values={`${city.size + 4};${city.size + 10};${city.size + 4}`} dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={city.x} cy={city.y} r={city.size} fill="var(--yellow)" stroke="var(--ink)" strokeWidth={city.primary ? 1.4 : 1} />
              <text
                x={city.x + city.size + 6}
                y={city.y + 3}
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--ink)"
                opacity="0.85"
              >
                {city.code} · {city.name}
              </text>
            </g>
          ))}

          {/* Legend scale bar */}
          <g transform="translate(240,605)">
            <rect x="0" y="0" width="30" height="5" fill="var(--ink)" />
            <rect x="30" y="0" width="30" height="5" fill="none" stroke="var(--ink)" />
            <rect x="60" y="0" width="30" height="5" fill="var(--ink)" />
            <text x="0" y="20" fontFamily="var(--font-mono)" fontSize="8" fill="var(--ink)">0</text>
            <text x="78" y="20" fontFamily="var(--font-mono)" fontSize="8" fill="var(--ink)">500 km</text>
          </g>

          {/* N compass */}
          <g transform="translate(920,110)">
            <polygon points="0,-14 4,4 0,0 -4,4" fill="var(--ink)" />
            <polygon points="0,14 4,-4 0,0 -4,-4" fill="none" stroke="var(--ink)" />
            <text x="-4" y="-20" fontFamily="var(--font-mono)" fontSize="11" fill="var(--ink)" fontWeight="500">N</text>
          </g>
        </svg>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .hero-sub {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-sub > div:last-child {
            justify-self: start !important;
            text-align: left !important;
          }
        }
        @media (max-width: 1200px) {
          .hero :global(.hero-visual-wrap) {
            opacity: 0.25;
          }
        }
      `}</style>
    </section>
  );
}
