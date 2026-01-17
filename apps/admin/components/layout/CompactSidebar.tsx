"use client";

import { useState, useEffect, useRef } from "react";
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
  Bot,
  Shield,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@karasu/ui";
import { Logo } from "@/components/branding/Logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

export function CompactSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const sidebarRef = useRef<HTMLAsideElement>(null);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
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

  const isActive = (href: string) => {
    const pathWithoutLocale = pathname?.replace(/^\/[^/]+/, "") || "";
    const hrefWithoutLocale = href.startsWith("/") ? href : `/${href}`;
    return pathWithoutLocale === hrefWithoutLocale || pathWithoutLocale.startsWith(hrefWithoutLocale + "/");
  };

  const mainNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/listings", label: "İlanlar", icon: Home },
    { href: "/articles", label: "Blog", icon: FileText },
    { href: "/haberler", label: "Haberler", icon: Newspaper },
    { href: "/users", label: "Kullanıcılar", icon: Users },
    { href: "/comments", label: "Yorumlar", icon: MessageSquare },
    { href: "/media", label: "Medya", icon: Image },
    { href: "/analytics/dashboard", label: "Analytics", icon: BarChart3 },
    { href: "/seo/booster", label: "SEO", icon: Zap },
    { href: "/settings", label: "Ayarlar", icon: Settings },
  ];

  const isExpanded = !collapsed || hovered;
  const sidebarWidth = isExpanded ? 240 : 64;

  // Update CSS variable for dynamic layout
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [sidebarWidth]);

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border z-40 transition-all duration-200",
          "flex flex-col shadow-sm",
          isExpanded ? "w-60" : "w-16"
        )}
        style={{ 
          width: `${sidebarWidth}px`,
          transform: 'translateZ(0)', // GPU acceleration
        }}
        onMouseEnter={() => !collapsed && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-3">
          {isExpanded ? (
            <Logo variant="icon" size="sm" href="/dashboard" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-modern">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const showLabel = isExpanded;

            const navItem = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  "text-sm font-medium",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-primary")} />
                {showLabel && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {item.badge && showLabel && (
                  <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );

            if (!showLabel) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {navItem}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{navItem}</div>;
          })}
        </nav>

        {/* Footer */}
        <div className="h-12 border-t border-border flex items-center justify-center px-3">
          {isExpanded ? (
            <div className="text-xs text-muted-foreground">
              v2.0.0
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
