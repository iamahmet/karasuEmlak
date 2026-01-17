import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Users, Award, TrendingUp, Phone, Mail, MessageCircle, ArrowRight, MapPin, GraduationCap, Languages, Briefcase, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { getAllTeamMembers, getTeamStats } from '@/lib/data/team';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateOrganizationSchema } from '@/lib/seo/structured-data';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/hakkimizda/ekibimiz' 
    : `/${locale}/hakkimizda/ekibimiz`;

  return {
    title: 'Ekibimiz | Karasu Emlak - Profesyonel Emlak Danışmanları',
    description: 'Karasu Emlak profesyonel ekibi. 8 deneyimli emlak danışmanımız ile Karasu emlak piyasasında güvenilir hizmet. 15+ yıllık deneyim, 1000+ başarılı işlem.',
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/hakkimizda/ekibimiz',
        'en': '/en/hakkimizda/ekibimiz',
        'et': '/et/hakkimizda/ekibimiz',
        'ru': '/ru/hakkimizda/ekibimiz',
        'ar': '/ar/hakkimizda/ekibimiz',
      },
    },
    openGraph: {
      title: 'Ekibimiz | Karasu Emlak - Profesyonel Emlak Danışmanları',
      description: '8 deneyimli emlak danışmanımız ile Karasu emlak piyasasında güvenilir hizmet. 15+ yıllık deneyim, 1000+ başarılı işlem.',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const teamMembers = getAllTeamMembers();
  const teamStats = getTeamStats();

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hakkımızda', href: `${basePath}/hakkimizda` },
    { label: 'Ekibimiz', href: `${basePath}/hakkimizda/ekibimiz` },
  ];

  // Generate organization schema for team
  const organizationSchema = generateOrganizationSchema({
    name: 'Karasu Emlak',
    description: 'Karasu ve çevresinde 15+ yıllık deneyimle emlak hizmetleri sunan profesyonel ekip',
    url: `${siteConfig.url}${basePath}/hakkimizda/ekibimiz`,
    logo: `${siteConfig.url}/logo.png`,
    employees: teamMembers.map(member => ({
      name: member.name,
      jobTitle: member.role,
      description: member.bio,
    })),
  });

  return (
    <>
      <StructuredData data={organizationSchema} />
    <div className="min-h-screen bg-white">
      <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/60 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,slate_1px,transparent_0)] bg-[length:32px_32px]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#006AFF]/10 rounded-full mb-6 border border-[#006AFF]/20">
                <Users className="h-5 w-5 text-[#006AFF]" />
                <span className="text-sm font-semibold text-[#006AFF]">Karasu Emlak Ekibi</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6 text-slate-900 leading-[1.1] tracking-tight">
                Ekibimiz ve Uzmanlığımız
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Deneyimli ve profesyonel ekibimiz ile Karasu emlak piyasasında güvenilir hizmet sunuyoruz. 
                Bölge bilgimiz ve sektör deneyimimiz ile müşterilerimize en iyi çözümleri sunuyoruz.
              </p>

              {/* Team Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-10">
                <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                  <span className="text-2xl sm:text-3xl font-bold text-[#006AFF]">{teamStats.totalMembers}</span>
                  <span>Ekip Üyesi</span>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                  <span className="text-2xl sm:text-3xl font-bold text-[#006AFF]">{teamStats.totalExperience}</span>
                  <span>Toplam Deneyim</span>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                  <span className="text-2xl sm:text-3xl font-bold text-[#006AFF]">{teamStats.totalSales}+</span>
                  <span>Başarılı Satış</span>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                  <span className="text-2xl sm:text-3xl font-bold text-[#006AFF]">{teamStats.totalRentals}+</span>
                  <span>Başarılı Kiralama</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 max-w-7xl">
          {/* Team Introduction */}
          <section className="mb-16 md:mb-20">
            <div className="bg-gradient-to-br from-[#006AFF]/5 via-blue-50/30 to-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200/60">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-900">Karasu Emlak Ekibi</h2>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
                  Karasu Emlak olarak, bölgenin emlak piyasasını yakından tanıyan, deneyimli ve profesyonel bir ekiple çalışıyoruz. 
                  Her ekip üyemiz, kendi uzmanlık alanında derinlemesine bilgi sahibi ve müşteri memnuniyetini ön planda tutuyor.
                </p>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
                  Ekibimiz, satılık ve kiralık emlak danışmanlığından, değerleme ve yatırım danışmanlığına, 
                  yasal işlemlerden müşteri ilişkilerine kadar geniş bir yelpazede hizmet sunmaktadır. 
                  Karasu'nun her mahallesini yakından tanıyan ekibimiz, müşterilerimize en doğru rehberliği sağlamaktadır. 
                  <Link href={`${basePath}/hakkimizda`} className="text-[#006AFF] hover:text-[#0052CC] font-semibold underline">
                    Hakkımızda
                  </Link> sayfasında şirketimizin hikayesini ve değerlerimizi öğrenebilirsiniz.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      <h3 className="font-bold text-slate-900">Sertifikalar</h3>
                    </div>
                    <p className="text-sm text-slate-600">Tüm ekip üyelerimiz sertifikalı emlak danışmanıdır</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-bold text-slate-900">Başarılar</h3>
                    </div>
                    <p className="text-sm text-slate-600">1000+ başarılı işlem ve %98 müşteri memnuniyeti</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-[#006AFF]" />
                      <h3 className="font-bold text-slate-900">Bölge Bilgisi</h3>
                    </div>
                    <p className="text-sm text-slate-600">Karasu'nun her mahallesini yakından tanıyoruz</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Members Grid */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Ekip Üyelerimiz</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Deneyimli ve profesyonel ekibimizle tanışın
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`${basePath}/hakkimizda/ekibimiz/${member.slug}`}
                  className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#006AFF] to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    {/* Name */}
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#006AFF] transition-colors">
                      {member.name}
                    </h3>
                    {/* Role */}
                    <p className="text-sm text-[#006AFF] font-semibold mb-2">{member.role}</p>
                    {/* Experience */}
                    <p className="text-xs text-slate-600 mb-3">{member.experience} Deneyim</p>
                    {/* Speciality */}
                    <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                      {member.speciality.slice(0, 2).map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                    {/* Stats */}
                    <div className="w-full pt-4 border-t border-slate-200">
                      {member.stats.sales && (
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-semibold text-slate-900">{member.stats.sales}</span> Satış
                        </div>
                      )}
                      {member.stats.rentals && (
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-semibold text-slate-900">{member.stats.rentals}</span> Kiralama
                        </div>
                      )}
                      {member.stats.rating && (
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-amber-600">{member.stats.rating}</span> Değerlendirme
                        </div>
                      )}
                    </div>
                    {/* View Profile */}
                    <div className="mt-4 text-xs font-semibold text-[#006AFF] group-hover:text-[#0052CC] flex items-center gap-1">
                      Profili Gör <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Team Expertise */}
          <section className="mb-16 md:mb-20">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl p-8 md:p-12 border border-slate-200/60">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Uzmanlık Alanlarımız</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Ekibimizin sunduğu kapsamlı hizmetler
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Home, title: 'Satılık Emlak', description: 'Daire, villa, yazlık ve arsa satışı' },
                  { icon: Briefcase, title: 'Kiralık Emlak', description: 'Aylık ve yıllık kiralama hizmetleri' },
                  { icon: TrendingUp, title: 'Değerleme', description: 'Gayrimenkul değerleme ve piyasa analizi' },
                  { icon: Award, title: 'Yatırım Danışmanlığı', description: 'Yatırım stratejileri ve getiri analizi' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#006AFF]/10 to-blue-50 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-[#006AFF]" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-[#006AFF] to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ekibimizle İletişime Geçin</h2>
              <p className="text-lg text-blue-50 mb-8 max-w-2xl mx-auto leading-relaxed">
                Emlak ihtiyaçlarınız için deneyimli ekibimizle iletişime geçin. Size en uygun danışmanımızı bulmanıza yardımcı olalım.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${basePath}/iletisim`}>
                  <Button size="lg" className="bg-white text-[#006AFF] hover:bg-blue-50 w-full sm:w-auto">
                    İletişime Geç
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`${basePath}/hakkimizda`}>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    Hakkımızda
                  </Button>
                </Link>
          </div>
        </div>
      </section>
    </div>
      </div>
    </>
  );
}
