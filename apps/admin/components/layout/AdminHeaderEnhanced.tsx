"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  Search, User, LogOut, Menu, X, Command, Bell, Settings, Sparkles,
  LayoutDashboard, Home, FileText, Newspaper, Users, MessageSquare,
  Image, BarChart3, Shield, Zap, Code, Link2, Calendar, Bot, Activity,
  ChevronRight, HelpCircle, BookOpen, ExternalLink, Monitor, Smartphone
} from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { GlobalSearch } from "../search/GlobalSearch";
import { NotificationCenter } from "../notifications/NotificationCenter";
import {
  Input,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  Badge,
} from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { useRouter, usePathname } from "@/i18n/routing";
import { Logo } from "@/components/branding/Logo";
import { cn } from "@karasu/lib";

interface AdminHeaderEnhancedProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface QuickNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

export function AdminHeaderEnhanced({ onMenuToggle, isMobileMenuOpen }: AdminHeaderEnhancedProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    const locale = window.location.pathname.split("/")[1] || "tr";
    router.push(`/${locale}/login`);
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick navigation items
  const quickNavItems: QuickNavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Ana kontrol paneli" },
    { href: "/articles", label: "Blog Yazıları", icon: FileText, description: "Makale yönetimi" },
    { href: "/haberler", label: "Haberler", icon: Newspaper, description: "Haber yönetimi" },
    { href: "/listings", label: "İlanlar", icon: Home, description: "Emlak ilanları" },
    { href: "/users", label: "Kullanıcılar", icon: Users, description: "Kullanıcı yönetimi" },
    { href: "/comments", label: "Yorumlar", icon: MessageSquare, description: "Yorum moderasyonu" },
    { href: "/media", label: "Medya", icon: Image, description: "Medya kütüphanesi" },
    { href: "/analytics/dashboard", label: "Analytics", icon: BarChart3, description: "Site analitikleri" },
    { href: "/seo/booster", label: "SEO Booster", icon: Zap, description: "SEO optimizasyonu" },
    { href: "/settings", label: "Ayarlar", icon: Settings, description: "Sistem ayarları" },
  ];

  // Get current page title from pathname
  const getPageTitle = () => {
    const path = pathname?.replace(/^\/[^/]+/, "") || "";
    const pageMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/articles": "Blog Yazıları",
      "/haberler": "Haberler",
      "/listings": "İlanlar",
      "/users": "Kullanıcılar",
      "/comments": "Yorumlar",
      "/media": "Medya",
      "/settings": "Ayarlar",
      "/content-quality": "İçerik Kalitesi",
      "/content-review": "İçerik İnceleme",
      "/seo": "SEO Araçları",
      "/analytics": "Analytics",
    };
    return pageMap[path] || path.split("/").pop()?.replace(/-/g, " ") || "Admin Panel";
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl h-14" />
    );
  }

  return (
    <>
      <header 
        role="banner" 
        className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/98 backdrop-blur-xl supports-[backdrop-filter]:bg-card/95 shadow-sm shadow-black/5 dark:shadow-black/20 transition-all duration-200"
        style={{ height: 'var(--header-height, 52px)' }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-design-light/3 via-transparent to-design-light/3 opacity-50 pointer-events-none" />
        
        <div className="container flex h-[52px] items-center gap-2.5 px-3 md:px-4 relative">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden h-8 w-8 rounded-md hover:bg-muted/50 transition-all"
            aria-label="Menü"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4 text-design-dark dark:text-white" />
            ) : (
              <Menu className="h-4 w-4 text-design-dark dark:text-white" />
            )}
          </Button>

          {/* Logo - Desktop only, compact */}
          <div className="hidden md:flex items-center min-w-0">
            <Logo variant="full" size="sm" href="/dashboard" />
          </div>

          {/* Page Title - Mobile only */}
          <div className="md:hidden flex-1 min-w-0">
            <h1 className="text-sm font-display font-semibold text-design-dark dark:text-white truncate">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* Breadcrumb - Desktop only, compact */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span>{getPageTitle()}</span>
          </div>

          {/* Search - Compact */}
          <div className="hidden sm:flex flex-1 max-w-md">
            <div className="relative group w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-design-light/15 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-md -z-10" />
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-design-gray dark:text-gray-400 group-focus-within:text-design-light transition-all duration-300 z-10" />
              <Input
                type="search"
                placeholder={t("header.search") || "Ara..."}
                onClick={() => setSearchOpen(true)}
                onFocus={() => setSearchOpen(true)}
                aria-label="Site genelinde ara"
                className="pl-8 pr-14 h-8 text-xs border border-border/60 focus:border-design-light focus:ring-1 focus:ring-design-light/20 bg-card/80 backdrop-blur-sm text-foreground transition-all duration-200 rounded-md font-ui placeholder:text-muted-foreground cursor-pointer hover:border-design-light/40 hover:bg-card/90 relative z-10"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono bg-muted border border-border/50 rounded text-muted-foreground shadow-sm z-10 hidden sm:flex items-center gap-0.5">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </kbd>
            </div>
          </div>

          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

          {/* Right side actions - Compact */}
          <div className="flex items-center gap-1.5">
            {/* Quick Nav Dropdown - Desktop only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex h-8 w-8 rounded-md hover:bg-muted/50 transition-all"
                  aria-label="Hızlı navigasyon"
                >
                  <LayoutDashboard className="h-4 w-4 text-design-dark dark:text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 rounded-lg border border-border/60 shadow-lg bg-card/98 backdrop-blur-xl p-1.5"
              >
                <DropdownMenuLabel className="px-2.5 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Hızlı Navigasyon
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5" />
                <div className="max-h-[360px] overflow-y-auto scrollbar-modern">
                  {quickNavItems.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className="rounded-md hover:bg-muted/50 transition-all cursor-pointer px-2.5 py-2 group"
                    >
                      <div className="flex items-center gap-2.5 w-full">
                        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-gradient-to-br from-design-light/15 to-design-light/5 dark:from-design-light/25 dark:to-design-light/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <item.icon className="h-3.5 w-3.5 text-design-light" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-ui font-semibold text-design-dark dark:text-white truncate">
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle - Compact */}
            <ThemeToggle />

            {/* Notifications - Compact */}
            <NotificationCenter />

            {/* User menu - Modern & Compact */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Kullanıcı menüsü"
                  className="h-8 w-8 rounded-md hover:bg-muted/50 transition-all duration-200 relative group"
                >
                  <div className="relative w-7 h-7 rounded-md bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-design-light dark:via-design-light/90 dark:to-design-light/80 flex items-center justify-center border border-border/40 shadow-sm group-hover:shadow-md transition-all duration-200">
                    <User className="h-3.5 w-3.5 text-white dark:text-design-dark" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 rounded-lg border border-border/60 shadow-lg bg-card/98 backdrop-blur-xl p-1.5 animate-in fade-in-0 zoom-in-95 duration-200"
              >
                {/* User Info - Compact */}
                <DropdownMenuLabel className="px-2.5 py-2.5 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                      <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-design-light dark:via-design-light/90 dark:to-design-light/80 flex items-center justify-center shadow-sm border border-border/40">
                      <User className="h-4 w-4 text-white dark:text-design-dark" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-none text-design-dark dark:text-white truncate">
                        {user?.email?.split('@')[0] || "User"}
                      </p>
                      <p className="text-[10px] leading-none text-muted-foreground mt-1 font-ui truncate">
                        {user?.email || "user@example.com"}
                      </p>
                      <Badge variant="outline" className="mt-1.5 text-[9px] px-1.5 py-0.5 border-design-light/30 text-design-light h-4">
                        Admin
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="my-2" />

                {/* Quick Actions - Compact */}
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    onClick={() => router.push('/dashboard')}
                    className="rounded-md hover:bg-[#E7E7E7]/50 dark:hover:bg-[#0a3d35]/50 transition-all cursor-pointer px-2.5 py-2 group"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <LayoutDashboard className="h-3.5 w-3.5 text-design-light group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-ui">Dashboard</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => router.push('/settings')}
                    className="rounded-md hover:bg-[#E7E7E7]/50 dark:hover:bg-[#0a3d35]/50 transition-all cursor-pointer px-2.5 py-2 group"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Settings className="h-3.5 w-3.5 text-design-light group-hover:rotate-90 transition-transform" />
                      <span className="text-xs font-ui">Ayarlar</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5" />

                {/* Help & Resources - Compact */}
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    onClick={() => window.open('https://docs.karasuemlak.net', '_blank')}
                    className="rounded-md hover:bg-[#E7E7E7]/50 dark:hover:bg-[#0a3d35]/50 transition-all cursor-pointer px-2.5 py-2 group"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <BookOpen className="h-3.5 w-3.5 text-design-light" />
                      <span className="text-xs font-ui">Dokümantasyon</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => router.push('/help')}
                    className="rounded-md hover:bg-[#E7E7E7]/50 dark:hover:bg-[#0a3d35]/50 transition-all cursor-pointer px-2.5 py-2 group"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <HelpCircle className="h-3.5 w-3.5 text-design-light" />
                      <span className="text-xs font-ui">Yardım & Destek</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5" />

                {/* View Site */}
                <DropdownMenuItem 
                  onClick={() => window.open('/', '_blank')}
                  className="rounded-md hover:bg-[#E7E7E7]/50 dark:hover:bg-[#0a3d35]/50 transition-all cursor-pointer px-2.5 py-2 group"
                >
                  <div className="flex items-center gap-2 w-full">
                    <ExternalLink className="h-3.5 w-3.5 text-design-light" />
                    <span className="text-xs font-ui">Siteyi Görüntüle</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1.5" />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer px-2.5 py-2 group"
                >
                  <div className="flex items-center gap-2 w-full">
                    <LogOut className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-ui font-semibold">Çıkış Yap</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
