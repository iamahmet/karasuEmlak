import { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import { napData } from '@karasu-emlak/config';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { COOKIE_INVENTORY, COOKIE_CATEGORY_DESCRIPTIONS, getThirdPartyCookies } from '@/lib/cookies/cookie-types';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
import { 
  Cookie, 
  Shield, 
  Settings, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Mail,
  Phone,
  FileText,
  Lock,
  Eye,
  BarChart3,
  Target,
  Zap,
  ChevronRight,
  Globe,
  Clock,
  Database
} from 'lucide-react';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Çerez Politikası | KVKK ve GDPR Uyumlu | Karasu Emlak',
    description: 'Karasu Emlak çerez politikası. KVKK ve GDPR uyumlu çerez kullanımı, çerez türleri, üçüncü taraf çerezler ve çerez yönetimi hakkında detaylı bilgi.',
    keywords: [
      'çerez politikası',
      'cookie policy',
      'KVKK uyumlu çerezler',
      'GDPR uyumlu çerezler',
      'çerez yönetimi',
      'kişisel veri koruma',
      'çerez tercihleri',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/cerez-politikasi`,
      languages: pruneHreflangLanguages({
        'tr': '/cerez-politikasi',
        'en': '/en/cerez-politikasi',
      }),
    },
    openGraph: {
      title: 'Çerez Politikası | KVKK ve GDPR Uyumlu | Karasu Emlak',
      description: 'Karasu Emlak çerez politikası. KVKK ve GDPR uyumlu çerez kullanımı ve yönetimi hakkında detaylı bilgi.',
      url: `${siteConfig.url}${basePath}/cerez-politikasi`,
      type: 'website',
    },
  };
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const lastUpdated = new Date('2026-01-27');

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Çerez Politikası', href: `${basePath}/cerez-politikasi` },
  ];

  const necessaryCookies = COOKIE_INVENTORY.filter(c => c.category === 'necessary');
  const analyticsCookies = COOKIE_INVENTORY.filter(c => c.category === 'analytics');
  const marketingCookies = COOKIE_INVENTORY.filter(c => c.category === 'marketing');
  const functionalCookies = COOKIE_INVENTORY.filter(c => c.category === 'functional');
  const thirdPartyCookies = getThirdPartyCookies();

  // Schema.org structured data
  const cookiePolicySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Çerez Politikası',
    description: 'Karasu Emlak çerez politikası ve KVKK/GDPR uyumluluk bilgileri',
    url: `${siteConfig.url}${basePath}/cerez-politikasi`,
    dateModified: lastUpdated.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href ? `${siteConfig.url}${crumb.href}` : undefined,
    })),
  };

  return (
    <>
      <StructuredData data={cookiePolicySchema} />
      <StructuredData data={breadcrumbSchema} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Cookie className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  Çerez Politikası
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                KVKK ve GDPR uyumlu çerez kullanımı ve yönetimi hakkında kapsamlı bilgi
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Son güncelleme: {lastUpdated.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>KVKK & GDPR Uyumlu</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-6 max-w-7xl py-12 lg:py-16">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Quick Navigation */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Hızlı Navigasyon
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <a href="#cerez-nedir" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ChevronRight className="w-4 h-4" />
                    Çerez Nedir?
                  </a>
                  <a href="#cerez-turleri" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ChevronRight className="w-4 h-4" />
                    Çerez Türleri
                  </a>
                  <a href="#kullandigimiz-cerezler" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ChevronRight className="w-4 h-4" />
                    Kullandığımız Çerezler
                  </a>
                  <a href="#cerez-yonetimi" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ChevronRight className="w-4 h-4" />
                    Çerez Yönetimi
                  </a>
                  <a href="#yasal-haklar" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ChevronRight className="w-4 h-4" />
                    Yasal Haklarınız
                  </a>
                  <a href="#iletisim" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ChevronRight className="w-4 h-4" />
                    İletişim
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Çerez Nedir? */}
            <Card id="cerez-nedir">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Çerez Nedir?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Çerezler (cookies), web sitelerini ziyaret ettiğinizde cihazınıza (bilgisayar, tablet, telefon) kaydedilen küçük metin dosyalarıdır. 
                  Bu dosyalar, web sitesinin düzgün çalışmasını sağlar, kullanıcı deneyimini iyileştirir ve web sitesi sahiplerinin 
                  sitelerini nasıl kullanıldığını anlamalarına yardımcı olur.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Önemli Bilgi
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Çerezler, kişisel bilgilerinizi doğrudan içermez. Ancak, sizin hakkınızda bilgi toplayabilir ve 
                    bu bilgileri kullanabilirler. Bu nedenle, KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR 
                    (Genel Veri Koruma Tüzüğü) kapsamında çerez kullanımı hakkında bilgilendirilme hakkınız bulunmaktadır.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Çerez Türleri */}
            <Card id="cerez-turleri">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Çerez Türleri</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Web sitemizde kullanılan çerezler, işlevlerine göre dört ana kategoriye ayrılmıştır:
                </p>

                {/* Zorunlu Çerezler */}
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-red-600" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Zorunlu Çerezler</h3>
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                      Her Zaman Aktif
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.necessary}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bu çerezler web sitesinin temel işlevlerini sağlamak için gereklidir ve devre dışı bırakılamaz. 
                    Çerez tercihlerinizden bağımsız olarak her zaman aktif kalırlar.
                  </p>
                </div>

                {/* Analitik Çerezler */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analitik Çerezler</h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      İzin Gerekli
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.analytics}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bu çerezler, web sitesinin nasıl kullanıldığını anlamamıza yardımcı olur. 
                    Sayfa görüntülemeleri, ziyaretçi sayıları ve kullanıcı davranışları hakkında anonim veriler toplar. 
                    Bu veriler, site performansını iyileştirmek ve kullanıcı deneyimini optimize etmek için kullanılır.
                  </p>
                </div>

                {/* Pazarlama Çerezleri */}
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pazarlama Çerezleri</h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      İzin Gerekli
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.marketing}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Şu anda web sitemizde pazarlama çerezleri kullanılmamaktadır. Gelecekte bu tür çerezler kullanılırsa, 
                    bu sayfa güncellenecek ve kullanıcılarımız bilgilendirilecektir.
                  </p>
                </div>

                {/* Fonksiyonel Çerezler */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fonksiyonel Çerezler</h3>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                      Varsayılan Aktif
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.functional}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bu çerezler, kullanıcı tercihlerinizi hatırlamak ve gelişmiş özellikler sunmak için kullanılır. 
                    Örneğin, tema tercihiniz (açık/koyu mod) veya dil seçiminiz bu çerezler sayesinde hatırlanır.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kullandığımız Çerezler */}
            <Card id="kullandigimiz-cerezler">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Kullandığımız Çerezler</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <p className="text-gray-700 dark:text-gray-300">
                  Aşağıda web sitemizde kullanılan tüm çerezlerin detaylı listesi yer almaktadır. 
                  Her çerez için amaç, süre ve toplanan veri türleri açıklanmıştır.
                </p>

                {/* Zorunlu Çerezler Listesi */}
                {necessaryCookies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-600" />
                      Zorunlu Çerezler ({necessaryCookies.length})
                    </h3>
                    <div className="space-y-4">
                      {necessaryCookies.map((cookie) => (
                        <div key={cookie.name} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                              {cookie.name}
                            </h4>
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                              Zorunlu
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{cookie.purpose}</p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-semibold">Süre:</span> {cookie.duration}
                            </div>
                            <div>
                              <span className="font-semibold">Sağlayıcı:</span> {cookie.provider}
                            </div>
                            {cookie.dataCollected.length > 0 && (
                              <div className="md:col-span-2">
                                <span className="font-semibold">Toplanan Veriler:</span>{' '}
                                {cookie.dataCollected.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analitik Çerezler Listesi */}
                {analyticsCookies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Analitik Çerezler ({analyticsCookies.length})
                    </h3>
                    <div className="space-y-4">
                      {analyticsCookies.map((cookie) => (
                        <div key={cookie.name} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                              {cookie.name}
                            </h4>
                            <div className="flex gap-2">
                              {cookie.isThirdParty && (
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                  Üçüncü Taraf
                                </span>
                              )}
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                İzin Gerekli
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{cookie.purpose}</p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-semibold">Süre:</span> {cookie.duration}
                            </div>
                            <div>
                              <span className="font-semibold">Sağlayıcı:</span>{' '}
                              {cookie.providerUrl ? (
                                <a 
                                  href={cookie.providerUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                >
                                  {cookie.provider}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                cookie.provider
                              )}
                            </div>
                            {cookie.dataCollected.length > 0 && (
                              <div className="md:col-span-2">
                                <span className="font-semibold">Toplanan Veriler:</span>{' '}
                                {cookie.dataCollected.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pazarlama Çerezleri */}
                {marketingCookies.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Pazarlama Çerezleri ({marketingCookies.length})
                    </h3>
                    <div className="space-y-4">
                      {marketingCookies.map((cookie) => (
                        <div key={cookie.name} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                              {cookie.name}
                            </h4>
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              İzin Gerekli
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{cookie.purpose}</p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-semibold">Süre:</span> {cookie.duration}
                            </div>
                            <div>
                              <span className="font-semibold">Sağlayıcı:</span> {cookie.provider}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Şu anda web sitemizde pazarlama çerezleri kullanılmamaktadır.
                    </p>
                  </div>
                )}

                {/* Fonksiyonel Çerezler */}
                {functionalCookies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      Fonksiyonel Çerezler ({functionalCookies.length})
                    </h3>
                    <div className="space-y-4">
                      {functionalCookies.map((cookie) => (
                        <div key={cookie.name} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                              {cookie.name}
                            </h4>
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                              Varsayılan Aktif
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{cookie.purpose}</p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-semibold">Süre:</span> {cookie.duration}
                            </div>
                            <div>
                              <span className="font-semibold">Sağlayıcı:</span> {cookie.provider}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Üçüncü Taraf Çerezler */}
                {thirdPartyCookies.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      Üçüncü Taraf Çerezler
                    </h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Önemli:</strong> Web sitemizde bazı çerezler üçüncü taraf hizmetler tarafından yerleştirilmektedir. 
                        Bu çerezler, ilgili üçüncü tarafın gizlilik politikasına tabidir.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {thirdPartyCookies.map((cookie) => (
                        <div key={cookie.name} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-sm font-semibold">{cookie.name}</span>
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                              Üçüncü Taraf
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Sağlayıcı: {cookie.providerUrl ? (
                              <a 
                                href={cookie.providerUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {cookie.provider}
                              </a>
                            ) : (
                              cookie.provider
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Çerez Yönetimi */}
            <Card id="cerez-yonetimi">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Çerez Tercihlerinizi Yönetme</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Web sitesinin alt kısmındaki 
                  "Çerez Ayarları" butonuna tıklayarak tercihlerinizi güncelleyebilirsiniz.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Çerez Ayarlarınıza Nasıl Erişirsiniz?
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>Web sitesinin alt kısmına gidin</li>
                    <li>"Çerez Ayarları" veya "Cookie Settings" butonuna tıklayın</li>
                    <li>İstediğiniz çerez kategorilerini açıp kapatın</li>
                    <li>Tercihlerinizi kaydedin</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Tarayıcı Bazlı Çerez Yönetimi</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Çerezleri tarayıcı ayarlarınızdan da yönetebilirsiniz. Ancak, bazı çerezleri devre dışı bırakmak 
                    web sitesinin bazı özelliklerinin çalışmamasına neden olabilir.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Google Chrome</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Mozilla Firefox</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Seçenekler → Gizlilik ve Güvenlik → Çerezler ve site verileri
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Safari</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tercihler → Gizlilik → Çerezleri ve web sitesi verilerini yönet
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Microsoft Edge</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ayarlar → Gizlilik, arama ve hizmetler → Çerezler ve site izinleri
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yasal Haklar */}
            <Card id="yasal-haklar">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Yasal Haklarınız</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    KVKK (Kişisel Verilerin Korunması Kanunu) Kapsamında Haklarınız
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    KVKK'nın 11. maddesi uyarınca, kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                    <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                    <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                    <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                    <li>Düzeltme, silme, yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                    <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
                    <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    GDPR (Genel Veri Koruma Tüzüğü) Kapsamında Haklarınız
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    GDPR'nin 15-22. maddeleri uyarınca, kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Erişim hakkı (Right of Access)</li>
                    <li>Düzeltme hakkı (Right to Rectification)</li>
                    <li>Silme hakkı (Right to Erasure / "Right to be Forgotten")</li>
                    <li>İşlemeyi kısıtlama hakkı (Right to Restriction of Processing)</li>
                    <li>Veri taşınabilirliği hakkı (Right to Data Portability)</li>
                    <li>İtiraz hakkı (Right to Object)</li>
                    <li>Otomatik karar alma ve profilleme hakkı (Rights related to Automated Decision Making and Profiling)</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Haklarınızı Nasıl Kullanabilirsiniz?
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerden birini kullanabilirsiniz:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-200">
                    <li>E-posta: {napData.contact.email}</li>
                    <li>Telefon: {napData.contact.phoneFormatted}</li>
                    <li>KVKK Başvuru Formu: <Link href={`${basePath}/kvkk-basvuru`} className="underline">KVKK Başvuru Sayfası</Link></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* KVKK ve GDPR Uyumluluğu */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">KVKK ve GDPR Uyumluluğu</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Çerez kullanımımız, KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) ve GDPR 
                  (2016/679 sayılı Genel Veri Koruma Tüzüğü) uyumludur. Kişisel verileriniz güvenli bir şekilde 
                  saklanır ve yalnızca yasal amaçlarla kullanılır.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-semibold mb-2">KVKK Uyumluluğu</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Türkiye Cumhuriyeti'nin 6698 sayılı Kişisel Verilerin Korunması Kanunu'na tam uyumlu olarak 
                      çerez kullanımı yapılmaktadır. Kişisel verileriniz, kanunun öngördüğü şekilde korunmaktadır.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-semibold mb-2">GDPR Uyumluluğu</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) gerekliliklerine uygun olarak çerez kullanımı 
                      yapılmaktadır. AB vatandaşlarının veri koruma hakları tam olarak korunmaktadır.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Veri Güvenliği
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Kişisel verilerinizin güvenliği için teknik ve idari tedbirler alınmıştır. 
                    Verileriniz, yetkisiz erişim, değiştirme, ifşa veya imhadan korunmaktadır.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Politika Güncellemeleri */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Politika Güncellemeleri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Bu çerez politikası, yasal gereklilikler veya web sitesi işlevselliğindeki değişiklikler nedeniyle 
                  güncellenebilir. Önemli değişiklikler yapıldığında, kullanıcılarımız bilgilendirilecektir.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Son güncelleme tarihi:</strong> {lastUpdated.toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </CardContent>
            </Card>

            {/* İletişim */}
            <Card id="iletisim">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">İletişim</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Çerez politikası, çerez kullanımı veya kişisel verilerinizin korunması hakkında sorularınız için 
                  bizimle iletişime geçebilirsiniz.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">E-posta</h3>
                    </div>
                    <a 
                      href={`mailto:${napData.contact.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {napData.contact.email}
                    </a>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Telefon</h3>
                    </div>
                    <a 
                      href={`tel:${napData.contact.phone}`}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {napData.contact.phoneFormatted}
                    </a>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold mb-2">Adres</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {napData.address.full}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="default">
                    <Link href={`${basePath}/iletisim`}>
                      İletişim Sayfasına Git
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`${basePath}/kvkk-basvuru`}>
                      KVKK Başvuru Formu
                      <FileText className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* İlgili Belgeler */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">İlgili Belgeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link 
                    href={`${basePath}/gizlilik-politikasi`}
                    className="border rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Gizlilik Politikası</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Kişisel verilerinizin nasıl işlendiği hakkında detaylı bilgi
                    </p>
                  </Link>
                  
                  <Link 
                    href={`${basePath}/kvkk-basvuru`}
                    className="border rounded-lg p-4 hover:border-green-500 dark:hover:border-green-400 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">KVKK Başvuru</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      KVKK kapsamındaki haklarınızı kullanmak için başvuru formu
                    </p>
                  </Link>
                  
                  <Link 
                    href={`${basePath}/kullanim-kosullari`}
                    className="border rounded-lg p-4 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold">Kullanım Koşulları</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Web sitesi kullanım koşulları ve şartları
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
