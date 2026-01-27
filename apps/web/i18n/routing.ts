import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Routing configuration
 * 
 * NOTE: Currently only Turkish (tr) is enabled.
 * Other locales (en, et, ru, ar) are prepared but disabled.
 * They will be enabled when the project reaches final stage.
 */
export const routing = defineRouting({
  // Active locales - currently only Turkish
  locales: ["tr"],
  // All supported locales (for future use)
  // locales: ["tr", "en", "et", "ru", "ar"],
  defaultLocale: "tr",
  // Use "as-needed" but we'll handle routing manually in middleware
  // This allows /satilik to work without /tr prefix
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

