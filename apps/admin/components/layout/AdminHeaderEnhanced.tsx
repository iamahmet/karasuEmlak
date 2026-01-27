"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Search, User, LogOut, Menu, X, Command, Bell, Settings, Sparkles,
  LayoutDashboard, Home, FileText, Newspaper, Users, MessageSquare,
  Image, BarChart3, Zap, ChevronRight, ExternalLink
} from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { GlobalSearch } from "../search/GlobalSearch";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { hapticButtonPress } from "@/lib/mobile/haptics";
import {
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
  color?: string;
}

export function AdminHeaderEnhanced({ onMenuToggle, isMobileMenuOpen }: AdminHeaderEnhancedProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUserAndRole = async () => {
      try {
        const supabase = createClient();
        if (!supabase || !supabase.auth) {
          console.error("Supabase client is invalid");
          return;
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }
        
        setUser(user);

        if (user) {
          // Check if user is superadmin
          const { data: roles } = await supabase
            .from("user_roles")
            .select("roles(name)")
            .eq("user_id", user.id);

          const hasSuperAdmin = roles?.some(
            (ur: any) => ur.roles?.name === "super_admin"
          ) || false;
          setIsSuperAdmin(hasSuperAdmin);
        }
      } catch (error) {
        console.error("Error in fetchUserAndRole:", error);
      }
    };
    fetchUserAndRole();
  }, []);

  const handleLogout = async () => {
    hapticButtonPress();
    try {
      const supabase = createClient();
      if (!supabase || !supabase.auth) {
        console.error("Supabase client is invalid");
        const locale = window.location.pathname.split("/")[1] || "tr";
        router.push(`/${locale}/login`);
        return;
      }
      await supabase.auth.signOut();
      const locale = window.location.pathname.split("/")[1] || "tr";
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error("Error during logout:", error);
      // Still redirect even if logout fails
      const locale = window.location.pathname.split("/")[1] || "tr";
      router.push(`/${locale}/login`);
    }
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
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Ana kontrol paneli", color: "primary" },
    { href: "/listings", label: "İlanlar", icon: Home, description: "Emlak ilanları", color: "emerald" },
    { href: "/articles", label: "Blog Yazıları", icon: FileText, description: "Makale yönetimi", color: "blue" },
    { href: "/haberler", label: "Haberler", icon: Newspaper, description: "Haber yönetimi", color: "violet" },
    { href: "/users", label: "Kullanıcılar", icon: Users, description: "Kullanıcı yönetimi", color: "amber" },
    { href: "/media", label: "Medya", icon: Image, description: "Medya kütüphanesi", color: "pink" },
    { href: "/analytics/dashboard", label: "Analytics", icon: BarChart3, description: "Site analitikleri", color: "cyan" },
    { href: "/seo/booster", label: "SEO Booster", icon: Zap, description: "SEO optimizasyonu", color: "orange" },
    // Ayarlar sadece superadmin için
    ...(isSuperAdmin ? [{ href: "/settings", label: "Ayarlar", icon: Settings, description: "Sistem ayarları", color: "slate" }] : []),
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
      "/seo": "SEO Araçları",
      "/analytics": "Analytics",
    };
    return pageMap[path] || path.split("/").pop()?.replace(/-/g, " ") || "Admin Panel";
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      primary: "bg-primary/10 text-primary group-hover:bg-primary/20",
      emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20",
      blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
      violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500/20",
      amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20",
      pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500/20",
      cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20",
      orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20",
      slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400 group-hover:bg-slate-500/20",
    };
    return colors[color] || colors.primary;
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur-xl h-14" />
    );
  }

  return (
    <>
      <header
        role="banner"
        className={cn(
          "sticky top-0 z-50 w-full h-14",
          "border-b border-border/40",
          // Glassmorphism - matching sidebar
          "bg-gradient-to-r from-card/98 via-card/95 to-card/98",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-sm shadow-black/5 dark:shadow-black/20",
          "transition-all duration-300"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

        <div className="relative flex h-full items-center gap-3 px-3 sm:px-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              hapticButtonPress();
              onMenuToggle?.();
            }}
            className={cn(
              "h-10 w-10 rounded-xl",
              "hover:bg-muted/50 active:scale-95",
              "transition-all duration-200",
              "touch-manipulation"
            )}
            aria-label="Menü"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <div className={cn(
              "transition-transform duration-300",
              isMobileMenuOpen && "rotate-90"
            )}>
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </div>
          </Button>

          {/* Logo - Compact with Brand Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo variant="icon" size="sm" href="/dashboard" />
            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground leading-tight truncate">Karasu Emlak</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Admin Panel</span>
            </div>
          </div>

          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                hapticButtonPress();
                setSearchOpen(true);
              }}
              className={cn(
                "h-10 w-10 rounded-xl",
                "hover:bg-primary/8 hover:text-primary",
                "transition-all duration-200"
              )}
              aria-label="Ara"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

            {/* Quick Nav Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hidden sm:flex h-10 w-10 rounded-xl",
                    "hover:bg-primary/8 hover:text-primary",
                    "transition-all duration-200"
                  )}
                  aria-label="Hızlı navigasyon"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn(
                  "w-72 rounded-xl p-2",
                  "bg-card/98 backdrop-blur-xl",
                  "border border-border/50 shadow-xl"
                )}
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Hızlı Navigasyon
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5 bg-border/50" />
                <div className="max-h-[400px] overflow-y-auto scrollbar-modern space-y-0.5">
                  {quickNavItems.map((item, index) => (
                    <DropdownMenuItem
                      key={item.href}
                      onClick={() => {
                        hapticButtonPress();
                        router.push(item.href);
                      }}
                      className={cn(
                        "rounded-xl px-2 py-2.5 cursor-pointer group",
                        "hover:bg-muted/50 transition-all duration-200",
                        "animate-in fade-in slide-in-from-left-2"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                          "transition-all duration-200 group-hover:scale-105",
                          getColorClasses(item.color || "primary")
                        )}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationCenter />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Kullanıcı menüsü"
                  className={cn(
                    "h-10 w-10 rounded-xl ml-0.5",
                    "hover:bg-muted/50",
                    "transition-all duration-200"
                  )}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-8 rounded-xl",
                      "bg-gradient-to-br from-primary/30 to-primary/10",
                      "flex items-center justify-center",
                      "shadow-inner border border-primary/10"
                    )}>
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn(
                  "w-72 rounded-xl p-2",
                  "bg-card/98 backdrop-blur-xl",
                  "border border-border/50 shadow-xl",
                  "animate-in fade-in-0 zoom-in-95 duration-200"
                )}
              >
                {/* User Info */}
                <div className="px-2 py-3 mb-2 rounded-xl bg-gradient-to-r from-muted/50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-xl",
                        "bg-gradient-to-br from-primary/30 to-primary/10",
                        "flex items-center justify-center shadow-inner"
                      )}>
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">
                        {user?.email?.split('@')[0] || "Admin User"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user?.email || "admin@karasuemlak.net"}
                      </p>
                      <Badge className={cn(
                        "mt-1.5 text-[10px] px-2 py-0.5 h-5",
                        "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      )}>
                        Admin
                      </Badge>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-2 bg-border/50" />

                {/* Quick Actions */}
                <DropdownMenuGroup className="space-y-0.5">
                  <DropdownMenuItem
                    onClick={() => {
                      hapticButtonPress();
                      router.push('/dashboard');
                    }}
                    className="rounded-xl px-2 py-2.5 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Dashboard</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      hapticButtonPress();
                      if (isSuperAdmin) {
                        router.push('/settings');
                      }
                    }}
                    className="rounded-xl px-2 py-2.5 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:rotate-90 transition-all duration-300" />
                      </div>
                      <span className="text-sm font-medium">Ayarlar</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-2 bg-border/50" />

                {/* View Site */}
                <DropdownMenuItem
                  onClick={() => {
                    hapticButtonPress();
                    window.open('/', '_blank');
                  }}
                  className="rounded-xl px-2 py-2.5 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-blue-500/10 transition-colors">
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium">Siteyi Görüntüle</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2 bg-border/50" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl px-2 py-2.5 cursor-pointer group hover:bg-destructive/10"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                      <LogOut className="h-4 w-4 text-destructive group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-sm font-semibold text-destructive">Çıkış Yap</span>
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
