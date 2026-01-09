import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/admin/supabase/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { ListingEditorAdvanced } from "@/components/admin/listings/ListingEditorAdvanced";

export const metadata: Metadata = {
  title: "İlan Düzenle | Admin Panel",
  description: "Karasu Emlak Admin Panel - İlan Düzenleme",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const { locale, id } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Use service role in development to bypass RLS
  let supabase;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (process.env.NODE_ENV === "development" && serviceRoleKey && supabaseUrl) {
    try {
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
    } catch (error) {
      supabase = await createClient();
    }
  } else {
    supabase = await createClient();
  }

  // Fetch listing
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching listing:", error);
    // Check if it's a "not found" error
    if (error.code === "PGRST116" || error.message?.includes("No rows")) {
      notFound();
    }
    // For other errors, still show not found to avoid exposing internal errors
    notFound();
  }

  if (!listing) {
    notFound();
  }

  // Transform listing data to match ListingEditorAdvanced interface
  const transformedListing = {
    id: listing.id,
    title: listing.title || "",
    slug: listing.slug || "",
    status: (listing.status as "satilik" | "kiralik") || "satilik",
    property_type: listing.property_type || "",
    location_neighborhood: listing.location_neighborhood || "",
    location_address: listing.location_address || undefined,
    price_amount: listing.price_amount || null,
    price_currency: listing.price_currency || "TRY",
    area_sqm: listing.area_sqm || undefined,
    room_count: listing.room_count || undefined,
    floor: listing.floor || undefined,
    building_age: listing.building_age || undefined,
    images: Array.isArray(listing.images) ? listing.images : (listing.images ? [listing.images] : []),
    description: listing.description || "",
    published: listing.published || false,
    featured: listing.featured || false,
    available: listing.available !== false, // Default to true if not set
    created_at: listing.created_at || new Date().toISOString(),
    updated_at: listing.updated_at || new Date().toISOString(),
    views: listing.views || 0,
  };

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">İlan Düzenle</h1>
          <p className="admin-page-description">
            {listing.title || "İlan detaylarını düzenleyin"}
          </p>
        </div>
      </div>

      <ListingEditorAdvanced
        listing={transformedListing}
        locale={locale}
      />
    </div>
  );
}
