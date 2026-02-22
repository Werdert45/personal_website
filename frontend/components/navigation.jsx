"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Globe } from "lucide-react";
import { Logo } from "@/components/logo";

const localeLabels = {
  en: { label: "EN", flag: "🇬🇧" },
  nl: { label: "NL", flag: "🇳🇱" },
  it: { label: "IT", flag: "🇮🇹" },
  de: { label: "DE", flag: "🇩🇪" },
};

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let t, locale, pathname, router;
  try {
    t = useTranslations("Navigation");
    locale = useLocale();
    pathname = usePathname();
    router = useRouter();
  } catch {
    // Fallback for pages outside locale context (admin, login, etc.)
    t = (key) => {
      const fallback = { home: "Home", about: "About", visualizations: "Visualizations", research: "Research", contact: "Contact", brand: "Ian Ronk" };
      return fallback[key] || key;
    };
    locale = "en";
    pathname = "";
    router = null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/visualizations`, label: t("visualizations") },
    { href: `/${locale}/research`, label: t("research") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  const switchLocale = (newLocale) => {
    // Replace the current locale prefix in the pathname
    const pathWithoutLocale = pathname.replace(/^\/(en|nl|it|de)/, "") || "/";
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center group">
            <Logo className="h-7 md:h-9 w-auto text-foreground group-hover:opacity-80 transition-opacity" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  {localeLabels[locale]?.flag} {localeLabels[locale]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(localeLabels).map(([key, { label, flag }]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => switchLocale(key)}
                    className={locale === key ? "bg-accent" : ""}
                  >
                    {flag} {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(localeLabels).map(([key, { label, flag }]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => switchLocale(key)}
                    className={locale === key ? "bg-accent" : ""}
                  >
                    {flag} {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
