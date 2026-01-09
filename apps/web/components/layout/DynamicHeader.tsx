"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@karasu/ui";
import { 
  Menu, 
  X, 
  Search, 
  Phone, 
  ChevronDown,
  Home,
  Key,
  Plus,
  MapPin,
  FileText,
  Newspaper,
  BookOpen,
  Calculator,
  TrendingUp,
  Building2,
  Heart,
  LucideIcon,
  Building,
  Landmark,
  Scale,
  Shield,
  Users,
  Award,
  Briefcase,
  BarChart3,
  LineChart,
  PieChart,
  Info
} from "lucide-react";
import { siteConfig } from "@karasu-emlak/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { getNavigationMenu, type NavigationItem } from "@karasu/lib/supabase/queries/navigation";
import { Logo } from "@/components/branding/Logo";

// Icon mapping for dynamic icons
const iconMap: Record<string, LucideIcon> = {
  Home,
  Key,
  Plus,
  MapPin,
  FileText,
  Newspaper,
  BookOpen,
  Calculator,
  TrendingUp,
  Building2,
  Heart,
  Search,
  Phone,
  Building,
  Landmark,
  Scale,
  Shield,
  Users,
  Award,
  Briefcase,
  BarChart3,
  LineChart,
  PieChart,
  Info,
};

export function DynamicHeader() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch navigation menu from database
  useEffect(() => {
    async function fetchMenu() {
      try {
        const menu = await getNavigationMenu('header');
        if (menu && menu.items) {
          setMenuItems(menu.items);
        }
      } catch (error) {
        console.error('Error fetching navigation menu:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  // Fallback menu items (if database is empty)
  const fallbackMainItems = [
    { title: t("forSale"), url: "/satilik", icon: "Home" },
    { title: t("forRent"), url: "/kiralik", icon: "Key" },
    { title: "İlan Ekle", url: "/ilan-ekle", icon: "Plus" },
  ];

  const fallbackLocationItems = [
    { title: t("karasu"), url: "/karasu" },
    { title: "Gezilecek Yerler", url: "/karasu/gezilecek-yerler" },
    { title: "Hastaneler", url: "/karasu/hastaneler" },
    { title: "Nöbetçi Eczaneler", url: "/karasu/nobetci-eczaneler" },
    { title: "Restoranlar", url: "/karasu/restoranlar" },
    { title: "Ulaşım", url: "/karasu/ulasim" },
    { title: "Önemli Telefonlar", url: "/karasu/onemli-telefonlar" },
    { title: t("kocaali"), url: "/kocaali" },
  ];

  const fallbackContentItems = [
    { title: t("blog"), url: "/blog", icon: "FileText" },
    { title: t("news"), url: "/haberler", icon: "Newspaper" },
    { title: t("guide"), url: "/rehber", icon: "BookOpen" },
  ];

  // Emlak Türleri dropdown
  const fallbackPropertyTypeItems = [
    { title: "Daire", url: "/tip/daire", icon: "Building" },
    { title: "Villa", url: "/tip/villa", icon: "Home" },
    { title: "Ev", url: "/tip/ev", icon: "Home" },
    { title: "Yazlık", url: "/tip/yazlik", icon: "Building2" },
    { title: "Arsa", url: "/tip/arsa", icon: "Landmark" },
    { title: "İşyeri", url: "/tip/isyeri", icon: "Building2" },
  ];

  // Hizmetler dropdown
  const fallbackServiceItems = [
    { title: "Emlak Değerleme", url: "/hizmetler/emlak-degerleme", icon: "Scale" },
    { title: "Danışmanlık", url: "/hizmetler/danismanlik", icon: "Info" },
    { title: "Hukuki Destek", url: "/hizmetler/hukuki-destek", icon: "Scale" },
    { title: "Sigorta Danışmanlığı", url: "/hizmetler/sigorta", icon: "Shield" },
  ];

  // Hakkımızda dropdown
  const fallbackAboutItems = [
    { title: "Hakkımızda", url: "/hakkimizda", icon: "Info" },
    { title: "Ekibimiz", url: "/hakkimizda/ekibimiz", icon: "Users" },
    { title: "Referanslar", url: "/hakkimizda/referanslar", icon: "Award" },
    { title: "Kariyer", url: "/hakkimizda/kariyer", icon: "Briefcase" },
  ];

  // Yatırım dropdown
  const fallbackInvestmentItems = [
    { title: "Yatırım Rehberi", url: "/rehber/yatirim", icon: "BookOpen" },
    { title: "Piyasa Analizi", url: "/yatirim/piyasa-analizi", icon: "BarChart3" },
    { title: "Yatırım Hesaplayıcı", url: "/yatirim-hesaplayici", icon: "Calculator" },
    { title: "ROI Hesaplayıcı", url: "/yatirim/roi-hesaplayici", icon: "TrendingUp" },
  ];

  // İstatistikler dropdown
  const fallbackStatsItems = [
    { title: "Piyasa Raporları", url: "/istatistikler/piyasa-raporlari", icon: "FileText" },
    { title: "Fiyat Trendleri", url: "/istatistikler/fiyat-trendleri", icon: "LineChart" },
    { title: "Bölge Analizi", url: "/istatistikler/bolge-analizi", icon: "PieChart" },
  ];

  const fallbackToolItems = [
    { title: "Kredi Hesaplayıcı", url: "/kredi-hesaplayici", icon: "Calculator" },
    { title: "Yatırım Hesaplayıcı", url: "/yatirim-hesaplayici", icon: "TrendingUp" },
    { title: "İlan Karşılaştır", url: "/karsilastir", icon: "Building2" },
    { title: t("favorites"), url: "/favorilerim", icon: "Heart" },
  ];

  // Use database menu if available, otherwise use fallback
  const mainItems = menuItems.length > 0 ? menuItems.filter(item => !item.parent_id && !item.children?.length) : fallbackMainItems;
  const dropdownItems = menuItems.length > 0 ? menuItems.filter(item => !item.parent_id && item.children && item.children.length > 0) : [];

  // Render navigation item with icon
  const renderNavItem = (item: NavigationItem | typeof fallbackMainItems[0], isMobile = false) => {
    const Icon = item.icon ? iconMap[item.icon] : null;
    const href = (item as any).url || '';
    const label = (item as any).title || '';

    return (
      <Link
        key={href}
        href={href}
        className={isMobile 
          ? "px-4 py-2.5 text-[15px] font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
          : "px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5"
        }
        onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
      >
        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
        {label}
      </Link>
    );
  };

  // Render dropdown menu
  const renderDropdown = (item: NavigationItem, isMobile = false) => {
    const Icon = item.icon ? iconMap[item.icon] : null;

    if (isMobile) {
      return (
        <div key={item.id}>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {item.title}
          </div>
          {item.children?.map((child) => {
            const ChildIcon = child.icon ? iconMap[child.icon] : null;
            return (
              <Link
                key={child.id}
                href={child.url}
                className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ChildIcon && <ChildIcon className="h-4 w-4 stroke-[1.5]" />}
                {child.title}
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <DropdownMenu key={item.id}>
        <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
          {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
          {item.title}
          <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
          {item.children?.map((child) => {
            const ChildIcon = child.icon ? iconMap[child.icon] : null;
            return (
              <DropdownMenuItem key={child.id} asChild>
                <Link href={child.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                  {ChildIcon && <ChildIcon className="h-4 w-4 stroke-[1.5]" />}
                  {child.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4 lg:gap-6">
          {/* Logo - Professional Component with proper spacing */}
          <div className="flex-shrink-0">
            <Logo variant="full" size="md" />
          </div>

          {/* Desktop Navigation - Dynamic from Database */}
          <nav className="hidden lg:flex items-center space-x-0.5">
            {loading ? (
              // Loading skeleton
              <>
                <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
              </>
            ) : menuItems.length > 0 ? (
              // Database menu
              <>
                {mainItems.map((item) => renderNavItem(item as any))}
                {dropdownItems.map((item) => renderDropdown(item))}
              </>
            ) : (
              // Fallback menu
              <>
                {fallbackMainItems.map((item) => renderNavItem(item))}
                
                {/* Emlak Türleri Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    <Building className="h-4 w-4 stroke-[1.5]" />
                    Emlak Türleri
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackPropertyTypeItems.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <DropdownMenuItem key={item.url} asChild>
                          <Link href={item.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                            {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Bölgeler Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 stroke-[1.5]" />
                    Bölgeler
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackLocationItems.map((item) => (
                      <DropdownMenuItem key={item.url} asChild>
                        <Link href={item.url} className="text-[15px] font-normal tracking-[-0.011em] py-2">
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Hizmetler Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    <Shield className="h-4 w-4 stroke-[1.5]" />
                    Hizmetler
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackServiceItems.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <DropdownMenuItem key={item.url} asChild>
                          <Link href={item.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                            {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Yatırım Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 stroke-[1.5]" />
                    Yatırım
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackInvestmentItems.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <DropdownMenuItem key={item.url} asChild>
                          <Link href={item.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                            {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* İstatistikler Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 stroke-[1.5]" />
                    İstatistikler
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackStatsItems.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <DropdownMenuItem key={item.url} asChild>
                          <Link href={item.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                            {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* İçerik Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    İçerik
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackContentItems.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <DropdownMenuItem key={item.url} asChild>
                          <Link href={item.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                            {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Hakkımızda Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    <Info className="h-4 w-4 stroke-[1.5]" />
                    Hakkımızda
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackAboutItems.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <DropdownMenuItem key={item.url} asChild>
                          <Link href={item.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                            {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Araçlar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                    Araçlar
                    <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                    {fallbackToolItems.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <DropdownMenuItem key={item.url} asChild>
                          <Link href={item.url} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                            {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>

          {/* Right Side Actions - Apple Quality */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 rounded-lg transition-all duration-200" asChild>
              <Link href="/arama" aria-label="Ara">
                <Search className="h-5 w-5 stroke-[1.5]" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 rounded-lg transition-all duration-200" asChild>
              <Link href="/iletisim" aria-label="İletişim">
                <Phone className="h-5 w-5 stroke-[1.5]" />
              </Link>
            </Button>
            <Button 
              variant="default" 
              size="default" 
              className="hidden md:flex bg-[#006AFF] hover:bg-[#0052CC] text-white px-4 py-2 text-[15px] font-semibold tracking-[-0.011em] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" 
              asChild
            >
              <Link href="/iletisim">{t("contact")}</Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Menu className="h-5 w-5 stroke-[1.5]" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4 animate-fade-in">
            <nav className="flex flex-col space-y-1">
              {loading ? (
                // Loading skeleton
                <>
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse mx-4" />
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse mx-4" />
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse mx-4" />
                </>
              ) : menuItems.length > 0 ? (
                // Database menu
                <>
                  {mainItems.map((item) => renderNavItem(item as any, true))}
                  {dropdownItems.map((item) => renderDropdown(item, true))}
                </>
              ) : (
                // Fallback menu
                <>
                  {fallbackMainItems.map((item) => renderNavItem(item, true))}
                  
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Emlak Türleri
                  </div>
                  {fallbackPropertyTypeItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                        {item.title}
                      </Link>
                    );
                  })}

                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bölgeler
                  </div>
                  {fallbackLocationItems.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}

                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hizmetler
                  </div>
                  {fallbackServiceItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                        {item.title}
                      </Link>
                    );
                  })}

                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Yatırım
                  </div>
                  {fallbackInvestmentItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                        {item.title}
                      </Link>
                    );
                  })}

                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    İstatistikler
                  </div>
                  {fallbackStatsItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                        {item.title}
                      </Link>
                    );
                  })}

                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    İçerik
                  </div>
                  {fallbackContentItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                        {item.title}
                      </Link>
                    );
                  })}

                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hakkımızda
                  </div>
                  {fallbackAboutItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                        {item.title}
                      </Link>
                    );
                  })}

                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Araçlar
                  </div>
                  {fallbackToolItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className="px-8 py-2 text-[15px] text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-[#006AFF] rounded-lg flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4 stroke-[1.5]" />}
                        {item.title}
                      </Link>
                    );
                  })}
                </>
              )}

              <div className="pt-4 mt-4 border-t">
                <Button className="w-full" asChild>
                  <Link href="/iletisim" onClick={() => setMobileMenuOpen(false)}>
                    {t("contact")}
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

