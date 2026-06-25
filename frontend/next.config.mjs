import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const LOCALES = ["en", "nl", "it", "de"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    // Safe baseline security headers. Do NOT add a restrictive
    // Content-Security-Policy here — it would break Mapbox / Google Analytics.
    // TODO: CSP after testing
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return LOCALES.flatMap((locale) => [
      {
        source: `/${locale}/blog`,
        destination: `/${locale}/thoughts`,
        permanent: true,
      },
      {
        source: `/${locale}/blog/:slug`,
        destination: `/${locale}/thoughts/:slug`,
        permanent: true,
      },
      {
        source: `/${locale}/work`,
        destination: `/${locale}/about`,
        permanent: true,
      },
    ]);
  },
};

export default withNextIntl(nextConfig);
