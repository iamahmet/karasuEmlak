import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { isRTL } from "@karasu/lib/i18n";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Toaster } from "@/components/providers/Toaster";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel - Karasu Emlak",
    template: "%s | Admin Panel - Karasu Emlak",
  },
  description: "Karasu Emlak Admin Panel - İçerik yönetimi, SEO araçları ve site yönetimi",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
      <html lang={locale} dir={rtl ? "rtl" : "ltr"} className="font-jakarta">
        <body className="bg-[#E7E7E7] dark:bg-[#062F28] text-design-dark dark:text-white antialiased">
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
      <html lang="tr" dir="ltr" className="font-jakarta">
        <body className="bg-[#E7E7E7] dark:bg-[#062F28] text-design-dark dark:text-white antialiased">
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
