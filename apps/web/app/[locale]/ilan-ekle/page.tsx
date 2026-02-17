import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import Link from 'next/link';
import { AddListingForm } from '@/components/listings/AddListingForm';
import { PageIntro, FAQBlock } from '@/components/content';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { withTimeout } from '@/lib/utils/timeout';
import { getQAEntries } from '@/lib/supabase/queries/qa';
import { Home, FileText, ArrowRight, MapPin, Phone } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/ilan-ekle' : `/${locale}/ilan-ekle`;

  return {
    title: 'İlan Ekle | Karasu Emlak',
    description: 'Karasu Emlak\'a ilan ekleyin. Satılık veya kiralık emlak ilanınızı kolayca yayınlayın.',
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'İlan Ekle | Karasu Emlak',
      description: 'Emlak ilanınızı ekleyin - Karasu Emlak',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function AddListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: basePath || '/' },
    { label: 'İlan Ekle', href: `${basePath}/ilan-ekle` },
  ];

  const qaEntries = await withTimeout(getQAEntries('karasu', 'medium'), 2000, []);
  const faqs = (qaEntries || [])
    .filter(qa => /ilan|ekle|yayın|onay/.test(qa.question.toLowerCase()))
    .slice(0, 4)
    .map(qa => ({ question: qa.question, answer: qa.answer }));
  const fallbackFaqs = [
    { question: 'İlanım ne zaman yayınlanır?', answer: 'İlanınız gönderildikten sonra ekibimiz tarafından incelenir. Genellikle 24 saat içinde onaylanır ve yayına alınır. Acil durumlarda iletişim sayfamızdan bize ulaşabilirsiniz.' },
    { question: 'İlan eklerken hangi bilgiler zorunlu?', answer: 'Başlık, emlak tipi, ilan tipi (satılık/kiralık), fiyat, adres ve en az bir görsel zorunludur. Detaylı açıklama ve ek özellikler ilanınızın görünürlüğünü artırır.' },
    { question: 'İlanımı düzenleyebilir miyim?', answer: 'Evet. Yayınlanan ilanınızı giriş yaptıktan sonra hesabınızdan düzenleyebilirsiniz. Değişiklikler yine inceleme sürecinden geçer.' },
    { question: 'Ücretsiz ilan ekleyebilir miyim?', answer: 'Evet, Karasu Emlak üzerinden ilan eklemek ücretsizdir. Satılık veya kiralık ilanınızı ekleyip binlerce potansiyel alıcıya ulaşabilirsiniz.' },
  ];
  const displayFaqs = faqs.length > 0 ? faqs : fallbackFaqs;
  const faqSchema = displayFaqs.length > 0 ? generateFAQSchema(displayFaqs) : null;

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="max-w-4xl mx-auto">
          <PageIntro
            title="İlan Ekle"
            description="Emlak ilanınızı kolayca ekleyin ve binlerce potansiyel alıcıya ulaşın. Satılık veya kiralık ilanınızı onay sürecinden sonra yayınlıyoruz."
            className="mb-8"
          />

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Bilgilendirme</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>İlanınız gönderildikten sonra inceleme sürecinden geçecektir</li>
                  <li>Onaylandıktan sonra ilanınız yayınlanacaktır</li>
                  <li>Zorunlu alanlar (*) ile işaretlenmiştir</li>
                  <li>Görseller yüklenirken lütfen bekleyin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 md:p-8">
            <AddListingForm />
          </div>

          {displayFaqs.length > 0 && (
            <FAQBlock
              faqs={displayFaqs}
              title="İlan Ekleme Hakkında Sık Sorulan Sorular"
              className="mt-12"
            />
          )}

          {/* Internal Links */}
          <section className="mt-12 pt-12 border-t dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6">İlgili Sayfalar</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href={`${basePath}/satilik`} className="flex items-center gap-3 p-4 rounded-xl border dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-colors">
                <Home className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <span className="font-semibold">Satılık İlanlar</span>
                  <p className="text-sm text-muted-foreground">Mevcut satılık ilanlar</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Link>
              <Link href={`${basePath}/kiralik`} className="flex items-center gap-3 p-4 rounded-xl border dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-colors">
                <Home className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <span className="font-semibold">Kiralık İlanlar</span>
                  <p className="text-sm text-muted-foreground">Mevcut kiralık ilanlar</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Link>
              <Link href={`${basePath}/karsilastir`} className="flex items-center gap-3 p-4 rounded-xl border dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-colors">
                <MapPin className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <span className="font-semibold">İlan Karşılaştırma</span>
                  <p className="text-sm text-muted-foreground">İlanları karşılaştırın</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Link>
              <Link href={`${basePath}/iletisim`} className="flex items-center gap-3 p-4 rounded-xl border dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-colors">
                <Phone className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <span className="font-semibold">İletişim</span>
                  <p className="text-sm text-muted-foreground">Yardım için bize ulaşın</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

