import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { BookOpen, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/rehber/kiralama' : `/${locale}/rehber/kiralama`;
  
  return {
    title: 'Kiralama Rehberi | Karasu Emlak',
    description: 'Ev kiralama sürecinde dikkat edilmesi gerekenler, kira sözleşmesi hazırlama ve kiracı hakları hakkında kapsamlı rehber.',
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/rehber/kiralama',
        'en': '/en/rehber/kiralama',
        'et': '/et/rehber/kiralama',
        'ru': '/ru/rehber/kiralama',
        'ar': '/ar/rehber/kiralama',
      },
    },
    openGraph: {
      title: 'Kiralama Rehberi | Karasu Emlak',
      description: 'Ev kiralama sürecinde dikkat edilmesi gerekenler',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function KiralamaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const steps = [
    {
      title: '1. Bütçe Belirleme',
      items: [
        'Aylık kira bütçenizi belirleyin',
        'Depozito ve aidat masraflarını hesaplayın',
        'Taşınma maliyetlerini göz önünde bulundurun',
      ],
    },
    {
      title: '2. İlan Araştırması',
      items: [
        'Güvenilir emlak sitelerini kullanın',
        'Bölge ve mahalle araştırması yapın',
        'Ulaşım imkanlarını değerlendirin',
        'Çevre güvenliğini kontrol edin',
      ],
    },
    {
      title: '3. Görüntüleme',
      items: [
        'Evi mutlaka görüntüleyin',
        'Yapısal durumu kontrol edin',
        'Eşya durumunu değerlendirin',
        'Komşularla konuşun',
      ],
    },
    {
      title: '4. Kira Sözleşmesi',
      items: [
        'Sözleşme şartlarını detaylı inceleyin',
        'Kira artış oranını kontrol edin',
        'Depozito tutarını belirleyin',
        'Noter onayı alın',
      ],
    },
    {
      title: '5. Taşınma',
      items: [
        'Taşınma tarihini belirleyin',
        'Eşya listesini hazırlayın',
        'Nakliye firması seçin',
        'Adres değişikliği yapın',
      ],
    },
  ];

  const importantNotes = [
    {
      icon: AlertCircle,
      title: 'Dikkat Edilmesi Gerekenler',
      items: [
        'Kira sözleşmesini mutlaka okuyun',
        'Depozito tutarını ve iade şartlarını kontrol edin',
        'Eşya envanteri çıkarın',
        'Fotoğraf ve video çekin',
        'Komşu ilişkilerini değerlendirin',
      ],
    },
    {
      icon: FileText,
      title: 'Gerekli Belgeler',
      items: [
        'Kimlik belgesi',
        'Gelir belgesi',
        'Referans mektubu',
        'Kira sözleşmesi',
        'Eşya envanter listesi',
      ],
    },
    {
      icon: CheckCircle,
      title: 'Kiracı Hakları',
      items: [
        'Sakin kullanım hakkı',
        'Gerekli onarımların yapılması',
        'Kira artışının yasal sınırlar içinde olması',
        'Depozito iadesi',
        'Öncelikli satın alma hakkı (belirli durumlarda)',
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          { label: 'Rehber', href: `${basePath}/rehber` },
          { label: 'Kiralama Rehberi' },
        ]}
        className="mb-8"
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12 border border-purple-100 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Kiralama Rehberi</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
              Ev kiralama sürecinde dikkat edilmesi gerekenler, kira sözleşmesi hazırlama ve kiracı hakları hakkında kapsamlı rehber. Güvenli ve sorunsuz bir kiralama süreci için bilmeniz gerekenler.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span>5 Adımlı Süreç</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                <span>Kiracı Hakları</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Gerekli Belgeler</span>
              </div>
            </div>
          </div>
        </header>

        {/* Steps */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Kiralama Süreci</h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-purple-600">{index + 1}</span>
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
            ))}
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Önemli Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {importantNotes.map((note, index) => {
              const Icon = note.icon;
              const colorClasses = index === 0 
                ? 'from-red-50 to-orange-50 border-red-100' 
                : index === 1 
                ? 'from-blue-50 to-cyan-50 border-blue-100'
                : 'from-green-50 to-emerald-50 border-green-100';
              return (
                <div key={index} className={`bg-gradient-to-br ${colorClasses} border-2 rounded-xl p-6 hover:shadow-lg transition-shadow`}>
                  <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center mb-4">
                    <Icon className={`h-6 w-6 ${index === 0 ? 'text-red-600' : index === 1 ? 'text-blue-600' : 'text-green-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">{note.title}</h3>
                  <ul className="space-y-2">
                    {note.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center border-t pt-12">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Kiralık ev mi arıyorsunuz?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Karasu ve çevresinde size uygun kiralık evleri keşfedin. Bütçenize ve ihtiyaçlarınıza uygun seçenekleri birlikte değerlendirebiliriz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`${basePath}/kiralik`}>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Kiralık İlanları Gör
                </Button>
              </Link>
              <Link href={`${basePath}/iletisim`}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  İletişime Geç
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

