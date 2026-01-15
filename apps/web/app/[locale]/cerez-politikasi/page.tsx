import { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { COOKIE_INVENTORY } from '@/lib/cookies/cookie-types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Çerez Politikası | Karasu Emlak',
    description: 'Karasu Emlak çerez politikası. KVKK ve GDPR uyumlu çerez kullanımı, çerez türleri ve yönetimi hakkında detaylı bilgi.',
    alternates: {
      canonical: `${basePath}/cerez-politikasi`,
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

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Çerez Politikası' },
  ];

  const necessaryCookies = COOKIE_INVENTORY.filter(c => c.category === 'necessary');
  const analyticsCookies = COOKIE_INVENTORY.filter(c => c.category === 'analytics');
  const marketingCookies = COOKIE_INVENTORY.filter(c => c.category === 'marketing');
  const functionalCookies = COOKIE_INVENTORY.filter(c => c.category === 'functional');

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Çerez Politikası</CardTitle>
            <p className="text-muted-foreground mt-2">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Çerez Nedir?</h2>
              <p>
                Çerezler, web sitelerini ziyaret ettiğinizde cihazınıza (bilgisayar, tablet, telefon) kaydedilen küçük metin dosyalarıdır. 
                Bu dosyalar, web sitesinin düzgün çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Çerez Türleri</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Zorunlu Çerezler</h3>
                <p className="mb-3">
                  Web sitesinin çalışması için gerekli çerezlerdir. Bu çerezler olmadan site düzgün çalışmaz.
                </p>
                <div className="space-y-3">
                  {necessaryCookies.map((cookie) => (
                    <div key={cookie.name} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{cookie.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{cookie.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-2">Süre: {cookie.duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Analitik Çerezler</h3>
                <p className="mb-3">
                  Web sitesi kullanımını analiz etmek için kullanılır. İzin verilmeden çalışmaz.
                </p>
                <div className="space-y-3">
                  {analyticsCookies.map((cookie) => (
                    <div key={cookie.name} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{cookie.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{cookie.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-2">Süre: {cookie.duration}</p>
                      {cookie.provider && (
                        <p className="text-xs text-muted-foreground">Sağlayıcı: {cookie.provider}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Pazarlama Çerezleri</h3>
                <p className="mb-3">
                  Kişiselleştirilmiş reklamlar için kullanılır. İzin verilmeden çalışmaz.
                </p>
                <div className="space-y-3">
                  {marketingCookies.map((cookie) => (
                    <div key={cookie.name} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{cookie.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{cookie.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-2">Süre: {cookie.duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Fonksiyonel Çerezler</h3>
                <p className="mb-3">
                  Web sitesi özelliklerini geliştirmek için kullanılır. Varsayılan olarak açıktır.
                </p>
                <div className="space-y-3">
                  {functionalCookies.map((cookie) => (
                    <div key={cookie.name} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{cookie.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{cookie.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-2">Süre: {cookie.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Çerez Tercihlerinizi Yönetme</h2>
              <p>
                Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Web sitesinin alt kısmındaki 
                "Çerez Ayarları" linkine tıklayarak tercihlerinizi güncelleyebilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">KVKK ve GDPR Uyumluluğu</h2>
              <p>
                Çerez kullanımımız, KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR (Genel Veri Koruma Tüzüğü) 
                uyumludur. Kişisel verileriniz güvenli bir şekilde saklanır ve yalnızca yasal amaçlarla kullanılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">İletişim</h2>
              <p>
                Çerez politikası hakkında sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
