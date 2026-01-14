/**
 * UI State Store (Zustand)
 * Global UI state management
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Keyboard Shortcuts
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Dashboard
  dashboardLayout: Record<string, { x: number; y: number; w: number; h: number }>;
  setDashboardLayout: (layout: Record<string, { x: number; y: number; w: number; h: number }>) => void;

  // Editor
  editorFullscreen: boolean;
  setEditorFullscreen: (fullscreen: boolean) => void;
  editorPreviewMode: "split" | "editor" | "preview";
  setEditorPreviewMode: (mode: "split" | "editor" | "preview") => void;

  // Media Library
  mediaViewMode: "grid" | "list";
  setMediaViewMode: (mode: "grid" | "list") => void;
  mediaSelectedIds: string[];
  setMediaSelectedIds: (ids: string[]) => void;
  clearMediaSelection: () => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    message: string;
    timestamp: number;
  }>;
  addNotification: (notification: Omit<UIState["notifications"][0], "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Command Palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Keyboard Shortcuts
      shortcutsOpen: false,
      setShortcutsOpen: (open) => set({ shortcutsOpen: open }),

      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Dashboard
      dashboardLayout: {},
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),

      // Editor
      editorFullscreen: false,
      setEditorFullscreen: (fullscreen) => set({ editorFullscreen: fullscreen }),
      editorPreviewMode: "split",
      setEditorPreviewMode: (mode) => set({ editorPreviewMode: mode }),

      // Media Library
      mediaViewMode: "grid",
      setMediaViewMode: (mode) => set({ mediaViewMode: mode }),
      mediaSelectedIds: [],
      setMediaSelectedIds: (ids) => set({ mediaSelectedIds: ids }),
      clearMediaSelection: () => set({ mediaSelectedIds: [] }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: `notif-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
            },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "admin-ui-storage",
      storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        dashboardLayout: state.dashboardLayout,
        editorPreviewMode: state.editorPreviewMode,
        mediaViewMode: state.mediaViewMode,
      }),
    }
  )
);
