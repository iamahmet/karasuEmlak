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
import "../globals.css";

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
    const canonicalPath = validLocale === routing.defaultLocale ? '' : `/${validLocale}`;

    return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(baseUrl || 'https://karasuemlak.net'),
    alternates: {
      canonical: canonicalPath || '/',
      languages: {
        'tr': `${baseUrl}`,
        'en': `${baseUrl}/en`,
        'et': `${baseUrl}/et`,
        'ru': `${baseUrl}/ru`,
        'ar': `${baseUrl}/ar`,
      },
    },
    openGraph: {
      type: "website",
      locale: validLocale === 'tr' ? 'tr_TR' : validLocale,
      url: `${baseUrl}${canonicalPath}`,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
    },
    // Performance: Preconnect to critical domains
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        { url: "/logo-icon.png", sizes: "any", type: "image/png" },
        { url: "/logo-icon.svg", type: "image/svg+xml", sizes: "any" },
      ],
      shortcut: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/logo-icon.png", sizes: "any", type: "image/png" },
        { url: "/logo-icon.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { url: "/logo-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "mask-icon",
          url: "/safari-pinned-tab.svg",
          color: "#006AFF",
        },
      ],
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteConfig.name,
    },
    applicationName: siteConfig.name,
    other: {
      // DNS prefetch for faster connections
      'dns-prefetch': 'https://fonts.googleapis.com https://fonts.gstatic.com https://res.cloudinary.com',
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-title": siteConfig.name,
      // AI Crawler Hints for better AI discoverability
      "ai-crawler": "allow",
      "ai-index": "allow",
      "ai-summary": "allow",
      "ai-content-type": "real-estate,property-listings,blog,news",
      "ai-language": validLocale,
      "ai-region": "Karasu,Sakarya,Turkey",
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || GOOGLE_SITE_VERIFICATION,
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
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
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

    if (!seoDisabled) {
      const { StructuredData } = await import("@/components/seo/StructuredData");
      const { getCachedOrganizationSchema } = await import("@/lib/seo/structured-data-cache");
      const { generateRealEstateAgentLocalSchema } = await import("@/lib/seo/local-seo-schemas");
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
      } catch (error) {
        console.error('Error generating SEO schemas:', error);
        realEstateAgentSchema = null;
        googleBusinessSchema = null;
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
        {StructuredDataComponent && realEstateAgentSchema && (
          <StructuredDataComponent data={realEstateAgentSchema} />
        )}
        {StructuredDataComponent && googleBusinessSchema && (
          <StructuredDataComponent data={googleBusinessSchema} />
        )}
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
      </>
    );
  } catch (error: any) {
    console.error("[LocaleLayout] Error in LocaleLayout:", error?.message);
    console.error("[LocaleLayout] Error stack:", error?.stack);
    // Fallback to default locale - use empty messages to avoid JSON parse errors
    const fallbackMessages = {};
    let FallbackStructuredData: ComponentType<{ data: any }> | null = null;
    let fallbackRealEstateAgentSchema = null;
    if (!seoDisabled) {
      try {
        const { StructuredData } = await import("@/components/seo/StructuredData");
        const { generateRealEstateAgentLocalSchema } = await import("@/lib/seo/local-seo-schemas");
        FallbackStructuredData = StructuredData;
        fallbackRealEstateAgentSchema = generateRealEstateAgentLocalSchema({
          includeRating: true,
          includeServices: true,
          includeAreaServed: true,
        });
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
        {FallbackStructuredData && fallbackRealEstateAgentSchema && (
          <FallbackStructuredData data={fallbackRealEstateAgentSchema} />
        )}
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
      </>
    );
  }
}

