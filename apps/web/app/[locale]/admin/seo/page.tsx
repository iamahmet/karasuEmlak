import { Metadata } from 'next';
import { SEOKeywordsTool, SERPTracker, BacklinksAnalyzer, ContentOptimizer } from '@/components/admin/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Search, TrendingUp, Link2, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SEO Araçları | Admin Panel',
  description: 'SEO analiz ve optimizasyon araçları',
};

export default async function SEOPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Araçları</h1>
        <p className="text-muted-foreground">
          Anahtar kelime araştırması, SERP takibi, backlink analizi ve içerik optimizasyonu
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Tool */}
        <div className="lg:col-span-2">
          <SEOKeywordsTool />
        </div>

        {/* SERP Tracker */}
        <SERPTracker locale={locale} />

        {/* Backlinks Analyzer */}
        <BacklinksAnalyzer />

        {/* Content Optimizer */}
        <div className="lg:col-span-2">
          <ContentOptimizer />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>SEO İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Takip Edilen Kelimeler</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Ortalama Pozisyon</span>
                </div>
                <p className="text-2xl font-bold text-green-600">4.2</p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Toplam Backlink</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">156</p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Domain Authority</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">55</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
