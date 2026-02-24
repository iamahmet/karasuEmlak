import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

interface HomepageSection {
  id?: string;
  slug: string;
  name: string;
  is_visible: boolean;
  display_order: number;
  settings?: Record<string, unknown>;
}

const DEFAULT_SECTIONS: HomepageSection[] = [
  { slug: "hero", name: "Hero Section", is_visible: true, display_order: 1, settings: {} },
  { slug: "stats", name: "Stats Section", is_visible: true, display_order: 2, settings: {} },
  { slug: "featured-listings", name: "Featured Listings", is_visible: true, display_order: 3, settings: {} },
  { slug: "neighborhoods", name: "Neighborhoods", is_visible: true, display_order: 4, settings: {} },
  { slug: "blog-news", name: "Blog & News", is_visible: true, display_order: 5, settings: {} },
  { slug: "cta", name: "CTA Section", is_visible: true, display_order: 6, settings: {} },
  { slug: "testimonials", name: "Testimonials", is_visible: true, display_order: 7, settings: {} },
];

function normalizeSections(sections: HomepageSection[]): HomepageSection[] {
  return [...sections]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((section, index) => ({
      id: section.id,
      slug: section.slug,
      name: section.name,
      is_visible: Boolean(section.is_visible),
      display_order: index + 1,
      settings:
        section.settings && typeof section.settings === "object" && !Array.isArray(section.settings)
          ? section.settings
          : {},
    }));
}

function isMissingTableError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() || "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes('relation "homepage_sections" does not exist') ||
    message.includes("could not find the table")
  );
}

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ success: true, sections: DEFAULT_SECTIONS, source: "default" });
      }
      return NextResponse.json(
        { success: false, error: error.message || "Homepage bölümleri yüklenemedi" },
        { status: 500 }
      );
    }

    const sections = Array.isArray(data) && data.length > 0 ? normalizeSections(data) : DEFAULT_SECTIONS;

    // Best-effort auto-seed when table exists but no rows.
    if ((!data || data.length === 0) && sections.length > 0) {
      await supabase.from("homepage_sections").upsert(
        sections.map(({ slug, name, is_visible, display_order, settings }) => ({
          slug,
          name,
          is_visible,
          display_order,
          settings: settings || {},
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "slug" }
      );
    }

    return NextResponse.json({ success: true, sections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Homepage bölümleri yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const inputSections = Array.isArray(body?.sections) ? body.sections : null;

    if (!inputSections) {
      return NextResponse.json(
        { success: false, error: "sections array zorunludur" },
        { status: 400 }
      );
    }

    const seenSlugs = new Set<string>();
    const normalizedInput: HomepageSection[] = [];

    for (const raw of inputSections) {
      if (!raw || typeof raw !== "object") {
        return NextResponse.json({ success: false, error: "Geçersiz section verisi" }, { status: 400 });
      }

      const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
      const name = typeof raw.name === "string" ? raw.name.trim() : "";
      if (!slug || !name) {
        return NextResponse.json({ success: false, error: "Her bölüm için slug ve name gerekli" }, { status: 400 });
      }
      if (seenSlugs.has(slug)) {
        return NextResponse.json({ success: false, error: `Tekrarlı slug: ${slug}` }, { status: 400 });
      }
      seenSlugs.add(slug);

      normalizedInput.push({
        slug,
        name,
        is_visible: Boolean(raw.is_visible),
        display_order:
          typeof raw.display_order === "number" && Number.isFinite(raw.display_order) ? raw.display_order : normalizedInput.length + 1,
        settings:
          raw.settings && typeof raw.settings === "object" && !Array.isArray(raw.settings)
            ? raw.settings
            : {},
      });
    }

    const sections = normalizeSections(normalizedInput);
    const supabase = createServiceClient();
    const nowIso = new Date().toISOString();

    const { error: upsertError } = await supabase.from("homepage_sections").upsert(
      sections.map(({ slug, name, is_visible, display_order, settings }) => ({
        slug,
        name,
        is_visible,
        display_order,
        settings: settings || {},
        updated_at: nowIso,
      })),
      { onConflict: "slug" }
    );

    if (upsertError) {
      if (isMissingTableError(upsertError)) {
        return NextResponse.json(
          {
            success: false,
            error: "homepage_sections tablosu bulunamadı. Migration çalıştırın.",
            code: upsertError.code,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, error: upsertError.message || "Homepage bölümleri kaydedilemedi" },
        { status: 500 }
      );
    }

    const { data, error: fetchError } = await supabase
      .from("homepage_sections")
      .select("*")
      .in("slug", sections.map((s) => s.slug))
      .order("display_order", { ascending: true });

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message || "Kaydedilen bölümler alınamadı" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sections: normalizeSections((data as HomepageSection[]) || sections) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Homepage bölümleri kaydedilemedi" },
      { status: 500 }
    );
  }
}
