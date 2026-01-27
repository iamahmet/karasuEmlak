"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, Link } from "../../i18n/routing";
import {
  LayoutDashboard,
  Home,
  FileText,
  Newspaper,
  Users,
  MessageSquare,
  Image,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Zap,
  FolderOpen,
  Code,
  Key,
  ChevronDown,
  Sparkles,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@karasu/ui";
import { Logo } from "@/components/branding/Logo";
import { hapticButtonPress } from "@/lib/mobile/haptics";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

export function ImprovedCompactSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["içerikler"]);
  const [poi369Expanded, setPoi369Expanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Animation mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    hapticButtonPress();
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
  };

  // Keyboard shortcut: Cmd+B / Ctrl+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [collapsed]);

  const isActive = (href?: string) => {
    if (!href) return false;
    const pathWithoutLocale = pathname?.replace(/^\/[^/]+/, "") || "";
    const hrefWithoutLocale = href.startsWith("/") ? href : `/${href}`;
    return pathWithoutLocale === hrefWithoutLocale || pathWithoutLocale.startsWith(hrefWithoutLocale + "/");
  };

  const toggleMenu = (label: string) => {
    hapticButtonPress();
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  // Navigation items
  const emlakciItems: NavItem[] = useMemo(() => [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/listings", label: "İlanlar", icon: Home },
    {
      label: "İçerikler",
      icon: FolderOpen,
      children: [
        { href: "/articles", label: "Blog Yazıları", icon: FileText },
        { href: "/haberler", label: "Haberler", icon: Newspaper },
      ],
    },
    { href: "/media", label: "Medya", icon: Image },
    {
      label: "Kullanıcılar",
      icon: Users,
      children: [
        { href: "/users", label: "Kullanıcı Listesi", icon: Users },
        { href: "/comments", label: "Yorumlar", icon: MessageSquare },
      ],
    },
    { href: "/settings", label: "Ayarlar", icon: Settings },
  ], []);

  const poi369Items: NavItem[] = useMemo(() => [
    { href: "/seo/booster", label: "SEO Booster", icon: Zap },
    { href: "/analytics/dashboard", label: "Analytics", icon: BarChart3 },
    { href: "/project-bot", label: "Project Bot", icon: Code },
  ], []);

  const isExpanded = !collapsed || hovered;
  const sidebarWidth = isExpanded ? 260 : 72;

  // Update CSS variable for dynamic layout
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [sidebarWidth]);

  const renderNavItem = (item: NavItem, level = 0, index = 0) => {
    const Icon = item.icon;
    const active = item.href ? isActive(item.href) : false;
    const hasChildren = item.children && item.children.length > 0;
    const menuKey = item.label.toLowerCase().replace(/\s+/g, "");
    const isMenuExpanded = expandedMenus.includes(menuKey);
    const showLabel = isExpanded;

    // Check if any child is active
    const hasActiveChild = hasChildren && item.children?.some(child => child.href && isActive(child.href));

    if (hasChildren) {
      return (
        <div
          key={item.label}
          className={cn(
            "animate-in fade-in slide-in-from-left-2",
            level > 0 && "ml-3"
          )}
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
          <button
            onClick={() => toggleMenu(menuKey)}
            className={cn(
              "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
              "text-sm font-medium transition-all duration-300 ease-out",
              "hover:bg-gradient-to-r hover:from-primary/8 hover:to-transparent",
              hasActiveChild
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground",
              showLabel ? "justify-between" : "justify-center"
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                hasActiveChild
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Icon className="h-4 w-4" />
                {hasActiveChild && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              {showLabel && (
                <span className="truncate font-medium">{item.label}</span>
              )}
            </div>
            {showLabel && (
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-300",
                isMenuExpanded && "rotate-180"
              )} />
            )}
          </button>
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isMenuExpanded && showLabel ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
          )}>
            <div className="pl-2 space-y-0.5 border-l-2 border-border/50 ml-6">
              {item.children?.map((child, childIndex) => renderNavItem(child, level + 1, childIndex))}
            </div>
          </div>
        </div>
      );
    }

    const navItem = item.href ? (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
          "text-sm font-medium transition-all duration-300 ease-out",
          "hover:bg-gradient-to-r hover:from-primary/8 hover:to-transparent",
          active
            ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          level > 0 && "py-2"
        )}
      >
        {/* Active indicator line */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full shadow-lg shadow-primary/30" />
        )}

        <div className={cn(
          "relative flex items-center justify-center rounded-lg transition-all duration-300",
          level > 0 ? "w-6 h-6" : "w-8 h-8",
          active
            ? "bg-primary/20 text-primary shadow-sm shadow-primary/20"
            : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          <Icon className={cn("transition-transform duration-300 group-hover:scale-110", level > 0 ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </div>

        {showLabel && (
          <>
            <span className={cn("truncate flex-1", active && "font-semibold")}>{item.label}</span>
            {item.badge && (
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-full",
                "bg-gradient-to-r from-primary to-primary/80 text-white",
                "shadow-sm shadow-primary/30"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    ) : null;

    if (!showLabel && navItem) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <div
              className="animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              {navItem}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="bg-card/95 backdrop-blur-xl border-border/50 shadow-xl px-3 py-1.5 text-sm font-medium"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div
        key={item.label || item.href}
        className="animate-in fade-in slide-in-from-left-2"
        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
      >
        {navItem}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 h-screen z-40",
          "flex flex-col transition-all duration-300 ease-out",
          // Glassmorphism effect
          "bg-gradient-to-b from-card/98 via-card/95 to-card/90",
          "backdrop-blur-2xl backdrop-saturate-150",
          "border-r border-border/40",
          // Subtle shadow
          "shadow-[4px_0_24px_-2px_rgba(0,0,0,0.08)]",
          "dark:shadow-[4px_0_24px_-2px_rgba(0,0,0,0.3)]",
          // Width
          isExpanded ? "w-[260px]" : "w-[72px]"
        )}
        style={{
          width: `${sidebarWidth}px`,
          transform: 'translateZ(0)',
        }}
        onMouseEnter={() => collapsed && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/20 via-transparent to-primary/10 pointer-events-none" />

        {/* Header */}
        <div className={cn(
          "relative h-16 flex items-center justify-between px-4 flex-shrink-0",
          "border-b border-border/30",
          "bg-gradient-to-r from-transparent via-primary/3 to-transparent"
        )}>
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <Logo variant="icon" size="sm" href="/dashboard" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground tracking-tight">Karasu Emlak</span>
                <span className="text-[10px] text-muted-foreground font-medium">Yönetim Paneli</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-inner">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
          )}
          {isExpanded && (
            <button
              onClick={toggleCollapse}
              className={cn(
                "p-2 rounded-lg transition-all duration-300",
                "hover:bg-muted/80 active:scale-95",
                "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Sidebar'ı daralt"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-modern">
          {/* Emlakçı Paneli Section */}
          {isExpanded && (
            <div className="px-1 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Key className="h-3 w-3 text-primary" />
                </div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Emlakçı Paneli
                </h3>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {emlakciItems.map((item, index) => renderNavItem(item, 0, index))}
          </div>

          {/* Section Divider */}
          <div className={cn(
            "my-4 mx-2 transition-all duration-300",
            isExpanded
              ? "h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
              : "h-px bg-border/40"
          )} />

          {/* POI369 Studio Section */}
          {isExpanded ? (
            <div className="animate-in fade-in duration-300">
              <button
                onClick={() => {
                  hapticButtonPress();
                  setPoi369Expanded(!poi369Expanded);
                }}
                className={cn(
                  "group w-full flex items-center justify-between px-3 py-2.5 rounded-xl",
                  "text-sm font-medium transition-all duration-300 ease-out",
                  "hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-transparent",
                  poi369Expanded
                    ? "bg-gradient-to-r from-indigo-500/10 to-transparent text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                    poi369Expanded
                      ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20"
                      : "bg-muted/50 group-hover:bg-indigo-500/10"
                  )}>
                    <Sparkles className={cn(
                      "h-4 w-4 transition-all duration-300",
                      poi369Expanded
                        ? "text-indigo-500"
                        : "text-muted-foreground group-hover:text-indigo-500"
                    )} />
                  </div>
                  <span className="font-medium">POI369 Studio</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300",
                  poi369Expanded && "rotate-180"
                )} />
              </button>

              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                poi369Expanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
              )}>
                <div className="pl-2 space-y-0.5 border-l-2 border-indigo-500/30 ml-6">
                  {poi369Items.map((item, index) => {
                    const Icon = item.icon;
                    const active = item.href ? isActive(item.href) : false;

                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2 rounded-xl",
                          "text-sm font-medium transition-all duration-300 ease-out",
                          "hover:bg-gradient-to-r hover:from-indigo-500/8 hover:to-transparent",
                          active
                            ? "bg-gradient-to-r from-indigo-500/15 to-transparent text-indigo-600 dark:text-indigo-400"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                        )}
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300",
                          active
                            ? "bg-indigo-500/20 text-indigo-500"
                            : "bg-muted/50 text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500"
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // Collapsed state - show icons only
            <div className="space-y-1">
              {poi369Items.map((item, index) => {
                const Icon = item.icon;
                const active = item.href ? isActive(item.href) : false;

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href!}
                        className={cn(
                          "group relative flex items-center justify-center p-2.5 rounded-xl",
                          "transition-all duration-300 ease-out",
                          "hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-transparent",
                          active
                            ? "bg-gradient-to-r from-indigo-500/15 to-transparent"
                            : ""
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                        )}
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                          active
                            ? "bg-indigo-500/20 text-indigo-500"
                            : "bg-muted/50 text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500"
                        )}>
                          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={12}
                      className="bg-card/95 backdrop-blur-xl border-border/50 shadow-xl px-3 py-1.5 text-sm font-medium"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer - User Info */}
        <div className={cn(
          "relative flex-shrink-0 p-3",
          "border-t border-border/30",
          "bg-gradient-to-r from-transparent via-muted/20 to-transparent"
        )}>
          {isExpanded ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer group">
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-inner">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Admin User</p>
                <p className="text-[11px] text-muted-foreground truncate">admin@karasuemlak.net</p>
              </div>

              {/* Logout Button */}
              <button
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-300"
                aria-label="Çıkış yap"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-muted/50 transition-all duration-300">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={12}
                className="bg-card/95 backdrop-blur-xl border-border/50 shadow-xl"
              >
                <div className="px-2 py-1">
                  <p className="text-sm font-semibold">Admin User</p>
                  <p className="text-[11px] text-muted-foreground">admin@karasuemlak.net</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Version Badge */}
          {isExpanded && (
            <div className="mt-2 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground/60 font-medium">v2.1.0</span>
            </div>
          )}
        </div>

        {/* Collapse/Expand button when collapsed */}
        {!isExpanded && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "absolute top-1/2 -right-3 -translate-y-1/2",
              "w-6 h-14 flex items-center justify-center",
              "bg-card/95 backdrop-blur-xl",
              "border border-border/40 border-l-0",
              "rounded-r-xl shadow-lg",
              "hover:bg-muted/80 active:scale-95",
              "transition-all duration-300 z-50",
              "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Sidebar'ı genişlet"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </aside>
    </TooltipProvider>
  );
}
