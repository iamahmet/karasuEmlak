import type { Metadata } from 'next';

import { Fragment } from 'react';
import { siteConfig } from '@karasu-emlak/config';
import { napData } from '@karasu-emlak/config/nap';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import {
  Building2,
  Users,
  Award,
  Target,
  CheckCircle,
  Shield,
  TrendingUp,
  Home,
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Heart,
  Handshake,
  Star,
  ArrowRight,
  Briefcase,
  FileText,
  BarChart3
} from 'lucide-react';
import { getListingStats } from '@/lib/supabase/queries';
import { FAQBlock } from '@/components/content';
import { getQAEntries } from '@/lib/supabase/queries/qa';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { withTimeout } from '@/lib/utils/timeout';
import { getAllTeamMembers, getTeamStats } from '@/lib/data/team';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/hakkimizda' : `/${locale}/hakkimizda`;

  return {
    title: 'Hakkımızda | Karasu Emlak - 15+ Yıllık Deneyim, Güvenilir Emlak Danışmanlığı',
    description: 'Karasu Emlak olarak 2010\'dan beri Karasu ve çevresinde emlak hizmetleri sunuyoruz. 15+ yıllık deneyim, 500+ mutlu müşteri, %98 memnuniyet oranı. Satılık ve kiralık emlak, danışmanlık, değerleme hizmetleri. Güvenilir, profesyonel ve müşteri odaklı hizmet anlayışımızla yanınızdayız.',
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/hakkimizda',
        'en': '/en/hakkimizda',
        'et': '/et/hakkimizda',
        'ru': '/ru/hakkimizda',
        'ar': '/ar/hakkimizda',
      },
    },
    openGraph: {
      title: 'Hakkımızda | Karasu Emlak - 15+ Yıllık Deneyim, Güvenilir Emlak Danışmanlığı',
      description: 'Karasu Emlak - 2010\'dan beri Karasu\'da emlak hizmetleri. 15+ yıl deneyim, 500+ mutlu müşteri, %98 memnuniyet. Satılık, kiralık emlak ve profesyonel danışmanlık.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const stats = await getListingStats();
  const teamMembers = getAllTeamMembers().slice(0, 4); // İlk 4 üyeyi göster
  const teamStats = getTeamStats();

  // Fetch Q&A entries for FAQ section
  const qaEntries = await withTimeout(getQAEntries('karasu', 'high'), 2000, []);
  const faqs = (qaEntries || [])
    .filter(qa => qa.question.toLowerCase().includes('emlak') ||
      qa.question.toLowerCase().includes('süreç') ||
      qa.question.toLowerCase().includes('komisyon'))
    .slice(0, 5)
    .map(qa => ({
      question: qa.question,
      answer: qa.answer,
    }));

  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  return (
    <Fragment>
      {faqSchema && <StructuredData data={faqSchema} />}

      <div className="min-h-screen bg-white">
        {/* Hero Section - Modern Premium */}
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/60 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,slate_1px,transparent_0)] bg-[length:32px_32px]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#006AFF]/10 rounded-full mb-6 border border-[#006AFF]/20">
                <Sparkles className="h-4 w-4 text-[#006AFF]" />
                <span className="text-sm font-semibold text-[#006AFF]">
                  Karasu Emlak
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-slate-900 leading-[1.1] tracking-tight">
                Hakkımızda
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Karasu Emlak olarak bölgede <span className="font-semibold text-[#006AFF]">15+ yıllık deneyimimizle</span> emlak hizmetleri sunuyoruz. Karasu ve çevresindeki emlak piyasasını yakından tanıyan, yerel bilgi birikimine sahip uzman ekibimizle güvenilir, profesyonel ve müşteri odaklı hizmet anlayışımızla yanınızdayız.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-10">
                <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                  <span className="text-2xl sm:text-3xl font-bold text-[#006AFF]">{stats.total > 0 ? `${stats.total}+` : '500+'}</span>
                  <span>Aktif İlan</span>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                  <span className="text-2xl sm:text-3xl font-bold text-[#006AFF]">15+</span>
                  <span>Yıllık Deneyim</span>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">Karasu, Sakarya</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 max-w-7xl">
          {/* Company Story Section */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                <FileText className="h-4 w-4 text-[#006AFF]" />
                <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Hikayemiz</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Karasu Emlak Hikayesi</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 md:p-10 border border-slate-200/60 mb-8">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-4">
                  2010 yılında Karasu'da kurulan Karasu Emlak, bölgenin emlak piyasasına derinlemesine hakim bir ekiple başladı.
                  İlk günden itibaren müşteri memnuniyetini ön planda tutan, şeffaf ve güvenilir hizmet anlayışımızla
                  Karasu ve çevresindeki emlak alım-satım, kiralama ve danışmanlık işlemlerinde öncü bir konuma geldik.
                </p>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-4">
                  Karasu'nun sahil şeridindeki konumu, İstanbul'a yakınlığı ve doğal güzellikleri, bölgeyi hem yazlık
                  hem de kalıcı yaşam için cazip kılıyor. Bu dinamikleri yakından takip eden ekibimiz, müşterilerimize
                  en güncel piyasa bilgilerini sunarak doğru kararlar vermelerine yardımcı oluyor.
                </p>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                  Bugün, yüzlerce başarılı işlem, mutlu müşteri ve bölgedeki güçlü referans ağımızla,
                  Karasu emlak piyasasının güvenilir adresi olmaya devam ediyoruz.
                </p>
              </div>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="mb-16 md:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                  <Target className="h-4 w-4 text-[#006AFF]" />
                  <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Misyonumuz</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-900">Misyonumuz</h2>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-4">
                  Karasu ve çevresinde emlak alım-satım ve kiralama işlemlerinde müşterilerimize
                  güvenilir, şeffaf ve profesyonel hizmet sunmak. Her müşterimizin hayalindeki
                  evi bulmasına yardımcı olmak ve emlak süreçlerinde rehberlik etmek temel misyonumuzdur.
                </p>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
                  Müşteri memnuniyetini ön planda tutarak, dürüstlük ve şeffaflık ilkelerimizle
                  sektörde öncü bir konumda yer almayı hedefliyoruz.
                </p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Vizyonumuz
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Karasu ve Sakarya bölgesinin en güvenilir, en profesyonel ve müşteri odaklı emlak danışmanlık firması olmak.
                    Bölgedeki emlak piyasasının gelişimine katkıda bulunmak ve müşterilerimize en iyi hizmeti sunmak.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#006AFF]/5 via-blue-50/50 to-slate-50 rounded-2xl p-8 md:p-10 border border-slate-200/60 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#006AFF] to-blue-600 flex items-center justify-center shadow-lg">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">15+ Yıllık Deneyim</h3>
                      <p className="text-sm text-slate-600">Bölgede uzun yıllardır faaliyet gösteriyoruz</p>
                    </div>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed mb-6">
                    Bölgede uzun yıllardır faaliyet gösteren ekibimiz, emlak sektöründeki
                    deneyim ve bilgi birikimini müşterilerimize aktarıyor.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                    <div>
                      <div className="text-2xl font-bold text-[#006AFF] mb-1">500+</div>
                      <div className="text-xs text-slate-600">Mutlu Müşteri</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#006AFF] mb-1">%98</div>
                      <div className="text-xs text-slate-600">Memnuniyet Oranı</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section - Enhanced */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                <Heart className="h-4 w-4 text-[#006AFF]" />
                <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Değerlerimiz</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Değerlerimiz</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Hizmet anlayışımızı şekillendiren temel değerlerimiz
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 text-center hover:border-[#006AFF]/40 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-[#006AFF]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Müşteri Odaklılık</h3>
                <p className="text-slate-600 leading-relaxed">
                  Her müşterimizin ihtiyaçlarını anlamak ve en iyi çözümü sunmak için çalışıyoruz.
                </p>
              </div>
              <div className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 text-center hover:border-[#006AFF]/40 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Güvenilirlik</h3>
                <p className="text-slate-600 leading-relaxed">
                  Dürüstlük ve şeffaflık ilkelerimizle müşterilerimizin güvenini kazanıyoruz.
                </p>
              </div>
              <div className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 text-center hover:border-[#006AFF]/40 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Profesyonellik</h3>
                <p className="text-slate-600 leading-relaxed">
                  Sektördeki bilgi ve deneyimimizle profesyonel hizmet sunuyoruz.
                </p>
              </div>
            </div>
          </section>

          {/* Stats Section - Enhanced */}
          <section className="mb-16 md:mb-20">
            <div className="bg-gradient-to-br from-[#006AFF]/5 via-blue-50/30 to-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200/60 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-[#006AFF] mb-2">{stats.total > 0 ? `${stats.total}+` : '500+'}</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Aktif İlan</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-[#006AFF] mb-2">{stats.satilik > 0 ? `${stats.satilik}+` : '300+'}</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Satılık İlan</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-[#006AFF] mb-2">{stats.kiralik > 0 ? `${stats.kiralik}+` : '200+'}</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Kiralık İlan</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-[#006AFF] mb-2">15+</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Yıllık Deneyim</div>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section - Enhanced */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                <Briefcase className="h-4 w-4 text-[#006AFF]" />
                <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Hizmetlerimiz</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Hizmetlerimiz</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Karasu ve çevresinde sunduğumuz kapsamlı emlak hizmetleri
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Home className="h-7 w-7 text-[#006AFF]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">Satılık Emlak</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Karasu'da daire, villa, yazlık, arsa ve ticari gayrimenkul seçenekleri. Denize sıfır konumlardan merkez mahallelere kadar geniş portföy.
                </p>
                <Link href={`${basePath}/satilik`} className="text-xs font-semibold text-[#006AFF] hover:text-[#0052CC] flex items-center gap-1">
                  İlanları Gör <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">Kiralık Emlak</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Aylık ve yıllık kiralık daire, ev ve yazlık seçenekleri. Bütçenize uygun, güvenilir kiralama hizmeti.
                </p>
                <Link href={`${basePath}/kiralik`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  İlanları Gör <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">Emlak Danışmanlığı</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Piyasa analizi, değerleme, yatırım danışmanlığı ve hukuki destek. Profesyonel rehberlik hizmeti.
                </p>
                <Link href={`${basePath}/iletisim`} className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  Danışmanlık Al <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">Güvenli İşlem</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Tapu işlemleri, noter süreçleri ve tüm yasal prosedürlerde yanınızdayız. Güvenli ve şeffaf işlem garantisi.
                </p>
                <Link href={`${basePath}/iletisim`} className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  Bilgi Al <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200/60">
              <h3 className="text-xl font-bold mb-6 text-slate-900 text-center">Ek Hizmetlerimiz</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Emlak Değerleme</h4>
                    <p className="text-sm text-slate-600">Gayrimenkulünüzün piyasa değerini objektif kriterlere göre belirliyoruz.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Yatırım Danışmanlığı</h4>
                    <p className="text-sm text-slate-600">Karasu emlak piyasasında yatırım fırsatları ve risk analizi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Hukuki Destek</h4>
                    <p className="text-sm text-slate-600">İşlem süreçlerinde hukuki danışmanlık ve rehberlik.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Regional Expertise Section */}
          <section className="mb-16 md:mb-20">
            <div className="bg-gradient-to-br from-[#006AFF]/5 via-blue-50/30 to-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200/60">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                  <MapPin className="h-4 w-4 text-[#006AFF]" />
                  <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Bölgesel Uzmanlık</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Karasu'yu Yakından Tanıyoruz</h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  15+ yıllık deneyimimizle Karasu'nun her mahallesini, her sokağını biliyoruz.
                  Bu yerel bilgi birikimi, müşterilerimize en doğru rehberliği sağlıyor.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#006AFF]" />
                    Mahalle Bilgisi
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Merkez, Liman, Kocaali ve diğer mahallelerin emlak piyasası, fiyat trendleri,
                    altyapı durumu ve yaşam kalitesi hakkında detaylı bilgi sahibiyiz.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Piyasa Analizi
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Karasu emlak piyasasındaki güncel fiyat hareketleri, yatırım potansiyeli ve
                    gelecek trendleri konusunda sürekli güncel bilgiye sahibiz.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us Section - Enhanced */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                <Star className="h-4 w-4 text-[#006AFF]" />
                <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Neden Biz</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Neden Bizi Seçmelisiniz?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Karasu Emlak olarak size sunduğumuz avantajlar ve farklılıklarımız
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {[
                {
                  icon: Award,
                  title: '15+ Yıllık Deneyim',
                  description: 'Bölgede uzun yıllardır faaliyet gösteren ekibimiz, emlak sektöründeki bilgi ve deneyimini müşterilerimize aktarıyor.',
                  color: 'amber'
                },
                {
                  icon: BarChart3,
                  title: 'Geniş İlan Portföyü',
                  description: 'Karasu ve çevresinde yüzlerce satılık ve kiralık emlak seçeneği ile size en uygun evi bulmanıza yardımcı oluyoruz.',
                  color: 'blue'
                },
                {
                  icon: Handshake,
                  title: 'Şeffaf İşlem',
                  description: 'Tüm işlemlerimizde şeffaflık ve dürüstlük ilkelerimizle müşterilerimizin güvenini kazanıyoruz.',
                  color: 'emerald'
                },
                {
                  icon: Clock,
                  title: '7/24 Destek',
                  description: 'Müşterilerimize her zaman ulaşılabilir olmak ve hızlı çözümler sunmak için çalışıyoruz.',
                  color: 'purple'
                }
              ].map((item, index) => {
                const Icon = item.icon;
                const colorClasses = {
                  amber: 'from-amber-50 to-amber-100 text-amber-600',
                  blue: 'from-blue-50 to-blue-100 text-blue-600',
                  emerald: 'from-emerald-50 to-emerald-100 text-emerald-600',
                  purple: 'from-purple-50 to-purple-100 text-purple-600'
                };
                return (
                  <div key={index} className="flex items-start gap-4 bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[item.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Contact Info Section - Enhanced */}
          <section className="mb-16 md:mb-20">
            <div className="bg-gradient-to-br from-[#006AFF]/5 via-blue-50/30 to-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200/60 shadow-lg">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                  <Phone className="h-4 w-4 text-[#006AFF]" />
                  <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">İletişim</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">İletişim Bilgileri</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Bize ulaşmak için iletişim bilgilerimiz
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <div className="text-center bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-[#006AFF]" />
                  </div>
                  <h3 className="font-bold mb-2 text-slate-900">Adres</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Merkez Mahallesi, Atatürk Caddesi No:123<br />
                    54500 Karasu / Sakarya
                  </p>
                </div>
                <div className="text-center bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-bold mb-2 text-slate-900">Telefon</h3>
                  <p className="text-sm text-slate-600">
                    <a href={`tel:${napData.contact.phone}`} className="text-[#006AFF] hover:text-[#0052CC] font-semibold transition-colors">
                      {napData.contact.phoneFormatted}
                    </a>
                  </p>
                </div>
                <div className="text-center bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold mb-2 text-slate-900">E-posta</h3>
                  <p className="text-sm text-slate-600">
                    <a href="mailto:info@karasuemlak.net" className="text-[#006AFF] hover:text-[#0052CC] font-semibold transition-colors">
                      info@karasuemlak.net
                    </a>
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 border-2 border-slate-200 shadow-sm">
                  <Clock className="h-5 w-5 text-[#006AFF]" />
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-900">Çalışma Saatleri</div>
                    <div className="text-xs text-slate-600">
                      Hafta İçi: 09:00 - 18:00 | Cumartesi: 09:00 - 14:00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section - Enhanced */}
          <section className="text-center mb-16 md:mb-20">
            <div className="bg-gradient-to-br from-[#006AFF] to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bizimle İletişime Geçin</h2>
              <p className="text-lg text-blue-50 mb-8 max-w-2xl mx-auto leading-relaxed">
                Emlak ihtiyaçlarınız için bize ulaşın. Size en iyi hizmeti sunmak için buradayız.
                Satılık veya kiralık emlak arayışınızda, yatırım danışmanlığı veya emlak değerleme
                hizmetlerimiz için bizimle iletişime geçebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${basePath}/iletisim`}>
                  <Button size="lg" className="bg-white text-[#006AFF] hover:bg-blue-50 w-full sm:w-auto">
                    İletişime Geç
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`${basePath}/satilik`}>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    Satılık İlanları Görüntüle
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                <FileText className="h-4 w-4 text-[#006AFF]" />
                <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Süreçlerimiz</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Nasıl Çalışıyoruz?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Emlak işlemlerinizde izlediğimiz adımlar ve süreçler
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'İhtiyaç Analizi',
                    description: 'Müşterimizin ihtiyaçlarını, bütçesini ve beklentilerini detaylı olarak anlıyoruz. Satılık mı, kiralık mı? Hangi bölge? Ne tür bir gayrimenkul? Tüm detayları birlikte belirliyoruz.'
                  },
                  {
                    step: '2',
                    title: 'Portföy Sunumu',
                    description: 'İhtiyaçlarınıza uygun seçenekleri sunuyoruz. Her ilanı yerinde inceliyor, fotoğraflıyor ve detaylı bilgileri hazırlıyoruz. Size en uygun seçenekleri öncelikli olarak gösteriyoruz.'
                  },
                  {
                    step: '3',
                    title: 'Yerinde İnceleme',
                    description: 'Beğendiğiniz gayrimenkulleri birlikte geziyoruz. Tüm sorularınızı yanıtlıyor, mahalle, çevre ve altyapı hakkında bilgi veriyoruz. Karar vermenizde size rehberlik ediyoruz.'
                  },
                  {
                    step: '4',
                    title: 'Değerleme ve Pazarlık',
                    description: 'Piyasa değerini objektif kriterlere göre belirliyoruz. Pazarlık sürecinde sizin yanınızda yer alıyor, en uygun fiyatı bulmanıza yardımcı oluyoruz.'
                  },
                  {
                    step: '5',
                    title: 'Yasal İşlemler',
                    description: 'Tapu, noter, banka işlemleri ve tüm yasal süreçlerde yanınızdayız. Her adımı takip ediyor, güvenli bir şekilde işlemin tamamlanmasını sağlıyoruz.'
                  },
                  {
                    step: '6',
                    title: 'Teslim ve Sonrası',
                    description: 'Gayrimenkulün teslimi sonrasında da destek olmaya devam ediyoruz. Sorularınız ve ihtiyaçlarınız için her zaman ulaşılabiliriz.'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#006AFF] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section - Ekibimiz */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006AFF]/10 rounded-lg mb-4">
                <Users className="h-4 w-4 text-[#006AFF]" />
                <span className="text-xs font-semibold text-[#006AFF] uppercase tracking-wide">Ekibimiz</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Ekibimiz ve Uzmanlığımız</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                Deneyimli ve profesyonel ekibimiz ile Karasu emlak piyasasında güvenilir hizmet sunuyoruz.
                8 uzman emlak danışmanımız, satılık ve kiralık emlak danışmanlığından değerleme ve yatırım danışmanlığına
                kadar geniş bir yelpazede hizmet vermektedir.
              </p>
              <p className="text-base text-slate-600 max-w-2xl mx-auto">
                Her ekip üyemiz kendi uzmanlık alanında derinlemesine bilgi sahibidir ve Karasu'nun emlak piyasasını
                yakından tanımaktadır. <Link href={`${basePath}/hakkimizda/ekibimiz`} className="text-[#006AFF] hover:text-[#0052CC] font-semibold underline">
                  Tüm ekibimizi görüntüleyin
                </Link> ve size en uygun danışmanımızı bulun.
              </p>
            </div>

            {/* Team Stats */}
            <div className="bg-gradient-to-br from-[#006AFF]/5 via-blue-50/30 to-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200/60 mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-[#006AFF] mb-2">{teamStats.totalMembers}</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Ekip Üyesi</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-[#006AFF] mb-2">{teamStats.totalExperience}</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Toplam Deneyim</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-[#006AFF] mb-2">{teamStats.totalSales}+</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Başarılı Satış</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-[#006AFF] mb-2">{teamStats.totalRentals}+</div>
                  <div className="text-sm md:text-base text-slate-600 font-medium">Başarılı Kiralama</div>
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`${basePath}/hakkimizda/ekibimiz/${member.slug}`}
                  className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[#006AFF]/40 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#006AFF] to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform">
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
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {member.speciality.slice(0, 2).map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Team Button */}
            <div className="text-center">
              <Link href={`${basePath}/hakkimizda/ekibimiz`}>
                <Button size="lg" className="bg-[#006AFF] hover:bg-[#0052CC] text-white">
                  Tüm Ekibi Görüntüle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          {faqs.length > 0 && (
            <FAQBlock
              faqs={faqs}
              title="Hakkımızda Sık Sorulan Sorular"
              className="mb-12"
            />
          )}
        </div>
      </div>
    </Fragment>
  );
}
