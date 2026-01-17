import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import dynamicImport from 'next/dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/kullanim-kosullari' : `/${locale}/kullanim-kosullari`;
  
  return {
    title: 'Kullanım Koşulları | Karasu Emlak',
    description: 'Karasu Emlak web sitesi kullanım koşulları ve şartları. Site kullanımı ile ilgili tüm kurallar ve yasal bilgiler.',
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const termsSections = [
  {
    title: 'Genel Koşullar',
    icon: FileText,
    content: [
      'Bu web sitesi Karasu Emlak tarafından işletilmektedir.',
      'Siteyi kullanarak, bu kullanım koşullarını kabul etmiş sayılırsınız.',
      'Karasu Emlak, bu koşulları önceden haber vermeksizin değiştirme hakkını saklı tutar.',
      'Site içeriği bilgilendirme amaçlıdır ve yasal bağlayıcılığı yoktur.',
    ],
  },
  {
    title: 'Kullanıcı Sorumlulukları',
    icon: Shield,
    content: [
      'Kullanıcılar, siteyi yasalara uygun şekilde kullanmakla yükümlüdür.',
      'Site içeriğini izinsiz kopyalamak, dağıtmak veya ticari amaçla kullanmak yasaktır.',
      'Kullanıcılar, doğru ve güncel bilgiler sağlamakla yükümlüdür.',
      'Siteyi kötüye kullanmak, zararlı yazılım yüklemek veya sistem güvenliğini tehdit etmek yasaktır.',
    ],
  },
  {
    title: 'Fikri Mülkiyet',
    icon: AlertCircle,
    content: [
      'Site içeriği, tasarımı ve yazılımı Karasu Emlak\'ın fikri mülkiyetidir.',
      'İçeriklerin izinsiz kullanımı telif hakkı ihlali sayılır.',
      'Site logosu, markası ve ticari isimleri koruma altındadır.',
      'Kullanıcılar, site içeriğini kişisel, ticari olmayan amaçlarla kullanabilir.',
    ],
  },
  {
    title: 'Sorumluluk Reddi',
    icon: CheckCircle,
    content: [
      'Karasu Emlak, site içeriğinin doğruluğu veya güncelliği konusunda garanti vermez.',
      'Site üzerinden yapılan işlemlerden doğan sorumluluk kullanıcıya aittir.',
      'Emlak ilanlarındaki bilgiler sahiplerinden alınmıştır ve doğruluğu garanti edilmez.',
      'Karasu Emlak, teknik hatalar veya kesintilerden sorumlu tutulamaz.',
    ],
  },
];

export default async function TermsOfUsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Kullanım Koşulları', href: `${basePath}/kullanim-kosullari` },
        ]}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <FileText className="w-12 h-12 mx-auto text-primary-300" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Kullanım Koşulları
                </h1>
                <p className="text-lg text-gray-200">
                  Karasu Emlak web sitesi kullanım koşulları ve şartları
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8">
              {termsSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <ScrollReveal key={index} direction="up" delay={index * 50}>
                    <div className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {section.title}
                        </h2>
                      </div>
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3 text-gray-700">
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

            {/* Contact Section */}
            <ScrollReveal direction="up" delay={200}>
              <div className="mt-12 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Sorularınız İçin
                </h3>
                <p className="text-gray-700 mb-4">
                  Kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz.
                </p>
                <a
                  href={`${basePath}/iletisim`}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-600 font-medium transition-colors"
                >
                  İletişim Sayfasına Git
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}

