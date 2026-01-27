"use client";

import React, { memo, useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { ImprovedCompactSidebar } from "./ImprovedCompactSidebar";
import { CompactHeader } from "./CompactHeader";
import { AdminHeaderEnhanced } from "./AdminHeaderEnhanced";
import { CommandPalette } from "../command-palette/CommandPalette";
import { KeyboardShortcuts } from "../keyboard-shortcuts/KeyboardShortcuts";
import { PullToRefresh } from "../mobile/PullToRefresh";
import { useIsAuthPage, useSidebar, useCommandPalette } from "@/lib/hooks/useLayout";
import { useUIStore } from "@/store/useUIStore";
import { LAYOUT_CONFIG } from "@/lib/constants/layout";
import { useHotkeys } from "react-hotkeys-hook";
import { useRouter, usePathname } from "@/i18n/routing";
import { createClient } from "@karasu/lib/supabase/client";
import Image from "next/image";

/**
 * Optimized Admin Layout Component
 * - Uses Zustand for state management
 * - Memoized for performance
 * - Keyboard shortcuts via react-hotkeys-hook
 * - Clean separation of concerns
 */
function AdminLayoutComponent({ children }: { children: React.ReactNode }) {
  const isAuthPage = useIsAuthPage();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen: sidebarOpen, toggle: toggleSidebar, close: closeSidebar } = useSidebar();
  const { isOpen: commandPaletteOpen, toggle: toggleCommandPalette, close: closeCommandPalette } = useCommandPalette();
  const { shortcutsOpen, setShortcutsOpen } = useUIStore((state) => ({
    shortcutsOpen: state.shortcutsOpen,
    setShortcutsOpen: state.setShortcutsOpen,
  }));
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Client-side auth guard
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        if (!supabase || !supabase.auth) {
          console.error("Supabase client is invalid");
          const locale = pathname?.split("/")[1] || "tr";
          router.push(`/${locale}/login?error=auth_error`);
          setCheckingAuth(false);
          return;
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          // Not authenticated, redirect to login
          const locale = pathname?.split("/")[1] || "tr";
          const currentPath = pathname || "/dashboard";
          router.push(`/${locale}/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        const locale = pathname?.split("/")[1] || "tr";
        router.push(`/${locale}/login?error=auth_error`);
      } finally {
        setCheckingAuth(false);
      }
    }

    // Only check auth if not on auth pages
    if (!isAuthPage) {
      checkAuth();
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthPage, router, pathname]);

  const handleRefresh = async () => {
    router.refresh();
  };

  // Keyboard shortcuts using react-hotkeys-hook
  useHotkeys("meta+k,ctrl+k", (e) => {
    e.preventDefault();
    toggleCommandPalette();
  });

  useHotkeys("meta+/,ctrl+/", (e) => {
    e.preventDefault();
    setShortcutsOpen(true);
  });

  // Early return for auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-lg animate-pulse">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/favicon.png"
                  alt="Karasu Emlak"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-display font-bold text-foreground leading-tight">Karasu Emlak</span>
                <span className="text-xs text-muted-foreground leading-tight">Admin Panel</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground font-medium">Kontrol ediliyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background relative admin-layout-container">
        {/* Background Pattern - Subtle & Modern */}
        <div className="absolute inset-0 pointer-events-none admin-layout-background opacity-20" />
        
        {/* Use ImprovedCompactSidebar for desktop, AdminSidebar for mobile */}
        <div className="hidden lg:block">
          <ImprovedCompactSidebar />
        </div>
        <div className="lg:hidden">
          <AdminSidebar 
            isMobileOpen={sidebarOpen}
            onMobileClose={closeSidebar}
          />
        </div>
        <div 
          className="flex-1 flex flex-col overflow-hidden relative z-10 transition-all duration-200"
          style={{ 
            marginLeft: 'var(--sidebar-width, 64px)',
          }}
        >
          <div className="hidden lg:block">
            <CompactHeader onMenuToggle={toggleSidebar} />
          </div>
          <div className="lg:hidden">
            <AdminHeaderEnhanced 
              onMenuToggle={toggleSidebar}
              isMobileMenuOpen={sidebarOpen}
            />
          </div>
          <main 
            role="main" 
            className="flex-1 overflow-y-auto bg-transparent relative scrollbar-modern admin-main-content"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 0)',
            }}
          >
            <PullToRefresh onRefresh={handleRefresh}>
              {children}
            </PullToRefresh>
          </main>
        </div>
      </div>
      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={(open) => open ? toggleCommandPalette() : closeCommandPalette()} 
      />
      <KeyboardShortcuts 
        open={shortcutsOpen} 
        onOpenChange={setShortcutsOpen} 
      />
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const AdminLayout = memo(AdminLayoutComponent);
AdminLayout.displayName = "AdminLayout";

