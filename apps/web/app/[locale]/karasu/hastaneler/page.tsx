import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { HospitalsMapLeaflet as HospitalsMap, type HospitalLocation } from '@/components/maps/HospitalsMapLeaflet';
import { HospitalCard } from '@/components/hospitals/HospitalCard';
import { KARASU_SAGLIK_KURULUSLARI } from '@/lib/local-info/karasu-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateLocalBusinessSchema } from '@/lib/seo/structured-data';
import Link from 'next/link';
import { HospitalsPageClient } from './HospitalsPageClient';
import { RelatedBlogSection } from '@/components/hospitals/RelatedBlogSection';
import { HealthInfoSection } from '@/components/hospitals/HealthInfoSection';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'Karasu Devlet Hastanesi nerede?',
    answer: 'Karasu Devlet Hastanesi Aziziye Mahallesi, 350. Sokak No:27, 54500 Karasu/Sakarya adresinde bulunmaktadır. Telefon: 0264 718 11 43',
  },
  {
    question: 'Karasu\'da acil servis var mı?',
    answer: 'Evet, Karasu Devlet Hastanesi\'nde 24 saat acil servis hizmeti bulunmaktadır. Acil durumlar için 112 numarasını arayabilirsiniz.',
  },
  {
    question: 'Karasu Aile Sağlığı Merkezi hangi hizmetleri sunuyor?',
    answer: 'Karasu Aile Sağlığı Merkezi aile hekimi hizmetleri, aşı, muayene ve genel sağlık hizmetleri sunmaktadır.',
  },
  {
    question: 'Karasu\'da özel hastane var mı?',
    answer: 'Karasu\'da özel sağlık merkezleri bulunmaktadır. Detaylı bilgi için sayfadaki iletişim bilgilerini kullanabilirsiniz.',
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
    title: 'Karasu Hastaneler ve Sağlık Kuruluşları | Karasu Emlak',
    description: 'Karasu hastaneler, sağlık merkezleri ve sağlık kuruluşları. Karasu Devlet Hastanesi, Aile Sağlığı Merkezi ve özel sağlık kuruluşları. Harita, telefon ve adres bilgileri.',
    keywords: [
      'karasu hastane',
      'karasu devlet hastanesi',
      'karasu sağlık merkezi',
      'karasu hastane telefon',
      'karasu acil servis',
      'sakarya karasu hastane',
      'karasu hastane adres',
      'karasu sağlık kuruluşları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/karasu/hastaneler`,
      languages: pruneHreflangLanguages({
        'tr': '/karasu/hastaneler',
        'en': '/en/karasu/hastaneler',
        'et': '/et/karasu/hastaneler',
        'ru': '/ru/karasu/hastaneler',
        'ar': '/ar/karasu/hastaneler',
      }),
    },
    openGraph: {
      title: 'Karasu Hastaneler ve Sağlık Kuruluşları',
      description: 'Karasu hastaneler, sağlık merkezleri ve sağlık kuruluşları bilgileri. Harita, telefon ve adres bilgileri.',
      url: `${siteConfig.url}${basePath}/karasu/hastaneler`,
      type: 'website',
    },
  };
}

export default async function HastanelerPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const hastaneler = KARASU_SAGLIK_KURULUSLARI.filter(k => k.type === 'hastane');
  const saglikMerkezleri = KARASU_SAGLIK_KURULUSLARI.filter(k => k.type === 'saglik-merkezi');
  const ozelSaglik = KARASU_SAGLIK_KURULUSLARI.filter(k => k.type === 'ozel-saglik');

  const faqSchema = generateFAQSchema(faqs);

  // LocalBusiness schema for hospitals
  const localBusinessSchemas = [
    ...hastaneler.map(h => generateLocalBusinessSchema({
      name: h.name,
      address: h.adres,
      telephone: h.telefon,
      description: h.aciklama,
      type: 'Hospital',
    })),
    ...saglikMerkezleri.map(h => generateLocalBusinessSchema({
      name: h.name,
      address: h.adres,
      telephone: h.telefon,
      description: h.aciklama,
      type: 'MedicalCenter',
    })),
    ...ozelSaglik.map(h => generateLocalBusinessSchema({
      name: h.name,
      address: h.adres,
      telephone: h.telefon,
      description: h.aciklama,
      type: 'MedicalBusiness',
    })),
  ];

  // Convert to HospitalLocation format for map with coordinates
  const allHospitalsForMap: HospitalLocation[] = [
    ...hastaneler.map(h => ({
      name: h.name,
      address: h.adres,
      type: h.type,
      phone: h.telefon,
      // Karasu Devlet Hastanesi - Aziziye Mahallesi (approximate coordinates)
      lat: h.name.includes('Devlet Hastanesi') ? 41.0969 : undefined,
      lng: h.name.includes('Devlet Hastanesi') ? 30.6906 : undefined,
    })),
    ...saglikMerkezleri.map(h => ({
      name: h.name,
      address: h.adres,
      type: h.type,
      phone: h.telefon,
      // Karasu Aile Sağlığı Merkezi - Kabakoz (approximate coordinates)
      lat: h.name.includes('Aile Sağlığı') ? 41.0950 : undefined,
      lng: h.name.includes('Aile Sağlığı') ? 30.6920 : undefined,
    })),
    ...ozelSaglik.map(h => ({
      name: h.name,
      address: h.adres,
      type: h.type,
      phone: h.telefon,
      // Özel Sakarya Karasu Doktorlar Merkezi - Yalı Mahallesi (approximate coordinates)
      lat: h.name.includes('Doktorlar Merkezi') ? 41.0980 : undefined,
      lng: h.name.includes('Doktorlar Merkezi') ? 30.6880 : undefined,
    })),
  ];

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      {localBusinessSchemas.map((schema, idx) => (
        <StructuredData key={idx} data={schema} />
      ))}
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Karasu', href: `${basePath}/karasu` },
            { label: 'Hastaneler', href: `${basePath}/karasu/hastaneler` },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-2xl p-8 md:p-12 border border-red-100 dark:border-red-800/50">
            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Karasu Hastaneler ve Sağlık Kuruluşları
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-6 leading-relaxed">
                Karasu hastaneler, sağlık merkezleri ve sağlık kuruluşları. Acil durumlar için 112 numarasını arayın.
              </p>
              <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">{hastaneler.length}</span>
                  <span className="text-gray-600 dark:text-gray-300">Hastane</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">{saglikMerkezleri.length}</span>
                  <span className="text-gray-600 dark:text-gray-300">Sağlık Merkezi</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">24</span>
                  <span className="text-gray-600 dark:text-gray-300">Saat Acil Servis</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Acil Servis Highlight */}
        <section className="mb-12 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 rounded-xl p-6 md:p-8 border-2 border-red-500 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Acil Durumlar İçin
              </h2>
              <a
                href="tel:112"
                className="inline-flex items-center gap-3 text-3xl md:text-4xl font-bold text-white hover:text-red-100 transition-colors mb-2"
                aria-label="Acil servis 112"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                112
              </a>
              <p className="text-red-100 text-sm md:text-base mt-2">
                Tüm acil sağlık durumları için 112 numarasını arayın
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Map */}
        {allHospitalsForMap.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                Haritada Konumlar
              </h2>
            </div>
            <HospitalsMap 
              hospitals={allHospitalsForMap} 
              center={{ lat: 41.0969, lng: 30.6906 }}
              height="500px"
              className="w-full"
            />
          </section>
        )}

        {/* Client Component for Search/Filter */}
        <HospitalsPageClient
          hastaneler={hastaneler}
          saglikMerkezleri={saglikMerkezleri}
          ozelSaglik={ozelSaglik}
          basePath={basePath}
        />

        {/* Health Information Section */}
        <HealthInfoSection city="karasu" className="mb-12" />

        {/* Related Blog Articles */}
        <RelatedBlogSection basePath={basePath} city="karasu" className="mb-12" />

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-900 dark:text-white">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-muted/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                <summary className="cursor-pointer flex items-center justify-between list-none">
                  <h3 className="text-base md:text-lg font-semibold pr-4 text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">İlgili Sayfalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href={`${basePath}/karasu/nobetci-eczaneler`} 
              className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all bg-white dark:bg-gray-800"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Nöbetçi Eczaneler</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">24 saat açık eczaneler</p>
            </Link>
            <Link 
              href={`${basePath}/karasu/onemli-telefonlar`} 
              className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all bg-white dark:bg-gray-800"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Önemli Telefonlar</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Acil durum telefonları</p>
            </Link>
            <Link 
              href={`${basePath}/karasu`} 
              className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all bg-white dark:bg-gray-800"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Karasu Rehberi</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tüm Karasu bilgileri</p>
            </Link>
            <Link 
              href={`${basePath}/karasu/ulasim`} 
              className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all bg-white dark:bg-gray-800"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Ulaşım Bilgileri</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Nasıl gidilir?</p>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
