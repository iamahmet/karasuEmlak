import { getTranslations, setRequestLocale } from "next-intl/server";
import { AIQAManager } from '@/app/(dashboard)/ai-qa/AIQAManager';

export default async function AIQAPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            AI Soru-Cevap Yönetimi
          </h1>
          <p className="admin-page-description">
            Sayfalarda görünecek soru-cevap çiftlerini buradan yönetebilirsiniz
          </p>
        </div>
      </div>

      <AIQAManager />
    </div>
  );
}
