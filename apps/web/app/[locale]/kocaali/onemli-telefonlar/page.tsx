import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { Phone, AlertCircle } from 'lucide-react';
import { KOCAALI_TELEFONLAR, getKocaaliTelefonlarByKategori, getKocaaliTelefonKategorileri } from '@/lib/local-info/kocaali-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'Kocaali acil durum telefonları nelerdir?',
    answer: 'Kocaali acil durum telefonları: Polis İmdat 155, Jandarma İmdat 156, İtfaiye 110, Ambulans 112, Sahil Güvenlik 158. Tüm acil durumlar için bu numaraları kullanabilirsiniz.',
  },
  {
    question: 'Kocaali belediye telefon numarası nedir?',
    answer: 'Kocaali Belediyesi ana telefon numarası 0264 511 20 50\'dir. Belediye hizmetleri, şikayetler ve diğer işlemler için bu numarayı arayabilirsiniz.',
  },
  {
    question: 'Kocaali hastane telefon numarası nedir?',
    answer: 'Kocaali Devlet Hastanesi telefon numarası 0264 511 20 00\'dür. Acil durumlar için 112 numarasını arayabilirsiniz.',
  },
];

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Kocaali Önemli Telefonlar | Acil Durum ve Kurum Telefonları | Karasu Emlak',
    description: 'Kocaali önemli telefon numaraları: Polis, itfaiye, ambulans, belediye, hastane ve diğer kurum telefonları. Kocaali acil durum telefonları.',
    keywords: [
      'kocaali önemli telefonlar',
      'kocaali acil durum telefonları',
      'kocaali polis telefon',
      'kocaali itfaiye telefon',
      'kocaali belediye telefon',
      'kocaali hastane telefon',
      'sakarya kocaali telefon',
    ],
    alternates: {
      canonical: `${basePath}/kocaali/onemli-telefonlar`,
    },
    openGraph: {
      title: 'Kocaali Önemli Telefonlar | Acil Durum ve Kurum Telefonları',
      description: 'Kocaali önemli telefon numaraları: Polis, itfaiye, ambulans, belediye ve diğer kurum telefonları.',
      url: `${siteConfig.url}${basePath}/kocaali/onemli-telefonlar`,
      type: 'website',
    },
  };
}

export default async function OnemliTelefonlarPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const kategoriler = getKocaaliTelefonKategorileri();
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Kocaali', href: `${basePath}/kocaali` },
            { label: 'Önemli Telefonlar' },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Kocaali Önemli Telefonlar
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Kocaali acil durum telefonları, belediye, hastane ve diğer önemli kurum telefon numaraları. Hızlı erişim için kaydedin.
          </p>
        </section>

        {/* Acil Durum Highlight */}
        <section className="mb-12 bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Acil Durum Telefonları
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {getKocaaliTelefonlarByKategori('Acil').map((telefon) => (
              <a
                key={telefon.kurum}
                href={`tel:${telefon.telefon.replace(/\s/g, '')}`}
                className="bg-white dark:bg-gray-950 rounded-xl border-2 border-red-200 dark:border-red-800 p-4 hover:border-red-400 dark:hover:border-red-600 hover:shadow-lg transition-all duration-200 text-center group"
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="font-semibold text-sm mb-1">{telefon.kurum}</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{telefon.telefon}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Diğer Kategoriler */}
        {kategoriler.filter(k => k !== 'Acil').map((kategori) => {
          const telefonlar = getKocaaliTelefonlarByKategori(kategori);
          if (telefonlar.length === 0) return null;
          
          return (
            <section key={kategori} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                {kategori}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {telefonlar.map((telefon) => (
                  <Card key={telefon.kurum}>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {telefon.kurum}
                      </h3>
                      {telefon.aciklama && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {telefon.aciklama}
                        </p>
                      )}
                      <a
                        href={`tel:${telefon.telefon.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 text-primary hover:underline font-semibold"
                      >
                        <Phone className="h-4 w-4" />
                        {telefon.telefon}
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}

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
