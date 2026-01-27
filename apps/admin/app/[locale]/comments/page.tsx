import { getTranslations, setRequestLocale } from "next-intl/server";
import { CommentsManagement } from "@/components/comments/CommentsManagement";

export default async function CommentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; article?: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const { status, article } = await searchParams;
  
  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "comments" });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("title")}
          </h1>
          <p className="admin-page-description">
            {t("description")}
          </p>
        </div>
      </div>

      <CommentsManagement locale={locale} initialStatus={status} initialArticle={article} />
    </div>
  );
}

