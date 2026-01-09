/**
 * SEO Meta Optimizer
 * 
 * Utilities for optimizing meta descriptions, titles, and heading hierarchy
 */

export interface MetaOptimization {
  title: string;
  description: string;
  keywords: string[];
  h1?: string;
  h2s?: string[];
  h3s?: string[];
}

/**
 * Generate optimized meta description
 * - 150-160 characters (optimal for search results)
 * - Includes primary keyword
 * - Includes call to action or value proposition
 * - Natural, readable language
 */
export function generateMetaDescription(
  primaryKeyword: string,
  valueProposition: string,
  location?: string,
  maxLength: number = 160
): string {
  let description = valueProposition;
  
  // Add location if provided
  if (location && !description.toLowerCase().includes(location.toLowerCase())) {
    description = `${location} ${description}`;
  }
  
  // Ensure primary keyword is included
  if (!description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    description = `${primaryKeyword} - ${description}`;
  }
  
  // Truncate to max length, ensuring we don't cut words
  if (description.length > maxLength) {
    description = description.substring(0, maxLength);
    const lastSpace = description.lastIndexOf(' ');
    if (lastSpace > 0) {
      description = description.substring(0, lastSpace);
    }
    description += '...';
  }
  
  return description;
}

/**
 * Generate optimized title
 * - 50-60 characters (optimal for search results)
 * - Primary keyword at the beginning
 * - Brand name at the end
 * - Natural, readable
 */
export function generateMetaTitle(
  primaryKeyword: string,
  secondaryKeyword?: string,
  brandName: string = 'Karasu Emlak',
  maxLength: number = 60
): string {
  let title = primaryKeyword;
  
  if (secondaryKeyword && title.length + secondaryKeyword.length + 3 < maxLength) {
    title = `${title} | ${secondaryKeyword}`;
  }
  
  if (title.length + brandName.length + 3 < maxLength) {
    title = `${title} | ${brandName}`;
  }
  
  // Truncate if still too long
  if (title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + '...';
  }
  
  return title;
}

/**
 * Validate heading hierarchy
 * - Must have exactly one H1
 * - H2s should follow H1
 * - H3s should follow H2s
 * - No skipped levels
 */
export function validateHeadingHierarchy(headings: {
  h1?: string;
  h2s?: string[];
  h3s?: string[];
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Must have exactly one H1
  if (!headings.h1) {
    errors.push('Missing H1 heading');
  } else if (headings.h1.length > 100) {
    errors.push('H1 is too long (should be < 100 characters)');
  }
  
  // H2s should exist if H3s exist
  if (headings.h3s && headings.h3s.length > 0 && (!headings.h2s || headings.h2s.length === 0)) {
    errors.push('H3 headings found without H2 headings (hierarchy violation)');
  }
  
  // H2s should be reasonable length
  if (headings.h2s) {
    headings.h2s.forEach((h2, index) => {
      if (h2.length > 100) {
        errors.push(`H2 #${index + 1} is too long (should be < 100 characters)`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate keyword array from content
 * Extracts relevant keywords for meta keywords tag
 */
export function extractKeywords(
  primaryKeyword: string,
  location?: string,
  propertyType?: string,
  status?: string,
  additionalKeywords?: string[]
): string[] {
  const keywords: string[] = [primaryKeyword];
  
  if (location) {
    keywords.push(`${location} emlak`);
    keywords.push(`${location} satılık ev`);
    keywords.push(`${location} kiralık ev`);
  }
  
  if (propertyType) {
    keywords.push(`${propertyType} satılık`);
    keywords.push(`${propertyType} kiralık`);
  }
  
  if (status) {
    keywords.push(`${status} emlak`);
  }
  
  if (additionalKeywords) {
    keywords.push(...additionalKeywords);
  }
  
  // Remove duplicates and limit to 10
  return [...new Set(keywords)].slice(0, 10);
}

/**
 * Generate FAQ suggestions based on page type
 */
export function generateFAQSuggestions(
  pageType: 'listing' | 'guide' | 'hub' | 'neighborhood' | 'comparison',
  location?: string,
  propertyType?: string
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  
  switch (pageType) {
    case 'listing':
      faqs.push(
        {
          question: `${location || 'Karasu'}'da ${propertyType || 'ev'} fiyatları nasıl?`,
          answer: `${location || 'Karasu'} bölgesinde ${propertyType || 'ev'} fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.`,
        },
        {
          question: `${location || 'Karasu'}'da ${propertyType || 'ev'} alırken nelere dikkat edilmeli?`,
          answer: `${location || 'Karasu'}'da ${propertyType || 'ev'} alırken konum, fiyat, bina yaşı, yapı durumu, tapu durumu ve çevresel faktörler önemlidir. Profesyonel emlak danışmanımız size tüm bu konularda yardımcı olacaktır.`,
        }
      );
      break;
      
    case 'guide':
      faqs.push(
        {
          question: 'Emlak alım-satım süreci ne kadar sürer?',
          answer: 'Emlak alım-satım süreci genellikle 2-4 hafta arasında değişmektedir. Bu süre, tapu işlemleri, kredi onayı ve diğer yasal süreçlere bağlı olarak değişebilir.',
        },
        {
          question: 'Emlak danışmanı seçerken nelere dikkat edilmeli?',
          answer: 'Emlak danışmanı seçerken deneyim, referanslar, bölge bilgisi ve iletişim becerileri önemlidir. Lisanslı ve güvenilir bir danışman ile çalışmak tüm süreçte size avantaj sağlar.',
        }
      );
      break;
      
    case 'hub':
      faqs.push(
        {
          question: `${location || 'Karasu'} emlak piyasası nasıl?`,
          answer: `${location || 'Karasu'} emlak piyasası aktif ve çeşitli seçenekler sunmaktadır. Denize yakın konumu, turizm potansiyeli ve gelişen altyapısı ile yatırımcıların ilgisini çekmektedir.`,
        },
        {
          question: `${location || 'Karasu'} yatırım için uygun mu?`,
          answer: `Evet, ${location || 'Karasu'} yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler, denize yakın konumlar ve turizm potansiyeli yüksek alanlar yatırımcıların ilgisini çekmektedir.`,
        }
      );
      break;
      
    case 'neighborhood':
      faqs.push(
        {
          question: `${location || 'Karasu'} ${propertyType || 'mahallesi'} hakkında bilgi alabilir miyim?`,
          answer: `${location || 'Karasu'} ${propertyType || 'mahallesi'} hakkında detaylı bilgi için mahalle rehberimizi inceleyebilir veya bizimle iletişime geçebilirsiniz.`,
        }
      );
      break;
      
    case 'comparison':
      faqs.push(
        {
          question: 'Hangi bölge daha avantajlı?',
          answer: 'Her bölge kendine özgü avantajlar sunar. Bütçe, yaşam tarzı tercihleri ve yatırım amaçlarına göre en uygun bölgeyi belirlemek için profesyonel danışmanlık almanız önerilir.',
        }
      );
      break;
  }
  
  return faqs;
}
