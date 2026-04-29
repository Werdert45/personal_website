"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ObfuscatedEmail from "@/components/obfuscated-email";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { reopenBanner } from "@/lib/analytics";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  let t;
  let tConsent;
  let locale = "en";
  try {
    t = useTranslations("Footer");
    tConsent = useTranslations("Consent");
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
    tConsent = (key) => (key === "cookiePreferences" ? "Cookie preferences" : key);
  }

  return (
    <footer className="site-footer">
      <div style={{ marginBottom: 24, maxWidth: 480 }}>
        <NewsletterSubscribe variant="compact" source="footer" locale={locale} />
      </div>
      <span>© Ian Ronk {CURRENT_YEAR} — {t("copyright", { year: CURRENT_YEAR })}</span>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Link href={`/${locale}/privacy-policy`}>{t("privacyPolicy")}</Link>
        <Link href={`/${locale}/terms-of-service`}>{t("termsOfService")}</Link>
        <Link href={`/${locale}/cookie-policy`}>{t("cookiePolicy")}</Link>
        <Link href="/login">{t("crmLogin")}</Link>
        <button
          type="button"
          onClick={reopenBanner}
          className="focus-ring"
          style={{ background: "transparent", border: 0, padding: 0, color: "inherit", font: "inherit", cursor: "pointer" }}
        >
          {tConsent("cookiePreferences")}
        </button>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GH</a>
        <a href="https://www.linkedin.com/in/ian-ronk-7b054a120" target="_blank" rel="noopener noreferrer">LI</a>
        <ObfuscatedEmail>@</ObfuscatedEmail>
      </div>
      <span>AMS · 52.37°N / 4.90°E</span>
    </footer>
  );
}
