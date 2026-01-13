"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { siteConfig } from "@karasu-emlak/config";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MessageCircle,
  Home,
  Key,
  FileText,
  Newspaper,
  BookOpen,
  Calculator,
  TrendingUp,
  Heart,
  Building,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Shield,
  Lock,
  Award,
  Search,
  HelpCircle,
  Plus,
  Bell,
  Clock,
  MapPin as MapPinIcon
} from "lucide-react";
import { napData } from "@karasu-emlak/config/nap";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import dynamic from "next/dynamic";

const QuoteWidget = dynamic(() => import("@/components/services/QuoteWidget").then(mod => ({ default: mod.QuoteWidget })), {
  ssr: false,
});

// Default statistics (fallback)
const defaultStats = {
  total: 103,
  satilik: 75,
  kiralik: 28,
  mutluMusteri: 500,
};

export function PremiumFooter() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState(defaultStats);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch statistics from API
  useEffect(() => {
    async function fetchStats() {
      setStatsLoading(true);
      try {
        const response = await fetch('/api/stats/listings');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setStats({
              total: data.total || defaultStats.total,
              satilik: data.satilik || defaultStats.satilik,
              kiralik: data.kiralik || defaultStats.kiralik,
              mutluMusteri: defaultStats.mutluMusteri,
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching stats:', error);
        }
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Footer link kategorileri
  const listingLinks = [
    { href: "/satilik", label: t("forSale"), icon: Home },
    { href: "/kiralik", label: t("forRent"), icon: Key },
    { href: "/ilan-ekle", label: "İlan Ekle", icon: Building },
  ];

  const locationLinks = [
    { href: "/karasu", label: "Karasu", description: "Karasu bölge rehberi" },
    { href: "/karasu/gezilecek-yerler", label: "Gezilecek Yerler" },
    { href: "/karasu/hastaneler", label: "Hastaneler" },
    { href: "/karasu/nobetci-eczaneler", label: "Nöbetçi Eczaneler" },
    { href: "/karasu/restoranlar", label: "Restoranlar" },
    { href: "/karasu/ulasim", label: "Ulaşım" },
    { href: "/karasu/onemli-telefonlar", label: "Önemli Telefonlar" },
    { href: "/kocaali", label: "Kocaali", description: "Kocaali bölge rehberi" },
  ];

  const contentLinks = [
    { href: "/blog", label: "Blog", icon: FileText },
    { href: "/haberler", label: "Haberler", icon: Newspaper },
    { href: "/rehber", label: "Rehber", icon: BookOpen },
    { href: "/yorumlar", label: "Yorumlar" },
    { href: "/sss", label: "SSS" },
  ];

  const toolLinks = [
    { href: "/kredi-hesaplayici", label: "Kredi Hesaplayıcı", icon: Calculator },
    { href: "/yatirim-hesaplayici", label: "Yatırım Hesaplayıcı", icon: TrendingUp },
    { href: "/karsilastir", label: "İlan Karşılaştır" },
    { href: "/favorilerim", label: "Favorilerim", icon: Heart },
  ];

  const legalLinks = [
    { href: "/gizlilik-politikasi", label: t("privacy") },
    { href: "/cerez-politikasi", label: "Çerez Politikası" },
    { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
    { href: "/hakkimizda", label: t("about") },
    { href: "/iletisim", label: t("contact") },
  ];

  const socialLinks = [
    { href: napData.social?.facebook || "#", label: "Facebook", icon: Facebook, color: "hover:text-[#1877F2] hover:border-[#1877F2]" },
    { href: napData.social?.instagram || "#", label: "Instagram", icon: Instagram, color: "hover:text-[#E4405F] hover:border-[#E4405F]" },
    { href: napData.social?.twitter || "#", label: "Twitter", icon: Twitter, color: "hover:text-[#1DA1F2] hover:border-[#1DA1F2]" },
  ];

  const contactInfo = {
    phone: napData.contact?.phone || '+905466395461',
    phoneFormatted: napData.contact?.phoneFormatted || '+90 546 639 54 61',
    whatsapp: napData.contact?.whatsapp || '+905466395461',
    email: napData.contact?.email || 'info@karasuemlak.net',
  };

  return (
    <footer
      className="relative border-t-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50/50"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006AFF] via-[#1A8CFF] to-[#006AFF]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Statistics & Trust Section - Premium Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 pb-12 border-b-2 border-slate-200/60">
          {/* İSTATİSTİKLER */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs font-bold mb-5 text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#006AFF]" strokeWidth={2.5} />
              İstatistikler
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium">Toplam İlan</span>
                <span className="text-lg font-bold text-[#006AFF] tracking-tight">
                  {statsLoading ? '...' : `${stats.total}+`}
                </span>
              </li>
              <li className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium">Satılık</span>
                <span className="text-lg font-bold text-[#00A862] tracking-tight">
                  {statsLoading ? '...' : `${stats.satilik}+`}
                </span>
              </li>
              <li className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium">Kiralık</span>
                <span className="text-lg font-bold text-[#006AFF] tracking-tight">
                  {statsLoading ? '...' : `${stats.kiralik}+`}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Mutlu Müşteri</span>
                <span className="text-lg font-bold text-orange-600 tracking-tight">{stats.mutluMusteri}+</span>
              </li>
            </ul>
          </div>

          {/* GÜVENİLİRLİK */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs font-bold mb-5 text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#006AFF]" strokeWidth={2.5} />
              Güvenilirlik
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#00A862] stroke-[2] flex-shrink-0" />
                <span className="text-sm text-slate-600 font-medium">Güvenilir Emlak</span>
              </li>
              <li className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-[#006AFF] stroke-[2] flex-shrink-0" />
                <span className="text-sm text-slate-600 font-medium">Güvenli İşlem</span>
              </li>
              <li className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600 stroke-[2] flex-shrink-0" />
                <span className="text-sm text-slate-600 font-medium">SSL Güvenli</span>
              </li>
              <li className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600 stroke-[2] flex-shrink-0" />
                <span className="text-sm text-slate-600 font-medium">15+ Yıl Deneyim</span>
              </li>
            </ul>
          </div>

          {/* HIZLI İŞLEMLER */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs font-bold mb-5 text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Search className="h-4 w-4 text-[#006AFF]" strokeWidth={2.5} />
              Hızlı İşlemler
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/satilik" prefetch={true} className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium group">
                  <Search className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
                  Satılık İlan Ara
                </Link>
              </li>
              <li>
                <Link href="/kiralik" prefetch={true} className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium group">
                  <Search className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
                  Kiralık İlan Ara
                </Link>
              </li>
              <li>
                <Link href="/kredi-hesaplayici" prefetch={false} className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium group">
                  <Calculator className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
                  Kredi Hesaplayıcı
                </Link>
              </li>
              <li>
                <Link href="/karsilastir" prefetch={false} className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium group">
                  <TrendingUp className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
                  İlan Karşılaştır
                </Link>
              </li>
              <li>
                <Link href="/sss" prefetch={false} className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium group">
                  <HelpCircle className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
                  Sık Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* E-BÜLTEN */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs font-bold mb-5 text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#006AFF]" strokeWidth={2.5} />
              E-Bülten
            </h4>
            <div className="space-y-4">
              <NewsletterForm variant="simple" source="footer" />
              <div className="flex items-center gap-2 text-xs text-[#00A862] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#00A862] stroke-[2]" />
                <span>Bildirimler Aktif</span>
              </div>
              <div className="flex gap-2 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`p-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 ${social.color} transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95`}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-5 w-5 stroke-[1.5]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content - Enhanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">
          {/* Brand Section - Enhanced */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-12 w-12 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#006AFF] to-[#1A8CFF] rounded-xl shadow-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                    {siteConfig.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium tracking-tight">
                    Gayrimenkul Danışmanlığı
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed tracking-tight mb-4">
                Karasu ve çevresinde 15 yıldır güvenilir emlak danışmanlığı hizmeti sunuyoruz.
                Hayalinizdeki evi bulmak için buradayız.
              </p>
              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPinIcon className="h-4 w-4 text-[#006AFF] flex-shrink-0 mt-0.5" />
                <span>{napData.address?.full || 'Merkez Mahallesi, Atatürk Caddesi No:123, 54500 Karasu / Sakarya'}</span>
              </div>
            </div>

            {/* Social Media - Premium Design */}
            <div>
              <h4 className="text-xs font-bold mb-4 text-slate-900 uppercase tracking-wider">
                Sosyal Medya
              </h4>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`p-3 rounded-xl bg-white border-2 border-slate-200 text-slate-600 ${social.color} transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95`}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-5 w-5 stroke-[1.5]" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* İlanlar */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Home className="h-4 w-4 stroke-[2]" />
              İlanlar
            </h4>
            <ul className="space-y-2.5 text-sm">
              {listingLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={link.href.includes('/satilik') || link.href.includes('/kiralik')}
                    className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium tracking-tight group"
                  >
                    <link.icon className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Satılık Kategoriler */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h5 className="text-[11px] font-bold mb-3 text-slate-900 uppercase tracking-wider">
                Satılık Kategoriler
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/satilik?tip=daire" prefetch={true} className="text-slate-600 hover:text-[#006AFF] transition-colors">
                    Satılık Daire
                  </Link>
                </li>
                <li>
                  <Link href="/satilik?tip=villa" prefetch={true} className="text-slate-600 hover:text-[#006AFF] transition-colors">
                    Satılık Villa
                  </Link>
                </li>
                <li>
                  <Link href="/satilik?tip=yazlik" prefetch={true} className="text-slate-600 hover:text-[#006AFF] transition-colors">
                    Satılık Yazlık
                  </Link>
                </li>
                <li>
                  <Link href="/satilik?tip=arsa" prefetch={true} className="text-slate-600 hover:text-[#006AFF] transition-colors">
                    Satılık Arsa
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bölgeler & İçerik */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 stroke-[2]" />
              Bölgeler & İçerik
            </h4>
            <ul className="space-y-2.5 text-sm">
              {locationLinks.slice(0, 5).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={link.href.includes('/karasu')}
                    className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 font-medium tracking-tight hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Blog & Makaleler */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h5 className="text-[11px] font-bold mb-3 text-slate-900 uppercase tracking-wider">
                Blog & Makaleler
              </h5>
              <ul className="space-y-2 text-xs">
                {contentLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={link.href.includes('/blog')}
                      className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 group"
                    >
                      {link.icon && <link.icon className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Araçlar & Yasal */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="h-4 w-4 stroke-[2]" />
              Araçlar & Yasal
            </h4>
            <ul className="space-y-2.5 text-sm">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium tracking-tight group"
                  >
                    {link.icon && <link.icon className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />}
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* Separator */}
              <li className="pt-3 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Yasal
                </span>
              </li>

              {legalLinks.map((link) => (
                <li key={link.href} className="mt-2.5">
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-slate-600 hover:text-[#006AFF] transition-all duration-200 font-medium tracking-tight hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info Cards - Premium Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
          {/* Phone */}
          <a
            href={`tel:${contactInfo.phone}`}
            className="group flex items-start gap-4 p-5 lg:p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#006AFF] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="p-3 bg-[#006AFF]/10 rounded-xl group-hover:bg-[#006AFF]/15 transition-colors duration-200 flex-shrink-0">
              <Phone className="h-6 w-6 text-[#006AFF] stroke-[1.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 mb-1 text-sm tracking-tight">
                İletişim
              </div>
              <div className="text-base text-slate-700 font-semibold tracking-tight">
                {contactInfo.phoneFormatted}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Hafta içi 09:00 - 18:00</span>
              </div>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-5 lg:p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#25D366] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="p-3 bg-[#25D366]/10 rounded-xl group-hover:bg-[#25D366]/15 transition-colors duration-200 flex-shrink-0">
              <MessageCircle className="h-6 w-6 text-[#25D366] stroke-[1.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 mb-1 text-sm tracking-tight">
                WhatsApp
              </div>
              <div className="text-base text-slate-700 font-semibold tracking-tight">
                Mesaj Gönder
              </div>
              <div className="text-xs text-slate-500 mt-1.5">
                7/24 hızlı yanıt
              </div>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${contactInfo.email}`}
            className="group flex items-start gap-4 p-5 lg:p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#006AFF] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:col-span-2 lg:col-span-1"
          >
            <div className="p-3 bg-[#006AFF]/10 rounded-xl group-hover:bg-[#006AFF]/15 transition-colors duration-200 flex-shrink-0">
              <Mail className="h-6 w-6 text-[#006AFF] stroke-[1.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 mb-1 text-sm tracking-tight">
                E-posta
              </div>
              <div className="text-base text-slate-700 font-semibold tracking-tight break-all">
                {contactInfo.email}
              </div>
              <div className="text-xs text-slate-500 mt-1.5">
                Detaylı bilgi için
              </div>
            </div>
          </a>
        </div>

        {/* Bottom Section - Enhanced */}
        <div className="pt-8 border-t-2 border-slate-200/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            {/* Copyright */}
            <p className="text-xs text-slate-600 font-medium tracking-tight text-center md:text-left">
              © {currentYear} <span className="font-bold text-slate-900">{siteConfig.name}</span>.
              <span className="mx-1.5">•</span>
              Tüm hakları saklıdır.
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link
                href="/gizlilik-politikasi"
                className="text-slate-600 hover:text-[#006AFF] transition-colors duration-200"
              >
                Gizlilik Politikası
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/cerez-politikasi"
                className="text-slate-600 hover:text-[#006AFF] transition-colors duration-200"
              >
                Çerez Politikası
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/kullanim-kosullari"
                className="text-slate-600 hover:text-[#006AFF] transition-colors duration-200"
              >
                Kullanım Koşulları
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/kvkk-basvuru"
                className="text-slate-600 hover:text-[#006AFF] transition-colors duration-200"
              >
                KVKK Başvuru
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/sitemap.xml"
                target="_blank"
                className="text-slate-600 hover:text-[#006AFF] transition-colors duration-200 flex items-center gap-1"
              >
                Sitemap
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Trust Badges - Horizontal */}
          <div className="pt-6 border-t border-slate-200/60">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl hover:border-[#00A862] transition-all duration-200">
                <Shield className="h-5 w-5 text-[#00A862] stroke-[2]" />
                <span className="text-xs font-bold text-slate-900">SSL Güvenli</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl hover:border-[#006AFF] transition-all duration-200">
                <Lock className="h-5 w-5 text-[#006AFF] stroke-[2]" />
                <span className="text-xs font-bold text-slate-900">Güvenli Ödeme</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl hover:border-yellow-500 transition-all duration-200">
                <Award className="h-5 w-5 text-yellow-600 stroke-[2]" />
                <span className="text-xs font-bold text-slate-900">15+ Yıl Deneyim</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl hover:border-orange-500 transition-all duration-200">
                <Heart className="h-5 w-5 text-orange-600 stroke-[2]" />
                <span className="text-xs font-bold text-slate-900">{stats.mutluMusteri}+ Mutlu Müşteri</span>
              </div>
            </div>
          </div>

          {/* Developer Info & Tagline */}
          <div className="pt-6 border-t border-slate-200/60">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-500">
                <span>Sakarya Karasu'nun <span className="font-bold text-slate-700">Güvenilir Emlak Platformu</span></span>
              </div>
              {/* Developer Credit */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <a
                  href="https://poi369.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#006AFF] hover:text-[#1A8CFF] transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span>poi369</span>
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <span>tarafından geliştirildi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO: Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": siteConfig.name,
            "url": siteConfig.url,
            "logo": `${siteConfig.url}/logo.png`,
            "telephone": contactInfo.phone,
            "email": contactInfo.email,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Karasu",
              "addressRegion": "Sakarya",
              "postalCode": "54500",
              "addressCountry": "TR",
              "streetAddress": napData.address?.street || "Merkez Mahallesi, Atatürk Caddesi No:123"
            },
            "sameAs": [
              napData.social?.facebook || "",
              napData.social?.instagram || "",
              napData.social?.twitter || ""
            ].filter(Boolean),
            "priceRange": "₺₺",
            "areaServed": [
              {
                "@type": "City",
                "name": "Karasu"
              },
              {
                "@type": "City",
                "name": "Kocaali"
              }
            ]
          }),
        }}
      />
    </footer>
  );
}
