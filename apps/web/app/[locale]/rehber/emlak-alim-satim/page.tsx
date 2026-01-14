import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { GuideSidebar } from '@/components/guides/GuideSidebar';
import { RelatedGuides } from '@/components/guides/RelatedGuides';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { AIChecker } from '@/components/content/AIChecker';
import { AICheckerBadge } from '@/components/content/AICheckerBadge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/rehber/emlak-alim-satim' : `/${locale}/rehber/emlak-alim-satim`;
  
  return {
    title: 'Emlak Alım-Satım Rehberi | Karasu Emlak',
    description: 'Emlak alım-satım sürecinde bilmeniz gerekenler, dikkat edilmesi gereken noktalar ve yasal süreçler hakkında kapsamlı rehber.',
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/rehber/emlak-alim-satim',
        'en': '/en/rehber/emlak-alim-satim',
        'et': '/et/rehber/emlak-alim-satim',
        'ru': '/ru/rehber/emlak-alim-satim',
        'ar': '/ar/rehber/emlak-alim-satim',
      },
    },
    openGraph: {
      title: 'Emlak Alım-Satım Rehberi | Karasu Emlak',
      description: 'Emlak alım-satım sürecinde bilmeniz gerekenler',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function EmlakAlimSatimPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const steps = [
    {
      title: '1. Hazırlık Aşaması',
      items: [
        'Bütçenizi belirleyin',
        'Kredi onayınızı alın (gerekirse)',
        'İhtiyaçlarınızı listeleyin',
        'Bölge araştırması yapın',
      ],
    },
    {
      title: '2. İlan Araştırması',
      items: [
        'Güvenilir emlak sitelerini kullanın',
        'Fiyat araştırması yapın',
        'Mahalle ve çevreyi inceleyin',
        'Ulaşım imkanlarını değerlendirin',
      ],
    },
    {
      title: '3. Görüntüleme ve Değerlendirme',
      items: [
        'Emlakı mutlaka görüntüleyin',
        'Yapısal durumu kontrol edin',
        'Çevre faktörlerini değerlendirin',
        'Sorularınızı hazırlayın',
      ],
    },
    {
      title: '4. Hukuki Süreçler',
      items: [
        'Tapu kontrolü yapın',
        'İpotek durumunu kontrol edin',
        'Yasal belgeleri inceleyin',
        'Noter sözleşmesi hazırlayın',
      ],
    },
    {
      title: '5. Finansman',
      items: [
        'Kredi başvurusu (gerekirse)',
        'Ödeme planı belirleyin',
        'Sigorta işlemlerini tamamlayın',
        'Vergi ödemelerini planlayın',
      ],
    },
    {
      title: '6. Tapu Devri',
      items: [
        'Gerekli belgeleri hazırlayın',
        'Tapu müdürlüğüne başvurun',
        'Devir işlemini tamamlayın',
        'Tapu senedini teslim alın',
      ],
    },
  ];

  const importantNotes = [
    {
      icon: AlertCircle,
      title: 'Dikkat Edilmesi Gerekenler',
      items: [
        'Tapu kaydını mutlaka kontrol edin',
        'İpotek ve haciz durumunu araştırın',
        'Yapı ruhsatı ve iskan durumunu kontrol edin',
        'Komşu haklarını göz önünde bulundurun',
        'Deprem sigortası yaptırın',
      ],
    },
    {
      icon: CheckCircle,
      title: 'Gerekli Belgeler',
      items: [
        'Kimlik belgesi',
        'Gelir belgesi',
        'Vergi levhası',
        'Tapu senedi',
        'Yapı ruhsatı ve iskan belgesi',
        'Emlak vergisi belgesi',
      ],
    },
    {
      icon: Info,
      title: 'Yardımcı Olabilecek Kurumlar',
      items: [
        'Emlak Müşavirleri',
        'Noterler',
        'Banka Kredi Departmanları',
        'Tapu Müdürlükleri',
        'Belediyeler',
      ],
    },
  ];

  // Generate HTML content for TOC
  const guideContent = `
    <h2 id="alim-satim-sureci">Alım-Satım Süreci</h2>
    <p>Emlak alım-satım sürecinde izlemeniz gereken adımlar ve dikkat edilmesi gereken noktalar.</p>
    
    <h3 id="hazirlik-asamasi">Hazırlık Aşaması</h3>
    <p>Bütçe belirleme, kredi onayı ve ihtiyaç analizi.</p>
    
    <h3 id="ilan-arastirmasi">İlan Araştırması</h3>
    <p>Güvenilir kaynaklardan ilan araştırması ve fiyat analizi.</p>
    
    <h3 id="goruntuleme-ve-degerlendirme">Görüntüleme ve Değerlendirme</h3>
    <p>Emlak görüntüleme ve değerlendirme süreci.</p>
    
    <h3 id="hukuki-surecler">Hukuki Süreçler</h3>
    <p>Tapu kontrolü, ipotek durumu ve yasal belgeler.</p>
    
    <h3 id="finansman">Finansman</h3>
    <p>Kredi başvurusu ve ödeme planı.</p>
    
    <h3 id="tapu-devri">Tapu Devri</h3>
    <p>Tapu devir işlemleri ve gerekli belgeler.</p>
    
    <h2 id="onemli-bilgiler">Önemli Bilgiler</h2>
    <p>Dikkat edilmesi gerekenler, gerekli belgeler ve yardımcı kurumlar.</p>
  `;

  // Calculate reading time and word count
  const readingTime = calculateReadingTime(guideContent);
  const wordCount = guideContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;

  // Related guides
  const relatedGuides = [
    {
      id: 'yatirim',
      title: 'Yatırım Rehberi',
      href: `${basePath}/rehber/yatirim`,
      description: 'Emlak yatırımı yaparken bilmeniz gerekenler',
      category: 'Yatırım',
    },
    {
      id: 'kiralama',
      title: 'Kiralama Rehberi',
      href: `${basePath}/rehber/kiralama`,
      description: 'Ev kiralama sürecinde dikkat edilmesi gerekenler',
      category: 'Kiralama',
    },
  ];

  // FAQs for structured data
  const faqs = [
    {
      question: 'Emlak alırken hangi belgeleri kontrol etmeliyim?',
      answer: 'Tapu senedi, yapı ruhsatı, iskan belgesi, emlak vergisi belgesi ve ipotek durumu kontrol edilmelidir.',
    },
    {
      question: 'Emlak satarken hangi masraflar çıkar?',
      answer: 'Noter masrafları, tapu devir harçları, emlak vergisi ve komisyon ücretleri çıkabilir.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
    <div className="min-h-screen bg-white">
      {/* AI Checker Badge */}
      <AICheckerBadge
        content={guideContent}
        title="Emlak Alım-Satım Rehberi"
        position="top-right"
      />

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Rehber', href: `${basePath}/rehber` },
          { label: 'Emlak Alım-Satım Rehberi' },
        ]}
        className="mb-8 container mx-auto px-4 pt-8"
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,900px)_380px] gap-10 lg:gap-16">
          {/* Main Content */}
          <main className="min-w-0 w-full">
            {/* AI Checker */}
            <div id="ai-checker" className="mb-8">
              <AIChecker
                content={guideContent}
                title="Emlak Alım-Satım Rehberi"
                contentType="guide"
                showDetails={true}
              />
            </div>

        {/* Header */}
        <header className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-blue-100 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Emlak Alım-Satım Rehberi</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
              Emlak alım-satım sürecinde bilmeniz gerekenler, dikkat edilmesi gereken noktalar ve yasal süreçler hakkında kapsamlı rehber. Uzman ekibimiz tarafından hazırlanmış adım adım rehber.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>6 Adımlı Süreç</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span>Önemli Uyarılar</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Gerekli Belgeler</span>
              </div>
            </div>
          </div>
        </header>

        {/* Steps */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-12" id="alim-satim-sureci">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Alım-Satım Süreci</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 100}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                        <ul className="space-y-3">
                          {step.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Important Notes */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-12" id="onemli-bilgiler">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Önemli Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {importantNotes.map((note, index) => {
                const Icon = note.icon;
                return (
                  <ScrollReveal key={index} direction="up" delay={index * 100}>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                      <Icon className="h-8 w-8 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">{note.title}</h3>
                      <ul className="space-y-2">
                        {note.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal direction="up" delay={0}>
          <section className="text-center border-t pt-12">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Yardıma mı ihtiyacınız var?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Profesyonel ekibimiz emlak alım-satım sürecinizde size yardımcı olmaya hazır. Tüm sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${basePath}/iletisim`}>
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                    İletişime Geç
                  </Button>
                </Link>
                <Link href={`${basePath}/satilik`}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Satılık İlanları Gör
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

            {/* Related Guides Section */}
            <RelatedGuides
              guides={relatedGuides}
              title="İlgili Rehberler"
              basePath={basePath}
              className="mt-16"
            />
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <GuideSidebar
              basePath={basePath}
              guide={{
                id: 'emlak-alim-satim-rehberi',
                title: 'Emlak Alım-Satım Rehberi',
                content: guideContent,
                published_at: new Date().toISOString(),
              }}
              readingTime={readingTime}
              wordCount={wordCount}
              relatedGuides={relatedGuides}
              showTOC={true}
            />
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}

