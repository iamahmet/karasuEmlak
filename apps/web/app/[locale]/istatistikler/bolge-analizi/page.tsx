import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PieChart, MapPin, TrendingUp, Building2, Home } from 'lucide-react';
import { getNeighborhoodStats } from '@/lib/supabase/queries/neighborhood-stats';
import { withTimeout } from '@/lib/utils/timeout';
import { PageIntro } from '@/components/content/PageIntro';
import { ContentSection } from '@/components/content/ContentSection';
import { FAQBlock } from '@/components/content/FAQBlock';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { generateSlug } from '@/lib/utils';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/istatistikler/bolge-analizi' 
    : `/${locale}/istatistikler/bolge-analizi`;

  return {
    title: 'Bölge Analizi | Karasu Emlak | Mahalle Bazlı Emlak Analizleri',
    description: 'Karasu bölgesi emlak analizi ve istatistikleri. Mahalle bazlı detaylı analizler, fiyat dağılımları ve yatırım potansiyeli değerlendirmeleri.',
    keywords: [
      'karasu bölge analizi',
      'karasu mahalle analizi',
      'karasu emlak bölge istatistikleri',
      'karasu mahalle fiyatları',
      'karasu emlak piyasası analizi',
      'karasu yatırım bölgeleri',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/istatistikler/bolge-analizi`,
        'en': `${siteConfig.url}/en/istatistikler/bolge-analizi`,
        'et': `${siteConfig.url}/et/istatistikler/bolge-analizi`,
        'ru': `${siteConfig.url}/ru/istatistikler/bolge-analizi`,
        'ar': `${siteConfig.url}/ar/istatistikler/bolge-analizi`,
      },
    },
    openGraph: {
      title: 'Bölge Analizi | Karasu Emlak',
      description: 'Karasu bölgesi emlak analizi ve istatistikleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Bölge Analizi',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Bölge Analizi | Karasu Emlak',
      description: 'Karasu bölgesi emlak analizi ve istatistikleri.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BolgeAnaliziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'İstatistikler', href: `${basePath}/istatistikler` },
    { label: 'Bölge Analizi', href: `${basePath}/istatistikler/bolge-analizi` },
  ];

  // Fetch neighborhood statistics
  const neighborhoodStatsResult = await withTimeout(getNeighborhoodStats(), 3000, []);
  const neighborhoodStats = neighborhoodStatsResult || [];

  // Top neighborhoods by listings
  const topNeighborhoods = neighborhoodStats.slice(0, 6);

  const faqs = [
    {
      question: 'Bölge analizi nasıl yapılıyor?',
      answer: 'Bölge analizi, mahalle bazlı ilan sayıları, ortalama fiyatlar, satılık/kiralık dağılımı ve piyasa aktivitesi dikkate alınarak yapılmaktadır. Veriler düzenli olarak güncellenmektedir.',
    },
    {
      question: 'Hangi mahalleler en popüler?',
      answer: 'Denize sıfır konumdaki mahalleler (Sahil, Yalı) ve merkez konumdaki mahalleler (Merkez, Çamlık) en yüksek talep görmektedir. Detaylı bilgi için mahalle sayfalarımızı ziyaret edebilirsiniz.',
    },
    {
      question: 'Bölge analizi yatırım kararlarım için yeterli mi?',
      answer: 'Bölge analizi önemli bir rehberdir ancak yatırım kararlarınızda mutlaka profesyonel danışmanlık almanızı öneririz. Detaylı analiz için bizimle iletişime geçebilirsiniz.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={breadcrumbs} />
        
        <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <PageIntro
            title="Bölge Analizi"
            description="Karasu bölgesi detaylı emlak analizi. Mahalle bazlı istatistikler, fiyat dağılımları ve yatırım potansiyeli değerlendirmeleri."
            stats={[
              { label: 'Analiz Edilen Mahalle', value: neighborhoodStats.length },
              { label: 'Toplam İlan', value: neighborhoodStats.reduce((sum, n) => sum + n.totalListings, 0) },
            ]}
          />

          {/* Top Neighborhoods */}
          {topNeighborhoods.length > 0 && (
            <ContentSection
              title="En Aktif Mahalleler"
              description="En çok ilan bulunan mahalleler ve temel göstergeler"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topNeighborhoods.map((neighborhood, index) => (
                  <div
                    key={neighborhood.name}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#006AFF] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#006AFF]/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-[#006AFF]">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{neighborhood.name}</h3>
                        <p className="text-sm text-gray-600">Mahallesi</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Toplam İlan
                        </span>
                        <span className="font-semibold text-gray-900">{neighborhood.totalListings}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Satılık
                        </span>
                        <span className="font-semibold text-green-600">{neighborhood.satilikCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Kiralık
                        </span>
                        <span className="font-semibold text-purple-600">{neighborhood.kiralikCount}</span>
                      </div>
                      
                      {neighborhood.avgPrice > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ortalama Fiyat</span>
                            <span className="text-lg font-bold text-[#006AFF]">
                              ₺{new Intl.NumberFormat('tr-TR').format(neighborhood.avgPrice)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`${basePath}/mahalle/${generateSlug(neighborhood.name)}`}>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <MapPin className="h-4 w-4 mr-2" />
                        Mahalle Detayları
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Regional Insights */}
          <ContentSection
            title="Bölgesel İçgörüler"
            description="Karasu bölgesi emlak piyasası hakkında önemli bilgiler"
          >
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Karasu bölgesi, denize sıfır konumu ve doğal güzellikleri ile emlak yatırımcıları için 
                cazip bir bölgedir. Özellikle yazlık konut ve denize yakın villalar yüksek talep görmektedir.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Bölge analizi, mahalle bazlı detaylı istatistikler ve fiyat dağılımları ile yatırımcılara 
                ve emlak alıcılarına rehberlik etmektedir. Her mahalle için özel analiz ve yatırım 
                potansiyeli değerlendirmeleri sunulmaktadır.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Bölge Özellikleri</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Denize sıfır konum avantajı</li>
                <li>Gelişen altyapı ve ulaşım imkanları</li>
                <li>Yüksek turizm potansiyeli</li>
                <li>Doğal güzellikler ve yaşam kalitesi</li>
                <li>Uzun vadeli değer artışı potansiyeli</li>
              </ul>
            </div>
          </ContentSection>

          {/* FAQ Section */}
          <FAQBlock faqs={faqs} title="Bölge Analizi Hakkında Sık Sorulan Sorular" />

          {/* CTA Section */}
          <section className="mt-12 bg-gradient-to-r from-[#006AFF] to-[#0052CC] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Özel Bölge Analizi İster misiniz?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Belirli bir mahalle veya bölge için detaylı analiz ve yatırım danışmanlığı için bizimle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-[#006AFF] hover:bg-gray-100">
                <Link href={`${basePath}/iletisim`}>İletişime Geç</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href={`${basePath}/istatistikler/piyasa-raporlari`}>Piyasa Raporları</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
