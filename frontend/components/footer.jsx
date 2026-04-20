"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  let t;
  let locale = "en";
  try {
    t = useTranslations("Footer");
    locale = useLocale();
  } catch {
    t = (key, params) => {
      const fallback = {
        copyright: `${params?.year || CURRENT_YEAR} Ian Ronk. All rights reserved.`,
        crmLogin: "CRM",
        privacyPolicy: "Privacy",
        termsOfService: "Terms",
        cookiePolicy: "Cookies",
        work: "Work with me",
      };
      return fallback[key] || key;
    };
  }

  return (
    <footer className="site-footer">
      <span>© Ian Ronk {CURRENT_YEAR} — {t("copyright", { year: CURRENT_YEAR })}</span>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Link href={`/${locale}/work`} style={{ color: "var(--ink)", fontWeight: 500 }}>{t("work")}</Link>
        <Link href={`/${locale}/privacy-policy`}>{t("privacyPolicy")}</Link>
        <Link href={`/${locale}/terms-of-service`}>{t("termsOfService")}</Link>
        <Link href={`/${locale}/cookie-policy`}>{t("cookiePolicy")}</Link>
        <Link href="/login">{t("crmLogin")}</Link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GH</a>
        <a href="https://www.linkedin.com/in/ian-ronk-7b054a120" target="_blank" rel="noopener noreferrer">LI</a>
        <a href="mailto:ian@example.com">@</a>
      </div>
      <span>AMS · 52.37°N / 4.90°E</span>
    </footer>
  );
}
