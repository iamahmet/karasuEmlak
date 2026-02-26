"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
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
} from "lucide-react";
import { cn } from "@karasu/lib";
import { Button } from "@karasu/ui";
import { Logo } from "@/components/branding/Logo";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

export function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["contentManagement"]);
  const [poi369Expanded, setPoi369Expanded] = useState(false); // Collapsible Poi369 Studio

  // 🔑 EMLAKÇI PANELİ (PRIMARY, DEFAULT)
  const emlakciItems: NavItem[] = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/listings",
      label: "İlanlar",
      icon: Home,
    },
    {
      label: "İçerikler",
      icon: FolderOpen,
      children: [
        {
          href: "/admin/articles",
          label: "Blog Yazıları",
          icon: FileText,
        },
        {
          href: "/admin/haberler",
          label: "Haberler",
          icon: Newspaper,
        },
        {
          href: "/admin/homepage",
          label: "Ana Sayfa",
          icon: Home,
        },
        {
          href: "/admin/navigation",
          label: "Menü Yönetimi",
          icon: Menu,
        },
        {
          href: "/admin/content-quality",
          label: "İçerik Kalitesi",
          icon: FileText,
        },
        {
          href: "/admin/content-review",
          label: "İçerik İnceleme",
          icon: FileText,
        },
      ],
    },
    {
      label: "Media",
      icon: Image,
      children: [
        {
          href: "/admin/media",
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
          href: "/admin/users",
          label: "Kullanıcılar",
          icon: Users,
        },
        {
          href: "/admin/comments",
          label: "Yorumlar",
          icon: MessageSquare,
        },
      ],
    },
    {
      href: "/admin/settings",
      label: "Ayarlar",
      icon: Settings,
    },
    {
      label: "Güvenlik",
      icon: Shield,
      children: [
        {
          href: "/admin/settings/mfa",
          label: "2FA Ayarları",
          icon: Key,
        },
        {
          href: "/admin/security/audit-logs",
          label: "Audit Logları",
          icon: Activity,
        },
      ],
    },
  ];

  // 🛠️ POI369 STUDIO (SECONDARY, ADVANCED TOOLS)
  const poi369Items: NavItem[] = [
    {
      label: "SEO Araçları",
      icon: Search,
      children: [
        {
          href: "/admin/seo/booster",
          label: "SEO Booster",
          icon: Zap,
        },
        {
          href: "/admin/seo/content-studio",
          label: "Content Studio",
          icon: FileText,
        },
        {
          href: "/admin/seo/control",
          label: "SEO Control",
          icon: Code,
        },
        {
          href: "/admin/seo/indexing",
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
          href: "/admin/ai-qa",
          label: "AI Q&A Yönetimi",
          icon: MessageSquareQuote,
        },
        {
          href: "/admin/ai-images",
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
          href: "/admin/programmatic-pages",
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
          href: "/admin/project-bot",
          label: "Project Bot",
          icon: Bot,
        },
        {
          href: "/admin/integrations/google",
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
          href: "/admin/analytics/dashboard",
          label: "Analytics",
          icon: BarChart3,
        },
        {
          href: "/admin/notifications",
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
          href: "/admin/compliance/consent",
          label: "Compliance",
          icon: Shield,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    const pathWithoutLocale = pathname?.replace(/^\/[^/]+/, "") || "";
    const hrefWithoutLocale = href.startsWith("/") ? href : `/${href}`;

    if (href.includes("/admin/dashboard")) {
      return pathWithoutLocale === "/admin/dashboard" || pathWithoutLocale === "/admin";
    }

    return pathWithoutLocale === hrefWithoutLocale || pathWithoutLocale.startsWith(hrefWithoutLocale + "/");
  };

  const toggleMenu = (label: string) => {
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
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-ui text-sm font-medium focus-professional group relative",
                active
                  ? "bg-gradient-to-r from-design-light/20 via-design-light/15 to-design-light/10 text-design-dark dark:text-design-light shadow-lg shadow-design-light/10 dark:shadow-design-light/5"
                  : "text-design-gray dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#0a3d35]/60 hover:text-design-dark dark:hover:text-white hover:shadow-md",
                level > 0 && "pl-8",
                "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-design-light/10 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-300"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {isExpanded && (
              <div id={`submenu-${item.label}`} role="group" aria-label={`${item.label} alt menüsü`} className="mt-1 space-y-1 ml-4 border-l-2 border-design-light/20 pl-2">
                {item.children!.map((child) => renderNavItem(child, level + 1))}
              </div>
            )}
          </>
        ) : item.href ? (
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-ui text-sm font-medium relative group focus-professional",
              active
                ? "bg-gradient-to-r from-design-light/20 via-design-light/15 to-design-light/10 text-design-dark dark:text-design-light shadow-lg shadow-design-light/10 dark:shadow-design-light/5"
                : "text-design-gray dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#0a3d35]/60 hover:text-design-dark dark:hover:text-white hover:shadow-md",
              level > 0 && "pl-8",
              "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-design-light/10 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-300"
            )}
          >
            {level > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-design-light opacity-50"></div>
            )}
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span>{item.label}</span>
            {active && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-design-light to-design-dark rounded-full"></div>
            )}
          </Link>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={isMobileOpen}
          aria-controls="admin-sidebar"
          className="bg-white dark:bg-[#062F28] border-[#E7E7E7] dark:border-[#0a3d35]"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar - Modern Glassmorphism */}
      <aside
        id="admin-sidebar"
        role="navigation"
        aria-label="Ana navigasyon menüsü"
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white/80 dark:bg-[#062F28]/80 backdrop-blur-xl border-r border-white/20 dark:border-[#0a3d35]/50 shadow-2xl shadow-black/5 dark:shadow-black/30 transition-all duration-300 ease-in-out lg:translate-x-0",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:via-white/30 before:to-transparent before:dark:from-[#062F28]/50 before:dark:via-[#062F28]/30 before:pointer-events-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Professional Component */}
          <div className="relative px-6 py-6 border-b border-white/20 dark:border-[#0a3d35]/50 bg-gradient-to-r from-white/50 to-transparent dark:from-[#062F28]/50">
            <Logo variant="full" size="md" href="/admin/dashboard" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-modern">
            {/* 🔑 EMLAKÇI PANELİ SECTION */}
            <div>
              <div className="flex items-center gap-2 px-2 mb-3">
                <Key className="h-3.5 w-3.5 text-design-light" />
                <h3 className="text-[10px] font-display font-bold text-design-gray dark:text-gray-400 uppercase tracking-wider">
                  Emlakçı Paneli
                </h3>
              </div>
              <div className="space-y-1">
                {emlakciItems.map((item) => renderNavItem(item))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E7E7E7] dark:border-[#0a3d35] my-4"></div>

            {/* 🛠️ POI369 STUDIO SECTION */}
            <div>
              <button
                onClick={() => setPoi369Expanded(!poi369Expanded)}
                className="w-full flex items-center justify-between px-2 mb-3 group"
                aria-expanded={poi369Expanded}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                  <h3 className="text-[10px] font-display font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Poi369 Studio
                  </h3>
                </div>
                {poi369Expanded ? (
                  <ChevronDown className="h-3 w-3 text-orange-500" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-orange-500" />
                )}
              </button>

              {/* Warning microcopy */}
              <div className="px-2 mb-3">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/20">
                  <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-orange-700 dark:text-orange-300 font-ui leading-tight">
                    Gelişmiş araçlar – dikkatli kullanın
                  </p>
                </div>
              </div>

              {poi369Expanded && (
                <div className="space-y-1 opacity-90">
                  {poi369Items.map((item) => renderNavItem(item))}
                </div>
              )}
            </div>
          </nav>

          {/* Footer - Modern */}
          <div className="relative p-4 border-t border-white/20 dark:border-[#0a3d35]/50 bg-gradient-to-t from-white/50 to-transparent dark:from-[#062F28]/50">
            <div className="text-xs text-design-gray dark:text-gray-400 font-ui text-center">
              <p className="font-bold text-design-dark dark:text-white mb-1 bg-gradient-to-r from-design-dark to-design-dark/80 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                v2.0.0
              </p>
              <p className="font-medium">© 2025 Karasu Emlak</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
