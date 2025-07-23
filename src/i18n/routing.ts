import { defineRouting } from "next-intl/routing";
export const locales = ["en", "de", "zh", "es", "ru"];

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: "en",
});
