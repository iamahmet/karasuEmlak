import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { Phone, MapPin, Car, Bus, Plane, ExternalLink } from 'lucide-react';
import { KOCAALI_ULASIM_YOLLARI, KOCAALI_ULASIM_BILGILERI } from '@/lib/local-info/kocaali-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'İstanbul\'dan Kocaali\'ye nasıl gidilir?',
    answer: `İstanbul'dan Kocaali'ye ${KOCAALI_ULASIM_YOLLARI.istanbul.mesafe} mesafe, yaklaşık ${KOCAALI_ULASIM_YOLLARI.istanbul.sure} sürmektedir. TEM Otoyolu üzerinden ulaşım sağlanmaktadır.`,
  },
  {
    question: 'Kocaali\'ye otobüs ile nasıl gidilir?',
    answer: 'Kocaali\'ye Sakarya Otobüs Terminali üzerinden ulaşım sağlanmaktadır. Sakarya\'dan Kocaali\'ye düzenli otobüs seferleri bulunmaktadır.',
  },
  {
    question: 'Kocaali\'ye en yakın havalimanı hangisi?',
    answer: 'Kocaali\'ye en yakın havalimanı İstanbul Havalimanı\'dır. Yaklaşık 2.5 saat mesafededir. Sabiha Gökçen Havalimanı ise 3 saat mesafededir.',
  },
  {
    question: 'Kocaali\'ye özel araçla nasıl gidilir?',
    answer: 'Kocaali\'ye özel araçla ulaşım için TEM Otoyolu kullanılabilir. İstanbul\'dan yaklaşık 2.5 saat, Sakarya\'dan 45 dakika sürmektedir.',
  },
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'otobus':
      return Bus;
    case 'taksi':
      return Car;
    case 'havaalani':
      return Plane;
    default:
      return Car;
  }
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Kocaali Ulaşım Bilgileri | Nasıl Gidilir? | Karasu Emlak',
    description: 'Kocaali\'ye nasıl gidilir? İstanbul, Sakarya ve Ankara\'dan Kocaali\'ye ulaşım bilgileri. Otobüs, taksi ve havalimanı bilgileri.',
    keywords: [
      'kocaali ulaşım',
      'kocaali nasıl gidilir',
      'kocaali otobüs',
      'kocaali taksi',
      'istanbul kocaali ulaşım',
      'kocaali havalimanı',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/kocaali/ulasim`,
      languages: {
        'tr': '/kocaali/ulasim',
        'en': '/en/kocaali/ulasim',
        'et': '/et/kocaali/ulasim',
        'ru': '/ru/kocaali/ulasim',
        'ar': '/ar/kocaali/ulasim',
      },
    },
    openGraph: {
      title: 'Kocaali Ulaşım Bilgileri | Nasıl Gidilir?',
      description: 'Kocaali\'ye ulaşım bilgileri: Otobüs, taksi, havalimanı ve karayolu bilgileri.',
      url: `${siteConfig.url}${basePath}/kocaali/ulasim`,
      type: 'website',
    },
  };
}

export default async function UlasimPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Kocaali', href: `${basePath}/kocaali` },
            { label: 'Ulaşım' },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Kocaali Ulaşım Bilgileri
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Kocaali'ye nasıl gidilir? İstanbul, Sakarya ve Ankara'dan Kocaali'ye ulaşım bilgileri. Otobüs, taksi ve havalimanı bilgileri.
          </p>
        </section>

        {/* Ulaşım Yolları */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Ulaşım Yolları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(KOCAALI_ULASIM_YOLLARI).map(([sehir, bilgi]) => (
              <Card key={sehir}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2 capitalize">
                    {sehir === 'istanbul' ? 'İstanbul' : sehir === 'sakarya' ? 'Sakarya' : 'Ankara'}
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <strong>Mesafe:</strong> {bilgi.mesafe}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Süre:</strong> {bilgi.sure}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Yol:</strong> {bilgi.yol}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Ulaşım Araçları */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Ulaşım Araçları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {KOCAALI_ULASIM_BILGILERI.map((bilgi) => (
              <Card key={bilgi.baslik}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {bilgi.baslik}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {bilgi.aciklama}
                  </p>
                  {bilgi.detaylar && bilgi.detaylar.length > 0 && (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {bilgi.detaylar.map((detay, idx) => (
                        <li key={idx}>• {detay}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-muted/50 rounded-xl p-6 border">
                <summary className="cursor-pointer flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm md:text-base text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
