import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PageFrame } from "@/components/page-frame";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { LinkedInInsight } from "@/components/analytics/linkedin-insight";
import { Clarity } from "@/components/analytics/clarity";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { ConsentProvider } from "@/components/consent-provider";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ConsentProvider>
        <PageFrame>
          <Navigation />
          {children}
          <Footer />
        </PageFrame>
        <GoogleAnalytics />
        <Clarity />
        <LinkedInInsight />
        <CookieConsent />
      </ConsentProvider>
    </NextIntlClientProvider>
  );
}
