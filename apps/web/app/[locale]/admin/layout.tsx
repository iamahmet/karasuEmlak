import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { isRTL } from "@karasu/lib/i18n";
import { siteConfig } from "@karasu-emlak/config";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Toaster } from "@/components/admin/providers/Toaster";
import { ErrorBoundary } from "@/components/admin/errors/ErrorBoundary";
import { BRAND_PRIMARY_COLOR, brandAssetUrl } from "@/lib/branding/assets";
import type { Metadata, Viewport } from "next";
import "../../globals.css";

function normalizeAbsoluteUrl(value: string | undefined, fallback: string): string {
  const raw = (value || "").trim();
  const candidate = raw
    ? /^https?:\/\//i.test(raw)
      ? raw
      : `https://${raw}`
    : fallback;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return fallback;
    }
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return fallback;
  }
}

const webAdminBaseUrl = normalizeAbsoluteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  siteConfig.url
);
const webAdminTitle = "Karasu Emlak Yönetim Paneli";
const webAdminDescription =
  "Karasu Emlak yönetim araçları: ilan, içerik, medya ve SEO operasyonları için yönetim paneli.";

export const metadata: Metadata = {
  metadataBase: new URL(webAdminBaseUrl),
  title: {
    default: webAdminTitle,
    template: `%s | ${webAdminTitle}`,
  },
  description: webAdminDescription,
  applicationName: webAdminTitle,
  manifest: brandAssetUrl("/manifest.json"),
  category: "business",
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    type: "website",
    url: webAdminBaseUrl,
    siteName: webAdminTitle,
    title: webAdminTitle,
    description: webAdminDescription,
    locale: "tr_TR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Admin`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: webAdminTitle,
    description: webAdminDescription,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: brandAssetUrl("/favicon.ico"), sizes: "any" },
      { url: brandAssetUrl("/favicon.svg"), type: "image/svg+xml", sizes: "any" },
      { url: brandAssetUrl("/icon-16x16.png"), sizes: "16x16", type: "image/png" },
      { url: brandAssetUrl("/icon-32x32.png"), sizes: "32x32", type: "image/png" },
      { url: brandAssetUrl("/icon-192x192.png"), sizes: "192x192", type: "image/png" },
      { url: brandAssetUrl("/icon-512x512.png"), sizes: "512x512", type: "image/png" },
      { url: brandAssetUrl("/logo-icon.svg"), type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: [
      { url: brandAssetUrl("/favicon.ico"), sizes: "any" },
      { url: brandAssetUrl("/favicon.svg"), type: "image/svg+xml" },
      { url: brandAssetUrl("/logo-icon.svg"), type: "image/svg+xml" },
    ],
    apple: [
      { url: brandAssetUrl("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" },
      { url: brandAssetUrl("/logo-icon.svg"), type: "image/svg+xml" },
    ],
    other: [
      { rel: "mask-icon", url: brandAssetUrl("/safari-pinned-tab.svg"), color: BRAND_PRIMARY_COLOR },
    ],
  },
  other: {
    "msapplication-config": brandAssetUrl("/browserconfig.xml"),
    "msapplication-TileColor": BRAND_PRIMARY_COLOR,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E7E7E7" },
    { media: "(prefers-color-scheme: dark)", color: "#062F28" },
  ],
};

// Admin sayfaları dinamik - statik üretim yok
export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Wrap everything in try-catch to prevent 500 errors
  try {
    let locale: string;
    try {
      const paramsResult = await params;
      locale = paramsResult.locale;
    } catch (paramError: any) {
      console.error('Error getting params:', paramError);
      locale = 'tr'; // Default locale
    }

    if (!routing.locales.includes(locale as any)) {
      locale = 'tr'; // Fallback to default
    }

    // Enable static rendering
    try {
      setRequestLocale(locale);
    } catch (setLocaleError) {
      console.error('Error setting request locale:', setLocaleError);
    }

    // Get messages with error handling - use direct import like main layout
    let messages = {};
    try {
      const messagesModule = await import(`../../../messages/${locale}.json`);
      messages = messagesModule.default || messagesModule;
    } catch (error) {
      console.error('Failed to load messages for locale:', locale, error);
      // Fallback to Turkish
      try {
        const fallbackModule = await import(`../../../messages/tr.json`);
        messages = fallbackModule.default || fallbackModule;
      } catch (fallbackError) {
        console.error('Failed to load fallback messages:', fallbackError);
        messages = {}; // Empty messages as last resort
      }
    }
    
    const rtl = isRTL(locale as any);

    return (
      <html lang={locale} dir={rtl ? "rtl" : "ltr"} className="font-jakarta">
        <body className="bg-[#E7E7E7] dark:bg-[#062F28] text-design-dark dark:text-white antialiased">
          <NextIntlClientProvider messages={messages}>
            <ErrorBoundary>
              <AdminLayout>{children}</AdminLayout>
              <Toaster />
            </ErrorBoundary>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error: any) {
    // Log error only in development
    if (process.env.NODE_ENV === "development") {
      console.error("Critical error in Admin LocaleLayout:", error);
    }
    // Fallback to default locale with safe message loading
    let messages = {};
    try {
      const fallbackModule = await import(`../../../messages/tr.json`);
      messages = fallbackModule.default || fallbackModule;
    } catch (msgError) {
      console.error("Error loading fallback messages:", msgError);
      messages = {}; // Empty messages as last resort
    }
    
    return (
      <html lang="tr" dir="ltr" className="font-jakarta">
        <body className="bg-[#E7E7E7] dark:bg-[#062F28] text-design-dark dark:text-white antialiased">
          <NextIntlClientProvider messages={messages}>
            <ErrorBoundary>
              <AdminLayout>{children}</AdminLayout>
              <Toaster />
            </ErrorBoundary>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  }
}
