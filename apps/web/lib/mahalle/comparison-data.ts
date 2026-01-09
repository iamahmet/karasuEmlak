/**
 * Neighborhood Comparison Data
 * Price, features, and investment potential comparisons
 */

import { generateSlug } from '@/lib/utils';

export interface NeighborhoodComparison {
  mahalle: string;
  averagePrice: {
    daire: number; // TL per m²
    villa: number; // TL per m²
    yazlik: number; // TL per m²
  };
  priceTrend: 'up' | 'down' | 'stable';
  investmentPotential: 'high' | 'medium' | 'low';
  features: {
    seaDistance: string;
    centerDistance: string;
    transportation: 'excellent' | 'good' | 'moderate';
    socialLife: 'excellent' | 'good' | 'moderate';
    safety: 'excellent' | 'good' | 'moderate';
  };
  pros: string[];
  cons: string[];
  bestFor: string[];
}

/**
 * Comparison data for Karasu neighborhoods
 */
export const NEIGHBORHOOD_COMPARISON_DATA: Record<string, NeighborhoodComparison> = {
  'merkez': {
    mahalle: 'Merkez',
    averagePrice: {
      daire: 25000,
      villa: 35000,
      yazlik: 20000,
    },
    priceTrend: 'up',
    investmentPotential: 'high',
    features: {
      seaDistance: '500 m',
      centerDistance: '0 m',
      transportation: 'excellent',
      socialLife: 'excellent',
      safety: 'excellent',
    },
    pros: [
      'Tüm ihtiyaçlara yakın',
      'Gelişmiş ulaşım imkanları',
      'Canlı sosyal yaşam',
      'Yüksek yatırım potansiyeli',
      'Okul ve hastaneye yakın',
    ],
    cons: [
      'Biraz gürültülü olabilir',
      'Park yeri bulmak zor olabilir',
      'Fiyatlar yüksek',
    ],
    bestFor: [
      'Kalıcı yaşam',
      'Yatırım',
      'Aileler',
      'Merkezi konum isteyenler',
    ],
  },
  'sahil': {
    mahalle: 'Sahil',
    averagePrice: {
      daire: 30000,
      villa: 45000,
      yazlik: 35000,
    },
    priceTrend: 'up',
    investmentPotential: 'high',
    features: {
      seaDistance: '0 m',
      centerDistance: '600 m',
      transportation: 'good',
      socialLife: 'excellent',
      safety: 'excellent',
    },
    pros: [
      'Denize sıfır',
      'Yüksek yatırım değeri',
      'Yazlık yaşam için ideal',
      'Plaj ve sosyal tesisler yakın',
      'Güzel manzara',
    ],
    cons: [
      'Fiyatlar çok yüksek',
      'Yaz aylarında kalabalık',
      'Nem oranı yüksek olabilir',
    ],
    bestFor: [
      'Yazlık ev',
      'Yatırım',
      'Deniz manzarası isteyenler',
      'Yazlık yaşam',
    ],
  },
  'yali': {
    mahalle: 'Yalı',
    averagePrice: {
      daire: 28000,
      villa: 40000,
      yazlik: 30000,
    },
    priceTrend: 'up',
    investmentPotential: 'high',
    features: {
      seaDistance: '100 m',
      centerDistance: '1.2 km',
      transportation: 'good',
      socialLife: 'good',
      safety: 'excellent',
    },
    pros: [
      'Denize çok yakın',
      'Sakin ve huzurlu',
      'Yatırım değeri yüksek',
      'Güzel manzara',
      'Yazlık yaşam için ideal',
    ],
    cons: [
      'Merkeze biraz uzak',
      'Fiyatlar yüksek',
      'Kış aylarında sakin',
    ],
    bestFor: [
      'Yazlık ev',
      'Yatırım',
      'Sakin yaşam isteyenler',
      'Deniz manzarası',
    ],
  },
  'liman': {
    mahalle: 'Liman',
    averagePrice: {
      daire: 22000,
      villa: 32000,
      yazlik: 25000,
    },
    priceTrend: 'stable',
    investmentPotential: 'medium',
    features: {
      seaDistance: '200 m',
      centerDistance: '1.8 km',
      transportation: 'moderate',
      socialLife: 'moderate',
      safety: 'good',
    },
    pros: [
      'Denize yakın',
      'Fiyatlar daha uygun',
      'Sakin bölge',
      'Yatırım potansiyeli var',
    ],
    cons: [
      'Merkeze uzak',
      'Ulaşım biraz zor',
      'Sosyal tesisler sınırlı',
    ],
    bestFor: [
      'Bütçe dostu yatırım',
      'Sakin yaşam',
      'Yazlık ev',
    ],
  },
  'cumhuriyet': {
    mahalle: 'Cumhuriyet',
    averagePrice: {
      daire: 23000,
      villa: 33000,
      yazlik: 22000,
    },
    priceTrend: 'up',
    investmentPotential: 'high',
    features: {
      seaDistance: '600 m',
      centerDistance: '400 m',
      transportation: 'excellent',
      socialLife: 'good',
      safety: 'excellent',
    },
    pros: [
      'Merkeze yakın',
      'Okula yakın',
      'Hastaneye yakın',
      'Ulaşım kolay',
      'Aileler için ideal',
    ],
    cons: [
      'Denize biraz uzak',
      'Park yeri sınırlı',
    ],
    bestFor: [
      'Aileler',
      'Kalıcı yaşam',
      'Okul yakını isteyenler',
      'Yatırım',
    ],
  },
  'ataturk': {
    mahalle: 'Atatürk',
    averagePrice: {
      daire: 24000,
      villa: 34000,
      yazlik: 23000,
    },
    priceTrend: 'up',
    investmentPotential: 'high',
    features: {
      seaDistance: '700 m',
      centerDistance: '500 m',
      transportation: 'excellent',
      socialLife: 'good',
      safety: 'excellent',
    },
    pros: [
      'Merkeze yakın',
      'Okula yakın',
      'Hastaneye yakın',
      'Ulaşım kolay',
      'Aileler için ideal',
      'Yatırım potansiyeli yüksek',
    ],
    cons: [
      'Denize biraz uzak',
      'Park yeri sınırlı',
    ],
    bestFor: [
      'Aileler',
      'Kalıcı yaşam',
      'Okul yakını isteyenler',
      'Yatırım',
    ],
  },
};

/**
 * Get comparison data for a neighborhood
 */
export function getComparisonData(mahalleSlug: string): NeighborhoodComparison | null {
  return NEIGHBORHOOD_COMPARISON_DATA[mahalleSlug.toLowerCase()] || null;
}

/**
 * Compare multiple neighborhoods
 */
export function compareNeighborhoods(mahalleSlugs: string[]): NeighborhoodComparison[] {
  return mahalleSlugs
    .map(slug => {
      return getComparisonData(slug);
    })
    .filter((data): data is NeighborhoodComparison => data !== null);
}

/**
 * Get neighborhoods sorted by price (lowest first)
 */
export function getNeighborhoodsByPrice(propertyType: 'daire' | 'villa' | 'yazlik' = 'daire'): Array<{ mahalle: string; price: number }> {
  return Object.entries(NEIGHBORHOOD_COMPARISON_DATA)
    .map(([slug, data]) => ({
      mahalle: data.mahalle,
      price: data.averagePrice[propertyType],
    }))
    .sort((a, b) => a.price - b.price);
}

/**
 * Get neighborhoods sorted by investment potential
 */
export function getNeighborhoodsByInvestmentPotential(): Array<{ mahalle: string; potential: 'high' | 'medium' | 'low' }> {
  const potentialOrder = { high: 3, medium: 2, low: 1 };
  
  return Object.entries(NEIGHBORHOOD_COMPARISON_DATA)
    .map(([slug, data]) => ({
      mahalle: data.mahalle,
      potential: data.investmentPotential,
    }))
    .sort((a, b) => potentialOrder[b.potential] - potentialOrder[a.potential]);
}

