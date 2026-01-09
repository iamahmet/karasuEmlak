import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { Fragment } from 'react';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { napData } from '@karasu-emlak/config/nap';
import { GoogleMapsLoader } from '@/components/maps/GoogleMapsLoader';
import { PropertyMap } from '@/components/maps/PropertyMap';
import ContactForm from '@/components/contact/ContactForm';
import { TrustSignalsBar } from '@/components/trust/TrustSignalsBar';
import { TrustBadgesSection } from '@/components/home/TrustBadgesSection';
import { PageIntro, FAQBlock } from '@/components/content';
import { getQAEntries } from '@/lib/supabase/queries/qa';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { withTimeout } from '@/lib/utils/timeout';
import { getNonce } from '@/lib/security/nonce';
import { Button } from '@karasu/ui';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/iletisim' : `/${locale}/iletisim`;
  
  return {
    title: 'İletişim | Karasu Emlak',
    description: 'Karasu Emlak ile iletişime geçin. Telefon, e-posta veya form üzerinden bize ulaşabilirsiniz.',
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/iletisim',
        'en': '/en/iletisim',
        'et': '/et/iletisim',
        'ru': '/ru/iletisim',
        'ar': '/ar/iletisim',
      },
    },
    openGraph: {
      title: 'İletişim | Karasu Emlak',
      description: 'Bize ulaşın - Karasu Emlak',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  // Fetch Q&A entries for FAQ section
  const qaEntries = await withTimeout(getQAEntries('karasu', 'high'), 2000, []);
  const faqs = (qaEntries || [])
    .filter(qa => qa.question.toLowerCase().includes('iletişim') || 
                   qa.question.toLowerCase().includes('ulaş') ||
                   qa.question.toLowerCase().includes('komisyon'))
    .slice(0, 4)
    .map(qa => ({
      question: qa.question,
      answer: qa.answer,
    }));

  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
  const nonce = await getNonce();

  return (
    <Fragment>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <PageIntro
          title="İletişim"
          description="Karasu Emlak ile iletişime geçin. Telefon, e-posta, WhatsApp veya iletişim formu üzerinden bize ulaşabilirsiniz. Size yardımcı olmaktan mutluluk duyarız."
          className="mb-12"
        />

      {/* Trust Signals Bar */}
      <div className="mb-12">
        <TrustSignalsBar variant="full" />
      </div>

      {/* Trust Badges */}
      <div className="mb-12">
        <TrustBadgesSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Mesaj Gönderin</h2>
          <ContactForm />
          
          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${napData.contact.phone}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span>Hemen Ara</span>
            </a>
            <a
              href={`https://wa.me/${napData.contact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-lg font-semibold transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">İletişim Bilgileri</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Adres</h3>
                <p className="text-muted-foreground">
                  Karasu, Sakarya<br />
                  Türkiye
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Telefon</h3>
                <a href={`tel:${napData.contact.phone}`} className="text-primary hover:underline">
                  {napData.contact.phoneFormatted}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#25D366]/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">WhatsApp</h3>
                <a
                  href={`https://wa.me/${napData.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:underline"
                >
                  {napData.contact.whatsappFormatted}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">E-posta</h3>
                <a href={`mailto:${napData.contact.email}`} className="text-primary hover:underline">
                  {napData.contact.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Çalışma Saatleri</h3>
                <p className="text-muted-foreground">
                  Pazartesi - Cuma: 09:00 - 18:00<br />
                  Cumartesi: 09:00 - 14:00<br />
                  Pazar: Kapalı
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-8">
            <GoogleMapsLoader nonce={nonce || undefined}>
              <PropertyMap
                latitude={41.0969}
                longitude={30.6919}
                title="Karasu Emlak"
                address="Karasu, Sakarya, Türkiye"
                className="h-64"
              />
            </GoogleMapsLoader>
          </div>
        </div>

      </div>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <FAQBlock
          faqs={faqs}
          title="İletişim Hakkında Sık Sorulan Sorular"
          className="mt-12"
        />
      )}
      </div>
    </Fragment>
  );
}

