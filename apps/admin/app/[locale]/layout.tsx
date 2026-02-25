import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { isRTL } from "@karasu/lib/i18n";
import { siteConfig } from "@karasu-emlak/config";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Toaster } from "@/components/providers/Toaster";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import type { Metadata, Viewport } from "next";
import "../globals.css";

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

const adminBaseUrl = normalizeAbsoluteUrl(
  process.env.NEXT_PUBLIC_ADMIN_URL,
  "https://admin.karasuemlak.net"
);
const adminTitle = "Karasu Emlak Yönetim Paneli";
const adminDescription =
  "Karasu Emlak yönetim paneli: ilan, içerik, medya, kullanıcı ve SEO yönetim araçları.";

export const metadata: Metadata = {
  metadataBase: new URL(adminBaseUrl),
  title: {
    default: adminTitle,
    template: `%s | ${adminTitle}`,
  },
  description: adminDescription,
  applicationName: adminTitle,
  manifest: "/manifest.json",
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
    url: adminBaseUrl,
    siteName: adminTitle,
    title: adminTitle,
    description: adminDescription,
    locale: "tr_TR",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Admin`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: adminTitle,
    description: adminDescription,
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.png", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo-icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg" },
    ],
  },
  other: {
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#006AFF",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#062F28" },
  ],
};

export function generateStaticParams() {
  // Only generate static params for non-auth routes
  // Login/signup pages are dynamic
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = true;

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

    // Enable static rendering
    try {
      setRequestLocale(locale);
    } catch (error) {
      console.error('Error setting request locale:', error);
    }

    // Get messages with error handling
    let messages = {};
    try {
      messages = await getMessages({ locale });
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to default locale messages
      try {
        messages = await getMessages({ locale: 'tr' });
      } catch (fallbackError) {
        console.error('Error loading fallback messages:', fallbackError);
        messages = {}; // Empty messages as last resort
      }
    }
    const rtl = isRTL(locale as any);

    return (
      <html lang={locale} dir={rtl ? "rtl" : "ltr"} className="font-jakarta" suppressHydrationWarning>
        <head>
          {/* Theme initialization script - prevents FOUC - Must run before body renders */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !(function() {
                  try {
                    const stored = localStorage.getItem('theme');
                    const theme = stored || 'system';
                    const root = document.documentElement;
                    
                    // Remove any existing theme classes
                    root.classList.remove('light', 'dark');
                    
                    let finalTheme = theme;
                    if (theme === 'system') {
                      finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    
                    // Apply theme class immediately
                    root.classList.add(finalTheme);
                    
                    // Store in localStorage if not already stored
                    if (!stored) {
                      localStorage.setItem('theme', theme);
                    }
                  } catch (e) {
                    // Fallback to light mode if anything fails
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                })();
              `,
            }}
          />
        </head>
        <body className="bg-background text-foreground antialiased">
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <ErrorBoundary>
                <AdminLayout>{children}</AdminLayout>
                <Toaster />
              </ErrorBoundary>
            </QueryProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error: any) {
    // Log error only in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error in LocaleLayout:", error);
    }
    // Fallback to default locale
    const messages = await getMessages({ locale: "tr" });
    return (
      <html lang="tr" dir="ltr" className="font-jakarta" suppressHydrationWarning>
        <head>
          {/* Theme initialization script - prevents FOUC - Must run before body renders */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !(function() {
                  try {
                    const stored = localStorage.getItem('theme');
                    const theme = stored || 'system';
                    const root = document.documentElement;
                    
                    // Remove any existing theme classes
                    root.classList.remove('light', 'dark');
                    
                    let finalTheme = theme;
                    if (theme === 'system') {
                      finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    
                    // Apply theme class immediately
                    root.classList.add(finalTheme);
                    
                    // Store in localStorage if not already stored
                    if (!stored) {
                      localStorage.setItem('theme', theme);
                    }
                  } catch (e) {
                    // Fallback to light mode if anything fails
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                })();
              `,
            }}
          />
        </head>
        <body className="bg-background text-foreground antialiased">
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <ErrorBoundary>
                <AdminLayout>{children}</AdminLayout>
                <Toaster />
              </ErrorBoundary>
            </QueryProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  }
}
