"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Github, Linkedin, Mail, LogIn } from "lucide-react";
import { Logo } from "@/components/logo";

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
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        cookiePolicy: "Cookie Policy",
      };
      return fallback[key] || key;
    };
  }

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-lg flex items-center justify-center">
                <Logo className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm md:text-base text-foreground">Ian Ronk</span>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <Link
                href="https://github.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/ian-ronk-7b054a120"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <Link
                href="mailto:ian@example.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                title="CRM Login"
              >
                <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">{t("crmLogin")}</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t border-border">
            <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm text-muted-foreground">
              <Link
                href={`/${locale}/privacy-policy`}
                className="hover:text-foreground transition-colors"
              >
                {t("privacyPolicy")}
              </Link>
              <Link
                href={`/${locale}/terms-of-service`}
                className="hover:text-foreground transition-colors"
              >
                {t("termsOfService")}
              </Link>
              <Link
                href={`/${locale}/cookie-policy`}
                className="hover:text-foreground transition-colors"
              >
                {t("cookiePolicy")}
              </Link>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground">
              {t("copyright", { year: CURRENT_YEAR })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
