import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl", "it", "de"],
  defaultLocale: "en",
});
