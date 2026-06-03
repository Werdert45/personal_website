import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl", "de", "it"],
  defaultLocale: "en",
});
