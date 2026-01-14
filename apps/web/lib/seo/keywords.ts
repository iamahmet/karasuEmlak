/**
 * SEO Keywords & Tone of Voice
 * Karasu Emlak için optimize edilmiş anahtar kelimeler ve içerik stratejisi
 */

export const primaryKeywords = [
  'karasu emlak',
  'karasu satılık daire',
  'karasu kiralık ev',
  'karasu villa',
  'karasu denize sıfır',
] as const;

export const secondaryKeywords = [
  'karasu emlak ilanları',
  'karasu gayrimenkul',
  'karasu yazlık',
  'karasu arsa',
  'sakarya karasu emlak',
  'karasu merkez daire',
  'karasu sahil villa',
  'karasu yatırım',
  'karasu ev fiyatları',
  'karasu emlak ofisi',
] as const;

export const longTailKeywords = [
  'karasu denize sıfır satılık villa',
  'karasu merkez kiralık daire fiyatları',
  'karasu sahil mahallesi satılık ev',
  'karasu emlak yatırım tavsiyesi',
  'karasu yazlık ev fiyatları 2025',
  'karasu kocaali emlak',
  'karasu 3+1 daire fiyatları',
  'karasu villa projeleri',
  'karasu arsa yatırımı',
  'karasu emlak piyasası',
] as const;

export const localKeywords = [
  'karasu merkez',
  'karasu sahil',
  'karasu liman',
  'karasu çamlık',
  'kocaali',
  'karasu mahalleler',
  'karasu bölgeler',
] as const;

/**
 * Tone of Voice Guidelines
 */
export const toneOfVoice = {
  style: 'Professional yet approachable',
  attributes: [
    'Güvenilir (Trustworthy)',
    'Uzman (Expert)',
    'Samimi (Friendly)',
    'Net (Clear)',
    'Yardımsever (Helpful)',
  ],
  avoid: [
    'Aşırı satış odaklı (Over-selling)',
    'Karmaşık jargon (Complex jargon)',
    'Belirsiz ifadeler (Vague statements)',
    'Abartılı vaatler (Exaggerated promises)',
  ],
  examples: {
    good: [
      '15 yıldır Karasu\'da güvenilir emlak hizmeti sunuyoruz',
      'Denize sıfır konumlarda size özel seçenekler',
      'Uzman ekibimiz hayalinizdeki evi bulmanıza yardımcı olur',
    ],
    bad: [
      'En iyi emlak firması!',
      'Garanti kar!',
      'Kaçırılmayacak fırsat!',
    ],
  },
};

/**
 * Content Structure Templates
 */
export const contentTemplates = {
  listingDescription: {
    structure: [
      'Giriş (1-2 cümle): Ana özellik + konum',
      'Özellikler (3-4 cümle): Detaylı açıklama',
      'Lokasyon (2-3 cümle): Mahalle, ulaşım, sosyal tesisler',
      'Yatırım (1-2 cümle): Değer artışı potansiyeli',
      'CTA (1 cümle): İletişim çağrısı',
    ],
    keywords: 'primary + location + property type',
    length: '150-250 words',
  },
  blogPost: {
    structure: [
      'H1: Ana başlık (primary keyword)',
      'Giriş: Problem/soru tanımla (100-150 kelime)',
      'H2: Ana konular (2-4 section)',
      'H3: Alt başlıklar (detaylar)',
      'Sonuç: Özet + CTA (50-100 kelime)',
    ],
    keywords: 'primary + 2-3 secondary + long-tail',
    length: '1500-2500 words',
  },
  neighborhoodPage: {
    structure: [
      'H1: [Mahalle] Emlak Rehberi',
      'Giriş: Genel tanıtım (150 kelime)',
      'H2: Konum ve Ulaşım',
      'H2: Yaşam Alanları',
      'H2: İlanlar ve Fiyatlar',
      'H2: Yatırım Potansiyeli',
      'H2: Sıkça Sorulan Sorular',
    ],
    keywords: 'location + emlak + specific features',
    length: '2000-3000 words',
  },
};

/**
 * Meta Description Templates
 */
export const metaTemplates = {
  homepage: (stats: { total: number }) => 
    `Karasu emlak ilanları: ${stats.total}+ satılık ve kiralık daire, villa, yazlık. Denize sıfır konumlar, uygun fiyatlar. 15 yıllık tecrübe.`,
  
  listing: (title: string, price: number, neighborhood: string) =>
    `${title} - ${neighborhood}. ₺${price.toLocaleString('tr-TR')}. Detaylı bilgi ve fotoğraflar için tıklayın. Karasu Emlak güvencesiyle.`,
  
  blog: (title: string, excerpt: string) =>
    `${title}. ${excerpt.substring(0, 100)}... Karasu emlak rehberleri ve uzman tavsiyeleri.`,
  
  neighborhood: (name: string, listingCount: number) =>
    `${name} mahallesi emlak ilanları. ${listingCount} aktif ilan. Konum bilgileri, fiyat analizi ve yatırım tavsiyeleri.`,
};

/**
 * Schema.org Data Generators
 */
export const schemaGenerators = {
  // Organization schema for footer
  organization: {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Karasu Emlak",
    "description": "Karasu ve çevresinde 15 yıldır güvenilir emlak danışmanlığı hizmeti",
    "url": "https://www.karasuemlak.net",
    "logo": "https://www.karasuemlak.net/logo.png",
    "image": "https://www.karasuemlak.net/og-image.jpg",
    "telephone": "+905325933854",
    "email": "info@karasuemlak.net",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Merkez Mahallesi",
      "addressLocality": "Karasu",
      "addressRegion": "Sakarya",
      "postalCode": "54500",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "41.0969",
      "longitude": "30.7856"
    },
    "areaServed": {
      "@type": "City",
      "name": "Karasu"
    },
    "priceRange": "₺₺",
    "openingHours": "Mo-Fr 09:00-18:00, Sa 09:00-14:00",
    "sameAs": [
      "https://facebook.com/karasuemlak",
      "https://instagram.com/karasuemlak",
      "https://twitter.com/karasuemlak"
    ]
  },

  // LocalBusiness schema for homepage
  localBusiness: (stats: { total: number; satilik: number; kiralik: number }) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Karasu Emlak",
    "image": "https://www.karasuemlak.net/og-image.jpg",
    "description": `Karasu'da ${stats.total}+ aktif ilan ile güvenilir emlak hizmeti. ${stats.satilik} satılık, ${stats.kiralik} kiralık seçenek.`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    },
    "priceRange": "₺₺"
  }),

  // WebSite schema for search
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Karasu Emlak",
    "url": "https://www.karasuemlak.net",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.karasuemlak.net/arama?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  },

  // BreadcrumbList schema
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),
};

/**
 * AI Content Generation Prompts
 */
export const aiPrompts = {
  listingDescription: (listing: any) => `
Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın.

Aşağıdaki gayrimenkul için SEO-optimized, satışa yönelik bir açıklama yaz:

Emlak: ${listing.property_type}
Durum: ${listing.status}
Konum: ${listing.location_neighborhood}, Karasu
Özellikler: ${JSON.stringify(listing.features)}
Fiyat: ₺${listing.price_amount}

Gereksinimler:
- Uzunluk: 150-200 kelime
- Ton: Profesyonel, güvenilir, samimi
- Anahtar kelimeler: "karasu ${listing.property_type}", "${listing.location_neighborhood}", "${listing.status}"
- Yapı: Giriş (özellikler) → Lokasyon (avantajlar) → Yatırım potansiyeli → CTA
- Abartısız, gerçekçi bilgiler
- SEO: Doğal keyword yerleştirme

Örnek başlangıç: "Karasu ${listing.location_neighborhood} mahallesinde..."
`,

  blogPost: (topic: string) => `
Sen Karasu emlak sektöründe uzman bir içerik yazarısın.

Konu: ${topic}

Aşağıdaki gereksinimlere uygun kapsamlı bir blog makalesi yaz:

SEO Gereksinimleri:
- Ana anahtar kelime: "karasu emlak" + konuya özel kelimeler
- Long-tail keywords: 3-4 adet
- Meta description: 150-160 karakter
- H1: Ana başlık (keyword içermeli)
- H2: 4-5 ana bölüm
- H3: Alt başlıklar (10-15 adet)

İçerik Yapısı:
1. Giriş (150 kelime): Problem/soru tanımla, okuyucuyu çek
2. Ana içerik (1200-1500 kelime): Detaylı bilgi, örnekler, veriler
3. Sonuç (100 kelime): Özet + CTA

Ton: Profesyonel, bilgilendirici, yardımsever
Hedef: Karasu'da ev almak/kiralamak isteyen kişiler
Stil: Net, anlaşılır, actionable

Ekstra:
- İç linkler için placeholder ekle: [Link: karasu mahalleler]
- İstatistikler ekle (gerçekçi)
- Pratik ipuçları ver
- SSS bölümü ekle (3-4 soru)
`,

  neighborhoodContent: (neighborhood: string) => `
Sen Karasu'yu çok iyi bilen yerel bir emlak uzmanısın.

${neighborhood} mahallesi için kapsamlı bir emlak rehberi oluştur:

Gereksinimler:
- Uzunluk: 2000-2500 kelime
- Ana keyword: "karasu ${neighborhood} emlak"
- Secondary: "${neighborhood} satılık daire", "${neighborhood} kiralık ev"

Bölümler:
1. Giriş: Mahalle tanıtımı (200 kelime)
2. Konum ve Ulaşım: Detaylı bilgi (300 kelime)
3. Yaşam Alanları: Sosyal tesisler, okullar, hastaneler (400 kelime)
4. Emlak Piyasası: Fiyatlar, trendler, istatistikler (400 kelime)
5. İlanlar: Mevcut seçenekler (300 kelime)
6. Yatırım Potansiyeli: Gelecek projeksiyon (300 kelime)
7. SSS: 5-6 soru-cevap (400 kelime)

Ton: Yerel uzman, güvenilir, bilgilendirici
Stil: Gerçekçi veriler, somut örnekler, pratik bilgiler

Not: İç linkler ekle (diğer mahalleler, blog yazıları)
`,
};

/**
 * SEO Validation Rules
 */
export const seoValidation = {
  title: {
    minLength: 30,
    maxLength: 60,
    shouldInclude: ['karasu', 'emlak'],
    pattern: /^[A-Za-zğüşıöçĞÜŞİÖÇ0-9\s\-,]+$/,
  },
  
  metaDescription: {
    minLength: 120,
    maxLength: 160,
    shouldInclude: ['karasu'],
    mustHaveCTA: true,
  },

  heading: {
    h1Count: 1,
    h2MinCount: 3,
    h3MinCount: 5,
    keywordInH1: true,
  },

  content: {
    minWords: 300,
    maxWords: 3000,
    keywordDensity: { min: 0.5, max: 2.5 }, // %
    readabilityScore: 60, // Flesch-Kincaid
  },

  images: {
    minCount: 1,
    maxCount: 20,
    altTextRequired: true,
    altTextMinLength: 10,
  },

  links: {
    internalMinCount: 3,
    internalMaxCount: 15,
    externalMaxCount: 5,
    noFollowExternal: true,
  },
};

/**
 * Content Quality Checker
 */
export function checkContentQuality(content: {
  title: string;
  description: string;
  body: string;
  keywords: string[];
}): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Title check
  if (content.title.length < seoValidation.title.minLength) {
    issues.push('Başlık çok kısa');
    score -= 10;
  }
  if (content.title.length > seoValidation.title.maxLength) {
    issues.push('Başlık çok uzun');
    score -= 5;
  }
  if (!content.title.toLowerCase().includes('karasu')) {
    issues.push('Başlıkta "karasu" kelimesi yok');
    score -= 15;
  }

  // Meta description check
  if (content.description.length < seoValidation.metaDescription.minLength) {
    issues.push('Meta açıklama çok kısa');
    score -= 10;
  }
  if (content.description.length > seoValidation.metaDescription.maxLength) {
    issues.push('Meta açıklama çok uzun');
    score -= 5;
  }

  // Content length check
  const wordCount = content.body.split(/\s+/).length;
  if (wordCount < seoValidation.content.minWords) {
    issues.push(`İçerik çok kısa (${wordCount} kelime)`);
    score -= 20;
  }

  // Keyword density check
  const bodyLower = content.body.toLowerCase();
  content.keywords.forEach(keyword => {
    const count = (bodyLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const density = (count / wordCount) * 100;
    
    if (density < seoValidation.content.keywordDensity.min) {
      suggestions.push(`"${keyword}" daha fazla kullanılabilir`);
    }
    if (density > seoValidation.content.keywordDensity.max) {
      issues.push(`"${keyword}" çok fazla kullanılmış (%${density.toFixed(1)})`);
      score -= 10;
    }
  });

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    suggestions,
  };
}

