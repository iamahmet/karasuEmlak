import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Award, 
  GraduationCap, 
  Languages, 
  MapPin, 
  Briefcase,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { getTeamMemberBySlug, getAllTeamMembers } from '@/lib/data/team';
import { StructuredData } from '@/components/seo/StructuredData';
import { generatePersonSchema } from '@/lib/seo/structured-data';

export async function generateStaticParams() {
  const members = getAllTeamMembers();
  return members.map((member) => ({
    slug: member.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const member = getTeamMemberBySlug(slug);

  if (!member) {
    return {
      title: 'Ekip Üyesi Bulunamadı',
    };
  }

  const canonicalPath = locale === routing.defaultLocale 
    ? `/hakkimizda/ekibimiz/${slug}` 
    : `/${locale}/hakkimizda/ekibimiz/${slug}`;

  return {
    title: `${member.name} - ${member.role} | Karasu Emlak`,
    description: `${member.name}, ${member.role}. ${member.experience} deneyim. ${member.speciality.join(', ')} konularında uzman. ${member.bio}`,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `/hakkimizda/ekibimiz/${slug}`,
        'en': `/en/hakkimizda/ekibimiz/${slug}`,
        'et': `/et/hakkimizda/ekibimiz/${slug}`,
        'ru': `/ru/hakkimizda/ekibimiz/${slug}`,
        'ar': `/ar/hakkimizda/ekibimiz/${slug}`,
      },
    },
    openGraph: {
      title: `${member.name} - ${member.role} | Karasu Emlak`,
      description: `${member.bio} ${member.experience} deneyim. ${member.speciality.join(', ')} konularında uzman.`,
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'profile',
    },
  };
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const member = getTeamMemberBySlug(slug);
  const allMembers = getAllTeamMembers();
  const currentIndex = allMembers.findIndex(m => m.slug === slug);
  const prevMember = currentIndex > 0 ? allMembers[currentIndex - 1] : null;
  const nextMember = currentIndex < allMembers.length - 1 ? allMembers[currentIndex + 1] : null;

  if (!member) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hakkımızda', href: `${basePath}/hakkimizda` },
    { label: 'Ekibimiz', href: `${basePath}/hakkimizda/ekibimiz` },
    { label: member.name, href: `${basePath}/hakkimizda/ekibimiz/${slug}` },
  ];

  // Generate person schema
  const personSchema = generatePersonSchema({
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    email: member.email,
    telephone: member.phone,
    url: `${siteConfig.url}${basePath}/hakkimizda/ekibimiz/${slug}`,
    worksFor: {
      name: 'Karasu Emlak',
      url: `${siteConfig.url}${basePath}/hakkimizda`,
    },
  });

  return (
    <>
      <StructuredData data={personSchema} />
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/60 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,slate_1px,transparent_0)] bg-[length:32px_32px]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-12">
                {/* Avatar */}
                <div className="flex justify-center lg:justify-start">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[#006AFF] to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                </div>

                {/* Info */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                    <Users className="h-4 w-4 text-[#006AFF]" />
                    <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">{member.role}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-3 text-slate-900 tracking-tight">
                    {member.name}
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-700 mb-6 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                    {member.stats.sales && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold text-slate-900">{member.stats.sales}</span>
                        <span>Satış</span>
                      </div>
                    )}
                    {member.stats.rentals && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-slate-900">{member.stats.rentals}</span>
                        <span>Kiralama</span>
                      </div>
                    )}
                    {member.stats.rating && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-amber-600">{member.stats.rating}</span>
                        <span>Değerlendirme</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Award className="h-4 w-4 text-[#006AFF]" />
                      <span className="font-semibold text-slate-900">{member.experience}</span>
                      <span>Deneyim</span>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <Link href={`tel:${member.phone}`}>
                      <Button size="sm" className="bg-[#006AFF] hover:bg-[#0052CC] text-white">
                        <Phone className="h-4 w-4 mr-2" />
                        Ara
                      </Button>
                    </Link>
                    <Link href={`mailto:${member.email}`}>
                      <Button size="sm" variant="outline" className="border-2 border-slate-200">
                        <Mail className="h-4 w-4 mr-2" />
                        E-posta
                      </Button>
                    </Link>
                    {member.whatsapp && (
                      <Link href={`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
            {/* Main Content */}
            <div>
              {/* About */}
              <section className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-900">Hakkında</h2>
                <div className="prose prose-slate max-w-none prose-lg prose-p:text-slate-700 prose-p:leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: member.bioLong.replace(/\n/g, '<br />') }} />
                </div>
              </section>

              {/* Expertise */}
              <section className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-900">Uzmanlık Alanları</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {member.expertise.map((exp, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-[#006AFF]/40 transition-colors">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700">{exp}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Neighborhoods */}
              {member.neighborhoods.length > 0 && member.neighborhoods[0] !== 'Tüm Mahalleler' && (
                <section className="mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-900">Uzman Olduğu Mahalleler</h2>
                  <div className="flex flex-wrap gap-3">
                    {member.neighborhoods.map((neighborhood, idx) => (
                      <Link
                        key={idx}
                        href={`${basePath}/karasu/${neighborhood.toLowerCase()}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-[#006AFF]/40 hover:bg-[#006AFF]/5 transition-all"
                      >
                        <MapPin className="h-4 w-4 text-[#006AFF]" />
                        <span className="text-sm font-medium text-slate-700">{neighborhood}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Certifications */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Sertifikalar
                </h3>
                <div className="space-y-2">
                  {member.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Başarılar
                </h3>
                <div className="space-y-2">
                  {member.achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-[#006AFF]" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Eğitim
                </h3>
                <p className="text-sm text-slate-700">{member.education}</p>
              </div>

              {/* Languages */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Languages className="h-5 w-5 text-blue-600" />
                  Diller
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-[#006AFF]/5 via-blue-50/30 to-slate-50 border-2 border-[#006AFF]/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">İletişim</h3>
                <div className="space-y-3">
                  <a href={`tel:${member.phone}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#006AFF] transition-colors">
                    <Phone className="h-4 w-4 text-[#006AFF]" />
                    <span>{member.phone}</span>
                  </a>
                  <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#006AFF] transition-colors">
                    <Mail className="h-4 w-4 text-[#006AFF]" />
                    <span>{member.email}</span>
                  </a>
                  {member.whatsapp && (
                    <a 
                      href={`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
                <Link href={`${basePath}/iletisim`} className="mt-4 block">
                  <Button size="sm" className="w-full bg-[#006AFF] hover:bg-[#0052CC] text-white">
                    İletişim Formu
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </aside>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {prevMember ? (
                <Link
                  href={`${basePath}/hakkimizda/ekibimiz/${prevMember.slug}`}
                  className="flex items-center gap-3 group w-full sm:w-auto"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-[#006AFF] transition-colors" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">Önceki</div>
                    <div className="font-semibold text-slate-900 group-hover:text-[#006AFF] transition-colors">
                      {prevMember.name}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              <Link
                href={`${basePath}/hakkimizda/ekibimiz`}
                className="text-sm font-medium text-slate-600 hover:text-[#006AFF] transition-colors"
              >
                Tüm Ekibi Görüntüle
              </Link>
              {nextMember ? (
                <Link
                  href={`${basePath}/hakkimizda/ekibimiz/${nextMember.slug}`}
                  className="flex items-center gap-3 group w-full sm:w-auto sm:flex-row-reverse"
                >
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#006AFF] transition-colors" />
                  <div className="flex-1 text-right sm:text-left">
                    <div className="text-xs text-slate-500 mb-1">Sonraki</div>
                    <div className="font-semibold text-slate-900 group-hover:text-[#006AFF] transition-colors">
                      {nextMember.name}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
