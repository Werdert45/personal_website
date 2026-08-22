"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { HeroVisual } from "./hero-visual";
import { trackEvent } from "@/lib/analytics";

function renderTitle(title, highlight, end) {
  return (
    <>
      {title}
      <br />
      <span className="y" style={{ fontStyle: "italic" }}>{highlight}</span>
      <br />
      {end}
    </>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [inview, setInview] = useState(false);
  const t = useTranslations("Hero");
  const locale = useLocale();

  const heroRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setInview(true));
    return () => cancelAnimationFrame(id);
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
              <div><span style={{ color: "var(--ink)" }}>◎</span> {t("location")}</div>
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
              href={`/${locale}/contact`}
              className="btn primary"
              onClick={() => trackEvent("cta_click", { cta: "contact", location: "hero", source: "hero_primary" })}
            >
              <span>{t("workWithMe")}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href={`/${locale}/about`}
              className="btn ghost"
              onClick={() => trackEvent("cta_click", { cta: "about_me", location: "hero", source: "hero_secondary" })}
            >
              <span>{t("aboutMe")}</span>
            </Link>
          </div>

          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)", marginRight: 8 }}>{t("expertise")}</span>
            {(t.raw("expertiseAreas") || []).map((area) => (
              <span key={area} className="chip">{area}</span>
            ))}
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
          <HeroVisual mounted={mounted} />
        </div>
      </div>

    </section>
  );
}
