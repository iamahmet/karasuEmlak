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
import { DISTRICT_IDS } from '@/lib/ramadan/constants';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export const revalidate = 60;

const RECOMMENDED_ARTICLE_SLUGS = [
  'ramazan-2026-karasu-rehberi',
  'sakarya-karasu-ramazan-imsakiyesi-2026',
  'ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi',
  'ramazan-2026-karasu-kiralik-ev-ipuclari',
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
  const canonicalPath = `${basePath}/kocaali/iftara-kac-dakika-kaldi`;
  const ogImageUrl = getOptimizedCloudinaryUrl('articles/ramazan-2026/karasu-iftara-kac-dakika-kaldi', {
    width: 1200,
    height: 630,
    crop: 'fill',
    quality: 90,
    format: 'auto',
  });

  return {
    title: 'Kocaali İftara Kaç Dakika Kaldı? | Canlı Geri Sayım (Sakarya Kocaali)',
    description:
      'Kocaali iftara kaç dakika kaldı? Sakarya Kocaali iftar saatine göre canlı geri sayım. Bugünün Kocaali iftar vakti ve güncel vakitler burada.',
    keywords: [
      'kocaali iftara kaç dakika kaldı',
      'sakarya kocaali iftara kaç dk kaldı',
      'sakarya kocaali iftar vakitleri',
      'kocaali iftar saati',
      'kocaali ramazan imsakiyesi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        tr: '/kocaali/iftara-kac-dakika-kaldi',
        en: '/en/kocaali/iftara-kac-dakika-kaldi',
        et: '/et/kocaali/iftara-kac-dakika-kaldi',
        ru: '/ru/kocaali/iftara-kac-dakika-kaldi',
        ar: '/ar/kocaali/iftara-kac-dakika-kaldi',
      }),
    },
    openGraph: {
      title: 'Kocaali İftara Kaç Dakika Kaldı?',
      description: 'Sakarya Kocaali iftar saatine göre canlı geri sayım ve güncel vakitler.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Kocaali İftara Kaç Dakika Kaldı' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kocaali İftara Kaç Dakika Kaldı?',
      description: 'Sakarya Kocaali iftar saatine göre canlı geri sayım.',
      images: [ogImageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export default async function KocaaliIftaraKacDakikaKaldiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const today = getTodayTurkeyYmd();
  const tomorrow = addDaysYmd(today, 1);

  const [todayTimes, tomorrowTimes] = await Promise.all([
    getPrayerTimesByDate({ districtId: DISTRICT_IDS.KOCAALI, date: today }),
    getPrayerTimesByDate({ districtId: DISTRICT_IDS.KOCAALI, date: tomorrow }),
  ]);

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Kocaali', href: `${basePath}/kocaali` },
    { label: 'İftara Kaç Dakika Kaldı?', href: `${basePath}/kocaali/iftara-kac-dakika-kaldi` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: siteConfig.url },
    { name: 'Kocaali', url: `${siteConfig.url}${basePath}/kocaali` },
    { name: 'İftara Kaç Dakika Kaldı?', url: `${siteConfig.url}${basePath}/kocaali/iftara-kac-dakika-kaldi` },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: 'Kocaali iftara kaç dakika kaldı?',
      answer:
        'Sayfadaki geri sayım, Sakarya Kocaali için bugünün iftar (akşam) saatine göre hesaplanır. İftar geçtiyse otomatik olarak yarının iftarına döner.',
    },
    {
      question: 'Kocaali ve Karasu iftar saatleri aynı mı?',
      answer:
        'Genelde birkaç dakika fark olabilir. Kocaali ve Karasu aynı bölgede olsa da vakitler ilçe merkezine göre hesaplanır. Bu sayfa Kocaali vakitlerini gösterir.',
    },
    {
      question: 'Kocaali Ramazan imsakiyesi nerede?',
      answer:
        'Kocaali Ramazan İmsakiyesi sayfasında gün gün imsak ve iftar saatleri tablosunu bulabilirsiniz.',
    },
  ]);

  const districtLabel = 'Sakarya / Kocaali';
  const iftarTimeText = todayTimes?.aksam ? toHHMM(todayTimes.aksam) : '';
  const targetUtcMs = iftarTimeText ? turkeyLocalToUtcMs(today, iftarTimeText) : 0;
  const nextUtcMs = tomorrowTimes?.aksam ? turkeyLocalToUtcMs(tomorrow, toHHMM(tomorrowTimes.aksam)) : undefined;

  const recommendedArticles = await (async () => {
    const curated = await getArticlesBySlugs(RECOMMENDED_ARTICLE_SLUGS, 6);
    if (curated.length > 0) return curated;
    const { articles } = await getArticlesByTag('ramazan', 6, 0);
    return articles;
  })();

  const recommendedItems = (recommendedArticles || []).slice(0, 6).map((a: any) => ({
    id: String(a.id ?? a.slug),
    title: a.title,
    slug: a.slug,
    description: a.excerpt || a.meta_description,
    image: a.featured_image,
    type: 'article' as const,
  }));

  const relatedListSchema =
    recommendedItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Karasu ve Kocaali: Ramazan Rehberleri',
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

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 max-w-7xl">
          <header className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary/5 via-white to-blue-50/60 dark:from-primary/10 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-10 shadow-sm mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
              Kocaali İftara Kaç Dakika Kaldı?
            </h1>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
              <strong>Kocaali iftara kaç dakika kaldı?</strong> ve &quot;<strong>Sakarya Kocaali iftara kaç dk kaldı</strong>&quot; diye arayanlar için canlı geri sayım.
              Sayaç Kocaali&apos;nin bugünkü iftar saatine göre çalışır. <strong>Karasu</strong> ile birkaç dakika fark olabilir; her ilçe kendi vakitlerine göre hesaplanır.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 mt-6">
              <Link href={`${basePath}/kocaali/ramazan-imsakiyesi`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <Calendar className="h-4 w-4 mr-2" />
                  Kocaali Ramazan İmsakiyesi
                </Button>
              </Link>
              <Link href={`${basePath}/karasu/iftara-kac-dakika-kaldi`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <MapPin className="h-4 w-4 mr-2" />
                  Karasu İftara Kaç Dakika?
                </Button>
              </Link>
              <Link href={`${basePath}/blog/ramazan-2026`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <FileText className="h-4 w-4 mr-2" />
                  Ramazan 2026 Rehberi
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
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 shadow-sm mb-6 sm:mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bugünün İftar Saati Bulunamadı</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Veritabanında <strong>{today}</strong> tarihi için Kocaali kaydı yok. Import sonrası otomatik görünecek.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`${basePath}/kocaali/ramazan-imsakiyesi`} className="text-primary font-semibold inline-flex items-center gap-2">
                  Kocaali Ramazan İmsakiyesi
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-gray-400">|</span>
                <Link href={`${basePath}/karasu/iftara-kac-dakika-kaldi`} className="text-primary font-semibold">
                  Karasu İftara Kaç Dakika?
                </Link>
              </div>
            </div>
          )}

          <section className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 shadow-sm mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="max-w-3xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Kocaali ve Karasu Ramazan Araçları</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Kocaali ve Karasu için ayrı ayrı imsak-iftar vakitleri ve geri sayım sayfaları hazırladık. Her iki ilçe de Sakarya sahilinde; vakitler birkaç dakika fark edebilir.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                <Link href={`${basePath}/kiralik`} className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                    <Home className="h-4 w-4 mr-2" />
                    Kiralık İlanlar
                  </Button>
                </Link>
                <Link href={`${basePath}/kocaali`} className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                    <MapPin className="h-4 w-4 mr-2" />
                    Kocaali Rehberi
                  </Button>
                </Link>
              </div>
            </div>

            {recommendedItems.length > 0 && (
              <div className="mt-8">
                <RelatedContent items={recommendedItems as any} title="İlgili Yazılar" type="articles" />
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <Link
                href={`${basePath}/kocaali/ramazan-imsakiyesi`}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 hover:bg-white dark:hover:bg-gray-800 hover:border-primary/30 hover:shadow-sm transition-all min-h-[88px] flex flex-col justify-center"
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Kocaali İmsak ve İftar Saatleri</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Ramazan boyunca Kocaali vakitleri gün gün tablo.</div>
              </Link>
              <Link
                href={`${basePath}/karasu/iftara-kac-dakika-kaldi`}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 hover:bg-white dark:hover:bg-gray-800 hover:border-primary/30 hover:shadow-sm transition-all min-h-[88px] flex flex-col justify-center"
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Karasu İftara Kaç Dakika?</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Karasu için canlı iftar geri sayımı.</div>
              </Link>
              <Link
                href={`${basePath}/kocaali`}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 hover:bg-white dark:hover:bg-gray-800 hover:border-primary/30 hover:shadow-sm transition-all min-h-[88px] flex flex-col justify-center"
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Kocaali Rehberi</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Kocaali mahalleler, yaşam ve emlak.</div>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Bugünün Kocaali Vakitleri</h2>
            {todayTimes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {[
                  ['İmsak', toHHMM(todayTimes.imsak)],
                  ['Güneş', toHHMM(todayTimes.gunes)],
                  ['Öğle', toHHMM(todayTimes.ogle)],
                  ['İkindi', toHHMM(todayTimes.ikindi)],
                  ['İftar', toHHMM(todayTimes.aksam)],
                  ['Yatsı', toHHMM(todayTimes.yatsi)],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-3 min-h-[72px] flex flex-col justify-center">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tabular-nums">{val}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">Bugün için Kocaali verisi yok.</p>
            )}
            <div className="mt-6">
              <Link href={`${basePath}/kocaali/ramazan-imsakiyesi`} className="block w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Kocaali Ramazan İmsakiyesi Tablosu
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
