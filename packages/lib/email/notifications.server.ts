'use server';

import type { ReactElement } from "react";
import { sendEmail } from "./client";
import {
  NewListingEmailTemplate,
  PriceChangeEmailTemplate,
  SavedSearchMatchEmailTemplate,
} from "./templates";
import { createServiceClient } from "../supabase/service";

// Dynamic import for renderToStaticMarkup to avoid client-side bundling
async function renderTemplate(component: ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(component);
}

/**
 * Send new listing notification email
 */
export async function sendNewListingNotification({
  listingId,
  userId,
  email,
}: {
  listingId: string;
  userId?: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Fetch listing details
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return {
        success: false,
        error: "Listing not found",
      };
    }

    // Format price
    const price = listing.price_amount
      ? `${new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: listing.price_currency || "TRY",
          minimumFractionDigits: 0,
        }).format(listing.price_amount)}`
      : undefined;

    // Format location
    const location = [
      listing.location_neighborhood,
      listing.location_district,
      listing.location_city,
    ]
      .filter(Boolean)
      .join(", ");

    // Get first image URL
    const imageUrl =
      listing.images && listing.images.length > 0
        ? listing.images[0].url
        : undefined;

    // Generate listing URL
    const listingUrl = `/ilan/${listing.slug}`;

    // Render email template
    const html = await renderTemplate(
      NewListingEmailTemplate({
        listingTitle: listing.title,
        listingUrl,
        price,
        location,
        imageUrl,
      })
    );

    // Send email
    const result = await sendEmail({
      to: email,
      subject: `Yeni İlan: ${listing.title}`,
      html,
    });

    // Log notification
    if (result.success && userId) {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "new_listing",
        title: "Yeni İlan Bildirimi",
        message: `${listing.title} ilanı için bildirim gönderildi`,
        action_url: listingUrl,
        metadata: { listing_id: listingId },
      });
    }

    return result;
  } catch (error: any) {
    console.error("New listing notification error:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
}

/**
 * Send price change notification email
 */
export async function sendPriceChangeNotification({
  listingId,
  oldPrice,
  newPrice,
  userId,
  email,
}: {
  listingId: string;
  oldPrice: number;
  newPrice: number;
  userId?: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Fetch listing details
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return {
        success: false,
        error: "Listing not found",
      };
    }

    // Format prices
    const currency = listing.price_currency || "TRY";
    const formatPrice = (price: number) =>
      new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      }).format(price);

    const oldPriceFormatted = formatPrice(oldPrice);
    const newPriceFormatted = formatPrice(newPrice);

    // Format location
    const location = [
      listing.location_neighborhood,
      listing.location_district,
      listing.location_city,
    ]
      .filter(Boolean)
      .join(", ");

    // Get first image URL
    const imageUrl =
      listing.images && listing.images.length > 0
        ? listing.images[0].url
        : undefined;

    // Generate listing URL
    const listingUrl = `/ilan/${listing.slug}`;

    // Render email template
    const html = await renderTemplate(
      PriceChangeEmailTemplate({
        listingTitle: listing.title,
        listingUrl,
        oldPrice: oldPriceFormatted,
        newPrice: newPriceFormatted,
        location,
        imageUrl,
      })
    );

    // Send email
    const result = await sendEmail({
      to: email,
      subject: `Fiyat Değişikliği: ${listing.title}`,
      html,
    });

    // Log notification
    if (result.success && userId) {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "price_change",
        title: "Fiyat Değişikliği Bildirimi",
        message: `${listing.title} ilanının fiyatı değişti`,
        action_url: listingUrl,
        metadata: {
          listing_id: listingId,
          old_price: oldPrice,
          new_price: newPrice,
        },
      });
    }

    return result;
  } catch (error: any) {
    console.error("Price change notification error:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
}

/**
 * Send price alert notification email (new listings matching filters)
 */
export async function sendPriceAlertNotification({
  alertId,
  email,
  matches,
}: {
  alertId: string;
  email: string;
  matches: Array<{
    id: string;
    title: string;
    slug: string;
    price_amount?: number | null;
    price_currency?: string;
    location_neighborhood?: string;
    images?: Array<{ url?: string }>;
  }>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedMatches = matches.map((match) => {
      const price = match.price_amount
        ? `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: match.price_currency || "TRY",
            minimumFractionDigits: 0,
          }).format(match.price_amount)}`
        : undefined;
      const imageUrl = match.images?.[0]?.url;
      return {
        title: match.title,
        url: `/ilan/${match.slug}`,
        price,
        location: match.location_neighborhood,
        imageUrl,
      };
    });

    const html = await renderTemplate(
      SavedSearchMatchEmailTemplate({
        searchName: "Fiyat Uyarısı",
        matches: formattedMatches,
        searchUrl: "/satilik",
      })
    );

    return await sendEmail({
      to: email,
      subject: `Fiyat Uyarısı: ${matches.length} yeni ilan bulundu`,
      html,
    });
  } catch (error: any) {
    console.error("Price alert notification error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send saved search match notification email
 */
export async function sendSavedSearchMatchNotification({
  searchId,
  userId,
  email,
  matches,
}: {
  searchId: string;
  userId?: string;
  email: string;
  matches: Array<{
    id: string;
    title: string;
    slug: string;
    price_amount?: number | null;
    price_currency?: string;
    location_neighborhood?: string;
    images?: Array<{ url: string }>;
  }>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Fetch saved search details
    const { data: savedSearch, error: searchError } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("id", searchId)
      .single();

    if (searchError || !savedSearch) {
      return {
        success: false,
        error: "Saved search not found",
      };
    }

    // Format matches for email template
    const formattedMatches = matches.map((match) => {
      const price = match.price_amount
        ? `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: match.price_currency || "TRY",
            minimumFractionDigits: 0,
          }).format(match.price_amount)}`
        : undefined;

      const location = match.location_neighborhood || undefined;
      const imageUrl =
        match.images && match.images.length > 0
          ? match.images[0].url
          : undefined;

      return {
        title: match.title,
        url: `/ilan/${match.slug}`,
        price,
        location,
        imageUrl,
      };
    });

    // Generate search URL from filters
    const params = (savedSearch.filters || savedSearch.search_params) as Record<string, string>;
    const searchUrl = params && Object.keys(params).length > 0
      ? `/satilik?${new URLSearchParams(params).toString()}`
      : "/satilik";

    // Render email template
    const html = await renderTemplate(
      SavedSearchMatchEmailTemplate({
        searchName: savedSearch.name || "Kayıtlı Arama",
        matches: formattedMatches,
        searchUrl,
      })
    );

    // Send email
    const result = await sendEmail({
      to: email,
      subject: `Yeni Eşleşmeler: ${savedSearch.name || "Kayıtlı Arama"}`,
      html,
    });

    // Log notification (only if user_id provided - notifications requires user_id)
    if (result.success && userId) {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "saved_search_match",
        title: "Kayıtlı Arama Eşleşmesi",
        message: `${savedSearch.name || "Kayıtlı aramanız"} için ${matches.length} yeni ilan bulundu`,
        action_url: searchUrl,
        metadata: {
          search_id: searchId,
          match_count: matches.length,
        },
      });
    }

    return result;
  } catch (error: any) {
    console.error("Saved search match notification error:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
}

