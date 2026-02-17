import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getPrayerTimesByDate, getPrayerTimesRange } from '@/lib/supabase/queries/prayer-times';
import { IftarCountdown } from '@/components/ramadan/IftarCountdown';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button } from '@karasu/ui';
import { Calendar, ArrowRight, MapPin, FileText } from 'lucide-react';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export const revalidate = 300;

const KARASU_DISTRICT_ID = 9803;
const RAMADAN_2026_FROM = '2026-02-19';
const RAMADAN_2026_TO = '2026-03-19';

function formatTurkeyDate(date: string) {
  const d = new Date(`${date}T00:00:00+03:00`);
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function toHHMM(t: string) {
  return (t || '').slice(0, 5);
}

function getTodayTurkeyYmd(): string {
  // "en-CA" yields YYYY-MM-DD
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

function turkeyLocalToUtcMs(ymd: string, hhmm: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  // Turkey is UTC+03:00 (fixed). Convert local time to UTC by subtracting 3 hours.
  return Date.UTC(y, m - 1, d, hh - 3, mm, 0);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const canonicalPath = `${basePath}/karasu/ramazan-imsakiyesi`;
  const ogImageUrl = getOptimizedCloudinaryUrl('articles/ramazan-2026/sakarya-karasu-ramazan-imsakiyesi-2026', {
    width: 1200,
    height: 630,
    crop: 'fill',
    quality: 90,
    format: 'auto',
  });

  return {
    title: 'Sakarya Karasu Ramazan İmsakiyesi 2026 | İftar Vakitleri ve Sahur Saatleri',
    description:
      'Sakarya Karasu Ramazan imsakiyesi 2026: imsak, iftar vakitleri ve gün gün saatler. Ayrıca Karasu iftara kaç dakika kaldı geri sayımı.',
    keywords: [
      'sakarya karasu ramazan imsakiyesi',
      'sakarya karasu iftar vakitleri',
      'karasu iftara kaç dakika kaldı',
      'sakarya karasu iftara kaç dk kaldı',
      'karasu imsakiye 2026',
      'karasu iftar saati',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        tr: '/karasu/ramazan-imsakiyesi',
        en: '/en/karasu/ramazan-imsakiyesi',
        et: '/et/karasu/ramazan-imsakiyesi',
        ru: '/ru/karasu/ramazan-imsakiyesi',
        ar: '/ar/karasu/ramazan-imsakiyesi',
      }),
    },
    openGraph: {
      title: 'Sakarya Karasu Ramazan İmsakiyesi 2026',
      description: 'Karasu için imsak, iftar vakitleri ve gün gün saatler. İftara kaç dakika kaldı geri sayımı.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Sakarya Karasu Ramazan İmsakiyesi 2026',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sakarya Karasu Ramazan İmsakiyesi 2026',
      description: 'Karasu için imsak, iftar vakitleri ve gün gün saatler.',
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

export default async function KarasuRamazanImsakiyePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const today = getTodayTurkeyYmd();
  const tomorrow = addDaysYmd(today, 1);

  const [todayTimes, tomorrowTimes, ramadanRange] = await Promise.all([
    getPrayerTimesByDate({ districtId: KARASU_DISTRICT_ID, date: today }),
    getPrayerTimesByDate({ districtId: KARASU_DISTRICT_ID, date: tomorrow }),
    getPrayerTimesRange({
      districtId: KARASU_DISTRICT_ID,
      from: RAMADAN_2026_FROM,
      to: RAMADAN_2026_TO,
      limit: 45,
    }),
  ]);

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: 'Ramazan İmsakiyesi', href: `${basePath}/karasu/ramazan-imsakiyesi` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: siteConfig.url },
    { name: 'Karasu', url: `${siteConfig.url}${basePath}/karasu` },
    { name: 'Ramazan İmsakiyesi', url: `${siteConfig.url}${basePath}/karasu/ramazan-imsakiyesi` },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: 'Sakarya Karasu Ramazan imsakiyesi 2026 nereden bakılır?',
      answer:
        'Bu sayfada Karasu için imsak, iftar ve diğer vakitleri gün gün listeleyebilirsiniz. Saatler gün içinde değiştiği için güncel tabloyu takip etmek en sağlıklısıdır.',
    },
    {
      question: 'Sakarya Karasu iftar vakitleri her gün aynı mı?',
      answer:
        'Hayır. İftar (akşam) saati ve imsak saati her gün birkaç dakika oynar. Bu yüzden “bugünün saati” ile “yarının saati” farklı olabilir.',
    },
    {
      question: 'Karasu iftara kaç dakika kaldı bilgisi nasıl hesaplanır?',
      answer:
        'Bugünün Karasu iftar saatine göre geri sayım yapılır. İftar geçtiyse, sayfa otomatik olarak yarının iftarına göre geri sayım gösterir.',
    },
  ]);

  const districtLabel = 'Sakarya / Karasu';
  const iftarTimeText = todayTimes?.aksam ? toHHMM(todayTimes.aksam) : '';
  const targetUtcMs = iftarTimeText ? turkeyLocalToUtcMs(today, iftarTimeText) : 0;
  const nextUtcMs = tomorrowTimes?.aksam ? turkeyLocalToUtcMs(tomorrow, toHHMM(tomorrowTimes.aksam)) : undefined;

  return (
    <>
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      {faqSchema && <StructuredData data={faqSchema} />}

      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 max-w-7xl">
          <header className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary/5 via-white to-blue-50/60 dark:from-primary/10 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-10 shadow-sm mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                Sakarya Karasu Ramazan İmsakiyesi 2026
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed mt-4">
              Bu sayfada <strong>Sakarya Karasu Ramazan imsakiyesi</strong> ve <strong>Karasu iftar vakitleri</strong> için gün gün tabloyu bulabilirsiniz.
              Ayrıca “<strong>Karasu iftara kaç dakika kaldı</strong>” sorusu için pratik bir geri sayım da ekledik.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 mt-6">
              <Link href={`${basePath}/karasu/iftara-kac-dakika-kaldi`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  İftara Kaç Dakika Kaldı?
                </Button>
              </Link>
              <Link href={`${basePath}/blog/ramazan-2026`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <FileText className="h-4 w-4 mr-2" />
                  Ramazan 2026 Rehberleri
                </Button>
              </Link>
              <Link href={`${basePath}/kiralik`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <MapPin className="h-4 w-4 mr-2" />
                  Kiralık İlanlar
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bugünün Vakitleri Bulunamadı</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Veritabanında <strong>{today}</strong> tarihi için kayıt yok. Import sonrası otomatik görünecek.
              </p>
            </div>
          )}

          <section className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 shadow-sm mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Bugünün Karasu Vakitleri</h2>
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
              <p className="text-gray-700 dark:text-gray-300">Bugün için veri yok.</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Not: Saatler kaynak veriye göre listelenir. Resmi takvimlerle küçük farklılıklar olabilir.
            </p>
          </section>

          <section className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Ramazan 2026 Karasu İmsakiyesi (Gün Gün)</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-5">
              Ramazan 2026 için Karasu’da imsak ve iftar saatleri <strong>{formatTurkeyDate(RAMADAN_2026_FROM)}</strong> ile{' '}
              <strong>{formatTurkeyDate(RAMADAN_2026_TO)}</strong> arasında gün gün aşağıda.
            </p>

            {ramadanRange.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0 sm:rounded-xl" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="min-w-[640px] sm:min-w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr className="text-left text-gray-700 dark:text-gray-300">
                      <th className="px-3 sm:px-4 py-3 font-semibold sticky left-0 bg-gray-50 dark:bg-gray-700/50 z-10">Tarih</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold">İmsak</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold">Güneş</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold">Öğle</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold">İkindi</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold">İftar</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold">Yatsı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ramadanRange.map((row) => (
                      <tr key={row.date} className="border-t border-gray-200 dark:border-gray-600">
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium">{formatTurkeyDate(row.date)}</td>
                        <td className="px-3 sm:px-4 py-3 tabular-nums text-gray-900 dark:text-gray-100">{toHHMM(row.imsak)}</td>
                        <td className="px-3 sm:px-4 py-3 tabular-nums text-gray-900 dark:text-gray-100">{toHHMM(row.gunes)}</td>
                        <td className="px-3 sm:px-4 py-3 tabular-nums text-gray-900 dark:text-gray-100">{toHHMM(row.ogle)}</td>
                        <td className="px-3 sm:px-4 py-3 tabular-nums text-gray-900 dark:text-gray-100">{toHHMM(row.ikindi)}</td>
                        <td className="px-3 sm:px-4 py-3 tabular-nums font-semibold text-gray-900 dark:text-white">{toHHMM(row.aksam)}</td>
                        <td className="px-3 sm:px-4 py-3 tabular-nums text-gray-900 dark:text-gray-100">{toHHMM(row.yatsi)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 text-gray-700 dark:text-gray-300">
                Ramazan 2026 aralığı için veri bulunamadı. Önce import scriptini çalıştırın.
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
              <Link href={`${basePath}/karasu/iftara-kac-dakika-kaldi`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Karasu İftara Kaç Dakika Kaldı
                </Button>
              </Link>
              <Link href={`${basePath}/blog/etiket/ramazan`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                  <FileText className="h-4 w-4 mr-2" />
                  Ramazan Blog Yazıları
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
