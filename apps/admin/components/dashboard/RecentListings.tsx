"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Home, Eye, Edit, ExternalLink, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: string;
  property_type: string;
  price: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  location_neighborhood?: string;
}

export function RecentListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentListings();
  }, []);

  const fetchRecentListings = async () => {
    try {
      // Use API route for better reliability
      const response = await fetch("/api/listings?limit=10");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error("API returned error:", data.error);
        setListings([]);
        return;
      }

      const listings = data.data?.listings || data.listings || [];
      
      // Map to expected format (handle both price and price_amount)
      const mappedListings = listings.map((l: any) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        status: l.status,
        property_type: l.property_type,
        price: l.price_amount || l.price || 0,
        published: l.published,
        featured: l.featured,
        created_at: l.created_at,
        location_neighborhood: l.location_neighborhood,
      }));
      
      setListings(mappedListings);
    } catch (error) {
      console.error("Failed to fetch recent listings:", error);
      // Try fallback with direct Supabase query
      try {
        const supabase = createClient();
        const { data: listings, error: supabaseError } = await supabase
          .from("listings")
          .select("id, title, slug, status, property_type, price_amount, published, featured, created_at, location_neighborhood, deleted_at")
          .order("created_at", { ascending: false })
          .limit(20);

        if (supabaseError) {
          console.error("Supabase fallback also failed:", supabaseError);
          setListings([]);
          return;
        }

        // Filter out deleted listings and map format
        const filteredListings = (listings || [])
          .filter((l: any) => !l.deleted_at)
          .slice(0, 10)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            status: l.status,
            property_type: l.property_type,
            price: l.price_amount || 0,
            published: l.published,
            featured: l.featured,
            created_at: l.created_at,
            location_neighborhood: l.location_neighborhood,
          }));
        
        setListings(filteredListings);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ₺`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K ₺`;
    }
    return `${price.toLocaleString("tr-TR")} ₺`;
  };

  const getStatusBadge = (status: string, published: boolean) => {
    if (!published) {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
          Taslak
        </span>
      );
    }
    if (status === "satilik") {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
          Satılık
        </span>
      );
    }
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
        Kiralık
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional relative overflow-hidden border-2 shadow-lg bg-gradient-to-br from-card to-card/80">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-transparent rounded-full blur-3xl"></div>
      <CardHeader className="pb-4 px-6 pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 via-green-400 to-blue-500 rounded-full shadow-lg"></div>
            <CardTitle className="text-xl font-bold text-foreground font-['Urbanist']">
              Son İlanlar
            </CardTitle>
          </div>
          <Link href="/listings">
            <Button variant="outline" size="sm" className="text-xs font-semibold hover:bg-green-500 hover:text-white transition-colors">
              Tümünü Gör →
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 relative z-10">
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Henüz ilan bulunmuyor</p>
            <Link href="/listings/new">
              <Button variant="outline" size="sm" className="mt-4">
                İlk İlanını Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-start justify-between p-4 rounded-xl border-2 border-border/60 hover:border-green-500/50 bg-gradient-to-r from-card to-card/50 hover:from-green-50/50 hover:to-blue-50/50 dark:hover:from-green-950/20 dark:hover:to-blue-950/20 transition-all duration-300 group cursor-pointer hover:shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-3">
                    <h4 className="text-base font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                      {listing.title}
                    </h4>
                    {listing.featured && (
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold flex-shrink-0 shadow-sm">
                        ⭐ Öne Çıkan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {getStatusBadge(listing.status, listing.published)}
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      {listing.property_type}
                    </span>
                    {listing.location_neighborhood && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        {listing.location_neighborhood}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {formatPrice(listing.price || 0)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {new Date(listing.created_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  {listing.published && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
                      onClick={() => {
                        const webUrl = typeof window !== "undefined"
                          ? window.location.origin.replace("admin.", "").replace(":3001", ":3000") + `/ilan/${listing.slug}`
                          : `/ilan/${listing.slug}`;
                        window.open(webUrl, "_blank");
                      }}
                      title="Görüntüle"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
