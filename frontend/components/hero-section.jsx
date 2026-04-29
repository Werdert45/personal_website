"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { EUROPE_PATH, europeanCities, dataConnections } from "./europe-map-path";
import { trackEvent } from "@/lib/analytics";

function renderTitle(title, highlight, end) {
  const cleanTitle = (title || "").replace(/[&\s]+$/, "").trim();
  const cleanEnd = (end || "").replace(/^[&\s]+/, "").trim();
  const titleParts = cleanTitle.split(" ");
  const lastTitleWord = titleParts.pop();
  const endParts = cleanEnd.split(" ");
  const lastEndWord = endParts.pop();

  return (
    <>
      {titleParts.join(" ")}{" "}
      <i style={{ fontStyle: "italic" }}>{lastTitleWord}</i> &amp;
      <br />
      <span className="y">{highlight}</span>
      <br />
      {endParts.join(" ")}{" "}
      <i style={{ fontStyle: "italic" }}>{lastEndWord}</i>.
    </>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [inview, setInview] = useState(false);
  const t = useTranslations("Hero");
  const locale = useLocale();

  const heroRef = useRef(null);
  const spotRef = useRef(null);

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
      spot.style.transform = `translate(${e.clientX - r.left - 220}px, ${e.clientY - r.top - 220}px)`;
    };
    spot.style.transform = "translate(50%, 30%)";
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero"
      id="home"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div ref={spotRef} className="spot" />

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
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <span><span style={{ color: "var(--ink)" }}>◎</span> {t("location")}</span>
          <span><span style={{ color: "var(--ink)" }}>◆</span> {t("role")}</span>
        </div>
        <div>§ 01 · Portfolio / 2026</div>
      </div>

      <div
        className="hero-grid"
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 72,
                height: 72,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid var(--ink)",
                boxShadow: "0 0 0 4px var(--yellow-soft)",
                flexShrink: 0,
              }}
            >
              <Image
                src="/ianronk.jpeg"
                alt="Ian Ronk"
                fill
                sizes="72px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--mute)",
                lineHeight: 1.5,
              }}
            >
              <div style={{ color: "var(--ink)" }}>Ian Ronk</div>
              <div>{t("role")}</div>
            </div>
          </div>

          <h1
            className={`hero-title${inview ? " inview" : ""}`}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(48px, 7.5vw, 116px)",
              lineHeight: 0.96,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              color: "var(--ink)",
            }}
          >
            {renderTitle(t("title"), t("titleHighlight"), t("titleEnd"))}
          </h1>

          <p
            className="lede"
            style={{
              marginTop: 32,
              fontSize: 17,
              lineHeight: 1.55,
              maxWidth: "50ch",
              color: "var(--ink-2)",
            }}
          >
            {t("description")}
          </p>

          <div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Link
              href={`/${locale}/about`}
              className="btn primary"
              onClick={() => trackEvent("cta_click", { cta: "about_me", location: "hero", source: "hero_primary" })}
            >
              <span>{t("viewProjects")}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="btn ghost"
              onClick={() => trackEvent("cta_click", { cta: "contact", location: "hero", source: "hero_secondary" })}
            >
              <span>{t("workWithMe")}</span>
            </Link>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-hidden
          style={{
            position: "relative",
            aspectRatio: "1 / 1",
            width: "100%",
          }}
        >
          <svg viewBox="200 80 760 560" aria-hidden="true" focusable="false" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <pattern id="gridp" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M30 0 L0 0 0 30" fill="none" stroke="rgba(15,14,11,.06)" strokeWidth="1" />
              </pattern>
              <radialGradient id="amsGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD60A" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#FFD60A" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect x="200" y="80" width="760" height="560" fill="url(#gridp)" />

            <g fill="var(--paper-2)" stroke="var(--ink)" strokeWidth="0.7" strokeOpacity="0.45">
              <path d={EUROPE_PATH} />
            </g>

            {mounted && (
              <circle cx={europeanCities[0].x} cy={europeanCities[0].y} r="60" fill="url(#amsGlow)">
                <animate attributeName="r" values="50;70;50" dur="4s" repeatCount="indefinite" />
              </circle>
            )}

            {mounted && dataConnections.map((c, i) => {
              const a = europeanCities[c.from];
              const b = europeanCities[c.to];
              return (
                <line
                  key={`ln-${i}`}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="var(--ink)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="-12" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
                </line>
              );
            })}

            {europeanCities.map((city) => (
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
                  fontSize="11"
                  fill="var(--ink)"
                  opacity="0.9"
                >
                  {city.code}
                </text>
              </g>
            ))}

            <g transform="translate(240,610)">
              <rect x="0" y="0" width="30" height="4" fill="var(--ink)" />
              <rect x="30" y="0" width="30" height="4" fill="none" stroke="var(--ink)" />
              <rect x="60" y="0" width="30" height="4" fill="var(--ink)" />
              <text x="0" y="18" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink)">0</text>
              <text x="78" y="18" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink)">500 km</text>
            </g>
          </svg>
        </div>
      </div>

      <div
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid var(--ink)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          position: "relative",
          zIndex: 2,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)", marginRight: 8 }}>{t("expertise")}</span>
        <span className="chip">Python</span>
        <span className="chip">PostGIS</span>
        <span className="chip">Airflow</span>
        <span className="chip">LLM/RAG</span>
        <span className="chip">PyTorch</span>
      </div>

    </section>
  );
}
