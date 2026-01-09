import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { napData } from '@karasu-emlak/config/nap';
import { routing } from '@/i18n/routing';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  User,
  Database,
  Globe,
  Key,
  Bell,
  Trash2,
  Download,
  ArrowRight,
  Target,
} from 'lucide-react';
import { Button } from '@karasu/ui';
import dynamicImport from 'next/dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/gizlilik-politikasi' 
    : `/${locale}/gizlilik-politikasi`;

  return {
    title: 'Gizlilik Politikası (KVKK) | Karasu Emlak | Kişisel Verilerin Korunması',
    description: 'Karasu Emlak gizlilik politikası ve KVKK uyumluluk bilgisi. Kişisel verilerin toplanması, işlenmesi, saklanması ve korunması hakkında detaylı bilgi. GDPR uyumlu gizlilik politikası.',
    keywords: [
      'gizlilik politikası',
      'kvkk',
      'kişisel verilerin korunması',
      'gdpr',
      'veri güvenliği',
      'karasu emlak gizlilik',
      'veri koruma',
      'kişisel veri politikası',
      'kvkk uyumluluk',
      'veri işleme politikası',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/gizlilik-politikasi`,
        'en': `${siteConfig.url}/en/gizlilik-politikasi`,
        'et': `${siteConfig.url}/et/gizlilik-politikasi`,
        'ru': `${siteConfig.url}/ru/gizlilik-politikasi`,
        'ar': `${siteConfig.url}/ar/gizlilik-politikasi`,
      },
    },
    openGraph: {
      title: 'Gizlilik Politikası | Karasu Emlak',
      description: 'Karasu Emlak gizlilik politikası ve KVKK uyumluluk bilgisi. Kişisel verilerin korunması hakkında detaylı bilgi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GizlilikPolitikasiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const lastUpdated = '2025-01-23';

  const privacyPolicySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gizlilik Politikası',
    description: 'Karasu Emlak gizlilik politikası ve KVKK uyumluluk bilgisi',
    url: `${siteConfig.url}${basePath}/gizlilik-politikasi`,
    datePublished: '2024-01-01',
    dateModified: lastUpdated,
    publisher: {
      '@type': 'Organization',
      name: napData.legalName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: napData.address.street,
        addressLocality: napData.address.city,
        addressRegion: napData.address.province,
        postalCode: napData.address.postalCode,
        addressCountry: napData.address.country,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: napData.contact.phone,
        email: napData.contact.email,
        contactType: 'Müşteri Hizmetleri',
      },
    },
  };

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Gizlilik Politikası', href: `${basePath}/gizlilik-politikasi` },
  ];

  const sections = [
    {
      id: 'genel-bilgiler',
      title: 'Genel Bilgiler',
      icon: Info,
      content: [
        {
          subtitle: 'Veri Sorumlusu',
          text: `${napData.legalName} olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla, kişisel verilerinizin işlenmesi ve korunması konusunda yükümlülüklerimizi yerine getirmekteyiz.`,
        },
        {
          subtitle: 'İletişim Bilgileri',
          text: `Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:`,
          list: [
            `Adres: ${napData.address.full}`,
            `Telefon: ${napData.contact.phoneFormatted}`,
            `E-posta: ${napData.contact.email}`,
            `Web: ${napData.contact.website}`,
          ],
        },
      ],
    },
    {
      id: 'toplanan-veriler',
      title: 'Toplanan Kişisel Veriler',
      icon: Database,
      content: [
        {
          subtitle: 'Kimlik Bilgileri',
          text: 'Ad, soyad, T.C. kimlik numarası, doğum tarihi, cinsiyet gibi kimlik bilgileri.',
        },
        {
          subtitle: 'İletişim Bilgileri',
          text: 'Telefon numarası, e-posta adresi, adres bilgileri, sosyal medya hesapları.',
        },
        {
          subtitle: 'Müşteri İşlem Bilgileri',
          text: 'Emlak arama kriterleri, ilan görüntüleme geçmişi, favori ilanlar, iletişim talepleri, randevu bilgileri.',
        },
        {
          subtitle: 'Finansal Bilgiler',
          text: 'Kredi bilgileri, ödeme bilgileri, fatura bilgileri (güvenli ödeme sistemleri üzerinden).',
        },
        {
          subtitle: 'İşlem Güvenliği Bilgileri',
          text: 'IP adresi, tarayıcı bilgileri, cihaz bilgileri, çerez bilgileri, log kayıtları.',
        },
        {
          subtitle: 'Pazarlama ve İletişim Bilgileri',
          text: 'E-bülten abonelik bilgileri, tercih ayarları, kampanya katılım bilgileri.',
        },
      ],
    },
    {
      id: 'veri-isleme-amaci',
      title: 'Kişisel Verilerin İşlenme Amaçları',
      icon: Target,
      content: [
        {
          subtitle: 'Hizmet Sunumu',
          text: 'Emlak danışmanlığı, ilan yönetimi, müşteri hizmetleri, randevu yönetimi, sözleşme süreçleri.',
        },
        {
          subtitle: 'İletişim',
          text: 'Müşteri talepleri, sorular, şikayetler, bilgilendirmeler, kampanya duyuruları.',
        },
        {
          subtitle: 'Yasal Yükümlülükler',
          text: 'Vergi mevzuatı, muhasebe kayıtları, yasal raporlama, düzenleyici uyumluluk.',
        },
        {
          subtitle: 'Pazarlama ve Analiz',
          text: 'Pazarlama kampanyaları, müşteri analizi, hizmet geliştirme, istatistiksel analizler.',
        },
        {
          subtitle: 'Güvenlik',
          text: 'Güvenlik önlemleri, dolandırıcılık önleme, sistem güvenliği, erişim kontrolü.',
        },
      ],
    },
    {
      id: 'veri-isleme-hukuki-dayanak',
      title: 'Veri İşlemenin Hukuki Dayanağı',
      icon: FileText,
      content: [
        {
          subtitle: 'Açık Rıza',
          text: 'KVKK\'nın 5. maddesi uyarınca, kişisel verileriniz açık rızanız olmadan işlenmez.',
        },
        {
          subtitle: 'Sözleşmenin Kurulması veya İfası',
          text: 'Hizmet sözleşmesinin kurulması ve ifası için gerekli veriler işlenir.',
        },
        {
          subtitle: 'Yasal Yükümlülük',
          text: 'Vergi, muhasebe ve diğer yasal yükümlülüklerin yerine getirilmesi için veriler işlenir.',
        },
        {
          subtitle: 'Meşru Menfaat',
          text: 'İşletmemizin meşru menfaatleri için gerekli veriler, kişisel haklarınızı ihlal etmemek kaydıyla işlenir.',
        },
      ],
    },
    {
      id: 'veri-paylasimi',
      title: 'Kişisel Verilerin Paylaşımı',
      icon: Globe,
      content: [
        {
          subtitle: 'Hizmet Sağlayıcılar',
          text: 'Web hosting, bulut depolama, ödeme işlemleri, e-posta servisleri gibi hizmet sağlayıcılarımız.',
        },
        {
          subtitle: 'İş Ortakları',
          text: 'Emlak değerleme, sigorta, hukuki danışmanlık gibi iş ortaklarımız (gerekli durumlarda).',
        },
        {
          subtitle: 'Yasal Zorunluluklar',
          text: 'Mahkeme kararları, yasal düzenlemeler, kamu kurumları talepleri durumunda.',
        },
        {
          subtitle: 'Güvenlik',
          text: 'Güvenlik ihlalleri, dolandırıcılık önleme, yasal uyumluluk için gerekli durumlarda.',
        },
      ],
    },
    {
      id: 'veri-guvenligi',
      title: 'Veri Güvenliği',
      icon: Lock,
      content: [
        {
          subtitle: 'Teknik Önlemler',
          text: 'SSL/TLS şifreleme, güvenli sunucular, düzenli güvenlik güncellemeleri, erişim kontrolü, veri yedekleme.',
        },
        {
          subtitle: 'İdari Önlemler',
          text: 'Personel eğitimi, gizlilik sözleşmeleri, erişim yetkilendirmeleri, güvenlik politikaları.',
        },
        {
          subtitle: 'Fiziksel Önlemler',
          text: 'Güvenli veri merkezleri, erişim kontrolü, güvenlik kameraları, yangın önleme sistemleri.',
        },
      ],
    },
    {
      id: 'haklar',
      title: 'KVKK Kapsamındaki Haklarınız',
      icon: User,
      content: [
        {
          subtitle: 'Bilgi Alma Hakkı',
          text: 'Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme.',
        },
        {
          subtitle: 'Erişim Hakkı',
          text: 'İşlenen kişisel verilerinize erişim talep etme.',
        },
        {
          subtitle: 'Düzeltme Hakkı',
          text: 'Yanlış veya eksik işlenen kişisel verilerinizin düzeltilmesini talep etme.',
        },
        {
          subtitle: 'Silme Hakkı',
          text: 'KVKK\'nın 7. maddesinde belirtilen şartlar çerçevesinde kişisel verilerinizin silinmesini talep etme.',
        },
        {
          subtitle: 'İtiraz Hakkı',
          text: 'Kişisel verilerinizin işlenmesine itiraz etme.',
        },
        {
          subtitle: 'Veri Taşınabilirliği',
          text: 'Kişisel verilerinizin başka bir veri sorumlusuna aktarılmasını talep etme.',
        },
        {
          subtitle: 'Rıza Geri Çekme',
          text: 'Verdiğiniz rızayı geri çekme.',
        },
      ],
    },
    {
      id: 'hak-kullanim',
      title: 'Haklarınızı Nasıl Kullanabilirsiniz?',
      icon: CheckCircle,
      content: [
        {
          subtitle: 'Başvuru Yöntemleri',
          text: 'KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerden birini kullanabilirsiniz:',
          list: [
            `E-posta: ${napData.contact.email} adresine "KVKK Başvurusu" konulu e-posta gönderebilirsiniz.`,
            `Posta: ${napData.address.full} adresine yazılı başvuru gönderebilirsiniz.`,
            `Telefon: ${napData.contact.phoneFormatted} numarasını arayabilirsiniz.`,
            `Web: ${basePath}/kvkk-basvuru sayfasından online başvuru yapabilirsiniz.`,
          ],
        },
        {
          subtitle: 'Başvuru İçeriği',
          text: 'Başvurunuzda aşağıdaki bilgileri belirtmeniz gerekmektedir:',
          list: [
            'Ad, soyad ve T.C. kimlik numaranız',
            'Başvuru konusu ve talebiniz',
            'İmzalı başvuru formu veya kimlik doğrulama',
          ],
        },
        {
          subtitle: 'Yanıt Süresi',
          text: 'Başvurularınız en geç 30 gün içinde yanıtlanacaktır.',
        },
      ],
    },
    {
      id: 'cerezler',
      title: 'Çerezler (Cookies)',
      icon: Key,
      content: [
        {
          subtitle: 'Çerez Kullanımı',
          text: 'Web sitemizde kullanıcı deneyimini iyileştirmek, site performansını analiz etmek ve kişiselleştirilmiş içerik sunmak için çerezler kullanılmaktadır.',
        },
        {
          subtitle: 'Çerez Türleri',
          text: 'Detaylı çerez bilgileri için lütfen Çerez Politikası sayfamızı ziyaret edin.',
        },
        {
          subtitle: 'Çerez Yönetimi',
          text: 'Tarayıcı ayarlarınızdan çerezleri yönetebilir veya çerez ayarları sayfamızdan tercihlerinizi değiştirebilirsiniz.',
        },
      ],
    },
    {
      id: 'veri-saklama',
      title: 'Veri Saklama Süreleri',
      icon: Calendar,
      content: [
        {
          subtitle: 'Saklama Süreleri',
          text: 'Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama süreleri çerçevesinde saklanmaktadır.',
        },
        {
          subtitle: 'Silme',
          text: 'İşleme amacı ortadan kalktığında veya saklama süresi dolduğunda, kişisel verileriniz güvenli bir şekilde silinir veya anonimleştirilir.',
        },
      ],
    },
    {
      id: 'degisiklikler',
      title: 'Politika Değişiklikleri',
      icon: Bell,
      content: [
        {
          subtitle: 'Güncellemeler',
          text: 'Gizlilik politikamız, yasal değişiklikler veya işletme gereksinimleri doğrultusunda güncellenebilir.',
        },
        {
          subtitle: 'Bildirim',
          text: 'Önemli değişiklikler durumunda, web sitemiz veya e-posta yoluyla bilgilendirileceksiniz.',
        },
        {
          subtitle: 'Son Güncelleme',
          text: `Bu politika son olarak ${lastUpdated} tarihinde güncellenmiştir.`,
        },
      ],
    },
    {
      id: 'iletisim',
      title: 'İletişim',
      icon: Mail,
      content: [
        {
          subtitle: 'Sorularınız İçin',
          text: 'Gizlilik politikamız hakkında sorularınız, önerileriniz veya şikayetleriniz için bizimle iletişime geçebilirsiniz:',
          list: [
            `E-posta: ${napData.contact.email}`,
            `Telefon: ${napData.contact.phoneFormatted}`,
            `Adres: ${napData.address.full}`,
            `Web: ${napData.contact.website}`,
          ],
        },
        {
          subtitle: 'KVKK Başvurusu',
          text: 'KVKK kapsamındaki haklarınızı kullanmak için başvuru yapabilirsiniz.',
        },
      ],
    },
  ];

  return (
    <>
      <StructuredData data={privacyPolicySchema} />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section - Modern Design */}
        <section className="relative overflow-hidden bg-white dark:bg-gray-900 py-16 lg:py-24 border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">KVKK Uyumlu</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Gizlilik Politikası
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-6 leading-relaxed">
                Kişisel verilerinizin korunması bizim için önemlidir. Bu sayfa, kişisel verilerinizin nasıl toplandığı, 
                işlendiği, saklandığı ve korunduğu hakkında detaylı bilgi sunmaktadır.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">KVKK Uyumlu</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GDPR Uyumlu</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Son Güncelleme: {lastUpdated}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light">
                  <Link href={`${basePath}/kvkk-basvuru`}>
                    <FileText className="w-5 h-5 mr-2" />
                    KVKK Başvurusu
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href={`${basePath}/cerez-politikasi`}>
                    Çerez Politikası
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              {/* Accent Line */}
              <div className="mt-10 h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full"></div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16 max-w-7xl">
          {/* Table of Contents */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  İçindekiler
                </h2>
                <nav className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:shadow-md transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                          {section.title}
                        </span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </ScrollReveal>
          </section>

          {/* Policy Sections */}
          {sections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <section key={section.id} id={section.id} className="mb-16 scroll-mt-20">
                <ScrollReveal direction="up" delay={sectionIndex * 50}>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>
                    
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="mb-6 last:mb-0">
                          {item.subtitle && (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                              {item.subtitle}
                            </h3>
                          )}
                          {item.text && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                              {item.text}
                            </p>
                          )}
                          {item.list && (
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                              {item.list.map((listItem, listIndex) => (
                                <li key={listIndex} className="leading-relaxed">
                                  {listItem}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </section>
            );
          })}

          {/* Important Notice */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-8 border-2 border-blue-200 dark:border-blue-800/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                    <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Önemli Not
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      Bu gizlilik politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği 
                      Genel Veri Koruma Tüzüğü (GDPR) uyumludur. Kişisel verilerinizin korunması bizim için önceliklidir. 
                      Herhangi bir sorunuz veya endişeniz varsa, lütfen bizimle iletişime geçmekten çekinmeyin.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild variant="outline" size="sm" className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                        <Link href={`${basePath}/kvkk-basvuru`}>
                          <FileText className="w-4 h-4 mr-2" />
                          KVKK Başvurusu Yap
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                        <Link href={`${basePath}/iletisim`}>
                          <Mail className="w-4 h-4 mr-2" />
                          İletişime Geç
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Related Pages */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  İlgili Sayfalar
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href={`${basePath}/cerez-politikasi`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <Key className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Çerez Politikası</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Çerez kullanımı ve yönetimi hakkında bilgi</p>
                </div>
              </Link>

              <Link href={`${basePath}/kvkk-basvuru`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">KVKK Başvurusu</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Kişisel veri haklarınızı kullanmak için başvuru</p>
                </div>
              </Link>

              <Link href={`${basePath}/kullanim-kosullari`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kullanım Koşulları</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Web sitesi kullanım koşulları ve şartları</p>
                </div>
              </Link>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-primary dark:bg-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sorularınız mı var?</h2>
            <p className="text-lg text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
              Gizlilik politikamız hakkında sorularınız, önerileriniz veya KVKK başvurunuz için bizimle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100">
                <Link href={`${basePath}/iletisim`}>
                  <Mail className="w-5 h-5 mr-2" />
                  İletişime Geç
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10">
                <Link href={`${basePath}/kvkk-basvuru`}>
                  <FileText className="w-5 h-5 mr-2" />
                  KVKK Başvurusu
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
