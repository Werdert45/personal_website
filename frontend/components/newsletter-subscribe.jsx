"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterSubscribe({ variant = "compact", source = "other", locale = "en" }) {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [tsStart] = useState(Date.now());
  const [state, setState] = useState("idle"); // idle | submitting | success | error

  async function onSubmit(e) {
    e.preventDefault();
    if (state !== "idle") return;
    if (hp) {
      // Honeypot caught — silently succeed
      setState("success");
      return;
    }
    if (Date.now() - tsStart < 2000) {
      // Submitted too fast — silently succeed
      setState("success");
      return;
    }
    setState("submitting");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, locale, hp, ts: tsStart }),
      });
      if (res.ok) setState("success");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return <p className="newsletter-success">{t("success")}</p>;
  }

  const isInline = variant === "inline";

  return (
    <form onSubmit={onSubmit} className={`newsletter-form newsletter-${variant}`}>
      {isInline && (
        <>
          <h3>{t("inlineHeading")}</h3>
          <p>{t("inlineDescription")}</p>
        </>
      )}
      {!isInline && (
        <p className="newsletter-compact-heading">{t("compactHeading")}</p>
      )}
      <div className="newsletter-row">
        <label htmlFor={`newsletter-email-${variant}`} className="sr-only">
          {t("emailPlaceholder")}
        </label>
        <input
          id={`newsletter-email-${variant}`}
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring"
        />
        {/* honeypot — hidden from humans */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          style={{ position: "absolute", left: "-9999px", height: 0, width: 0 }}
          aria-hidden="true"
        />
        <button type="submit" disabled={state === "submitting"} className="btn primary focus-ring">
          {t("submit")}
        </button>
      </div>
      {state === "error" && <p className="newsletter-error">{t("error")}</p>}
    </form>
  );
}
