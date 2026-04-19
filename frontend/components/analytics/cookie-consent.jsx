"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getConsent, setConsent } from "@/lib/analytics";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const t = useTranslations("Consent");
  const locale = useLocale();

  useEffect(() => {
    const id = setTimeout(() => {
      if (getConsent() === null) setShow(true);
    }, 600);
    return () => clearTimeout(id);
  }, []);

  if (!show) return null;

  const accept = () => { setConsent("accepted"); setShow(false); };
  const decline = () => { setConsent("declined"); setShow(false); };

  return (
    <div
      role="dialog"
      aria-label={t("dialogLabel")}
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
        padding: "18px 20px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>
        {t("body")}{" "}
        <Link href={`/${locale}/cookie-policy`} style={{ borderBottom: "1px solid", whiteSpace: "nowrap" }}>
          {t("policyLink")}
        </Link>
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={decline}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "10px 16px",
            border: "1px solid var(--ink)",
            background: "transparent",
            color: "var(--ink)",
            cursor: "pointer",
          }}
        >
          {t("decline")}
        </button>
        <button
          type="button"
          onClick={accept}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "10px 16px",
            border: "1px solid var(--ink)",
            background: "var(--yellow)",
            color: "var(--ink)",
            cursor: "pointer",
          }}
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
