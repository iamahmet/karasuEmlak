import { createServiceClient } from '@karasu/lib/supabase/service';

export interface NeighborhoodStats {
  name: string;
  totalListings: number;
  satilikCount: number;
  kiralikCount: number;
  avgPrice: number;
}

interface NeighborhoodStatsInternal extends NeighborhoodStats {
  prices: number[];
}

/**
 * Get neighborhood statistics from listings
 */
export async function getNeighborhoodStats(): Promise<NeighborhoodStats[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for neighborhood stats:', error.message);
    return [];
  }

  const { data, error } = await supabase
    .from('listings')
    .select('location_neighborhood, status, price_amount')
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null)
    .not('location_neighborhood', 'is', null);

  if (error) {
    console.error('Error fetching neighborhood stats:', error);
    return [];
  }

  // Group by neighborhood
  const statsMap = new Map<string, NeighborhoodStatsInternal>();

  data?.forEach((listing) => {
    const neighborhood = listing.location_neighborhood;
    if (!neighborhood) return;

    if (!statsMap.has(neighborhood)) {
      statsMap.set(neighborhood, {
        name: neighborhood,
        totalListings: 0,
        satilikCount: 0,
        kiralikCount: 0,
        avgPrice: 0,
        prices: [],
      });
    }

    const stats = statsMap.get(neighborhood)!;
    stats.totalListings++;
    if (listing.status === 'satilik') {
      stats.satilikCount++;
    } else if (listing.status === 'kiralik') {
      stats.kiralikCount++;
    }
    if (listing.price_amount) {
      stats.prices.push(Number(listing.price_amount));
    }
  });

  // Calculate averages
  const result: NeighborhoodStats[] = Array.from(statsMap.values()).map((stats) => {
    const avgPrice = stats.prices.length > 0
      ? stats.prices.reduce((sum, price) => sum + price, 0) / stats.prices.length
      : 0;
    return {
      name: stats.name,
      totalListings: stats.totalListings,
      satilikCount: stats.satilikCount,
      kiralikCount: stats.kiralikCount,
      avgPrice: Math.round(avgPrice),
    };
  });

  return result.sort((a, b) => b.totalListings - a.totalListings);
}
