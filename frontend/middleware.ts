import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except those starting with:
    // - /admin-portal, /api, /login, /crm (English-only sections)
    // - /_next, /favicon, /profile, /apple-icon (static files)
    // - /sitemap.xml, /robots.txt (SEO files)
    "/((?!admin-portal|api|login|crm|_next|favicon|profile|apple-icon|sitemap|robots|.*\\.).*)",
  ],
};
