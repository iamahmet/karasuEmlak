import { Suspense } from "react";
import { notFound } from "next/navigation";
import { IntlProvider } from "@/components/providers/IntlProvider";
import { routing } from "@/i18n/routing";
import { isRTL } from "@karasu/lib/i18n";
import { siteConfig } from "@karasu-emlak/config";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { PremiumFooter } from "@/components/layout/PremiumFooter";
import { PremiumNewsTicker } from "@/components/layout/PremiumNewsTicker";
import { StructuredData } from "@/components/seo/StructuredData";
// Lazy load analytics components for better mobile performance
import dynamic from 'next/dynamic';

const GoogleAnalytics = dynamic(() => import("@/components/analytics/GoogleAnalytics").then(mod => ({ default: mod.GoogleAnalytics })), {
});

const WebVitals = dynamic(() => import("@/components/analytics/WebVitals").then(mod => ({ default: mod.WebVitals })), {
});

const PerformanceMonitor = dynamic(() => import("@/components/analytics/PerformanceMonitor").then(mod => ({ default: mod.PerformanceMonitor })), {
});
import { ClientOnlyComponents } from "@/components/layout/ClientOnlyComponents";
import { getCachedOrganizationSchema } from "@/lib/seo/structured-data-cache";
import { generateRealEstateAgentLocalSchema } from "@/lib/seo/local-seo-schemas";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
import SkipLinks from "@/components/accessibility/SkipLinks";
import Announcer from "@/components/accessibility/Announcer";
import ContrastChecker from "@/components/accessibility/ContrastChecker";
import { CriticalResourcesLoader } from "@/components/performance/CriticalResourcesLoader";
import { getNonce } from "@/lib/security/nonce";
import { Toaster } from "@/components/ui/Toaster";
import type { Metadata, Viewport } from "next";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = siteConfig.url;
  // Since localePrefix is "as-needed", default locale doesn't need /tr prefix
  const canonicalPath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(baseUrl),
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
      locale: locale === 'tr' ? 'tr_TR' : locale,
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
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
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
  try {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
      notFound();
    }

    // Get messages - use direct import to avoid config issues
    // next-intl config is handled by the plugin, but we load messages directly
    let messages = {};
    try {
      const messagesModule = await import(`../../messages/${locale}.json`);
      messages = messagesModule.default || messagesModule;
    } catch (error) {
      console.error('Failed to load messages for locale:', locale, error);
      // Fallback to Turkish
      try {
        const fallbackModule = await import(`../../messages/tr.json`);
        messages = fallbackModule.default || fallbackModule;
      } catch {
        messages = {};
      }
    }
    const _rtl = isRTL(locale as any); // RTL is handled by HTML dir attribute

    // Use cached schema (organization data is static)
    const organizationSchema = getCachedOrganizationSchema();
    
    // Get nonce from request headers (for CSP)
    const nonce = await getNonce();

    // Generate comprehensive RealEstateAgent schema with ServiceArea
    let realEstateAgentSchema;
    try {
      realEstateAgentSchema = generateRealEstateAgentLocalSchema({
        includeRating: true,
        includeServices: true,
        includeAreaServed: true, // This also includes serviceArea
      });
    } catch (error) {
      console.error('Error generating real estate agent schema:', error);
      realEstateAgentSchema = null;
    }

    return (
      <div className="antialiased overflow-x-hidden w-full">
        {/* Structured Data - Rendered in body (Next.js handles head automatically) */}
        {realEstateAgentSchema && <StructuredData data={realEstateAgentSchema} />}
        <IntlProvider locale={locale} messages={messages}>
          <CriticalResourcesLoader />
          <SkipToContent />
          <SkipLinks />
          <Announcer />
          <ContrastChecker />
          <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
            <PremiumNewsTicker basePath={locale === routing.defaultLocale ? "" : `/${locale}`} />
            <PremiumHeader />
            <main id="main-content" className="flex-1" role="main" aria-label="Ana içerik">{children}</main>
            <PremiumFooter />
            {/* Client-only components (ssr: false) */}
            <ClientOnlyComponents basePath={locale === routing.defaultLocale ? "" : `/${locale}`} />
            {/* Analytics - Only loads if consent given */}
            {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
              <Suspense fallback={null}>
                <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} nonce={nonce || undefined} />
              </Suspense>
            )}
            {/* Web Vitals - Always active (performance monitoring) */}
            <WebVitals />
            {/* Performance Monitor - Tracks page load and resource performance */}
            <PerformanceMonitor />
          </div>
          {/* Toast Notifications */}
          <Toaster />
        </IntlProvider>
      </div>
    );
  } catch (error: any) {
    console.error("Error in LocaleLayout:", error);
    // Fallback to default locale
    let fallbackMessages = {};
    try {
      const fallbackModule = await import(`../../messages/tr.json`);
      fallbackMessages = fallbackModule.default || fallbackModule;
    } catch {
      fallbackMessages = {};
    }
    // Generate comprehensive RealEstateAgent schema with ServiceArea (fallback)
    const fallbackRealEstateAgentSchema = generateRealEstateAgentLocalSchema({
      includeRating: true,
      includeServices: true,
      includeAreaServed: true, // This also includes serviceArea
    });
    return (
      <div className="antialiased">
        {/* Structured Data - Rendered in body (Next.js handles head automatically) */}
        <StructuredData data={fallbackRealEstateAgentSchema} />
        <IntlProvider locale="tr" messages={fallbackMessages}>
          <CriticalResourcesLoader />
          <SkipToContent />
          <SkipLinks />
          <Announcer />
          <ContrastChecker />
          <div className="flex min-h-screen flex-col">
            <PremiumHeader />
            <main id="main-content" className="flex-1" role="main" aria-label="Ana içerik">{children}</main>
            <PremiumFooter />
            {/* Client-only components (ssr: false) */}
            <ClientOnlyComponents basePath="" />
            {/* Analytics - Only loads if consent given */}
            {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
              <Suspense fallback={null}>
                <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} />
              </Suspense>
            )}
            {/* Web Vitals - Always active (performance monitoring) */}
            <WebVitals />
            {/* Performance Monitor - Tracks page load and resource performance */}
            <PerformanceMonitor />
          </div>
          {/* Toast Notifications */}
          <Toaster />
        </IntlProvider>
      </div>
    );
}
}

