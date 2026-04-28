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
        permanent: false,
      },
    ]);
  },
};

export default withNextIntl(nextConfig);
