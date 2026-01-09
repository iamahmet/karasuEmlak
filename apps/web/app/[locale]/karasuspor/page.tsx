import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { Trophy, Users, Calendar, MapPin, Heart, Star, CheckCircle } from 'lucide-react';
import { Button } from '@karasu/ui';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasuspor' : `/${locale}/karasuspor`;

  return {
    title: 'Karasuspor | Karasu Spor Kulübü ve Topluluk | Karasu Emlak',
    description: 'Karasuspor hakkında bilgiler, takım haberleri, maç sonuçları ve Karasu topluluğu. Karasu\'nun spor kültürü ve toplumsal etkisi.',
    keywords: [
      'karasuspor',
      'karasu spor kulübü',
      'karasu takım',
      'karasu futbol',
      'karasu spor',
      'karasu topluluk',
      'karasu haberler',
      'karasu maç sonuçları',
      'karasu spor kültürü',
      'karasu toplumsal etki',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/karasuspor',
        'en': '/en/karasuspor',
        'et': '/et/karasuspor',
        'ru': '/ru/karasuspor',
        'ar': '/ar/karasuspor',
      },
    },
    openGraph: {
      title: 'Karasuspor | Karasu Spor Kulübü',
      description: 'Karasuspor hakkında bilgiler, takım haberleri ve Karasu topluluğu.',
      type: 'article',
    },
  };
}

export default async function KarasusporPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: 'Karasuspor', href: `${basePath}/karasuspor` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Karasuspor | Karasu Spor Kulübü',
    description: 'Karasuspor hakkında bilgiler, takım haberleri, maç sonuçları ve Karasu topluluğu.',
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
    image: [`${siteConfig.url}/og-image.jpg`],
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <header className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="h-12 w-12 text-primary" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                Karasuspor
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Karasu\'nun gururu Karasuspor hakkında bilgiler, takım haberleri, maç sonuçları ve Karasu topluluğu. Spor kültürü ve toplumsal etki.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Kulüp Bilgileri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Kulüp Bilgileri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Karasuspor, Karasu\'nun yerel spor kulübüdür ve bölge halkının gurur kaynağıdır. Kulüp, futbol ve diğer spor dallarında faaliyet göstermektedir.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kuruluş:</strong> Karasu\'nun köklü spor kulüplerinden biri</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Lig:</strong> Amatör ve profesyonel liglerde mücadele</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Toplumsal etki:</strong> Karasu toplumunun birleştirici gücü</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Takım Haberleri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Takım Haberleri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Karasuspor\'un güncel haberleri, maç sonuçları ve takım gelişmeleri:
                  </p>
                  <div className="space-y-4">
                    <Link href={`${basePath}/blog/karasuspor-takim-otobusu-taslama-haberi`} className="block group border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                        Karasuspor Takım Otobüsü Taşlama Haberi
                      </h3>
                      <p className="text-sm text-gray-600">
                        Güncel takım haberleri ve gelişmeler
                      </p>
                    </Link>
                  </div>
                </div>
              </section>

              {/* Toplumsal Etki */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Toplumsal Etki</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Karasuspor, Karasu toplumunun önemli bir parçasıdır:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Toplumsal birlik:</strong> Karasu halkını bir araya getirir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Gençlik sporu:</strong> Gençlere spor sevgisi aşılar</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yerel gurur:</strong> Karasu\'nun tanıtımına katkı sağlar</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Karasu\'da Yaşamak İster misiniz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Karasu\'nun güçlü toplumsal yapısı ve spor kültürü, yaşam kalitesini artırır. Karasu\'da ev almak için bizimle iletişime geçin.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/satilik`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Karasu\'da Ev Ara
                    </Button>
                  </Link>
                  <Link href={`${basePath}/karasu`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Karasu Hakkında
                    </Button>
                  </Link>
                </div>
              </section>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
