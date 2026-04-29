"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { isBannerNeeded, setConsent, subscribeConsent } from "@/lib/analytics";

export function CookieConsent() {
  const t = useTranslations("Consent");
  const locale = useLocale();
  const [show, setShow] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const sync = () => setShow(isBannerNeeded());
    const id = setTimeout(sync, 600);
    const unsub = subscribeConsent(sync);
    return () => {
      clearTimeout(id);
      unsub();
    };
  }, []);

  if (!show) return null;

  const close = () => setShow(false);
  const acceptAll = () => { setConsent({ analytics: true, marketing: true }); close(); };
  const rejectAll = () => { setConsent({ analytics: false, marketing: false }); close(); };
  const savePrefs = () => { setConsent({ analytics, marketing }); close(); };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 60,
        maxWidth: 720,
        margin: "0 auto",
        background: "var(--paper)",
        border: "1px solid var(--ink)",
        padding: "20px 22px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <h2
        id="cookie-banner-title"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: 0,
          color: "var(--mute)",
        }}
      >
        {t("title")}
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>
        {t("body")}{" "}
        <Link href={`/${locale}/cookie-policy`} style={{ borderBottom: "1px solid", whiteSpace: "nowrap" }}>
          {t("policyLink")}
        </Link>
      </p>

      {showCustom && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0", borderTop: "1px dashed rgba(15,14,11,0.15)", paddingTop: 14 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--ink-2)" }}>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              <strong style={{ display: "block", color: "var(--ink)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
                {t("tierAnalytics")}
              </strong>
              <span style={{ color: "var(--mute)", fontSize: 12 }}>{t("tierAnalyticsDetail")}</span>
            </span>
          </label>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--ink-2)" }}>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              <strong style={{ display: "block", color: "var(--ink)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
                {t("tierMarketing")}
              </strong>
              <span style={{ color: "var(--mute)", fontSize: 12 }}>{t("tierMarketingDetail")}</span>
            </span>
          </label>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button type="button" onClick={rejectAll} className="focus-ring" style={btnGhost}>
          {t("rejectAll")}
        </button>
        <button type="button" onClick={() => setShowCustom((v) => !v)} className="focus-ring" style={btnGhost}>
          {showCustom ? t("hidePrefs") : t("customize")}
        </button>
        {showCustom && (
          <button type="button" onClick={savePrefs} className="focus-ring" style={btnGhost}>
            {t("savePrefs")}
          </button>
        )}
        <button type="button" onClick={acceptAll} className="focus-ring" style={btnPrimary}>
          {t("acceptAll")}
        </button>
      </div>
    </div>
  );
}

const btnGhost = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding: "10px 16px",
  border: "1px solid var(--ink)",
  background: "transparent",
  color: "var(--ink)",
  cursor: "pointer",
};

const btnPrimary = {
  ...btnGhost,
  background: "var(--yellow)",
};
