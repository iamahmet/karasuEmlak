import type { Metadata } from 'next';
import { AIImagesTabs } from '@/components/admin/ai-images/AIImagesTabs';

export const metadata: Metadata = {
  title: 'AI Görsel Üretme',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AIImagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Development mode: Skip auth check
  // await requireStaff();

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            AI Görsel Üretme
          </h1>
          <p className="admin-page-description">
            Yapay zeka ile görsel üretme, rate limiting ve maliyet takibi
          </p>
        </div>
      </div>

      {/* AI Images Tabs Component */}
      <AIImagesTabs locale={locale} />
    </div>
  );
}

