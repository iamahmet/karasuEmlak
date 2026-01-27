import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@karasu/ui';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Check, X } from 'lucide-react';
import { getNeighborhoods } from '@/lib/supabase/queries';
import { compareNeighborhoods, getNeighborhoodsByPrice, getNeighborhoodsByInvestmentPotential } from '@/lib/mahalle/comparison-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { generateSlug } from '@/lib/utils';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'Karasu mahallelerini nasıl karşılaştırabilirim?',
    answer: 'Karasu mahallelerini fiyat, özellikler ve yatırım potansiyeli açısından karşılaştırmak için bu sayfadaki karşılaştırma tablosunu kullanabilirsiniz. Her mahalle için detaylı bilgiler mevcuttur.',
  },
  {
    question: 'Hangi mahalle yatırım için en uygun?',
    answer: 'Yatırım potansiyeli yüksek mahalleler genellikle denize yakın, merkeze yakın ve gelişmekte olan bölgelerdir. Sahil, Merkez ve Yalı mahalleleri yüksek yatırım potansiyeline sahiptir.',
  },
  {
    question: 'Mahalle fiyatları nasıl belirleniyor?',
    answer: 'Mahalle fiyatları, o mahalledeki mevcut ilanların ortalama fiyatlarına göre belirlenmektedir. Fiyatlar gayrimenkul tipine (daire, villa, yazlık) göre değişiklik göstermektedir.',
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
    title: 'Karasu Mahalle Karşılaştırması | Fiyat, Özellikler, Yatırım Potansiyeli',
    description: 'Karasu mahallelerini fiyat, özellikler ve yatırım potansiyeli açısından karşılaştırın. En uygun mahalleyi bulun.',
    keywords: [
      'karasu mahalle karşılaştırma',
      'karasu mahalle fiyatları',
      'karasu yatırım potansiyeli',
      'karasu en iyi mahalle',
    ],
    alternates: {
      canonical: `${basePath}/karasu/mahalle-karsilastirma`,
    },
    openGraph: {
      title: 'Karasu Mahalle Karşılaştırması | Fiyat, Özellikler, Yatırım Potansiyeli',
      description: 'Karasu mahallelerini fiyat, özellikler ve yatırım potansiyeli açısından karşılaştırın.',
      url: `${siteConfig.url}${basePath}/karasu/mahalle-karsilastirma`,
      type: 'website',
    },
  };
}

export default async function MahalleKarsilastirmaPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Get neighborhoods from database
  const neighborhoods = await getNeighborhoods();
  
  // Compare neighborhoods
  const comparisons = compareNeighborhoods(neighborhoods);
  const byPriceDaire = getNeighborhoodsByPrice('daire');
  const byPriceVilla = getNeighborhoodsByPrice('villa');
  const byPriceYazlik = getNeighborhoodsByPrice('yazlik');
  const byInvestment = getNeighborhoodsByInvestmentPotential();

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Karasu', href: '/karasu' },
            { label: 'Mahalle Karşılaştırması' },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Karasu Mahalle Karşılaştırması
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mahalleleri fiyat, özellikler ve yatırım potansiyeli açısından karşılaştırın
          </p>
        </section>

        {/* Comparison Table */}
        {comparisons.length > 0 && (
          <section className="mb-12">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Mahalle Karşılaştırma Tablosu
                </h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahalle</TableHead>
                        <TableHead>Daire (₺/m²)</TableHead>
                        <TableHead>Villa (₺/m²)</TableHead>
                        <TableHead>Yazlık (₺/m²)</TableHead>
                        <TableHead>Fiyat Trendi</TableHead>
                        <TableHead>Yatırım Potansiyeli</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisons.map((comp) => {
                        const slug = generateSlug(comp.mahalle);
                        return (
                          <TableRow key={comp.mahalle}>
                            <TableCell>
                              <Link
                                href={`${basePath}/mahalle/${slug}`}
                                className="font-semibold text-primary hover:underline"
                              >
                                {comp.mahalle}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {comp.averagePrice.daire.toLocaleString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              {comp.averagePrice.villa.toLocaleString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              {comp.averagePrice.yazlik.toLocaleString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                comp.priceTrend === 'up'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : comp.priceTrend === 'down'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                              }`}>
                                {comp.priceTrend === 'up' && <><TrendingUp className="h-3 w-3" /> Artış</>}
                                {comp.priceTrend === 'down' && <><TrendingDown className="h-3 w-3" /> Düşüş</>}
                                {comp.priceTrend === 'stable' && <><Minus className="h-3 w-3" /> Stabil</>}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                comp.investmentPotential === 'high'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : comp.investmentPotential === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                              }`}>
                                {comp.investmentPotential === 'high' && 'Yüksek'}
                                {comp.investmentPotential === 'medium' && 'Orta'}
                                {comp.investmentPotential === 'low' && 'Düşük'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Detailed Comparisons */}
        {comparisons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Detaylı Mahalle Bilgileri
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {comparisons.map((comp) => {
                const slug = generateSlug(comp.mahalle);
                return (
                  <Card key={comp.mahalle}>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4">
                        {comp.mahalle} Mahallesi
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Özellikler</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>Denize uzaklık: {comp.features.seaDistance}</li>
                            <li>Merkeze uzaklık: {comp.features.centerDistance}</li>
                            <li>Ulaşım: {
                              comp.features.transportation === 'excellent' ? 'Mükemmel' :
                              comp.features.transportation === 'good' ? 'İyi' : 'Orta'
                            }</li>
                            <li>Sosyal yaşam: {
                              comp.features.socialLife === 'excellent' ? 'Mükemmel' :
                              comp.features.socialLife === 'good' ? 'İyi' : 'Orta'
                            }</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2">Avantajlar</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {comp.pros.map((pro, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2">Dezavantajlar</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {comp.cons.map((con, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <X className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2">Kimler İçin İdeal?</h4>
                          <div className="flex flex-wrap gap-2">
                            {comp.bestFor.map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <Link
                            href={`${basePath}/mahalle/${slug}`}
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            {comp.mahalle} Mahallesi İlanları →
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Price Rankings */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Fiyat Sıralaması
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Daire Fiyatları</h3>
                <div className="space-y-2">
                  {byPriceDaire.slice(0, 5).map((item, index) => (
                    <div key={item.mahalle} className="flex items-center justify-between">
                      <span className="text-sm">{index + 1}. {item.mahalle}</span>
                      <span className="text-sm font-semibold">{item.price.toLocaleString('tr-TR')} ₺/m²</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Villa Fiyatları</h3>
                <div className="space-y-2">
                  {byPriceVilla.slice(0, 5).map((item, index) => (
                    <div key={item.mahalle} className="flex items-center justify-between">
                      <span className="text-sm">{index + 1}. {item.mahalle}</span>
                      <span className="text-sm font-semibold">{item.price.toLocaleString('tr-TR')} ₺/m²</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Yazlık Fiyatları</h3>
                <div className="space-y-2">
                  {byPriceYazlik.slice(0, 5).map((item, index) => (
                    <div key={item.mahalle} className="flex items-center justify-between">
                      <span className="text-sm">{index + 1}. {item.mahalle}</span>
                      <span className="text-sm font-semibold">{item.price.toLocaleString('tr-TR')} ₺/m²</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Investment Potential */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Yatırım Potansiyeli Sıralaması
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {byInvestment.map((item) => (
                  <div key={item.mahalle} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{item.mahalle}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.potential === 'high'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : item.potential === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {item.potential === 'high' && 'Yüksek'}
                      {item.potential === 'medium' && 'Orta'}
                      {item.potential === 'low' && 'Düşük'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

