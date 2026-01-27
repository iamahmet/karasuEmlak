import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import KVKKApplicationForm from '@/components/legal/KVKKApplicationForm';
import { StructuredData } from '@/components/seo/StructuredData';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const lastUpdated = '2025-01-25';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'KVKK Başvuru Formu | Kişisel Verilerin Korunması | Karasu Emlak',
    description: 'KVKK kapsamında kişisel verilerinizle ilgili haklarınızı kullanmak için başvuru formu. Bilgi alma, düzeltme, silme ve itiraz haklarınız.',
    keywords: [
      'KVKK başvuru',
      'kişisel veri koruma',
      'KVKK hakları',
      'veri silme',
      'veri düzeltme',
      'KVKK formu',
    ],
    alternates: {
      canonical: `${basePath}/kvkk-basvuru`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: 'KVKK Başvuru Formu | Karasu Emlak',
      description: 'KVKK kapsamında kişisel verilerinizle ilgili haklarınızı kullanmak için başvuru formu.',
      url: `${siteConfig.url}${basePath}/kvkk-basvuru`,
      type: 'website',
    },
  };
}

export default async function KVKKBasvuruPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const kvkkSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'KVKK Başvuru Formu',
    description: 'KVKK kapsamında kişisel verilerinizle ilgili haklarınızı kullanmak için başvuru formu',
    url: `${siteConfig.url}${basePath}/kvkk-basvuru`,
    publishedTime: '2024-01-01',
    modifiedTime: lastUpdated,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <>
      <StructuredData data={kvkkSchema} />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'KVKK Başvuru' },
          ]}
          className="mb-6"
        />

        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            KVKK Başvuru Formu
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınızı kullanın
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Son Güncelleme: {new Date(lastUpdated).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </section>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto">
          {/* Info Box */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                KVKK Kapsamında Haklarınız
              </h2>
              <div className="space-y-3 text-base text-muted-foreground">
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Bilgi Alma Hakkı:</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li><strong>Bilgi Talep Etme Hakkı:</strong> İşlenen verileriniz hakkında bilgi talep etme</li>
                  <li><strong>Düzeltme Hakkı:</strong> Verilerinizin düzeltilmesini isteme</li>
                  <li><strong>Silme Hakkı:</strong> Verilerinizin silinmesini isteme</li>
                  <li><strong>İtiraz Hakkı:</strong> Verilerinizin üçüncü kişilere aktarılmasına itiraz etme</li>
                  <li><strong>Zararın Giderilmesi:</strong> Verilerinizin kanuna aykırı işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Başvuru Formu
              </h2>
              <KVKKApplicationForm />
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">
                  Başvuru Süreci
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Yukarıdaki formu doldurun ve gönderin</li>
                  <li>Başvurunuz en geç 30 gün içinde değerlendirilecektir</li>
                  <li>Gerekli durumlarda ek bilgi talep edilebilir</li>
                  <li>Başvurunuzun sonucu size bildirilecektir</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">
                  İletişim
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  KVKK başvurunuz hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{siteConfig.name}</p>
                  <p className="text-muted-foreground">E-posta: {siteConfig.nap.email}</p>
                  <p className="text-muted-foreground">Telefon: {siteConfig.nap.phone}</p>
                  <p className="text-muted-foreground">
                    Adres: {siteConfig.nap.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

