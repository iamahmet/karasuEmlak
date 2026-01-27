import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { AddListingForm } from '@/components/listings/AddListingForm';
import { Home, FileText } from 'lucide-react';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">İlan Ekle</h1>
          <p className="text-xl text-muted-foreground">
            Emlak ilanınızı kolayca ekleyin ve binlerce potansiyel alıcıya ulaşın
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Bilgilendirme</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>İlanınız gönderildikten sonra inceleme sürecinden geçecektir</li>
                <li>Onaylandıktan sonra ilanınız yayınlanacaktır</li>
                <li>Zorunlu alanlar (*) ile işaretlenmiştir</li>
                <li>Görseller yüklenirken lütfen bekleyin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border rounded-lg p-6 md:p-8">
          <AddListingForm />
        </div>
      </div>
    </div>
  );
}

