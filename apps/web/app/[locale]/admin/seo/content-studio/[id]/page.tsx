/**
 * Content Studio - Edit Content Item
 * Edit existing content item with workflow, translations, quality gates
 */

import { getTranslations, setRequestLocale } from "next-intl/server";

import { createClient } from "@/lib/admin/supabase/server";
import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content-studio/ContentEditor";
import { ContentScheduler } from "@/components/admin/content-studio/ContentScheduler";
import { ContentAnalytics } from "@/components/admin/content-studio/ContentAnalytics";
import { ContentHistory } from "@/components/admin/content-studio/ContentHistory";
import { AdvancedSEOTools } from "@/components/admin/content-studio/AdvancedSEOTools";

export default async function ContentEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "contentStudio" });

  const supabase = await createClient();

  // Get content item
  const { data: contentItem, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !contentItem) {
    notFound();
  }

  // Get content locales
  const { data: locales } = await supabase
    .from("content_locales")
    .select("*")
    .eq("content_item_id", id)
    .order("locale");

  // Get quality scores
  const { data: qualityScores } = await supabase
    .from("content_quality")
    .select("*")
    .eq("content_item_id", id);

  return (
    <div className="admin-container responsive-padding space-section">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("editTitle")}</h1>
        <p className="text-muted-foreground">{contentItem.slug}</p>
      </div>

      <div className="space-y-6">
        <ContentEditor
          contentItem={contentItem}
          locales={locales || []}
          qualityScores={qualityScores || []}
          currentLocale={locale}
        />

        {/* Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContentScheduler
            type="article"
            contentId={id}
            currentSchedule={contentItem.published_at || undefined}
            onScheduleChange={async () => {
              // Refresh content item data
              window.location.reload();
            }}
          />

          <ContentAnalytics contentItemId={id} locale={locale} />
        </div>

        {/* SEO & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdvancedSEOTools
            content={{
              title: locales?.[0]?.title || "",
              content: locales?.[0]?.content || "",
              metaDescription: locales?.[0]?.meta_description,
              keywords: contentItem.seo_keywords,
            }}
            onUpdate={async (updates) => {
              const response = await fetch(`/api/content-studio/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locale, ...updates }),
              });
              if (!response.ok) throw new Error("Failed to update");
            }}
          />

          <ContentHistory contentItemId={id} locale={locale} />
        </div>
      </div>
    </div>
  );
}

