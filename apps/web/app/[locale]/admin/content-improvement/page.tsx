import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import type { Metadata } from 'next';
import { AdminAIChecker } from '@/components/admin/content/AdminAIChecker';
import { getArticles } from '@/lib/supabase/queries';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { requireStaff } from '@/lib/admin/auth/server';
import dynamic from 'next/dynamic';

const BatchImprovement = dynamic(
  () => import('@/components/admin/content/BatchImprovement').then(mod => ({ default: mod.BatchImprovement })),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'İçerik İyileştirme | Admin',
  description: 'AI ile içerik analizi ve iyileştirme',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ContentImprovementPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ articleId?: string }>;
}) {
  const { locale } = await params;
  const { articleId } = await searchParams;
  
  setRequestLocale(locale);
  
  // Require staff authentication
  await requireStaff();
  
  const t = await getTranslations('admin');
  
  // Fetch all articles using service client (admin access)
  const supabase = createServiceClient();
  const { data: articlesData, error } = await supabase
    .from('articles')
    .select('id, title, content, slug, status')
    .order('created_at', { ascending: false })
    .limit(100);
  
  const articles = (articlesData || []).map((article: any) => ({
    id: article.id,
    title: article.title || '',
    slug: article.slug || '',
    status: article.status || 'draft',
    content: article.content || '',
  }));
  
  // If articleId provided, fetch that article with full content
  let selectedArticle = null;
  if (articleId) {
    const found = articles.find(a => a.id === articleId);
    if (found) {
      // Fetch full article content
      const { data: fullArticle } = await supabase
        .from('articles')
        .select('id, title, content, slug, status')
        .eq('id', articleId)
        .single();
      
      selectedArticle = fullArticle || null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          İçerik İyileştirme (AI Analiz)
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Blog yazılarını AI ile analiz edin ve otomatik iyileştirin
        </p>
      </div>

      {/* Article Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Makale Seç</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/${locale}/admin/content-improvement?articleId=${article.id}`}
                className={`block p-3 rounded-lg border transition-colors ${
                  articleId === article.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">{article.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {article.slug} • {article.status}
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Checker for Selected Article */}
      {selectedArticle && (
        <AdminAIChecker
          content={selectedArticle.content || ''}
          title={selectedArticle.title}
          contentType="blog"
          articleId={selectedArticle.id}
          onImproved={(improvedContent) => {
            // Content will be updated via API in AdminAIChecker component
            console.log('Content improved:', improvedContent);
          }}
        />
      )}

      {!selectedArticle && (
        <>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Analiz etmek için yukarıdan bir makale seçin
              </p>
            </CardContent>
          </Card>

          {/* Batch Improvement */}
          <BatchImprovement articles={articles} />
        </>
      )}
    </div>
  );
}
