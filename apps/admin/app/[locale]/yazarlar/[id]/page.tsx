import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { AuthorEditor } from "@/components/authors/AuthorEditor";

export const metadata: Metadata = {
  title: "Yazar Düzenle | Admin Panel",
  description: "Karasu Emlak Admin Panel - Yazar Düzenle",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <div className="admin-container responsive-padding py-6">
        <AuthorEditor authorId={id} locale={locale} />
      </div>
    </div>
  );
}
