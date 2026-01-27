/**
 * SEO Indexing Page
 * IndexNow connector, sitemap queue management, and lastmod control
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { RefreshCw, FileText, Calendar, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { IndexNowManager } from "@/components/seo/IndexNowManager";
import { SitemapManager } from "@/components/seo/SitemapManager";

export default async function SEOIndexingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin.seo" });
  const supabase = await createClient();

  // Get recent articles for indexing
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("id, title, slug, updated_at, status")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("indexing")}
          </h1>
          <p className="admin-page-description">
            IndexNow connector, sitemap queue management, and lastmod control
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <Card className="card-professional hover-lift">
          <CardHeader className="pb-4 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-design-light" />
                IndexNow
              </CardTitle>
              <Button variant="outline" size="sm" className="hover-scale micro-bounce rounded-xl">
                <RefreshCw className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
              Submit URLs to search engines instantly via IndexNow API
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-design-gray dark:text-gray-400">Pending URLs</span>
                <span className="font-semibold text-design-dark dark:text-white">0</span>
              </div>
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-design-gray dark:text-gray-400">Last Submission</span>
                <span className="text-design-gray dark:text-gray-400">Never</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader className="pb-4 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-design-light" />
                Sitemap
              </CardTitle>
              <Button variant="outline" size="sm" className="hover-scale micro-bounce rounded-xl">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
              Manage XML sitemap generation and submission
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-design-gray dark:text-gray-400">Total URLs</span>
                <span className="font-semibold text-design-dark dark:text-white">{recentArticles?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-design-gray dark:text-gray-400">Last Updated</span>
                <span className="text-design-gray dark:text-gray-400">
                  {recentArticles?.[0]?.updated_at
                    ? new Date(recentArticles[0].updated_at).toLocaleDateString("tr-TR")
                    : "Never"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-design-light" />
              Lastmod Control
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-sm text-design-gray dark:text-gray-400 mb-4 font-ui">
              Control lastmod dates for better crawl efficiency
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-design-gray dark:text-gray-400">Auto Update</span>
                <span className="font-semibold text-green-600 dark:text-green-400">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-design-gray dark:text-gray-400">Update Frequency</span>
                <span className="text-design-gray dark:text-gray-400">On Change</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IndexNow Manager */}
      {recentArticles && recentArticles.length > 0 && (
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              IndexNow Gönderimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IndexNowManager articles={recentArticles} locale={locale} />
          </CardContent>
        </Card>
      )}

      {/* Sitemap Manager */}
      <SitemapManager locale={locale} />
    </div>
  );
}

