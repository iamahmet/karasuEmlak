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
  FolderOpen,
  Bell,
  Shield,
  Code,
  Database,
  Activity,
  Wrench,
  Key,
  Menu,
  GitBranch,
  AlertTriangle,
  ChevronDown,
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["contentManagement"]);
  const [poi369Expanded, setPoi369Expanded] = useState(false);
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
  const emlakciItems: NavItem[] = [
    { href: "/dashboard", label: "İlan Dashboard", icon: LayoutDashboard },
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
      label: "Kullanıcı & Etkileşim",
      icon: Users,
      children: [
        { href: "/users", label: "Kullanıcılar", icon: Users },
        { href: "/comments", label: "Yorumlar", icon: MessageSquare },
      ],
    },
    { href: "/settings", label: "Ayarlar", icon: Settings },
  ];

  const poi369Items: NavItem[] = [
    { href: "/seo/booster", label: "SEO Booster", icon: Zap },
    { href: "/analytics/dashboard", label: "Analytics", icon: BarChart3 },
    { href: "/project-bot", label: "Project Bot", icon: Code },
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

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon;
    const active = item.href ? isActive(item.href) : false;
    const hasChildren = item.children && item.children.length > 0;
    const menuKey = item.label.toLowerCase().replace(/\s+/g, "");
    const isMenuExpanded = expandedMenus.includes(menuKey);
    const showLabel = isExpanded;

    if (hasChildren) {
      return (
        <div key={item.label} className={cn(level > 0 && "ml-4")}>
          <button
            onClick={() => toggleMenu(menuKey)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              showLabel ? "justify-between" : "justify-center"
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Icon className="h-4 w-4 flex-shrink-0" />
              {showLabel && <span className="truncate">{item.label}</span>}
            </div>
            {showLabel && (
              isMenuExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )
            )}
          </button>
          {isMenuExpanded && showLabel && (
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    const navItem = item.href ? (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
          "text-sm font-medium",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          level > 0 && "ml-4"
        )}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-primary")} />
        {showLabel && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
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
            {navItem}
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.label || item.href}>{navItem}</div>;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 h-screen bg-card/95 backdrop-blur-xl border-r border-border z-40",
          "flex flex-col shadow-lg transition-all duration-200 ease-in-out",
          isExpanded ? "w-60" : "w-16"
        )}
        style={{ 
          width: `${sidebarWidth}px`,
          transform: 'translateZ(0)',
        }}
        onMouseEnter={() => !collapsed && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-3 flex-shrink-0">
          {isExpanded ? (
            <Logo variant="icon" size="sm" href="/dashboard" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
          )}
          {isExpanded && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-modern">
          {/* Emlakçı Paneli Section */}
          {isExpanded && (
            <div className="px-2 mb-2">
              <div className="flex items-center gap-2">
                <Key className="h-3 w-3 text-primary" />
                <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Emlakçı Paneli
                </h3>
              </div>
            </div>
          )}
          <div className="space-y-0.5">
            {emlakciItems.map((item) => renderNavItem(item))}
          </div>

          {/* Divider */}
          {isExpanded && (
            <div className="border-t border-border/60 my-3" />
          )}

          {/* POI369 Studio Section */}
          {isExpanded && (
            <div>
              <button
                onClick={() => {
                  hapticButtonPress();
                  setPoi369Expanded(!poi369Expanded);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <div className="flex items-center gap-3">
                  <Code className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>POI369 Studio</span>
                </div>
                {poi369Expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {poi369Expanded && (
                <div className="mt-1 space-y-0.5">
                  {poi369Items.map((item) => renderNavItem(item))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="h-12 border-t border-border flex items-center justify-center px-3 flex-shrink-0">
          {isExpanded ? (
            <div className="text-xs text-muted-foreground">v2.0.0</div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Collapse button when collapsed */}
        {!isExpanded && (
          <button
            onClick={toggleCollapse}
            className="absolute top-1/2 -right-3 w-6 h-12 bg-card border border-border rounded-r-md flex items-center justify-center shadow-md hover:bg-muted transition-colors z-50"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </aside>
    </TooltipProvider>
  );
}
