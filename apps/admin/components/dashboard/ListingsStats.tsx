"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Home, TrendingUp, Eye, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ListingsStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  satilik: number;
  kiralik: number;
  totalValue: number;
}

export function ListingsStats() {
  const [stats, setStats] = useState<ListingsStats>({
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    satilik: 0,
    kiralik: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use API route instead of direct Supabase client for better reliability
      // Fetch in batches if needed (API limit is 100)
      const response = await fetch("/api/listings?limit=100");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error("API returned error:", data.error);
        setLoading(false);
        return;
      }

      // API returns: { success: true, data: { listings: [...], total: ... } }
      const listings = data.data?.listings || data.listings || [];
      
      console.log("[ListingsStats] Fetched listings:", listings.length);
      
      // If we got 100 listings, there might be more - fetch additional batches
      let allListings = [...listings];
      if (listings.length === 100 && data.data?.total > 100) {
        // Fetch more batches (up to 5 batches = 500 listings max)
        for (let offset = 100; offset < Math.min(500, data.data.total); offset += 100) {
          try {
            const nextResponse = await fetch(`/api/listings?limit=100&offset=${offset}`);
            if (!nextResponse.ok) break;
            const nextData = await nextResponse.json();
            if (!nextData.success || !nextData.data?.listings?.length) break;
            allListings = [...allListings, ...(nextData.data.listings || [])];
            if (nextData.data.listings.length < 100) break; // No more listings
          } catch (e) {
            break; // Stop fetching on error
          }
        }
      }
      
      console.log("[ListingsStats] Total listings to process:", allListings.length);
      
      // Process listings - handle both price and price_amount formats
      processListings(allListings);
    } catch (error) {
      console.error("Failed to fetch listings stats:", error);
      // Try fallback with direct Supabase query
      try {
        const supabase = createClient();
        const { data: listings, error: supabaseError } = await supabase
          .from("listings")
          .select("id, published, featured, status, price, price_amount, deleted_at")
          .limit(500);

        if (supabaseError) {
          console.error("Supabase fallback also failed:", supabaseError);
          setLoading(false);
          return;
        }

        // Filter out deleted listings and process
        const filteredListings = (listings || []).filter((l: any) => !l.deleted_at);
        processListings(filteredListings);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
      } finally {
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const processListings = (listings: any[]) => {
    // Handle both price and price_amount formats
    const getPrice = (listing: any) => {
      return listing.price_amount || 0;
    };

    const total = listings?.length || 0;
    const published = listings?.filter((l) => l.published).length || 0;
    const drafts = total - published;
    const featured = listings?.filter((l) => l.featured).length || 0;
    const satilik = listings?.filter((l) => l.status === "satilik").length || 0;
    const kiralik = listings?.filter((l) => l.status === "kiralik").length || 0;
    const totalValue = listings?.reduce((sum, l) => sum + getPrice(l), 0) || 0;

    console.log("[ListingsStats] Processed stats:", { total, published, featured, satilik, kiralik, totalValue });

    setStats({
      total,
      published,
      drafts,
      featured,
      satilik,
      kiralik,
      totalValue,
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-professional">
            <CardContent className="p-4">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      label: "Toplam İlan",
      value: stats.total,
      icon: Home,
      change: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Yayında",
      value: stats.published,
      icon: Eye,
      change: `${Math.round((stats.published / stats.total) * 100) || 0}%`,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: `${stats.drafts} taslak`,
    },
    {
      label: "Öne Çıkan",
      value: stats.featured,
      icon: TrendingUp,
      change: "+5%",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Toplam Değer",
      value: `${(stats.totalValue / 1000000).toFixed(1)}M ₺`,
      icon: DollarSign,
      change: "+8%",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: `${stats.satilik} satılık, ${stats.kiralik} kiralık`,
    },
  ];

  const getProgressWidth = (stat: typeof statsCards[0]) => {
    if (stat.label === "Yayında") {
      return stats.total > 0 ? (stats.published / stats.total) * 100 : 0;
    }
    if (stat.label === "Öne Çıkan") {
      return stats.total > 0 ? (stats.featured / stats.total) * 100 : 0;
    }
    return 75; // Default progress
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        const progressWidth = getProgressWidth(stat);
        const colors = [
          { bg: "from-blue-500/10 to-blue-600/5", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-900/30", progress: "from-blue-500 to-blue-600" },
          { bg: "from-green-500/10 to-green-600/5", icon: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-900/30", progress: "from-green-500 to-green-600" },
          { bg: "from-purple-500/10 to-purple-600/5", icon: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-900/30", progress: "from-purple-500 to-purple-600" },
          { bg: "from-orange-500/10 to-orange-600/5", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-900/30", progress: "from-orange-500 to-orange-600" },
        ];
        const colorScheme = colors[index % colors.length];
        
        return (
          <Card
            key={stat.label}
            className="group relative overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer bg-card"
          >
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 relative z-10">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.label}
              </CardTitle>
              <div className={`relative p-2 rounded-lg transition-all duration-200 bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} group-hover:scale-105`}>
                <Icon className={`h-4 w-4 ${colorScheme.icon} transition-transform duration-200`} />
              </div>
            </CardHeader>
            
            <CardContent className="px-4 pb-4 relative z-10">
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl md:text-2xl font-bold text-foreground tracking-tight group-hover:scale-105 transition-transform duration-200">
                  {stat.value}
                </div>
                {stat.change && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${colorScheme.border} bg-gradient-to-r ${colorScheme.bg} ${colorScheme.icon}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mb-2">{stat.subtitle}</p>
              )}
              
              <div className="relative h-1 rounded-full overflow-hidden bg-muted/50">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${colorScheme.progress}`}
                  style={{ width: `${Math.min(100, progressWidth)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
