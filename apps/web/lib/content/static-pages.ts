import { createServiceClient } from "@/lib/supabase/clients";

export interface StaticPageContent {
  id: string;
  slug: string;
  title: string;
  locale: string;
  content: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  is_published?: boolean;
  updated_at?: string | null;
}

interface GetPublishedStaticPageOptions {
  locale: string;
  slugCandidates: string[];
  fallbackLocale?: string;
}

function isMissingTableError(error: unknown) {
  const message = typeof error === "object" && error && "message" in error ? String((error as any).message) : "";
  const code = typeof error === "object" && error && "code" in error ? String((error as any).code) : "";
  return code === "42P01" || code === "PGRST205" || message.toLowerCase().includes("static_pages");
}

export async function getPublishedStaticPage({
  locale,
  slugCandidates,
  fallbackLocale = "tr",
}: GetPublishedStaticPageOptions): Promise<StaticPageContent | null> {
  const preferredSlugs = [...new Set(slugCandidates.map((s) => s.trim()).filter(Boolean))];
  if (preferredSlugs.length === 0) {
    return null;
  }

  const supabase = createServiceClient();

  const fetchForLocale = async (targetLocale: string) => {
    const { data, error } = await supabase
      .from("static_pages")
      .select("id, slug, title, locale, content, meta_title, meta_description, meta_keywords, is_published, updated_at")
      .eq("locale", targetLocale)
      .eq("is_published", true)
      .in("slug", preferredSlugs)
      .order("updated_at", { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return null;
      }
      throw error;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    for (const preferredSlug of preferredSlugs) {
      const match = data.find((page) => page.slug === preferredSlug);
      if (match) {
        return match as StaticPageContent;
      }
    }

    return (data[0] as StaticPageContent) ?? null;
  };

  try {
    const localized = await fetchForLocale(locale);
    if (localized) {
      return localized;
    }

    if (fallbackLocale && fallbackLocale !== locale) {
      return await fetchForLocale(fallbackLocale);
    }
  } catch (error) {
    console.error("[static-pages] Failed to fetch published static page:", error);
  }

  return null;
}
