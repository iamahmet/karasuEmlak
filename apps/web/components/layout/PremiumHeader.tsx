"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
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
  MessageCircle,
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
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { siteConfig } from "@karasu-emlak/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@karasu/ui";
import { getNavigationMenu, type NavigationItem } from "@karasu/lib/supabase/queries/navigation";
import { Logo } from "@/components/branding/Logo";

// Icon mapping for dynamic icons
const iconMap: Record<string, LucideIcon> = {
  Home, Key, Plus, MapPin, FileText, Newspaper, BookOpen,
  Calculator, TrendingUp, Building2, Heart, Search, Phone, MessageCircle,
  Building, Landmark, Scale, Shield, Users, Award, Briefcase,
  BarChart3, LineChart, PieChart, Info,
};

interface NavItem {
  title: string;
  url: string;
  icon?: string;
  description?: string;
  badge?: string;
  children?: NavItem[];
}

export function PremiumHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fallback menu structure
  const mainMenuItems: NavItem[] = [
    { 
      title: "Satılık", 
      url: "/satilik", 
      icon: "Home",
      description: "Satılık konut, villa, arsa ve işyerleri"
    },
    { 
      title: "Kiralık", 
      url: "/kiralik", 
      icon: "Key",
      description: "Kiralık daire, ev ve yazlık seçenekleri"
    },
  ];

  const locationMenuItems: NavItem[] = [
    { title: "Karasu", url: "/karasu", description: "Karasu bölge rehberi" },
    { title: "Kocaali", url: "/kocaali", description: "Kocaali bölge rehberi" },
    { title: "Sapanca", url: "/sapanca", description: "Sapanca bölge rehberi" },
    { title: "Gezilecek Yerler", url: "/karasu/gezilecek-yerler" },
    { title: "Hastaneler", url: "/karasu/hastaneler" },
    { title: "Nöbetçi Eczaneler", url: "/karasu/nobetci-eczaneler" },
    { title: "Restoranlar", url: "/karasu/restoranlar" },
    { title: "Ulaşım", url: "/karasu/ulasim" },
    { title: "Önemli Telefonlar", url: "/karasu/onemli-telefonlar" },
  ];

  // Emlak Türleri dropdown
  const propertyTypeMenuItems: NavItem[] = [
    { title: "Daire", url: "/tip/daire", icon: "Building", description: "Satılık ve kiralık daireler" },
    { title: "Villa", url: "/tip/villa", icon: "Home", description: "Lüks villa seçenekleri" },
    { title: "Ev", url: "/tip/ev", icon: "Home", description: "Müstakil evler" },
    { title: "Yazlık", url: "/tip/yazlik", icon: "Building2", description: "Yazlık konutlar" },
    { title: "Arsa", url: "/tip/arsa", icon: "Landmark", description: "Satılık arsalar" },
    { title: "İşyeri", url: "/tip/isyeri", icon: "Building2", description: "Ticari emlak" },
  ];

  // Hizmetler dropdown
  const serviceMenuItems: NavItem[] = [
    { title: "Emlak Değerleme", url: "/hizmetler/emlak-degerleme", icon: "Scale", description: "Profesyonel değerleme hizmeti" },
    { title: "Danışmanlık", url: "/hizmetler/danismanlik", icon: "Info", description: "Emlak danışmanlığı" },
    { title: "Hukuki Destek", url: "/hizmetler/hukuki-destek", icon: "Scale", description: "Hukuki danışmanlık" },
    { title: "Sigorta Danışmanlığı", url: "/hizmetler/sigorta", icon: "Shield", description: "Gayrimenkul sigortası" },
  ];

  // Yatırım dropdown
  const investmentMenuItems: NavItem[] = [
    { title: "Yatırım Rehberi", url: "/rehber/yatirim", icon: "BookOpen", description: "Yatırım stratejileri" },
    { title: "Piyasa Analizi", url: "/yatirim/piyasa-analizi", icon: "BarChart3", description: "Piyasa trendleri" },
    { title: "Yatırım Hesaplayıcı", url: "/yatirim-hesaplayici", icon: "Calculator", description: "Getiri hesaplama" },
    { title: "ROI Hesaplayıcı", url: "/yatirim/roi-hesaplayici", icon: "TrendingUp", description: "Yatırım getirisi" },
  ];

  // İstatistikler dropdown
  const statsMenuItems: NavItem[] = [
    { title: "Piyasa Raporları", url: "/istatistikler/piyasa-raporlari", icon: "FileText", description: "Detaylı piyasa raporları" },
    { title: "Fiyat Trendleri", url: "/istatistikler/fiyat-trendleri", icon: "LineChart", description: "Fiyat analizleri" },
    { title: "Bölge Analizi", url: "/istatistikler/bolge-analizi", icon: "PieChart", description: "Bölgesel analizler" },
  ];

  // Check if current path is active
  const isActive = (url: string) => pathname === url || pathname?.startsWith(url + '/');

  // Render navigation link - Compact & Modern
  const NavLink = ({ item, mobile = false }: { item: NavItem; mobile?: boolean }) => {
    const Icon = item.icon ? iconMap[item.icon] : null;
    const active = isActive(item.url);
    // Prefetch important pages for faster navigation
    const shouldPrefetch = !active && (
      item.url.includes('/satilik') ||
      item.url.includes('/kiralik') ||
      item.url.includes('/blog') ||
      item.url.includes('/karasu') ||
      item.url === '/'
    );

    return (
      <Link
        href={item.url}
        prefetch={shouldPrefetch}
        className={`
          group relative flex items-center gap-1.5
          ${mobile ? 'px-4 py-2.5' : 'px-2.5 py-1.5'}
          text-[14px] font-medium tracking-[-0.01em]
          rounded-md transition-all duration-150
          whitespace-nowrap
          ${active 
            ? 'text-[#006AFF] bg-blue-50/80' 
            : 'text-gray-700 hover:text-[#006AFF] hover:bg-gray-50/80'
          }
        `}
        onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
        aria-label={item.description || item.title}
        aria-current={active ? 'page' : undefined}
      >
        {Icon && <Icon className="h-3.5 w-3.5 stroke-[1.5] flex-shrink-0" aria-hidden="true" />}
        <span className="whitespace-nowrap">{item.title}</span>
        {item.badge && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 rounded-full flex-shrink-0">
            {item.badge}
          </span>
        )}
        {active && !mobile && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#006AFF] rounded-full" />
        )}
      </Link>
    );
  };

  // Render dropdown menu with descriptions (Mega Menu style)
  const DropdownNav = ({ title, items, icon }: { title: string; items: NavItem[]; icon?: string }) => {
    const Icon = icon ? iconMap[icon] : null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger 
          className="px-2.5 py-1.5 text-[14px] font-medium text-gray-700 tracking-[-0.01em] 
                     transition-all duration-150 hover:text-[#006AFF] hover:bg-gray-50/80 
                     rounded-md flex items-center gap-1.5 group whitespace-nowrap"
          aria-label={`${title} menüsü`}
          aria-haspopup="true"
          aria-expanded="false"
        >
          {Icon && <Icon className="h-3.5 w-3.5 stroke-[1.5] flex-shrink-0" />}
          <span className="whitespace-nowrap">{title}</span>
          <ChevronDown className="h-3 w-3 stroke-[1.5] ml-0.5 transition-transform duration-150 group-data-[state=open]:rotate-180 flex-shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-64 rounded-lg border border-gray-200/80 shadow-lg p-1.5 bg-white/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95"
        >
          {items.map((item, index) => {
            const ItemIcon = item.icon ? iconMap[item.icon] : null;
            const active = isActive(item.url);
            // Prefetch important pages on hover
            const shouldPrefetch = !active && (
              item.url.includes('/satilik') ||
              item.url.includes('/kiralik') ||
              item.url.includes('/blog') ||
              item.url.includes('/karasu') ||
              item.url === '/'
            );
            
            return (
              <div key={item.url}>
                {index > 0 && !item.description && items[index - 1]?.description && (
                  <DropdownMenuSeparator className="my-1" />
                )}
                <DropdownMenuItem asChild>
                  <Link 
                    href={item.url}
                    prefetch={shouldPrefetch}
                    className={`
                      flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-150
                      ${active ? 'bg-blue-50/80 text-[#006AFF]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#006AFF]'}
                    `}
                    aria-label={item.description || item.title}
                    aria-current={active ? 'page' : undefined}
                  >
                    {ItemIcon && (
                      <ItemIcon className={`h-3.5 w-3.5 stroke-[1.5] flex-shrink-0 ${active ? 'text-[#006AFF]' : 'text-gray-500'}`} aria-hidden="true" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-medium leading-tight ${active ? 'text-[#006AFF]' : 'text-gray-900'}`}>
                        {item.title}
                        {item.badge && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-tight line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      {/* SEO: Navigation schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            "name": "Ana Navigasyon",
            "url": siteConfig.url,
          }),
        }}
      />

      <header 
        className={`
          sticky top-0 z-50 w-full border-b overflow-x-hidden
          transition-all duration-200
          ${scrolled 
            ? 'border-gray-200/80 bg-white/98 backdrop-blur-lg shadow-sm' 
            : 'border-gray-200/60 bg-white/95 backdrop-blur-sm'
          }
        `}
        role="banner"
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 overflow-x-hidden">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4 lg:gap-6 min-w-0">
            {/* Logo - Professional Component with proper spacing */}
            <div className="flex-shrink-0">
              <Logo 
                variant="full" 
                size="md"
                hideTextOnMobile={false}
                className="flex-shrink-0"
              />
            </div>

            {/* Desktop Navigation - Compact & Modern */}
            <nav 
              className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-5xl mx-2 lg:mx-4 min-w-0" 
              role="navigation"
              aria-label="Ana menü"
            >
              {loading ? (
                // Loading skeleton
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </>
              ) : menuItems.length > 0 ? (
                // Database menu - organized structure from database
                <>
                  {menuItems.map((item) => {
                    const navItem: NavItem = {
                      title: item.title,
                      url: item.url,
                      icon: item.icon || undefined,
                      description: item.description || undefined,
                      badge: undefined,
                      children: item.children?.map(child => ({
                        title: child.title,
                        url: child.url,
                        icon: child.icon || undefined,
                        description: child.description || undefined,
                        badge: undefined,
                      })),
                    };
                    
                    // Render as dropdown if has children, otherwise as link
                    if (navItem.children && navItem.children.length > 0) {
                      return (
                        <DropdownNav
                          key={item.id}
                          title={navItem.title}
                          items={navItem.children}
                          icon={navItem.icon}
                        />
                      );
                    } else {
                      return <NavLink key={item.id} item={navItem} />;
                    }
                  })}
                </>
              ) : (
                // Fallback menu - organized structure
                <>
                  {/* Main Actions - Direct Links */}
                  {mainMenuItems.map((item) => (
                    <NavLink key={item.url} item={item} />
                  ))}
                  
                  {/* Property Types - Most Used */}
                  <DropdownNav title="Emlak Türleri" items={propertyTypeMenuItems} icon="Building" />
                  
                  {/* Locations */}
                  <DropdownNav title="Bölgeler" items={locationMenuItems} icon="MapPin" />
                  
              {/* Services & Investment - Combined */}
              <DropdownNav 
                title="Hizmetler & Yatırım" 
                items={[
                  ...serviceMenuItems,
                  ...investmentMenuItems,
                  ...statsMenuItems,
                ]} 
                icon="TrendingUp" 
              />
                </>
              )}
            </nav>

            {/* Right Side Actions - Compact & Modern */}
            <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
              {/* Theme Toggle - Desktop */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* Search Button - Compact */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex h-8 w-8 rounded-md transition-all duration-150 hover:bg-gray-100 hover:scale-105 active:scale-95" 
                asChild
              >
                <Link href="/arama" aria-label="İlan Ara">
                  <Search className="h-4 w-4 stroke-[1.5]" />
                </Link>
              </Button>

              {/* İlan Ekle Button - Compact & Responsive */}
              <Button 
                variant="outline"
                size="sm" 
                className="
                  hidden md:flex 
                  bg-white
                  hover:bg-gray-50
                  text-gray-900
                  border border-gray-200
                  hover:border-[#006AFF]
                  px-2.5 lg:px-3 py-1.5
                  text-[13px] font-semibold tracking-[-0.01em] 
                  rounded-md 
                  transition-all duration-150 
                  hover:scale-105 active:scale-95
                  hover:text-[#006AFF]
                  h-8
                  whitespace-nowrap
                " 
                asChild
              >
                <Link href="/ilan-ekle" className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 stroke-[2] flex-shrink-0" />
                  <span className="hidden xl:inline">İlan Ekle</span>
                </Link>
              </Button>

              {/* Contact CTA Button - Compact & Responsive */}
              <Button 
                variant="default" 
                size="sm" 
                className="
                  hidden md:flex 
                  bg-[#006AFF]
                  hover:bg-[#0052CC]
                  text-white 
                  px-2.5 lg:px-3.5 py-1.5 
                  text-[13px] font-semibold tracking-[-0.01em] 
                  rounded-md 
                  transition-all duration-150 
                  shadow-sm hover:shadow-md 
                  hover:scale-105 active:scale-95
                  h-8
                  whitespace-nowrap
                " 
                asChild
              >
                <Link href="/iletisim" className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 stroke-[1.5] flex-shrink-0" />
                  <span className="hidden xl:inline">İletişim</span>
                </Link>
              </Button>

              {/* Mobile Menu Button - Compact */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 rounded-md transition-all duration-150"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4 stroke-[1.5]" />
                ) : (
                  <Menu className="h-4 w-4 stroke-[1.5]" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu - Compact & Modern */}
          {mobileMenuOpen && (
            <div 
              id="mobile-menu"
              className="lg:hidden border-t border-gray-200/80 py-2.5 animate-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-3rem)] overflow-y-auto bg-white/98 backdrop-blur-sm"
              role="navigation"
              aria-label="Mobil menü"
            >
              <nav className="flex flex-col gap-0.5">
                {loading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse mx-2" />
                    ))}
                  </>
                ) : (
                  <>
                    {/* Main Items */}
                    <div className="space-y-0.5 pb-2">
                      {mainMenuItems.map((item) => (
                        <NavLink key={item.url} item={item} mobile />
                      ))}
                    </div>

                    {/* Emlak Türleri */}
                    <div className="border-t border-gray-200/60 pt-2">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="h-3 w-3" />
                        Emlak Türleri
                      </div>
                      <div className="space-y-0.5">
                        {propertyTypeMenuItems.map((item) => {
                          const Icon = item.icon ? iconMap[item.icon] : null;
                          return (
                            <Link
                              key={item.url}
                              href={item.url}
                              className={`
                                flex items-center gap-2 px-6 py-2 text-[14px] 
                                rounded-md transition-all duration-150
                                ${isActive(item.url)
                                  ? 'text-[#006AFF] bg-blue-50/80 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50/80 hover:text-[#006AFF]'
                                }
                              `}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {Icon && <Icon className="h-3.5 w-3.5 stroke-[1.5]" />}
                              <div>{item.title}</div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bölgeler */}
                    <div className="border-t border-gray-200/60 pt-2">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        Bölgeler
                      </div>
                      <div className="space-y-0.5">
                        {locationMenuItems.map((item) => (
                          <Link
                            key={item.url}
                            href={item.url}
                            className={`
                              block px-6 py-2 text-[14px] 
                              rounded-md transition-all duration-150
                              ${isActive(item.url)
                                ? 'text-[#006AFF] bg-blue-50/80 font-medium'
                                : 'text-gray-600 hover:bg-gray-50/80 hover:text-[#006AFF]'
                              }
                            `}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div>{item.title}</div>
                            {item.description && (
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Hizmetler */}
                    <div className="border-t border-gray-200/60 pt-2">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        Hizmetler
                      </div>
                      <div className="space-y-0.5">
                        {serviceMenuItems.map((item) => {
                          const Icon = item.icon ? iconMap[item.icon] : null;
                          return (
                            <Link
                              key={item.url}
                              href={item.url}
                              className={`
                                flex items-center gap-2 px-6 py-2
                                rounded-md transition-all duration-150
                                ${isActive(item.url)
                                  ? 'text-[#006AFF] bg-blue-50/70'
                                  : 'text-gray-600 hover:bg-blue-50/50 hover:text-[#006AFF]'
                                }
                              `}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {Icon && <Icon className="h-3.5 w-3.5 stroke-[1.5] flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[14px]">{item.title}</div>
                                {item.description && (
                                  <div className="text-[11px] text-gray-500 mt-0.5">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Yatırım */}
                    <div className="border-t border-gray-200/60 pt-2">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Yatırım
                      </div>
                      <div className="space-y-0.5">
                        {investmentMenuItems.map((item) => {
                          const Icon = item.icon ? iconMap[item.icon] : null;
                          return (
                            <Link
                              key={item.url}
                              href={item.url}
                              className={`
                                flex items-center gap-2 px-6 py-2
                                rounded-md transition-all duration-150
                                ${isActive(item.url)
                                  ? 'text-[#006AFF] bg-blue-50/70'
                                  : 'text-gray-600 hover:bg-blue-50/50 hover:text-[#006AFF]'
                                }
                              `}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {Icon && <Icon className="h-3.5 w-3.5 stroke-[1.5] flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[14px]">{item.title}</div>
                                {item.description && (
                                  <div className="text-[11px] text-gray-500 mt-0.5">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* İstatistikler */}
                    <div className="border-t border-gray-200/60 pt-2">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5" />
                        İstatistikler
                      </div>
                      <div className="space-y-0.5">
                        {statsMenuItems.map((item) => {
                          const Icon = item.icon ? iconMap[item.icon] : null;
                          return (
                            <Link
                              key={item.url}
                              href={item.url}
                              className={`
                                flex items-center gap-2 px-6 py-2
                                rounded-md transition-all duration-150
                                ${isActive(item.url)
                                  ? 'text-[#006AFF] bg-blue-50/70'
                                  : 'text-gray-600 hover:bg-blue-50/50 hover:text-[#006AFF]'
                                }
                              `}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {Icon && <Icon className="h-3.5 w-3.5 stroke-[1.5] flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[14px]">{item.title}</div>
                                {item.description && (
                                  <div className="text-[11px] text-gray-500 mt-0.5">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>


                    {/* CTA Section */}
                    <div className="pt-4 mt-4 border-t border-gray-200 px-4 space-y-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-[#006AFF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#003D99] shadow-md" 
                        asChild
                      >
                        <Link href="/iletisim" onClick={() => setMobileMenuOpen(false)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {t("contact")}
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        asChild
                      >
                        <Link href="/arama" onClick={() => setMobileMenuOpen(false)}>
                          <Search className="h-4 w-4 mr-2" />
                          İlan Ara
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

