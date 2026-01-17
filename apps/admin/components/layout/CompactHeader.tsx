"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { Search, Bell, Settings, User, Menu, ChevronRight, Home } from "lucide-react";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@karasu/ui";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Track scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    const locale = window.location.pathname.split("/")[1] || "tr";
    router.push(`/${locale}/login`);
  };

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const path = pathname?.replace(/^\/[^/]+/, "") || "";
    if (path === "/dashboard" || path === "") {
      return [{ label: "Dashboard", href: "/dashboard" }];
    }

    const parts = path.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }];

    let currentPath = "";
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const label = part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-12 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
        "transition-shadow duration-200",
        scrolled && "shadow-sm"
      )}
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Menu + Breadcrumbs */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="h-8 w-8"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <button
                    onClick={() => router.push(crumb.href)}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile: Page title */}
          <div className="md:hidden flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
            </h1>
          </div>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="h-8 w-8"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

          {/* Notifications */}
          <NotificationCenter />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
