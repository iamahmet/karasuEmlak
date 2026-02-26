import { Suspense } from "react";
import { notFound } from "next/navigation";
import { IntlProvider } from "@/components/providers/IntlProvider";
import { routing } from "@/i18n/routing";
import { isRTL } from "@karasu/lib/i18n";
import { siteConfig } from "@karasu-emlak/config";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { PremiumFooter } from "@/components/layout/PremiumFooter";
import { PremiumNewsTicker } from "@/components/layout/PremiumNewsTicker";
// Lazy load analytics components for better mobile performance
import dynamic from 'next/dynamic';
import { ClientOnlyComponents } from "@/components/layout/ClientOnlyComponents";
import type { ComponentType } from "react";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
import SkipLinks from "@/components/accessibility/SkipLinks";
import Announcer from "@/components/accessibility/Announcer";
import ContrastChecker from "@/components/accessibility/ContrastChecker";
import { CriticalResourcesLoader } from "@/components/performance/CriticalResourcesLoader";
import { getNonce } from "@/lib/security/nonce";
import { Toaster } from "@/components/ui/Toaster";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import type { Metadata, Viewport } from "next";
import { GOOGLE_SITE_VERIFICATION, GA_MEASUREMENT_ID } from "@/lib/seo/constants";
import { BRAND_PRIMARY_COLOR, brandAssetUrl } from "@/lib/branding/assets";
import { QueryProvider } from "@/providers/query-provider";
import "../globals.css";

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  try {
    const { locale } = await params;
    // Geçerli locale kontrolü - geçersizse varsayılan locale kullan
    const validLocale = routing.locales.includes(locale as any)
      ? locale
      : routing.defaultLocale;
    const baseUrl = siteConfig?.url ?? '';
    const resolvedBaseUrl = baseUrl || 'https://karasuemlak.net';
    const canonicalPath = validLocale === routing.defaultLocale ? '' : `/${validLocale}`;

    return {
      title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
      },
      description: siteConfig.description,
      metadataBase: new URL(resolvedBaseUrl),
      alternates: {
        canonical: canonicalPath || '/',
        languages: pruneHreflangLanguages({
          tr: canonicalPath || '/',
          en: '/en',
          et: '/et',
          ru: '/ru',
          ar: '/ar',
        }),
      },
      openGraph: {
        type: "website",
        locale: validLocale === 'tr' ? 'tr_TR' : validLocale,
        url: `${resolvedBaseUrl}${canonicalPath}`,
        siteName: siteConfig.name,
        title: siteConfig.name,
        description: siteConfig.description,
        images: [
          {
            url: `${resolvedBaseUrl}/og-image.jpg`,
            width: 1200,
            height: 630,
            alt: `${siteConfig.name} - Karasu Satilik ve Kiralik Ilanlar`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        images: [`${resolvedBaseUrl}/og-image.jpg`],
        creator: "@karasuemlak",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      icons: {
        icon: [
          { url: brandAssetUrl("/favicon.svg"), sizes: "any", type: "image/svg+xml" },
          { url: brandAssetUrl("/favicon.ico"), sizes: "any" },
          { url: brandAssetUrl("/icon-16x16.png"), sizes: "16x16", type: "image/png" },
          { url: brandAssetUrl("/icon-32x32.png"), sizes: "32x32", type: "image/png" },
          { url: brandAssetUrl("/icon-192x192.png"), sizes: "192x192", type: "image/png" },
          { url: brandAssetUrl("/icon-512x512.png"), sizes: "512x512", type: "image/png" },
          { url: brandAssetUrl("/logo-icon.png"), sizes: "any", type: "image/png" },
          { url: brandAssetUrl("/logo-icon.svg"), type: "image/svg+xml", sizes: "any" },
        ],
        shortcut: [
          { url: brandAssetUrl("/favicon.svg"), sizes: "any", type: "image/svg+xml" },
          { url: brandAssetUrl("/favicon.ico"), sizes: "any" },
        ],
        apple: [
          { url: brandAssetUrl("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" },
        ],
        other: [
          {
            rel: "mask-icon",
            url: brandAssetUrl("/safari-pinned-tab.svg"),
            color: BRAND_PRIMARY_COLOR,
          },
        ],
      },
      manifest: brandAssetUrl("/manifest.json"),
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: siteConfig.name,
      },
      applicationName: siteConfig.name,
      other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-title": siteConfig.name,
        "msapplication-config": brandAssetUrl("/browserconfig.xml"),
        "msapplication-TileColor": BRAND_PRIMARY_COLOR,
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION || GOOGLE_SITE_VERIFICATION,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
        other: process.env.NEXT_PUBLIC_BING_VERIFICATION
          ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
          : undefined,
      },
    };
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[generateMetadata] layout:', (e as Error)?.message);
    }
    return {
      title: siteConfig?.name ?? 'Karasu Emlak',
      description: siteConfig?.description ?? 'Karasu emlak',
    };
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_PRIMARY_COLOR },
    { media: "(prefers-color-scheme: dark)", color: "#1E40AF" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  // Mobile optimizations
  interactiveWidget: "resizes-content", // Prevents virtual keyboard from resizing viewport
};

// Resource hints for performance optimization
export function generateResourceHints() {
  return {
    other: {
      // Preconnect to Google Fonts (critical for font loading)
      'dns-prefetch': 'https://fonts.googleapis.com https://fonts.gstatic.com https://res.cloudinary.com',
      // Preconnect hints (faster connection establishment)
      'preconnect-google-fonts': 'https://fonts.googleapis.com',
      'preconnect-google-fonts-static': 'https://fonts.gstatic.com',
      'preconnect-cloudinary': 'https://res.cloudinary.com',
    },
  };
}

export function generateStaticParams() {
  // Only generate params for active locales (currently only "tr")
  return routing.locales.map((locale) => ({ locale }));

  // Future: When all locales are enabled, uncomment below:
  // return ["tr", "en", "et", "ru", "ar"].map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const analyticsDisabled = process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === '1';
  const seoDisabled = process.env.NEXT_PUBLIC_DISABLE_SEO_TOOLS === '1';

  try {
    let locale: string;
    try {
      const paramsResult = await params;
      locale = paramsResult.locale;
    } catch (paramError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[LocaleLayout] Error getting params, using default:', paramError?.message);
      }
      locale = routing.defaultLocale;
    }

    // Eğer locale geçerli değilse, varsayılan locale'e fallback yap
    // Bu, middleware'in rewrite'ının bazen çalışmaması durumunda güvenlik ağı sağlar
    // ÖNEMLİ: Middleware rewrite yaptığında bile Next.js params hala orijinal URL'den geliyor olabilir
    // Bu yüzden geçersiz locale'leri otomatik olarak varsayılan locale'e çeviriyoruz
    const validLocale = routing.locales.includes(locale as any)
      ? locale
      : routing.defaultLocale;

    // Geçersiz locale durumunda uyarı ver ama notFound() çağırma
    // Middleware rewrite yapmış olabilir ve Next.js params henüz güncellenmemiş olabilir
    if (!routing.locales.includes(locale as any)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[LocaleLayout] Invalid locale "${locale}", falling back to "${routing.defaultLocale}". This may be due to middleware rewrite.`);
      }
    }

    // Get messages - use next-intl's getMessages hook
    // This uses the messages loaded by i18n.ts getRequestConfig
    let messages = {};
    const configPath = process.env.NEXT_INTL_CONFIG_PATH;
    if (configPath) {
      try {
        const { getMessages } = await import('next-intl/server');
        const messagesResult = await getMessages();
        messages = messagesResult || {};
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[LocaleLayout] Failed to get messages from next-intl, falling back to JSON:', error?.message);
        }
      }
    }

    if (!messages || Object.keys(messages).length === 0) {
      try {
        const fallback = await import(`@/messages/${validLocale}.json`);
        messages = fallback.default || {};
      } catch (fallbackError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[LocaleLayout] Failed to load fallback messages:', fallbackError?.message);
        }
        messages = {};
      }
    }
    const _rtl = isRTL(validLocale as any); // RTL is handled by HTML dir attribute

    let StructuredDataComponent: ComponentType<{ data: any }> | null = null;
    let realEstateAgentSchema = null;
    let googleBusinessSchema = null;
    let webSiteSchema = null;

    if (!seoDisabled) {
      const { StructuredData } = await import("@/components/seo/StructuredData");
      const { getCachedOrganizationSchema } = await import("@/lib/seo/structured-data-cache");
      const { generateRealEstateAgentLocalSchema, generateWebSiteSchema } = await import("@/lib/seo/local-seo-schemas");
      const { generateGoogleBusinessProfileSchema } = await import("@/lib/seo/local-seo-google-business");

      StructuredDataComponent = StructuredData;
      // Keep cached organization schema warm
      getCachedOrganizationSchema();
      try {
        realEstateAgentSchema = generateRealEstateAgentLocalSchema({
          includeRating: true,
          includeServices: true,
          includeAreaServed: true,
        });
        googleBusinessSchema = generateGoogleBusinessProfileSchema();
        // WebSite schema with SearchAction for sitelinks search box in Google SERP
        webSiteSchema = generateWebSiteSchema('/arama');
      } catch (error) {
        console.error('Error generating SEO schemas:', error);
        realEstateAgentSchema = null;
        googleBusinessSchema = null;
        webSiteSchema = null;
      }
    }

    let GoogleAnalyticsComponent: ComponentType<{ measurementId?: string; nonce?: string }> | null = null;
    let WebVitalsComponent: ComponentType | null = null;
    let PerformanceMonitorComponent: ComponentType | null = null;

    if (!analyticsDisabled) {
      GoogleAnalyticsComponent = dynamic(() => import("@/components/analytics/GoogleAnalytics").then(mod => ({ default: mod.GoogleAnalytics })));
      WebVitalsComponent = dynamic(() => import("@/components/analytics/WebVitals").then(mod => ({ default: mod.WebVitals })));
      PerformanceMonitorComponent = dynamic(() => import("@/components/analytics/PerformanceMonitor").then(mod => ({ default: mod.PerformanceMonitor })));
    }

    // Get nonce from request headers (for CSP)
    const nonce = await getNonce();

    return (
      <>
        {/* Structured Data - Rendered in body (Next.js handles head automatically) */}
        {StructuredDataComponent && webSiteSchema && (
          <StructuredDataComponent data={webSiteSchema} />
        )}
        {StructuredDataComponent && realEstateAgentSchema && (
          <StructuredDataComponent data={realEstateAgentSchema} />
        )}
        {StructuredDataComponent && googleBusinessSchema && (
          <StructuredDataComponent data={googleBusinessSchema} />
        )}
        <QueryProvider>
          <IntlProvider locale={validLocale} messages={messages}>
            <CriticalResourcesLoader />
            <SkipToContent />
            <SkipLinks />
            <Announcer />
            <ContrastChecker />
            <PremiumNewsTicker basePath={validLocale === routing.defaultLocale ? "" : `/${validLocale}`} />
            <PremiumHeader />
            <main id="main-content" role="main" aria-label="Ana içerik">{children}</main>
            <PremiumFooter />
            {/* Client-only components (ssr: false) */}
            <ClientOnlyComponents basePath={validLocale === routing.defaultLocale ? "" : `/${validLocale}`} />
            {/* Analytics - Only loads if consent given */}
            {!analyticsDisabled && (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || GA_MEASUREMENT_ID) && GoogleAnalyticsComponent && (
              <Suspense fallback={null}>
                <GoogleAnalyticsComponent measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || GA_MEASUREMENT_ID} nonce={nonce || undefined} />
              </Suspense>
            )}
            {/* Web Vitals - Always active (performance monitoring) */}
            {!analyticsDisabled && WebVitalsComponent && <WebVitalsComponent />}
            {/* Performance Monitor - Tracks page load and resource performance */}
            {!analyticsDisabled && PerformanceMonitorComponent && <PerformanceMonitorComponent />}
            {/* Toast Notifications */}
            <Toaster />
            {/* Offline Indicator */}
            <OfflineIndicator />
          </IntlProvider>
        </QueryProvider>
      </>
    );
  } catch (error: any) {
    console.error("[LocaleLayout] Error in LocaleLayout:", error?.message);
    console.error("[LocaleLayout] Error stack:", error?.stack);
    // Fallback to default locale - use empty messages to avoid JSON parse errors
    const fallbackMessages = {};
    let FallbackStructuredData: ComponentType<{ data: any }> | null = null;
    let fallbackRealEstateAgentSchema = null;
    let fallbackWebSiteSchema = null;
    if (!seoDisabled) {
      try {
        const { StructuredData } = await import("@/components/seo/StructuredData");
        const { generateRealEstateAgentLocalSchema, generateWebSiteSchema } = await import("@/lib/seo/local-seo-schemas");
        FallbackStructuredData = StructuredData;
        fallbackRealEstateAgentSchema = generateRealEstateAgentLocalSchema({
          includeRating: true,
          includeServices: true,
          includeAreaServed: true,
        });
        fallbackWebSiteSchema = generateWebSiteSchema('/arama');
      } catch (schemaError: any) {
        console.error("[LocaleLayout] Schema generation failed:", schemaError?.message);
        fallbackRealEstateAgentSchema = null;
      }
    }
    // Get nonce from request headers (for CSP) - fallback scenario
    let nonce: string | undefined;
    try {
      const nonceValue = await getNonce();
      nonce = nonceValue ?? undefined;
    } catch (nonceError: any) {
      console.error("[LocaleLayout] Failed to get nonce:", nonceError?.message);
      nonce = undefined;
    }
    let FallbackGoogleAnalytics: ComponentType<{ measurementId?: string; nonce?: string }> | null = null;
    let FallbackWebVitals: ComponentType | null = null;
    let FallbackPerformanceMonitor: ComponentType | null = null;
    if (!analyticsDisabled) {
      FallbackGoogleAnalytics = dynamic(() => import("@/components/analytics/GoogleAnalytics").then(mod => ({ default: mod.GoogleAnalytics })));
      FallbackWebVitals = dynamic(() => import("@/components/analytics/WebVitals").then(mod => ({ default: mod.WebVitals })));
      FallbackPerformanceMonitor = dynamic(() => import("@/components/analytics/PerformanceMonitor").then(mod => ({ default: mod.PerformanceMonitor })));
    }

    return (
      <>
        {/* Structured Data - Rendered in body (Next.js handles head automatically) */}
        {FallbackStructuredData && fallbackWebSiteSchema && (
          <FallbackStructuredData data={fallbackWebSiteSchema} />
        )}
        {FallbackStructuredData && fallbackRealEstateAgentSchema && (
          <FallbackStructuredData data={fallbackRealEstateAgentSchema} />
        )}
        <QueryProvider>
          <IntlProvider locale="tr" messages={fallbackMessages}>
            <CriticalResourcesLoader />
            <SkipToContent />
            <SkipLinks />
            <Announcer />
            <ContrastChecker />
            <PremiumHeader />
            <main id="main-content" role="main" aria-label="Ana içerik">{children}</main>
            <PremiumFooter />
            {/* Client-only components (ssr: false) */}
            <ClientOnlyComponents basePath="" />
            {/* Analytics - Only loads if consent given */}
            {!analyticsDisabled && (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || GA_MEASUREMENT_ID) && FallbackGoogleAnalytics && (
              <Suspense fallback={null}>
                <FallbackGoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || GA_MEASUREMENT_ID} nonce={nonce || undefined} />
              </Suspense>
            )}
            {/* Web Vitals - Always active (performance monitoring) */}
            {!analyticsDisabled && FallbackWebVitals && <FallbackWebVitals />}
            {/* Performance Monitor - Tracks page load and resource performance */}
            {!analyticsDisabled && FallbackPerformanceMonitor && <FallbackPerformanceMonitor />}
            {/* Toast Notifications */}
            <Toaster />
            {/* Offline Indicator */}
            <OfflineIndicator />
          </IntlProvider>
        </QueryProvider>
      </>
    );
  }
}
