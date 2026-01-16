import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { AuthorEditor } from "@/components/authors/AuthorEditor";

export const metadata: Metadata = {
  title: "Yeni Yazar | Admin Panel",
  description: "Karasu Emlak Admin Panel - Yeni Yazar Oluştur",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewAuthorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="admin-container responsive-padding py-6">
        <AuthorEditor locale={locale} />
      </div>
    </div>
  );
}
