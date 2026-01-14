/**
 * Layout Types
 * Type definitions for layout components
 */

export interface LayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
  external?: boolean;
  disabled?: boolean;
}

export interface QuickNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export type ViewMode = "grid" | "list" | "details";
export type EditorPreviewMode = "split" | "editor" | "preview";
export type Theme = "light" | "dark" | "system";
