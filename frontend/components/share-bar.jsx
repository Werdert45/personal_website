"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent, buildShareUrl } from "@/lib/analytics";

export function ShareBar({ slug, title }) {
  const t = useTranslations("Share");
  const [copied, setCopied] = useState(false);

  const articleUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  const open = (platform) => {
    const url = buildShareUrl(platform, articleUrl, slug, title);
    trackEvent("share_click", { platform, slug });
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=600");
  };

  const copy = async () => {
    const tagged = buildShareUrl("copy", articleUrl, slug, title);
    try {
      await navigator.clipboard.writeText(tagged);
      setCopied(true);
      trackEvent("share_click", { platform: "copy", slug });
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const btn = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "9px 14px",
    border: "1px solid var(--ink)",
    background: "transparent",
    color: "var(--ink)",
    cursor: "pointer",
  };

  return (
    <div
      aria-label={t("label")}
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
        padding: "16px 0",
        margin: "32px 0",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", marginRight: 8 }}>
        {t("label")}
      </span>
      <button type="button" onClick={() => open("linkedin")} style={btn}>{t("linkedin")}</button>
      <button type="button" onClick={() => open("twitter")} style={btn}>{t("twitter")}</button>
      <button type="button" onClick={copy} style={{ ...btn, background: copied ? "var(--yellow)" : "transparent" }}>
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
