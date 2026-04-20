"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const localeLabels = {
  en: { label: "EN", flag: "🇬🇧" },
  nl: { label: "NL", flag: "🇳🇱" },
  it: { label: "IT", flag: "🇮🇹" },
  de: { label: "DE", flag: "🇩🇪" },
};

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let t, locale, pathname, router;
  try {
    t = useTranslations("Navigation");
    locale = useLocale();
    pathname = usePathname();
    router = useRouter();
  } catch {
    t = (key) => {
      const fallback = { home: "Home", about: "About", visualizations: "Thoughts", research: "Research", contact: "Contact", work: "Work with me", brand: "Ian Ronk", letsTalk: "Let's talk", menu: "Menu" };
      return fallback[key] || key;
    };
    locale = "en";
    pathname = "";
    router = null;
  }

  const navLinks = [
    { href: `/${locale}`, label: t("home"), idx: "01", routeKey: "/" },
    { href: `/${locale}/about`, label: t("about"), idx: "02", routeKey: "/about" },
    { href: `/${locale}/thoughts`, label: t("visualizations"), idx: "03", routeKey: "/thoughts" },
    { href: `/${locale}/research`, label: t("research"), idx: "04", routeKey: "/research" },
    { href: `/${locale}/work`, label: t("work"), idx: "05", routeKey: "/work" },
    { href: `/${locale}/contact`, label: t("contact"), idx: "06", routeKey: "/contact" },
  ];

  const activeKey = (() => {
    if (!pathname) return "/";
    const stripped = pathname.replace(new RegExp(`^/(${Object.keys(localeLabels).join("|")})`), "") || "/";
    const match = navLinks.find((l) => (l.routeKey === "/" ? stripped === "/" : stripped.startsWith(l.routeKey)));
    return match ? match.routeKey : "/";
  })();

  const switchLocale = (newLocale) => {
    const pathWithoutLocale = pathname.replace(/^\/(en|nl|it|de)/, "") || "/";
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <nav
      className="site-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        height: 72,
        background: "linear-gradient(var(--paper) 70%, transparent)",
      }}
    >
      <Link href={`/${locale}`} className="flex items-center gap-[14px]" style={{ fontFamily: "var(--font-serif)", fontSize: 28, letterSpacing: "-0.01em" }}>
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            background: "var(--yellow)",
            borderRadius: "50%",
            boxShadow: "0 0 0 4px var(--yellow-soft)",
          }}
        />
        <span>Ian <i style={{ fontStyle: "italic" }}>Ronk</i></span>
      </Link>

      <div className="hidden md:flex items-center" style={{ gap: 2 }}>
        {navLinks.map((link) => {
          const active = activeKey === link.routeKey;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="nv"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "10px 14px",
                borderRadius: 2,
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--yellow)" : "var(--ink)",
                transition: "background .15s, color .15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--ink)";
                  e.currentTarget.style.color = "var(--paper)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ink)";
                }
              }}
            >
              <span style={{ color: active ? "#8A8676" : "var(--mute)", marginRight: 8 }}>{link.idx}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}

        <div
          className="ml-3"
          style={{
            display: "flex",
            border: "1px solid var(--ink)",
            borderRadius: 2,
            overflow: "hidden",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
          }}
        >
          {Object.entries(localeLabels).map(([key, { label, flag }]) => (
            <button
              key={key}
              onClick={() => switchLocale(key)}
              style={{
                padding: "8px 10px",
                background: locale === key ? "var(--ink)" : "var(--paper)",
                border: "none",
                color: locale === key ? "var(--yellow)" : "var(--ink)",
              }}
            >
              {flag} {label}
            </button>
          ))}
        </div>

        <Link
          href={`/${locale}/contact`}
          onClick={() => trackEvent("cta_click", { cta: "lets_talk", location: "nav" })}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "10px 16px",
            border: "1px solid var(--ink)",
            background: "var(--yellow)",
            color: "var(--ink)",
            borderRadius: 2,
            marginLeft: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ink)";
            e.currentTarget.style.color = "var(--yellow)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--yellow)";
            e.currentTarget.style.color = "var(--ink)";
          }}
        >
          {t("letsTalk")}
        </Link>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={t("menu")}
          style={{
            width: 40, height: 40,
            border: "1px solid var(--ink)",
            background: "var(--paper)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: "absolute",
            top: 72, left: 0, right: 0,
            background: "var(--paper)",
            borderTop: "1px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
            padding: "16px 24px",
          }}
        >
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <span style={{ color: "var(--mute)", marginRight: 12 }}>{link.idx}</span>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-4">
              {Object.entries(localeLabels).map(([key, { label, flag }]) => (
                <button
                  key={key}
                  onClick={() => switchLocale(key)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--ink)",
                    background: locale === key ? "var(--ink)" : "var(--paper)",
                    color: locale === key ? "var(--yellow)" : "var(--ink)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                  }}
                >
                  {flag} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
