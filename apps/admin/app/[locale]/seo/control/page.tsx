/**
 * SEO Control Page
 * Metadata editor, schema JSON-LD generator, and internal link suggestions
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { FileText, Code, Link2, Search } from "lucide-react";
import Link from "next/link";

export default async function SEOControlPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const t = await getTranslations({ locale, namespace: "admin.seo" });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("seoControl")}
          </h1>
          <p className="admin-page-description">
            Metadata editor, schema JSON-LD generator, and internal link suggestions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <Card className="card-professional hover-lift group cursor-pointer">
          <CardHeader className="pb-4 px-5 pt-5">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-primary/10 transition-all duration-200 shadow-sm group-hover:shadow-md">
                <FileText className="h-5 w-5 text-primary relative z-10 transition-transform duration-200 group-hover:scale-110" />
              </div>
              <CardTitle className="text-base font-display font-bold text-foreground">
                Metadata Editor
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
              Edit meta titles, descriptions, and Open Graph tags for all pages
            </p>
            <Link href={`/${locale}/seo/control/metadata`}>
              <span className="text-primary hover:text-foreground text-sm font-semibold font-ui transition-colors duration-200 inline-flex items-center gap-1">
                Open Editor →
              </span>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift group cursor-pointer">
          <CardHeader className="pb-4 px-5 pt-5">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-primary/10 transition-all duration-200 shadow-sm group-hover:shadow-md">
                <Code className="h-5 w-5 text-primary relative z-10 transition-transform duration-200 group-hover:scale-110" />
              </div>
              <CardTitle className="text-base font-display font-bold text-foreground">
                Schema Generator
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
              Generate and manage JSON-LD structured data for better SEO
            </p>
            <Link href={`/${locale}/seo/control/schema`}>
              <span className="text-primary hover:text-foreground text-sm font-semibold font-ui transition-colors duration-200 inline-flex items-center gap-1">
                Open Generator →
              </span>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift group cursor-pointer">
          <CardHeader className="pb-4 px-5 pt-5">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-primary/10 transition-all duration-200 shadow-sm group-hover:shadow-md">
                <Link2 className="h-5 w-5 text-primary relative z-10 transition-transform duration-200 group-hover:scale-110" />
              </div>
              <CardTitle className="text-base font-display font-bold text-foreground">
                Internal Links
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
              AI-powered internal linking suggestions and management
            </p>
            <Link href={`/${locale}/seo/control/links`}>
              <span className="text-primary hover:text-foreground text-sm font-semibold font-ui transition-colors duration-200 inline-flex items-center gap-1">
                Open Manager →
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Quick SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
            Run a quick SEO analysis on your content to identify improvement opportunities
          </p>
          <div className="flex gap-2">
            <Link href={`/${locale}/project-bot?tab=findings&category=seo`}>
              <span className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 text-sm font-semibold font-ui shadow-sm hover:shadow-md transition-all duration-200">
                Run SEO Scan
              </span>
            </Link>
            <Link href={`/${locale}/analytics/dashboard`}>
              <span className="inline-flex items-center px-4 py-2 border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] rounded-xl hover:bg-[#E7E7E7] dark:hover:bg-[#062F28] text-sm font-semibold font-ui transition-all duration-200 hover-scale micro-bounce">
                View Analytics
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

