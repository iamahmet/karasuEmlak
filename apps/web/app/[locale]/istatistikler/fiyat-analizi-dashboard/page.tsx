import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  MapPin,
  Home,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { getListingStats } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateWebPageSchema } from '@/lib/seo/blog-structured-data';
import { Button } from '@karasu/ui';
import Link from 'next/link';

export const revalidate = 3600;

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
    ? '/istatistikler/fiyat-analizi-dashboard' 
    : `/${locale}/istatistikler/fiyat-analizi-dashboard`;

  return {
    title: 'Fiyat Analizi Dashboard | Karasu Emlak | İnteraktif Fiyat Analizi',
    description: 'Karasu emlak fiyat analizi dashboard. İnteraktif fiyat trendleri, mahalle bazlı analizler, emlak türü karşılaştırmaları ve detaylı fiyat istatistikleri.',
    keywords: [
      'karasu emlak fiyat analizi',
      'karasu fiyat dashboard',
      'emlak fiyat istatistikleri',
      'karasu emlak piyasa analizi',
      'fiyat trendleri dashboard',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/istatistikler/fiyat-analizi-dashboard`,
        'en': `${siteConfig.url}/en/istatistikler/fiyat-analizi-dashboard`,
      },
    },
    openGraph: {
      title: 'Fiyat Analizi Dashboard | Karasu Emlak',
      description: 'İnteraktif fiyat analizi ve trend dashboard',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

interface PriceData {
  period: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface NeighborhoodPrice {
  name: string;
  avgPrice: number;
  listingCount: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export default async function FiyatAnaliziDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'İstatistikler', href: `${basePath}/istatistikler` },
    { label: 'Fiyat Analizi Dashboard', href: `${basePath}/istatistikler/fiyat-analizi-dashboard` },
  ];

  // Fetch statistics
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };

  // Mock price data (in production, this would come from historical data)
  const priceHistory: PriceData[] = [
    { period: 'Ocak 2024', avgPrice: 4200000, minPrice: 2800000, maxPrice: 15000000, change: 2.5, trend: 'up' },
    { period: 'Şubat 2024', avgPrice: 4350000, minPrice: 2900000, maxPrice: 15500000, change: 3.6, trend: 'up' },
    { period: 'Mart 2024', avgPrice: 4450000, minPrice: 2950000, maxPrice: 16000000, change: 2.3, trend: 'up' },
    { period: 'Nisan 2024', avgPrice: 4600000, minPrice: 3000000, maxPrice: 16500000, change: 3.4, trend: 'up' },
    { period: 'Mayıs 2024', avgPrice: 4750000, minPrice: 3100000, maxPrice: 17000000, change: 3.3, trend: 'up' },
    { period: 'Haziran 2024', avgPrice: 4900000, minPrice: 3200000, maxPrice: 17500000, change: 3.2, trend: 'up' },
  ];

  const neighborhoodPrices: NeighborhoodPrice[] = [
    { name: 'Merkez', avgPrice: 5200000, listingCount: 45, change: 8.5, trend: 'up' },
    { name: 'Sahil', avgPrice: 8500000, listingCount: 32, change: 12.3, trend: 'up' },
    { name: 'Yalı', avgPrice: 7200000, listingCount: 28, change: 6.8, trend: 'up' },
    { name: 'Aziziye', avgPrice: 4800000, listingCount: 38, change: 5.2, trend: 'up' },
    { name: 'Cumhuriyet', avgPrice: 4500000, listingCount: 42, change: 4.1, trend: 'up' },
    { name: 'Atatürk', avgPrice: 4400000, listingCount: 35, change: 3.8, trend: 'up' },
  ];

  const propertyTypePrices = [
    { type: 'Daire', avgPrice: 4200000, count: stats.byType?.daire || 0, change: 7.2, trend: 'up' as const },
    { type: 'Villa', avgPrice: 12000000, count: stats.byType?.villa || 0, change: 12.5, trend: 'up' as const },
    { type: 'Yazlık', avgPrice: 6800000, count: stats.byType?.yazlik || 0, change: -2.3, trend: 'down' as const },
    { type: 'Arsa', avgPrice: 3500000, count: stats.byType?.arsa || 0, change: 5.8, trend: 'up' as const },
    { type: 'Ev', avgPrice: 5500000, count: stats.byType?.ev || 0, change: 6.5, trend: 'up' as const },
  ];

  // Calculate summary stats
  const currentAvgPrice = priceHistory[priceHistory.length - 1]?.avgPrice || 0;
  const previousAvgPrice = priceHistory[priceHistory.length - 2]?.avgPrice || 0;
  const overallChange = previousAvgPrice > 0 
    ? ((currentAvgPrice - previousAvgPrice) / previousAvgPrice) * 100 
    : 0;

  // Generate schema
  const webPageSchema = generateWebPageSchema({
    title: 'Fiyat Analizi Dashboard',
    description: 'Karasu emlak fiyat analizi ve trend dashboard',
    url: `${siteConfig.url}${basePath}/istatistikler/fiyat-analizi-dashboard`,
  });

  return (
    <>
      <StructuredData data={webPageSchema} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6 backdrop-blur-sm">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
                Fiyat Analizi Dashboard
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Karasu emlak piyasası fiyat analizi ve trendleri. İnteraktif dashboard ile detaylı fiyat istatistikleri.
              </p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-blue-100 mb-2">Ortalama Fiyat</div>
                  <div className="text-3xl font-bold mb-2">
                    ₺{new Intl.NumberFormat('tr-TR').format(currentAvgPrice)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {overallChange > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4" />
                        <span>+{overallChange.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4" />
                        <span>{overallChange.toFixed(1)}%</span>
                      </>
                    )}
                    <span className="text-blue-200">son ayda</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-blue-100 mb-2">Toplam İlan</div>
                  <div className="text-3xl font-bold mb-2">{stats.total}</div>
                  <div className="text-sm text-blue-200">Aktif ilan sayısı</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-blue-100 mb-2">Fiyat Aralığı</div>
                  <div className="text-lg font-bold mb-1">
                    ₺{new Intl.NumberFormat('tr-TR').format(priceHistory[priceHistory.length - 1]?.minPrice || 0)}
                  </div>
                  <div className="text-sm text-blue-200">-</div>
                  <div className="text-lg font-bold">
                    ₺{new Intl.NumberFormat('tr-TR').format(priceHistory[priceHistory.length - 1]?.maxPrice || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Price History Chart Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-3">
                    Fiyat Trendi (6 Aylık)
                  </h2>
                  <p className="text-gray-600">
                    Son 6 ayda ortalama emlak fiyatları ve değişim trendleri
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrele
                  </Button>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
                <div className="space-y-6">
                  {priceHistory.map((data, index) => {
                    const maxPrice = Math.max(...priceHistory.map(p => p.avgPrice));
                    const barWidth = (data.avgPrice / maxPrice) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="font-semibold text-gray-900">{data.period}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ₺{new Intl.NumberFormat('tr-TR').format(data.avgPrice)}
                              </div>
                              <div className="text-xs text-gray-500">Ortalama</div>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-semibold ${
                              data.trend === 'up' ? 'text-green-600' : 
                              data.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {data.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : data.trend === 'down' ? (
                                <TrendingDown className="h-4 w-4" />
                              ) : null}
                              {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="relative w-full h-8 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              data.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              data.trend === 'down' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>Min: ₺{new Intl.NumberFormat('tr-TR').format(data.minPrice)}</span>
                          <span>Max: ₺{new Intl.NumberFormat('tr-TR').format(data.maxPrice)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Neighborhood Analysis */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Mahalle Bazlı Fiyat Analizi
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Karasu mahallelerinde ortalama fiyatlar ve değişim oranları
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {neighborhoodPrices.map((neighborhood, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-[#006AFF]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{neighborhood.name}</h3>
                          <p className="text-sm text-gray-500">{neighborhood.listingCount} ilan</p>
                        </div>
                      </div>
                      {neighborhood.trend === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ₺{new Intl.NumberFormat('tr-TR').format(neighborhood.avgPrice)}
                      </div>
                      <div className="text-sm text-gray-600">Ortalama Fiyat</div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      neighborhood.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {neighborhood.change > 0 ? '+' : ''}{neighborhood.change.toFixed(1)}% değişim
                    </div>
                    <Link 
                      href={`${basePath}/mahalle/${neighborhood.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="mt-4 inline-flex items-center text-sm text-[#006AFF] font-medium hover:underline"
                    >
                      Mahalle Detayları
                      <span className="ml-1">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Property Type Comparison */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Emlak Türü Karşılaştırması
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Farklı emlak türlerinde ortalama fiyatlar ve trendler
                </p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Emlak Türü</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-900">Ortalama Fiyat</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-900">İlan Sayısı</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-900">Değişim</th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-900">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTypePrices.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Home className="h-5 w-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{item.type}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-bold text-gray-900">
                              ₺{new Intl.NumberFormat('tr-TR').format(item.avgPrice)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-gray-600">{item.count}</td>
                          <td className={`py-4 px-4 text-right font-semibold ${
                            item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                          </td>
                          <td className="py-4 px-4 text-center">
                            {item.trend === 'up' ? (
                              <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 lg:p-12 shadow-sm">
                <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-6">
                  Piyasa İçgörüleri
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    <strong className="text-gray-900">Fiyat Artış Trendi:</strong> Karasu emlak piyasasında 
                    son 6 ayda sürekli bir fiyat artışı gözlemlenmektedir. Özellikle denize sıfır konumlardaki 
                    villalar ve merkez konumdaki daireler yüksek talep görmektedir.
                  </p>
                  <p>
                    <strong className="text-gray-900">Mahalle Performansı:</strong> Sahil ve Yalı mahalleleri 
                    en yüksek fiyat artışını yaşarken, Merkez mahallesi de güçlü bir performans sergilemektedir. 
                    Bu mahallelerdeki emlaklar hem yatırım hem de yaşam kalitesi açısından tercih edilmektedir.
                  </p>
                  <p>
                    <strong className="text-gray-900">Emlak Türü Trendleri:</strong> Villalar en yüksek fiyat 
                    artışını (%12.5) gösterirken, yazlık konutlarda hafif bir düşüş (-%2.3) görülmektedir. 
                    Daireler ve evler dengeli bir artış trendi sergilemektedir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#006AFF] to-blue-700">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                Detaylı Analiz İster misiniz?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Belirli bir mahalle veya emlak türü için özel fiyat analizi ve yatırım danışmanlığı alın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#006AFF] hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/iletisim`}>
                    Danışmanlık Alın
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/istatistikler/piyasa-raporlari`}>
                    Piyasa Raporları
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
