"use client";

import React, { memo } from "react";
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
import { useRouter } from "@/i18n/routing";

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
  const { isOpen: sidebarOpen, toggle: toggleSidebar, close: closeSidebar } = useSidebar();
  const { isOpen: commandPaletteOpen, toggle: toggleCommandPalette, close: closeCommandPalette } = useCommandPalette();
  const { shortcutsOpen, setShortcutsOpen } = useUIStore((state) => ({
    shortcutsOpen: state.shortcutsOpen,
    setShortcutsOpen: state.setShortcutsOpen,
  }));

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

