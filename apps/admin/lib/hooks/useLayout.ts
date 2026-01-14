/**
 * Layout Hooks
 * Custom hooks for layout management
 */

import { useUIStore } from "@/store/useUIStore";
import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook for managing sidebar state
 */
export function useSidebar() {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, [setSidebarOpen]);

  // Auto-close sidebar on mobile when route changes
  const pathname = usePathname();
  useEffect(() => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  }, [pathname, closeSidebar]);

  return {
    isOpen: sidebarOpen,
    open: openSidebar,
    close: closeSidebar,
    toggle: toggleSidebar,
  };
}

/**
 * Hook for managing command palette
 */
export function useCommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  const open = useCallback(() => {
    setCommandPaletteOpen(true);
  }, [setCommandPaletteOpen]);

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
  }, [setCommandPaletteOpen]);

  const toggle = useCallback(() => {
    setCommandPaletteOpen(!commandPaletteOpen);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  return {
    isOpen: commandPaletteOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook for checking if current page is auth page
 */
export function useIsAuthPage() {
  const pathname = usePathname();
  return pathname?.includes("/login") || pathname?.includes("/signup");
}
