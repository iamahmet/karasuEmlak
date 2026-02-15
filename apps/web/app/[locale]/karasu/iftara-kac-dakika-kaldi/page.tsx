import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getPrayerTimesByDate } from '@/lib/supabase/queries/prayer-times';
import { getArticlesBySlugs, getArticlesByTag } from '@/lib/supabase/queries/articles';
import { IftarCountdown } from '@/components/ramadan/IftarCountdown';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button } from '@karasu/ui';
import { ArrowRight, Calendar, FileText, MapPin, Home } from 'lucide-react';
import { RelatedContent } from '@/components/content';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export const revalidate = 60;

const KARASU_DISTRICT_ID = 9803;
const RECOMMENDED_ARTICLE_SLUGS = [
  'ramazan-2026-karasu-rehberi',
  'sakarya-karasu-ramazan-imsakiyesi-2026',
  'ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi',
  'ramazan-2026-karasu-kiralik-ev-ipuclari',
  'ramazan-oncesi-tasinma-checklist-karasu',
  'karasu-ramazan-sahil-aksam-plani',
];

function getTodayTurkeyYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function toHHMM(t: string) {
  return (t || '').slice(0, 5);
}

function turkeyLocalToUtcMs(ymd: string, hhmm: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  return Date.UTC(y, m - 1, d, hh - 3, mm, 0);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const canonicalPath = `${basePath}/karasu/iftara-kac-dakika-kaldi`;
  const ogImageUrl = getOptimizedCloudinaryUrl('articles/ramazan-2026/karasu-iftara-kac-dakika-kaldi', {
    width: 1200,
    height: 630,
    crop: 'fill',
    quality: 90,
    format: 'auto',
  });

  return {
    title: 'Karasu İftara Kaç Dakika Kaldı? | Canlı Geri Sayım (Sakarya Karasu)',
    description:
      'Karasu iftara kaç dakika kaldı? Sakarya Karasu iftar saatine göre canlı geri sayım. Bugünün Karasu iftar vakti ve güncel vakitler burada.',
    keywords: [
      'karasu iftara kaç dakika kaldı',
      'sakarya karasu iftara kaç dk kaldı',
      'sakarya karasu iftar vakitleri',
      'karasu iftar saati',
      'karasu ramazan imsakiyesi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        tr: '/karasu/iftara-kac-dakika-kaldi',
        en: '/en/karasu/iftara-kac-dakika-kaldi',
        et: '/et/karasu/iftara-kac-dakika-kaldi',
        ru: '/ru/karasu/iftara-kac-dakika-kaldi',
        ar: '/ar/karasu/iftara-kac-dakika-kaldi',
      }),
    },
    openGraph: {
      title: 'Karasu İftara Kaç Dakika Kaldı?',
      description: 'Sakarya Karasu iftar saatine göre canlı geri sayım ve güncel vakitler.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Karasu İftara Kaç Dakika Kaldı',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu İftara Kaç Dakika Kaldı?',
      description: 'Sakarya Karasu iftar saatine göre canlı geri sayım.',
      images: [ogImageUrl],
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

export default async function KarasuIftaraKacDakikaKaldiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const today = getTodayTurkeyYmd();
  const tomorrow = addDaysYmd(today, 1);

  const [todayTimes, tomorrowTimes] = await Promise.all([
    getPrayerTimesByDate({ districtId: KARASU_DISTRICT_ID, date: today }),
    getPrayerTimesByDate({ districtId: KARASU_DISTRICT_ID, date: tomorrow }),
  ]);

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: 'İftara Kaç Dakika Kaldı?', href: `${basePath}/karasu/iftara-kac-dakika-kaldi` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: siteConfig.url },
    { name: 'Karasu', url: `${siteConfig.url}${basePath}/karasu` },
    { name: 'İftara Kaç Dakika Kaldı?', url: `${siteConfig.url}${basePath}/karasu/iftara-kac-dakika-kaldi` },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: 'Karasu iftara kaç dakika kaldı?',
      answer:
        'Sayfadaki geri sayım, Sakarya Karasu için bugünün iftar (akşam) saatine göre hesaplanır. İftar geçtiyse otomatik olarak yarının iftarına döner.',
    },
    {
      question: 'Kocaali’de iftar saati Karasu ile aynı mı?',
      answer:
        'Genelde birkaç dakika fark olabilir. Bu sayfadaki geri sayım Karasu merkezli vakte göre çalışır; Kocaali ve çevresi için saatleri resmî takvimden kontrol etmek en doğrusudur.',
    },
    {
      question: 'Sakarya Karasu iftara kaç dk kaldı bilgisi doğru mu?',
      answer:
        'Geri sayım Karasu iftar vakti üzerinden otomatik hesaplanır. Yine de resmi takvimlerde küçük farklılıklar olabileceği için son kontrolü resmî kaynaklardan yapmak iyi olur.',
    },
    {
      question: 'Sakarya Karasu iftar vakitleri nereden takip edilir?',
      answer:
        'Bu sayfada günlük vakitleri görürsünüz. Ramazan ayı için gün gün imsak ve iftar saatleri tablosu için “Karasu Ramazan İmsakiyesi” sayfasını kullanabilirsiniz.',
    },
  ]);

  const districtLabel = 'Sakarya / Karasu';
  const iftarTimeText = todayTimes?.aksam ? toHHMM(todayTimes.aksam) : '';
  const targetUtcMs = iftarTimeText ? turkeyLocalToUtcMs(today, iftarTimeText) : 0;
  const nextUtcMs = tomorrowTimes?.aksam ? turkeyLocalToUtcMs(tomorrow, toHHMM(tomorrowTimes.aksam)) : undefined;

  const recommendedArticles = await (async () => {
    // Prefer curated slugs; fall back to tag-based list if DB doesn't have them yet.
    const curated = await getArticlesBySlugs(RECOMMENDED_ARTICLE_SLUGS, 6);
    if (curated.length > 0) return curated;
    const { articles } = await getArticlesByTag('ramazan', 6, 0);
    return articles;
  })();

  const recommendedItems = (recommendedArticles || []).slice(0, 6).map((a: any) => ({
    id: String(a.id ?? a.slug),
    title: a.title,
    slug: a.slug,
    description: a.excerpt || a.meta_description || undefined,
    image: a.featured_image || undefined,
    type: 'article' as const,
  }));

  const relatedListSchema =
    recommendedItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Karasu ve Çevresi: Ramazan Rehberleri',
          itemListElement: recommendedItems.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${siteConfig.url}${basePath}/blog/${item.slug}`,
            name: item.title,
          })),
        }
      : null;

  return (
    <>
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      {faqSchema && <StructuredData data={faqSchema} />}
      {relatedListSchema && <StructuredData data={relatedListSchema as any} />}

      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
          <header className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-blue-50/60 p-6 md:p-10 shadow-sm mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              Karasu İftara Kaç Dakika Kaldı?
            </h1>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl leading-relaxed">
              <strong>Karasu iftara kaç dakika kaldı?</strong> ve “<strong>Sakarya Karasu iftara kaç dk kaldı</strong>” diye arayanlar için canlı geri sayım.
              Sayaç Karasu’nun bugünkü iftar saatine göre çalışır; <strong>Kocaali</strong> ve Sakarya çevresinde ise saatler genelde çok yakın olsa da birkaç dakika fark edebilir. En doğru referans her zaman resmî takvimdir.
            </p>

            <div className="flex flex-wrap gap-2.5 mt-6">
              <Link href={`${basePath}/karasu/ramazan-imsakiyesi`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <Calendar className="h-4 w-4 mr-2" />
                  Karasu Ramazan İmsakiyesi
                </Button>
              </Link>
              <Link href={`${basePath}/blog/ramazan-2026`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <FileText className="h-4 w-4 mr-2" />
                  Ramazan 2026 Rehberi
                </Button>
              </Link>
              <Link href={`${basePath}/kocaali`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <MapPin className="h-4 w-4 mr-2" />
                  Kocaali Rehberi
                </Button>
              </Link>
            </div>
          </header>

          {todayTimes?.aksam ? (
            <IftarCountdown
              districtLabel={districtLabel}
              targetLabel="İftar (Akşam)"
              targetTimeText={iftarTimeText}
              targetUtcMs={targetUtcMs}
              nextTargetUtcMs={nextUtcMs}
              className="mb-8"
            />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Bugünün İftar Saati Bulunamadı</h2>
              <p className="text-gray-700">
                Veritabanında <strong>{today}</strong> tarihi için kayıt yok. Import sonrası otomatik görünecek.
              </p>
              <div className="mt-4">
                <Link href={`${basePath}/karasu/ramazan-imsakiyesi`} className="text-primary font-semibold inline-flex items-center gap-2">
                  Karasu Ramazan İmsakiyesi sayfasına geç
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm mb-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">İftardan Sonra Ne Yapmalı? Karasu ve Çevresi İçin Kısa Rehber</h2>
                <p className="text-gray-700 leading-relaxed">
                  İftara yakın saatlerde plan sıkışabiliyor. Bu yüzden aşağıya, Karasu merkezli vakit araçlarını ve Karasu, Kocaali ve çevresi için işine yarayacak birkaç pratik rehberi bıraktık:
                  sahil yürüyüşü rotası, bayram haftası yoğun saatler, kiralık ev bakarken sorulacak sorular gibi.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`${basePath}/kiralik`}>
                  <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                    <Home className="h-4 w-4 mr-2" />
                    Kiralık İlanlar
                  </Button>
                </Link>
                <Link href={`${basePath}/satilik`}>
                  <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                    <Home className="h-4 w-4 mr-2" />
                    Satılık İlanlar
                  </Button>
                </Link>
              </div>
            </div>

            {recommendedItems.length > 0 && (
              <div className="mt-8">
                <RelatedContent
                  items={recommendedItems as any}
                  title="İlgili Yazılar"
                  type="articles"
                />
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`${basePath}/karasu/ramazan-imsakiyesi`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-white hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">Karasu İmsak ve İftar Saatleri (Gün Gün)</div>
                <div className="text-sm text-gray-700">Ramazan boyunca imsak, iftar ve diğer vakitleri tek tabloda takip et.</div>
              </Link>
              <Link
                href={`${basePath}/karasu`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-white hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">Karasu Rehberi</div>
                <div className="text-sm text-gray-700">Mahalleler, yaşam, ulaşım ve bölge notları.</div>
              </Link>
              <Link
                href={`${basePath}/kocaali`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-white hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">Kocaali Rehberi</div>
                <div className="text-sm text-gray-700">Kocaali’de yaşam ve emlak hareketi: hızlı bir başlangıç.</div>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Bugünün Karasu Vakitleri</h2>
            {todayTimes ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  ['İmsak', toHHMM(todayTimes.imsak)],
                  ['Güneş', toHHMM(todayTimes.gunes)],
                  ['Öğle', toHHMM(todayTimes.ogle)],
                  ['İkindi', toHHMM(todayTimes.ikindi)],
                  ['İftar', toHHMM(todayTimes.aksam)],
                  ['Yatsı', toHHMM(todayTimes.yatsi)],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-semibold text-gray-600">{label}</div>
                    <div className="text-lg font-bold text-gray-900 tabular-nums">{val}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">Bugün için veri yok.</p>
            )}
            <div className="mt-6">
              <Link href={`${basePath}/karasu/ramazan-imsakiyesi`}>
                <Button variant="outline" className="border-2 hover:border-primary hover:bg-primary/5">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Ramazan İmsakiyesi ve İftar Vakitleri Tablosu
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
