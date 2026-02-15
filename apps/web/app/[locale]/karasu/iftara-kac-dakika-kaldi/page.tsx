import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getPrayerTimesByDate } from '@/lib/supabase/queries/prayer-times';
import { IftarCountdown } from '@/components/ramadan/IftarCountdown';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button } from '@karasu/ui';
import { ArrowRight, Calendar, FileText } from 'lucide-react';

export const revalidate = 60;

const KARASU_DISTRICT_ID = 9803;

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
      languages: {
        tr: '/karasu/iftara-kac-dakika-kaldi',
        en: '/en/karasu/iftara-kac-dakika-kaldi',
        et: '/et/karasu/iftara-kac-dakika-kaldi',
        ru: '/ru/karasu/iftara-kac-dakika-kaldi',
        ar: '/ar/karasu/iftara-kac-dakika-kaldi',
      },
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

  return (
    <>
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      {faqSchema && <StructuredData data={faqSchema} />}

      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
          <header className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-blue-50/60 p-6 md:p-10 shadow-sm mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              Karasu İftara Kaç Dakika Kaldı?
            </h1>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl leading-relaxed">
              “<strong>Karasu iftara kaç dakika kaldı</strong>” ve “<strong>Sakarya Karasu iftara kaç dk kaldı</strong>” diye arayanlar için canlı geri sayım.
              Aşağıda ayrıca bugünün Karasu iftar vakti ve diğer vakitleri de var.
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
