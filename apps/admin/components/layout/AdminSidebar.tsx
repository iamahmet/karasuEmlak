"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/routing";
import {
  LayoutDashboard,
  Search,
  FileText,
  Bot,
  BarChart3,
  Users,
  MessageSquare,
  MessageSquareQuote,
  ImageIcon,
  Shield,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Zap,
  Code,
  Link2,
  Newspaper,
  Calendar,
  Home,
  Sparkles,
  Menu,
  FolderOpen,
  Image,
  TrendingUp,
  Database,
  AlertTriangle,
  Key,
  Wrench,
  Activity,
  GitBranch,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { Button } from "@karasu/ui";
import { Logo } from "@/components/branding/Logo";
import { useSwipe } from "@/lib/mobile/swipe-gestures";
import { hapticButtonPress } from "@/lib/mobile/haptics";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ isMobileOpen = false, onMobileClose }: AdminSidebarProps = {}) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["contentManagement"]);
  const [poi369Expanded, setPoi369Expanded] = useState(false); // Collapsible Poi369 Studio
  const sidebarRef = useRef<HTMLElement>(null);

  // Swipe gesture to close sidebar on mobile
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (isMobileOpen && onMobileClose) {
        hapticButtonPress();
        onMobileClose();
      }
    },
  }, { threshold: 50, preventDefault: false });

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onMobileClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, onMobileClose]);

  // 🔑 EMLAKÇI PANELİ (PRIMARY, DEFAULT - İLAN ODAKLI)
  const emlakciItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "İlan Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/listings",
      label: "İlanlar",
      icon: Home,
    },
    {
      label: "İçerikler",
      icon: FolderOpen,
      children: [
        {
          href: "/articles",
          label: "Blog Yazıları",
          icon: FileText,
        },
        {
          href: "/yazarlar",
          label: "Yazarlar",
          icon: Users,
        },
        {
          href: "/haberler",
          label: "Haberler",
          icon: Newspaper,
        },
        {
          href: "/homepage",
          label: "Ana Sayfa",
          icon: Home,
        },
        {
          href: "/navigation",
          label: "Menü Yönetimi",
          icon: Menu,
        },
        {
          href: "/content-quality",
          label: "İçerik Kalitesi",
          icon: FileText,
        },
        {
          href: "/content-review",
          label: "İçerik İnceleme",
          icon: FileText,
        },
        {
          href: "/workflow",
          label: "Workflow Yönetimi",
          icon: GitBranch,
        },
      ],
    },
    {
      label: "Media",
      icon: Image,
      children: [
        {
          href: "/media",
          label: "Medya Kütüphanesi",
          icon: ImageIcon,
        },
      ],
    },
    {
      label: "Kullanıcı & Etkileşim",
      icon: Users,
      children: [
        {
          href: "/users",
          label: "Kullanıcılar",
          icon: Users,
        },
        {
          href: "/comments",
          label: "Yorumlar",
          icon: MessageSquare,
        },
      ],
    },
    {
      href: "/settings",
      label: "Ayarlar",
      icon: Settings,
    },
  ];

  // 🛠️ POI369 STUDIO (SECONDARY, ADVANCED TOOLS - GELİŞTİRME ODAKLI)
  const poi369Items: NavItem[] = [
    {
      href: "/poi369",
      label: "Developer Dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "SEO Araçları",
      icon: Search,
      children: [
        {
          href: "/seo/booster",
          label: "SEO Booster",
          icon: Zap,
        },
        {
          href: "/seo/content-studio",
          label: "Content Studio",
          icon: FileText,
        },
        {
          href: "/seo/control",
          label: "SEO Control",
          icon: Code,
        },
        {
          href: "/seo/indexing",
          label: "Indexing",
          icon: Link2,
        },
      ],
    },
    {
      label: "AI İçerik & Q&A",
      icon: Sparkles,
      children: [
        {
          href: "/ai-qa",
          label: "AI Q&A Yönetimi",
          icon: MessageSquareQuote,
        },
        {
          href: "/ai-images",
          label: "AI Görseller",
          icon: Sparkles,
        },
      ],
    },
    {
      label: "Schema & Indexleme",
      icon: Database,
      children: [
        {
          href: "/programmatic-pages",
          label: "Programmatic Pages",
          icon: Calendar,
        },
      ],
    },
    {
      label: "Otomasyonlar",
      icon: Zap,
      children: [
        {
          href: "/project-bot",
          label: "Project Bot",
          icon: Bot,
        },
        {
          href: "/integrations/google",
          label: "Entegrasyonlar",
          icon: Settings,
        },
      ],
    },
    {
      label: "Sistem Sağlığı",
      icon: Activity,
      children: [
        {
          href: "/analytics/dashboard",
          label: "Analytics",
          icon: BarChart3,
        },
        {
          href: "/notifications",
          label: "Bildirimler",
          icon: Bell,
        },
      ],
    },
    {
      label: "Gelişmiş Ayarlar",
      icon: Wrench,
      children: [
        {
          href: "/compliance/consent",
          label: "Compliance",
          icon: Shield,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    const pathWithoutLocale = pathname?.replace(/^\/[^/]+/, "") || "";
    const hrefWithoutLocale = href.startsWith("/") ? href : `/${href}`;
    
    if (href.includes("/dashboard")) {
      return pathWithoutLocale === "/dashboard" || pathWithoutLocale === "/";
    }
    
    return pathWithoutLocale === hrefWithoutLocale || pathWithoutLocale.startsWith(hrefWithoutLocale + "/");
  };

  const toggleMenu = (label: string) => {
    hapticButtonPress();
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((m) => m !== label)
        : [...prev, label]
    );
  };

  const isMenuExpanded = (label: string) => {
    return expandedMenus.includes(label);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = hasChildren && isMenuExpanded(item.label);
    const active = item.href ? isActive(item.href) : (hasChildren && item.children!.some(child => child.href && isActive(child.href)));

    return (
      <div key={item.href || item.label}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleMenu(item.label)}
              aria-expanded={isExpanded}
              aria-controls={`submenu-${item.label}`}
              aria-label={`${item.label} menüsünü ${isExpanded ? "kapat" : "aç"}`}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 font-ui text-sm font-medium focus-professional group relative",
                "min-h-[44px] touch-manipulation active:scale-[0.98]",
                active
                  ? "bg-gradient-to-r from-design-light/15 via-design-light/10 to-transparent text-design-dark dark:text-primary shadow-sm shadow-design-light/5 dark:shadow-design-light/5 border-l-2 border-design-light"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                level > 0 && "pl-6 ml-2",
                "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-design-light/5 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-200"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {isExpanded && (
              <div id={`submenu-${item.label}`} role="group" aria-label={`${item.label} alt menüsü`} className="mt-1 space-y-0.5 ml-2 border-l border-design-light/20 dark:border-design-light/10 pl-2">
                {item.children!.map((child) => renderNavItem(child, level + 1))}
              </div>
            )}
          </>
        ) : item.href ? (
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            onClick={() => {
              hapticButtonPress();
              onMobileClose?.();
            }}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 font-ui text-sm font-medium relative group focus-professional",
              "min-h-[44px] touch-manipulation active:scale-[0.98]",
              active
                ? "bg-gradient-to-r from-design-light/15 via-design-light/10 to-transparent text-design-dark dark:text-primary shadow-sm shadow-design-light/5 dark:shadow-design-light/5 border-l-2 border-design-light"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              level > 0 && "pl-6 ml-2",
              "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-design-light/5 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-200"
            )}
            style={{ touchAction: 'manipulation' }}
          >
            {level > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-design-light opacity-40"></div>
            )}
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{item.label}</span>
            {active && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-design-light to-design-dark rounded-full"></div>
            )}
          </Link>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button - Hidden, handled by header */}

      {/* Sidebar - Ultra Modern & Compact */}
      <aside
        ref={sidebarRef}
        id="admin-sidebar"
        role="navigation"
        aria-label="Ana navigasyon menüsü"
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-[240px] bg-card/95 backdrop-blur-xl border-r border-border/60 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 ease-in-out lg:translate-x-0",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:via-card/20 before:to-transparent before:pointer-events-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "touch-manipulation" // Optimize touch interactions
        )}
        style={{ 
          width: 'var(--sidebar-width, 240px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
        {...swipeHandlers}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Compact & Professional */}
          <div className="relative px-4 py-4 border-b border-border/40 bg-card/95 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Logo variant="icon" size="md" href="/dashboard" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-display font-bold text-foreground leading-tight truncate">
                  Karasu Emlak
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight font-medium">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Navigation - Compact */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-modern">
            {/* 🔑 EMLAKÇI PANELİ SECTION */}
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <Key className="h-3 w-3 text-primary" />
                <h3 className="text-[9px] font-display font-bold text-muted-foreground uppercase tracking-wider">
                  Emlakçı Paneli
                </h3>
              </div>
              <div className="space-y-0.5">
                {emlakciItems.map((item) => renderNavItem(item))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/40/60 dark:border-[#0a3d35]/60 my-3"></div>

            {/* 🛠️ POI369 STUDIO SECTION - PREMIUM & ELEGANT */}
            <div>
              <button
                onClick={() => {
                  hapticButtonPress();
                  setPoi369Expanded(!poi369Expanded);
                }}
                className="w-full flex items-center justify-between px-2 mb-3 group relative overflow-hidden rounded-lg p-2.5 transition-all duration-300 min-h-[48px] touch-manipulation active:scale-[0.98]"
                aria-expanded={poi369Expanded}
                style={{ touchAction: 'manipulation' }}
              >
                {/* Premium gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-purple-500/6 to-indigo-500/4 dark:from-indigo-500/12 dark:via-purple-500/8 dark:to-indigo-500/6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                
                {/* Subtle border glow */}
                <div className="absolute inset-0 rounded-lg border border-indigo-500/20 dark:border-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center gap-2.5 relative z-10">
                  {/* Premium icon container with gradient */}
                  <div className="relative p-1.5 rounded-md bg-gradient-to-br from-indigo-500/15 via-purple-500/12 to-indigo-600/10 dark:from-indigo-400/20 dark:via-purple-400/15 dark:to-indigo-500/15 border border-indigo-500/25 dark:border-indigo-400/25 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-md"></div>
                    <Code className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 relative z-10" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col items-start">
                    <h3 className="text-[10px] font-display font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-[0.08em] leading-tight">
                      POI369
                    </h3>
                    <span className="text-[8px] font-medium text-indigo-500/70 dark:text-indigo-400/70 tracking-wide">
                      STUDIO
                    </span>
                  </div>
                </div>
                <div className="relative z-10">
                  {poi369Expanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transition-transform duration-200" />
                  )}
                </div>
              </button>
              
              {/* Premium info card - Enhanced */}
              <div className="px-2 mb-3">
                <div className="relative flex items-start gap-2.5 p-3 rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-indigo-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-indigo-950/40 border border-indigo-200/40 dark:border-indigo-800/30 shadow-sm overflow-hidden group">
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] bg-[length:16px_16px]"></div>
                  
                  {/* Accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400"></div>
                  
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    <div className="p-1 rounded-md bg-gradient-to-br from-indigo-500/15 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/15 border border-indigo-500/20 dark:border-indigo-400/20">
                      <AlertTriangle className="h-3 w-3 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <p className="text-[10px] font-semibold bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent font-ui leading-tight mb-1">
                      Geliştirici Araçları
                    </p>
                    <p className="text-[9px] text-indigo-600/80 dark:text-indigo-400/80 font-ui leading-tight">
                      SEO, AI, Analytics ve sistem yönetimi
                    </p>
                  </div>
                </div>
              </div>

              {poi369Expanded && (
                <div className="space-y-1 opacity-95">
                  {poi369Items.map((item) => renderNavItem(item))}
                </div>
              )}
            </div>
          </nav>

          {/* Footer - Compact */}
          <div className="relative p-3 border-t border-border/40/60 dark:border-[#0a3d35]/60 bg-gradient-to-t from-white/40 to-transparent dark:from-[#062F28]/40">
            <div className="text-[10px] text-muted-foreground font-ui text-center">
              <p className="font-semibold text-foreground mb-0.5">
                v2.0.0
              </p>
              <p className="font-medium">© 2025</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}
