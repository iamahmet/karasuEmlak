"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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
  Building
} from "lucide-react";
import { napData } from "@karasu-emlak/config/nap";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

export function Footer() {
  const t = useTranslations("footer");

  // Footer link kategorileri
  const listingLinks = [
    { href: "/satilik", label: t("forSale"), icon: Home },
    { href: "/kiralik", label: t("forRent"), icon: Key },
    { href: "/ilan-ekle", label: "İlan Ekle", icon: Building },
  ];

  const locationLinks = [
    { href: "/karasu", label: "Karasu" },
    { href: "/karasu/gezilecek-yerler", label: "Gezilecek Yerler" },
    { href: "/karasu/hastaneler", label: "Hastaneler" },
    { href: "/karasu/nobetci-eczaneler", label: "Nöbetçi Eczaneler" },
    { href: "/karasu/restoranlar", label: "Restoranlar" },
    { href: "/karasu/ulasim", label: "Ulaşım" },
    { href: "/karasu/onemli-telefonlar", label: "Önemli Telefonlar" },
    { href: "/kocaali", label: "Kocaali" },
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
    { href: "/cerez-politikasi", label: t("cookies") },
    { href: "/kullanim-kosullari", label: t("terms") },
    { href: "/hakkimizda", label: t("about") },
    { href: "/iletisim", label: t("contact") },
  ];

  return (
    <footer className="border-t-2 border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Company Info - Apple Quality */}
          <div className="space-y-5 lg:col-span-2">
            <div>
              <h3 className="text-[19px] font-display font-semibold mb-3 text-gray-900 tracking-[-0.022em]">{siteConfig.name}</h3>
              <p className="text-[15px] text-gray-600 leading-[1.47] tracking-[-0.011em] mb-6">{siteConfig.description}</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="#" 
                className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 p-3 rounded-lg hover:bg-white hover:shadow-sm active:scale-95"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 stroke-[1.5]" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 p-3 rounded-lg hover:bg-white hover:shadow-sm active:scale-95"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 stroke-[1.5]" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 p-3 rounded-lg hover:bg-white hover:shadow-sm active:scale-95"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 stroke-[1.5]" />
              </Link>
            </div>
          </div>

          {/* İlanlar - Apple Quality */}
          <div>
            <h4 className="text-[13px] font-semibold mb-4 text-gray-900 uppercase tracking-wider">İlanlar</h4>
            <ul className="space-y-2.5 text-[15px]">
              {listingLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium tracking-[-0.011em] hover:translate-x-1"
                  >
                    {link.icon && <link.icon className="h-4 w-4 stroke-[1.5]" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bölgeler & İçerik - Apple Quality */}
          <div>
            <h4 className="text-[13px] font-semibold mb-4 text-gray-900 uppercase tracking-wider">Bölgeler & İçerik</h4>
            <ul className="space-y-2.5 text-[15px]">
              {locationLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 font-medium tracking-[-0.011em] hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {contentLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium tracking-[-0.011em] hover:translate-x-1"
                  >
                    {link.icon && <link.icon className="h-4 w-4 stroke-[1.5]" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Araçlar & Yasal - Apple Quality */}
          <div>
            <h4 className="text-[13px] font-semibold mb-4 text-gray-900 uppercase tracking-wider">Araçlar & Yasal</h4>
            <ul className="space-y-2.5 text-[15px]">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 flex items-center gap-2 font-medium tracking-[-0.011em] hover:translate-x-1"
                  >
                    {link.icon && <link.icon className="h-4 w-4 stroke-[1.5]" />}
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3 border-t border-gray-200 mt-3">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Yasal</span>
              </li>
              {legalLinks.map((link) => (
                <li key={link.href} className="mt-2.5">
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 font-medium tracking-[-0.011em] hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter - Apple Quality */}
        <div className="mt-10 pt-10 border-t-2 border-gray-200">
          <div className="max-w-md">
            <h4 className="text-[19px] font-semibold mb-2 text-gray-900 tracking-[-0.022em]">Newsletter</h4>
            <p className="text-[15px] text-gray-600 mb-4 leading-[1.47] tracking-[-0.011em]">Yeni ilanlar ve emlak haberleri için abone olun</p>
            <NewsletterForm variant="simple" source="footer" />
          </div>
        </div>

        {/* Contact Info - Apple Quality */}
        <div className="mt-10 pt-10 border-t-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <Phone className="h-5 w-5 text-[#006AFF] stroke-[1.5]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1 text-[13px] tracking-[-0.01em]">{t("contact")}</div>
                <a href={`tel:${napData.contact.phone}`} className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 font-medium text-[15px] tracking-[-0.011em]">
                  {napData.contact.phoneFormatted}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <MessageCircle className="h-5 w-5 text-[#25D366] stroke-[1.5]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1 text-[13px] tracking-[-0.01em]">WhatsApp</div>
                <a
                  href={`https://wa.me/${napData.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#25D366] transition-all duration-200 font-medium text-[15px] tracking-[-0.011em]"
                >
                  Mesaj Gönder
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <Mail className="h-5 w-5 text-[#006AFF] stroke-[1.5]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1 text-[13px] tracking-[-0.01em]">E-posta</div>
                <a href={`mailto:${napData.contact.email}`} className="text-gray-600 hover:text-[#006AFF] transition-all duration-200 font-medium text-[15px] tracking-[-0.011em]">
                  {napData.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - Apple Quality */}
        <div className="mt-10 pt-8 border-t border-gray-200 text-center">
          <p className="text-[13px] text-gray-600 font-medium tracking-[-0.01em]">
            © {new Date().getFullYear()} {siteConfig.name}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
