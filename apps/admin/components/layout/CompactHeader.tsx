"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  Search, Bell, Settings, User, Menu, ChevronRight, Home,
  Command, Sparkles, ExternalLink, LogOut, Moon, Sun,
  LayoutDashboard, Zap, BarChart3
} from "lucide-react";
import { Button } from "@karasu/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@karasu/ui";
import { GlobalSearch } from "../search/GlobalSearch";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { ThemeToggle } from "../theme/ThemeToggle";
import { createClient } from "@karasu/lib/supabase/client";
import { cn } from "@karasu/lib";

interface CompactHeaderProps {
  onMenuToggle?: () => void;
}

export function CompactHeader({ onMenuToggle }: CompactHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Track scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
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

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = (): Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> | null }> => {
    const path = pathname?.replace(/^\/[^/]+/, "") || "";
    if (path === "/dashboard" || path === "") {
      return [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }];
    }

    const parts = path.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> | null }> = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
    ];

    let currentPath = "";
    parts.forEach((part) => {
      currentPath += `/${part}`;
      const label = part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      breadcrumbs.push({ label, href: currentPath, icon: null });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 h-14 border-b border-border/40 bg-card/95 backdrop-blur-xl" />
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-14",
        "border-b border-border/40",
        // Glassmorphism - matching sidebar
        "bg-gradient-to-r from-card/98 via-card/95 to-card/98",
        "backdrop-blur-2xl backdrop-saturate-150",
        // Shadow on scroll
        "transition-all duration-300 ease-out",
        scrolled && "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

      <div className="relative flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Breadcrumbs - Desktop */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 mx-1" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/8 text-primary font-semibold text-sm">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => router.push(crumb.href)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded-lg",
                      "text-muted-foreground hover:text-foreground",
                      "hover:bg-muted/50 transition-all duration-200"
                    )}
                  >
                    {crumb.icon && <crumb.icon className="h-3.5 w-3.5" />}
                    <span className="text-sm">{crumb.label}</span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile: Page title */}
          <div className="md:hidden flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              "group w-full flex items-center gap-3 px-4 py-2 rounded-xl",
              "bg-muted/40 hover:bg-muted/60",
              "border border-border/50 hover:border-primary/30",
              "transition-all duration-300 ease-out",
              "hover:shadow-sm hover:shadow-primary/5"
            )}
          >
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <span className="flex-1 text-left text-sm text-muted-foreground">
              Ara...
            </span>
            <kbd className={cn(
              "hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md",
              "bg-background/80 border border-border/50",
              "text-[10px] font-mono text-muted-foreground"
            )}>
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </button>
        </div>

        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="lg:hidden h-9 w-9 rounded-xl hover:bg-muted/50"
            aria-label="Ara"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hidden md:flex h-9 w-9 rounded-xl",
                  "hover:bg-primary/8 hover:text-primary",
                  "transition-all duration-200"
                )}
                aria-label="Hızlı işlemler"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(
                "w-56 rounded-xl p-2",
                "bg-card/98 backdrop-blur-xl",
                "border border-border/50 shadow-xl"
              )}
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Hızlı Erişim
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1.5 bg-border/50" />
              <DropdownMenuItem
                onClick={() => router.push("/seo/booster")}
                className="rounded-lg px-2 py-2 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium">SEO Booster</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/analytics/dashboard")}
                className="rounded-lg px-2 py-2 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Analytics</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5 bg-border/50" />
              <DropdownMenuItem
                onClick={() => window.open("/", "_blank")}
                className="rounded-lg px-2 py-2 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Siteyi Görüntüle</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationCenter />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-xl ml-1",
                  "hover:bg-muted/50",
                  "transition-all duration-200"
                )}
              >
                <div className="relative">
                  <div className={cn(
                    "h-8 w-8 rounded-xl",
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
                "w-64 rounded-xl p-2",
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
                      "h-10 w-10 rounded-xl",
                      "bg-gradient-to-br from-primary/30 to-primary/10",
                      "flex items-center justify-center shadow-inner"
                    )}>
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.email?.split("@")[0] || "Admin User"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.email || "admin@karasuemlak.net"}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="my-1.5 bg-border/50" />

              {/* Ayarlar sadece superadmin için */}
              {isSuperAdmin && (
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="rounded-lg px-2 py-2 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Settings className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Ayarlar</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}

              <DropdownMenuSeparator className="my-1.5 bg-border/50" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg px-2 py-2 cursor-pointer group hover:bg-destructive/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                    <LogOut className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <span className="text-sm font-medium text-destructive">Çıkış Yap</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
