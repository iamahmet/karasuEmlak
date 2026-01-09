"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import { Globe } from "lucide-react";

const localeNames: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  et: "Eesti",
  ru: "Русский",
  ar: "العربية",
};

/**
 * Language Switcher Component
 * 
 * NOTE: Currently only Turkish is enabled.
 * This component is prepared for future multi-language support.
 * When other locales are enabled, uncomment the code below.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Currently disabled - only Turkish is active
  // When other locales are enabled, uncomment below:
  /*
  const handleLocaleChange = (newLocale: string) => {
    // Replace current locale in pathname
    const segments = pathname.split("/");
    if (segments[1] && routing.locales.includes(segments[1] as any)) {
      segments[1] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push(segments.join("/"));
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[140px]">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  */

  // Temporary: Show only Turkish (hidden for now)
  return null;
}

