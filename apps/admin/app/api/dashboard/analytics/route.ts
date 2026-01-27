import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { requireStaff } from "@/lib/auth/server";

/**
 * Dashboard Analytics API
 * Returns analytics data for dashboard charts and metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // In production, uncomment the line below to enable role checking
    // await requireStaff();
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    // Calculate date range
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch listings for trend analysis
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("id, title, created_at, updated_at, published, featured, status, price_amount, location_neighborhood")
      .gte("created_at", startDate.toISOString())
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (listingsError) {
      console.error("Error fetching listings:", listingsError);
    }

    // Generate daily trends
    const trends: Array<{
      date: string;
      added: number;
      published: number;
      featured: number;
    }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayListings = (listings || []).filter((l: any) => {
        const created = new Date(l.created_at).toISOString().split("T")[0];
        return created === dateStr;
      });

      trends.push({
        date: date.toISOString().split("T")[0],
        added: dayListings.length,
        published: dayListings.filter((l: any) => l.published).length,
        featured: dayListings.filter((l: any) => l.featured).length,
      });
    }

    // Generate neighborhood performance
    const neighborhoodMap = new Map<string, { listings: number; totalPrice: number }>();

    (listings || []).forEach((listing: any) => {
      const neighborhood = listing.location_neighborhood || "Bilinmeyen";
      if (!neighborhoodMap.has(neighborhood)) {
        neighborhoodMap.set(neighborhood, { listings: 0, totalPrice: 0 });
      }
      const data = neighborhoodMap.get(neighborhood)!;
      data.listings++;
      data.totalPrice += listing.price_amount || 0;
    });

    const neighborhoods = Array.from(neighborhoodMap.entries())
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        listings: data.listings,
        avgPrice: data.listings > 0 ? data.totalPrice / data.listings : 0,
      }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        trends,
        neighborhoods,
        period,
      },
    });
  } catch (error: any) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Analytics fetch failed" },
      { status: 500 }
    );
  }
}
