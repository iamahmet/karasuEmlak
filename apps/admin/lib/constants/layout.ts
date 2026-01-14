/**
 * Layout Constants
 * Centralized layout configuration
 */

export const LAYOUT_CONFIG = {
  sidebar: {
    width: 256, // 64 * 4 = 256px (lg:ml-64)
    collapsedWidth: 64,
    mobileBreakpoint: 1024, // lg breakpoint
  },
  header: {
    height: 56, // h-14 = 56px
    sticky: true,
  },
  container: {
    maxWidth: 1920,
    padding: {
      mobile: 16, // p-4
      desktop: 24, // p-6
    },
  },
  zIndex: {
    sidebar: 40,
    header: 50,
    dropdown: 1000,
    modal: 1050,
    tooltip: 1070,
    toast: 1080,
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

export const TRANSITION_EASING = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
} as const;
