/**
 * Create general cornerstone pages: /satilik-daire, /satilik-villa, etc.
 * These are general pages (not location-specific like /karasu-satilik-daire)
 */

import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(process.cwd(), 'apps/web/app/[locale]');

// Page configurations
const pages = [
  {
    slug: 'satilik-daire',
    title: 'Satılık Daire',
    propertyType: 'daire',
    status: 'satilik',
    description: 'Türkiye\'de satılık daire ilanları. 1+1\'den 4+1\'e kadar geniş seçenek.',
    keywords: ['satılık daire', 'satılık daireler', 'satılık daire ilanları', 'satılık daire fiyatları'],
  },
  {
    slug: 'satilik-villa',
    title: 'Satılık Villa',
    propertyType: 'villa',
    status: 'satilik',
    description: 'Türkiye\'de satılık villa ilanları. Denize sıfır konumlarda bahçeli, havuzlu lüks villalar.',
    keywords: ['satılık villa', 'satılık villalar', 'satılık villa ilanları', 'satılık villa fiyatları'],
  },
  {
    slug: 'satilik-yazlik',
    title: 'Satılık Yazlık',
    propertyType: 'yazlik',
    status: 'satilik',
    description: 'Türkiye\'de satılık yazlık ilanları. Denize yakın konumlarda uygun fiyatlı yazlık evler.',
    keywords: ['satılık yazlık', 'satılık yazlık ev', 'satılık yazlık ilanları', 'satılık yazlık fiyatları'],
  },
  {
    slug: 'satilik-ev',
    title: 'Satılık Ev',
    propertyType: 'ev',
    status: 'satilik',
    description: 'Türkiye\'de satılık ev ilanları. Müstakil evler, bahçeli konutlar ve geniş yaşam alanları.',
    keywords: ['satılık ev', 'satılık evler', 'satılık konut', 'satılık müstakil ev'],
  },
  {
    slug: 'satilik-arsa',
    title: 'Satılık Arsa',
    propertyType: 'arsa',
    status: 'satilik',
    description: 'Türkiye\'de satılık arsa ilanları. İmarlı arsalar, yatırım arsaları ve gelişim potansiyeli yüksek bölgeler.',
    keywords: ['satılık arsa', 'satılık arsalar', 'satılık arsa ilanları', 'imarlı arsa'],
  },
  {
    slug: 'kiralik-daire',
    title: 'Kiralık Daire',
    propertyType: 'daire',
    status: 'kiralik',
    description: 'Türkiye\'de kiralık daire ilanları. 1+1\'den 4+1\'e kadar geniş seçenek. Aylık kira fiyatları.',
    keywords: ['kiralık daire', 'kiralık daireler', 'kiralık daire ilanları', 'kiralık daire fiyatları'],
  },
  {
    slug: 'kiralik-ev',
    title: 'Kiralık Ev',
    propertyType: 'ev',
    status: 'kiralik',
    description: 'Türkiye\'de kiralık ev ilanları. Müstakil evler, bahçeli konutlar. Aylık kira fiyatları.',
    keywords: ['kiralık ev', 'kiralık evler', 'kiralık konut', 'kiralık müstakil ev'],
  },
  {
    slug: 'kiralik-villa',
    title: 'Kiralık Villa',
    propertyType: 'villa',
    status: 'kiralik',
    description: 'Türkiye\'de kiralık villa ilanları. Denize sıfır konumlarda bahçeli, havuzlu lüks villalar.',
    keywords: ['kiralık villa', 'kiralık villalar', 'kiralık villa ilanları', 'kiralık villa fiyatları'],
  },
];

// Template for page content (simplified version)
const pageTemplate = (page: typeof pages[0]) => `import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generateRealEstateAgentLocalSchema } from '@/lib/seo/local-seo-schemas';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import { getListings, getNeighborhoods, getListingStats } from '@/lib/supabase/queries';
import { getHighPriorityQAEntries } from '@/lib/supabase/queries/qa';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

export const revalidate = 3600;

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/${page.slug}' : \`/\${locale}/${page.slug}\`;
  
  return {
    title: ${JSON.stringify(page.title + ' | En Güncel İlanlar ve Fiyatlar 2025 | Karasu Emlak')},
    description: ${JSON.stringify(page.description + ' Güncel fiyatlar, mahalle rehberi ve yatırım analizi. Uzman emlak danışmanlığı.')},
    keywords: ${JSON.stringify(page.keywords)},
    alternates: {
      canonical: \`\${siteConfig.url}\${canonicalPath}\`,
      languages: {
        'tr': '/${page.slug}',
        'en': '/en/${page.slug}',
        'et': '/et/${page.slug}',
        'ru': '/ru/${page.slug}',
        'ar': '/ar/${page.slug}',
      },
    },
    openGraph: {
      title: ${JSON.stringify(page.title + ' | En Güncel İlanlar 2025')},
      description: ${JSON.stringify(page.description)},
      url: \`\${siteConfig.url}\${canonicalPath}\`,
      type: 'article',
      images: [{ url: \`\${siteConfig.url}/og-image.jpg\`, width: 1200, height: 630, alt: ${JSON.stringify(page.title)} }],
    },
    robots: { index: true, follow: true },
  };
}

async function getFAQs() {
  try {
    const faqs = await getHighPriorityQAEntries('${page.slug}', 10);
    if (faqs && faqs.length > 0) return faqs.map(q => ({ question: q.question, answer: q.answer }));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
  }
  return [];
}

export default async function ${page.slug.split('-').map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : \`/\${locale}\`;
  
  const allListingsResult = await withTimeout(
    getListings({ status: '${page.status}', property_type: ['${page.propertyType}'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  
  const { listings = [] } = allListingsResult || {};
  const neighborhoods = neighborhoodsResult || [];
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
  
  const filteredListings = listings.filter(l => l.property_type === '${page.propertyType}');
  
  const prices = filteredListings.filter(l => l.price_amount && l.price_amount > 0).map(l => l.price_amount!);
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  
  const faqs = await getFAQs();
  
  const articleSchema = generateArticleSchema({
      headline: ${JSON.stringify(page.title + ' | En Güncel İlanlar ve Fiyatlar 2025')},
      description: ${JSON.stringify(page.description)},
    image: [\`\${siteConfig.url}/og-image.jpg\`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });
  
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: \`\${siteConfig.url}\${basePath}/\` },
      { name: ${JSON.stringify(page.status === 'satilik' ? 'Satılık' : 'Kiralık') + ' İlanlar'}, url: \`\${siteConfig.url}\${basePath}/${page.status === 'satilik' ? 'satilik' : 'kiralik'}\` },
      { name: ${JSON.stringify(page.title)}, url: \`\${siteConfig.url}\${basePath}/${page.slug}\` },
    ],
    \`\${siteConfig.url}\${basePath}/${page.slug}\`
  );
  
  const realEstateAgentSchema = generateRealEstateAgentLocalSchema({
    includeRating: true,
    includeServices: true,
    includeAreaServed: true,
  });
  
  const itemListSchema = filteredListings.length > 0
    ? generateItemListSchema(filteredListings.slice(0, 20), \`\${siteConfig.url}\${basePath}\`, {
        name: ${JSON.stringify(page.title + ' İlanları')},
        description: \`Türkiye'de \${filteredListings.length} adet ${JSON.stringify(page.title.toLowerCase())} ilanı.\`,
      })
    : null;

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={realEstateAgentSchema} />
      {itemListSchema && <StructuredData data={itemListSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: \`\${basePath}/\` },
          { label: ${JSON.stringify(page.status === 'satilik' ? 'Satılık' : 'Kiralık') + ' İlanlar'}, href: \`\${basePath}/${page.status === 'satilik' ? 'satilik' : 'kiralik'}\` },
          { label: ${JSON.stringify(page.title)}, href: \`\${basePath}/${page.slug}\` },
        ]}
      />

      <main className="min-h-screen bg-white">
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    {filteredListings.length}+ Aktif İlan
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  {${JSON.stringify(page.title)}}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  {${JSON.stringify(page.description + ' Güncel fiyatlar, mahalle rehberi ve yatırım analizi. Uzman emlak danışmanlığı ile hayalinizdeki ' + (page.propertyType === 'daire' ? 'daireyi' : page.propertyType === 'villa' ? 'villayı' : page.propertyType === 'yazlik' ? 'yazlığı' : page.propertyType === 'ev' ? 'evi' : 'arsayı') + ' bulun.')}}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={\`\${basePath}/${page.status}?propertyType=${page.propertyType}\`}>
                      <Home className="w-5 h-5 mr-2" />
                      Tüm İlanları Görüntüle
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <Link href={\`\${basePath}/iletisim\`}>
                      <Phone className="w-5 h-5 mr-2" />
                      İletişime Geçin
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="py-8 bg-white border-b border-gray-200 -mt-4 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{filteredListings.length}</div>
                <div className="text-sm text-gray-600">Aktif İlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{neighborhoods.length}</div>
                <div className="text-sm text-gray-600">Mahalle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgPrice ? \`₺\${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K\` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Fiyat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Danışmanlık</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-12">
                <ScrollReveal direction="up" delay={0}>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>${page.title}</strong> arayanlar için geniş bir seçenek yelpazesi mevcuttur. 
                      Fiyatlar konum, metrekare ve özelliklere göre değişmektedir. 
                      Merkez mahalleler ve gelişen bölgeler daha yüksek fiyatlara sahiptir. 
                      Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır.
                    </p>
                  </div>
                </ScrollReveal>

                {filteredListings.length > 0 && (
                  <ScrollReveal direction="up" delay={200}>
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                          Öne Çıkan ${page.title} İlanları
                        </h2>
                        <Link href={\`\${basePath}/${page.status}?propertyType=${page.propertyType}\`}>
                          <Button variant="ghost" size="sm">
                            Tümünü Gör
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredListings.slice(0, 6).map((listing) => (
                          <ListingCard key={listing.id} listing={listing} basePath={basePath} />
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {faqs.length > 0 && (
                  <ScrollReveal direction="up" delay={400}>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Sık Sorulan Sorular
                      </h2>
                      <div className="space-y-4">
                        {faqs.map((faq, index) => (
                          <div key={index} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                )}
              </div>

              <aside className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İstatistikler</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam İlan</span>
                      <span className="font-bold text-gray-900">{filteredListings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ortalama Fiyat</span>
                      <span className="font-bold text-gray-900">
                        {avgPrice ? \`₺\${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K\` : 'Değişken'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">İlgili Sayfalar</h3>
                  <div className="space-y-2">
                    <Link href={\`\${basePath}/karasu-${page.slug}\`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Karasu ${page.title}</div>
                      <div className="text-sm text-gray-600">Karasu'ya özel rehber</div>
                    </Link>
                    <Link href={\`\${basePath}/${page.status}\`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Tüm ${page.status === 'satilik' ? 'Satılık' : 'Kiralık'} İlanlar</div>
                      <div className="text-sm text-gray-600">Tüm ilanları görüntüle</div>
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {${JSON.stringify('Hayalinizdeki ' + (page.propertyType === 'daire' ? 'Daireyi' : page.propertyType === 'villa' ? 'Villayı' : page.propertyType === 'yazlik' ? 'Yazlığı' : page.propertyType === 'ev' ? 'Evi' : 'Arsayı') + ' Bulun')}}
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                {${JSON.stringify('Geniş ilan yelpazesi ve uzman danışmanlık hizmeti ile size en uygun ' + (page.propertyType === 'daire' ? 'daireyi' : page.propertyType === 'villa' ? 'villayı' : page.propertyType === 'yazlik' ? 'yazlığı' : page.propertyType === 'ev' ? 'evi' : 'arsayı') + ' bulmanıza yardımcı oluyoruz.')}}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link href={\`\${basePath}/${page.status}?propertyType=${page.propertyType}\`}>
                    İlan Ara
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={\`\${basePath}/iletisim\`}>
                    İletişime Geçin
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
`;

// Create directories and files
pages.forEach(page => {
  const dirPath = path.join(baseDir, page.slug);
  const filePath = path.join(dirPath, 'page.tsx');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
  
  // Create file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, pageTemplate(page), 'utf-8');
    console.log(`✅ Created page: ${filePath}`);
  } else {
    console.log(`⏭️  Skipped (already exists): ${filePath}`);
  }
});

console.log(`\n✅ Created ${pages.length} cornerstone pages!`);
