import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Phone, MapPin, ExternalLink } from 'lucide-react';
import { KOCAALI_ECZANELER } from '@/lib/local-info/kocaali-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const NOBETCI_ECZANE_BILGILERI = {
  telefon: '444 0 444',
  web: 'https://www.eczaneler.gen.tr',
  aciklama: 'Güncel nöbetçi eczane bilgisi için 444 0 444 numarasını arayabilir veya eczaneler.gen.tr web sitesini ziyaret edebilirsiniz. Nöbetçi eczane bilgileri günlük olarak değişmektedir.',
};

const faqs = [
  {
    question: 'Kocaali nöbetçi eczane nasıl öğrenilir?',
    answer: `Kocaali nöbetçi eczane bilgisi için 444 0 444 numarasını arayabilir veya eczaneler.gen.tr web sitesini ziyaret edebilirsiniz. Nöbetçi eczane bilgileri günlük olarak değişmektedir.`,
  },
  {
    question: `Kocaali'de kaç eczane var?`,
    answer: `Kocaali'de ${KOCAALI_ECZANELER.length} adet eczane bulunmaktadır. Eczaneler merkez ve mahallelerde hizmet vermektedir.`,
  },
  {
    question: 'Kocaali eczaneler hangi saatlerde açık?',
    answer: 'Kocaali eczaneleri genellikle hafta içi 09:00-19:00 saatleri arasında açıktır. Nöbetçi eczaneler 24 saat hizmet vermektedir.',
  },
];

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Kocaali Nöbetçi Eczaneler | Güncel Nöbetçi Eczane Listesi | Karasu Emlak',
    description: 'Kocaali nöbetçi eczaneler, eczane telefon numaraları ve adresleri. Güncel nöbetçi eczane bilgisi için 444 0 444 numarasını arayabilirsiniz.',
    keywords: [
      'kocaali nöbetçi eczane',
      'kocaali eczaneler',
      'kocaali eczane telefon',
      'kocaali eczane adresleri',
      'sakarya kocaali eczane',
      'kocaali nöbetçi eczane listesi',
    ],
    alternates: {
      canonical: `${basePath}/kocaali/nobetci-eczaneler`,
    },
    openGraph: {
      title: 'Kocaali Nöbetçi Eczaneler | Güncel Nöbetçi Eczane Listesi',
      description: 'Kocaali nöbetçi eczaneler ve eczane bilgileri. Güncel nöbetçi eczane sorgulama.',
      url: `${siteConfig.url}${basePath}/kocaali/nobetci-eczaneler`,
      type: 'website',
    },
  };
}

export default async function NobetciEczanelerPage({
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
            { label: 'Nöbetçi Eczaneler' },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Kocaali Nöbetçi Eczaneler
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Kocaali nöbetçi eczaneler ve eczane bilgileri. Güncel nöbetçi eczane bilgisi için aşağıdaki telefon numarasını arayabilirsiniz.
          </p>
        </section>

        {/* Nöbetçi Eczane Sorgulama */}
        <section className="mb-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                Nöbetçi Eczane Sorgulama
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                {NOBETCI_ECZANE_BILGILERI.aciklama}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${NOBETCI_ECZANE_BILGILERI.telefon.replace(/\s/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Phone className="h-5 w-5" />
                  {NOBETCI_ECZANE_BILGILERI.telefon}
                </a>
                {NOBETCI_ECZANE_BILGILERI.web && (
                  <a
                    href={NOBETCI_ECZANE_BILGILERI.web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Web Sitesi
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Eczaneler */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Kocaali Eczaneleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KOCAALI_ECZANELER.map((eczane) => (
              <Card key={eczane.name}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {eczane.name}
                  </h3>
                  <div className="space-y-2">
                    {eczane.mahalle && (
                      <div className="text-sm text-muted-foreground">
                        Mahalle: {eczane.mahalle}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{eczane.adres}</span>
                    </div>
                    <a
                      href={`tel:${eczane.telefon.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {eczane.telefon}
                    </a>
                  </div>
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
