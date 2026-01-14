"use client";

import React, { memo } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeaderEnhanced } from "./AdminHeaderEnhanced";
import { CommandPalette } from "../command-palette/CommandPalette";
import { KeyboardShortcuts } from "../keyboard-shortcuts/KeyboardShortcuts";
import { useIsAuthPage, useSidebar, useCommandPalette } from "@/lib/hooks/useLayout";
import { useUIStore } from "@/store/useUIStore";
import { LAYOUT_CONFIG } from "@/lib/constants/layout";
import { useHotkeys } from "react-hotkeys-hook";

/**
 * Optimized Admin Layout Component
 * - Uses Zustand for state management
 * - Memoized for performance
 * - Keyboard shortcuts via react-hotkeys-hook
 * - Clean separation of concerns
 */
function AdminLayoutComponent({ children }: { children: React.ReactNode }) {
  const isAuthPage = useIsAuthPage();
  const { isOpen: sidebarOpen, toggle: toggleSidebar, close: closeSidebar } = useSidebar();
  const { isOpen: commandPaletteOpen, toggle: toggleCommandPalette, close: closeCommandPalette } = useCommandPalette();
  const { shortcutsOpen, setShortcutsOpen } = useUIStore((state) => ({
    shortcutsOpen: state.shortcutsOpen,
    setShortcutsOpen: state.setShortcutsOpen,
  }));

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
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#E7E7E7]/50 via-white to-[#E7E7E7]/50 dark:from-[#062F28] dark:via-[#062F28] dark:to-[#0a3d35] relative admin-layout-container">
        {/* Background Pattern - Subtle & Modern */}
        <div className="absolute inset-0 pointer-events-none admin-layout-background opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-design-light/3 via-transparent to-transparent dark:from-design-light/2 pointer-events-none" />
        
        <AdminSidebar 
          isMobileOpen={sidebarOpen}
          onMobileClose={closeSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-[240px] relative z-10" style={{ marginLeft: 'var(--sidebar-width, 240px)' }}>
          <AdminHeaderEnhanced 
            onMenuToggle={toggleSidebar}
            isMobileMenuOpen={sidebarOpen}
          />
          <main 
            role="main" 
            className="flex-1 overflow-y-auto bg-transparent relative scrollbar-modern admin-main-content"
          >
            {children}
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

