import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getCookiesByCategory, getThirdPartyCookies, COOKIE_CATEGORY_LABELS, COOKIE_CATEGORY_DESCRIPTIONS } from '@/lib/cookies/cookie-types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/cerez-politikasi' 
    : `/${locale}/cerez-politikasi`;

  return {
    title: 'Çerez Politikası (Cookie Policy) | Karasu Emlak',
    description: 'Karasu Emlak çerez politikası. Web sitemizde kullanılan çerezler, türleri ve kullanım amaçları hakkında detaylı bilgi.',
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Çerez Politikası | Karasu Emlak',
      description: 'Karasu Emlak çerez politikası. Web sitemizde kullanılan çerezler, türleri ve kullanım amaçları hakkında detaylı bilgi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

export default async function CerezPolitikasiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const lastUpdated = '2025-01-23';

  const cookiePolicySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Çerez Politikası',
    description: 'Karasu Emlak çerez politikası',
    url: `${siteConfig.url}${basePath}/cerez-politikasi`,
    publishedTime: '2024-01-01',
    modifiedTime: lastUpdated,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  const necessaryCookies = getCookiesByCategory('necessary');
  const analyticsCookies = getCookiesByCategory('analytics');
  const functionalCookies = getCookiesByCategory('functional');
  const marketingCookies = getCookiesByCategory('marketing');
  const thirdPartyCookies = getThirdPartyCookies();

  return (
    <>
      <StructuredData data={cookiePolicySchema} />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: basePath },
            { label: 'Çerez Politikası' },
          ]}
          className="mb-6"
        />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white py-20 md:py-28 overflow-hidden rounded-xl mb-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                Çerez Politikası
              </h1>
              <p className="text-lg md:text-xl text-gray-200 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed tracking-tight">
                Web sitemizde kullanılan çerezler ve gizlilik haklarınız
              </p>
              <p className="text-sm text-gray-400 mt-4 tracking-tight">
                Son Güncelleme: {new Date(lastUpdated).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {/* Introduction */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                  Çerezler Hakkında
                </h2>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight mb-4">
                  {siteConfig.name} olarak, web sitemizde çerezler (cookies) kullanmaktayız. Bu sayfa, 
                  hangi çerezleri kullandığımızı, neden kullandığımızı ve çerez tercihlerinizi nasıl yönetebileceğinizi açıklamaktadır.
                </p>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                  Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) 
                  kapsamında hazırlanmıştır.
                </p>
              </div>

              {/* What are Cookies */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                  Çerez Nedir?
                </h2>
                <div className="space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                  <p>
                    Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. 
                    Bu dosyalar, web sitesinin düzgün çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.
                  </p>
                  <p>
                    Çerezler, kişisel bilgilerinizi doğrudan içermez ancak web sitesi kullanımınız hakkında bilgi toplayabilir.
                  </p>
                </div>
              </div>

              {/* Cookie Categories */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                  Kullandığımız Çerez Türleri
                </h2>
                
                {/* Necessary Cookies */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">
                    1. {COOKIE_CATEGORY_LABELS.necessary}
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.necessary}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {necessaryCookies.map((cookie) => (
                      <li key={cookie.name}>
                        <strong>{cookie.name}:</strong> {cookie.purpose} ({cookie.duration})
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    <strong>Saklama Süresi:</strong> Oturum süresi veya 1 yıl
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">
                    2. {COOKIE_CATEGORY_LABELS.analytics}
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.analytics}
                  </p>
                  <div className="space-y-3">
                    {analyticsCookies.map((cookie) => (
                      <div key={cookie.name}>
                        <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {cookie.provider}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cookie.purpose}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          <strong>Saklama Süresi:</strong> {cookie.duration} | <strong>Çerez Adı:</strong> {cookie.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">
                    3. {COOKIE_CATEGORY_LABELS.functional}
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.functional}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {functionalCookies.map((cookie) => (
                      <li key={cookie.name}>
                        <strong>{cookie.name}:</strong> {cookie.purpose} ({cookie.duration})
                      </li>
                    ))}
                    {functionalCookies.length === 0 && (
                      <>
                        <li>Tema tercihi (açık/koyu mod)</li>
                        <li>Favori ilanların saklanması</li>
                        <li>Karşılaştırma listesi</li>
                        <li>Dil tercihi</li>
                        <li>Form verilerinin otomatik doldurulması</li>
                      </>
                    )}
                  </ul>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    <strong>Saklama Süresi:</strong> 1 yıl
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">
                    4. {COOKIE_CATEGORY_LABELS.marketing}
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {COOKIE_CATEGORY_DESCRIPTIONS.marketing}
                  </p>
                  {marketingCookies.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Şu anda web sitemizde pazarlama çerezleri kullanılmamaktadır. Gelecekte kullanılması durumunda, 
                      bu sayfa güncellenecek ve kullanıcılarımız bilgilendirilecektir.
                    </p>
                  ) : (
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 ml-4">
                      {marketingCookies.map((cookie) => (
                        <li key={cookie.name}>
                          <strong>{cookie.name}:</strong> {cookie.purpose} ({cookie.duration})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Third-Party Cookies */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                  Üçüncü Taraf Çerezler
                </h2>
                <div className="space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                  <p>
                    Web sitemizde, hizmet sağlayıcılarımız tarafından yerleştirilen üçüncü taraf çerezler kullanılmaktadır:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                    <ul className="space-y-3">
                      {thirdPartyCookies.map((cookie) => (
                        <li key={cookie.name}>
                          <strong className="text-gray-900 dark:text-gray-50">{cookie.provider}:</strong>{' '}
                          {cookie.providerUrl && (
                            <a 
                              href={cookie.providerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              Gizlilik Politikası
                            </a>
                          )}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({cookie.name})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cookie Management */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                  Çerez Tercihlerinizi Yönetme
                </h2>
                <div className="space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                  <p>
                    Çerez tercihlerinizi aşağıdaki yollarla yönetebilirsiniz:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
                      1. Çerez Banner Üzerinden
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Web sitemizi ilk ziyaret ettiğinizde görünen çerez banner'ından tercihlerinizi özelleştirebilirsiniz. 
                      Daha sonra tercihlerinizi değiştirmek için sayfanın alt kısmındaki "Çerez Ayarları" bağlantısını kullanabilirsiniz.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3 mt-6">
                      2. Tarayıcı Ayarlarından
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Çoğu tarayıcı, çerezleri yönetmenize izin verir. Tarayıcınızın ayarlar menüsünden çerez tercihlerinizi değiştirebilirsiniz:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                      <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                      <li><strong>Firefox:</strong> Seçenekler → Gizlilik ve Güvenlik → Çerezler</li>
                      <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
                      <li><strong>Edge:</strong> Ayarlar → Gizlilik, arama ve hizmetler → Çerezler</li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                      <strong>Not:</strong> Tüm çerezleri devre dışı bırakmak, web sitesinin bazı özelliklerinin çalışmamasına neden olabilir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                  Haklarınız
                </h2>
                <div className="space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                  <p>
                    KVKK ve GDPR kapsamında çerezlerle ilgili olarak aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Çerez kullanımı hakkında bilgi alma</li>
                    <li>İsteğe bağlı çerezleri reddetme</li>
                    <li>Çerez tercihlerinizi değiştirme</li>
                    <li>Çerezleri silme</li>
                    <li>Çerez kullanımına itiraz etme</li>
                  </ul>
                  <p className="mt-4">
                    Bu haklarınızı kullanmak için bizimle{' '}
                    <Link href={`${basePath}/iletisim`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                      iletişime geçebilirsiniz
                    </Link>.
                  </p>
                </div>
              </div>

              {/* Updates */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3 tracking-tight">
                  Politika Güncellemeleri
                </h2>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                  Bu çerez politikası zaman zaman güncellenebilir. Önemli değişikliklerde sizi bilgilendireceğiz. 
                  Güncel politika metnini bu sayfadan takip edebilirsiniz.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  Son güncelleme tarihi sayfanın üst kısmında belirtilmiştir.
                </p>
              </div>

              {/* Contact */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
                  İletişim
                </h2>
                <div className="space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                  <p>
                    Çerez politikamız hakkında sorularınız veya haklarınızı kullanmak istiyorsanız, bizimle iletişime geçebilirsiniz:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                    <p className="font-semibold mb-2 text-gray-900 dark:text-gray-50">{siteConfig.name}</p>
                    <p className="text-sm">E-posta: {siteConfig.nap.email}</p>
                    <p className="text-sm">Telefon: {siteConfig.nap.phone}</p>
                    <p className="text-sm">Adres: {siteConfig.nap.address}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Ayrıca{' '}
                    <Link href={`${basePath}/gizlilik-politikasi`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                      Gizlilik Politikamızı
                    </Link>{' '}
                    ve{' '}
                    <Link href={`${basePath}/kvkk-basvuru`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                      KVKK Başvuru Sayfamızı
                    </Link>{' '}
                    da inceleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

