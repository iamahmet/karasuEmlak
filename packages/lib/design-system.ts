/**
 * Karasu Emlak Design System
 * Tutarlı marka kimliği ve tasarım token'ları
 * 
 * Brand Identity:
 * - Primary Color: #006AFF (Zillow Blue - Güven ve profesyonellik)
 * - Secondary Color: #00A862 (Yeşil - Satılık için, büyüme ve güven)
 * - Accent Color: #FF5A5F (Kırmızı - Öne çıkan ilanlar için)
 * - Typography: System fonts (Inter, -apple-system, sans-serif)
 */

export const designSystem = {
  // Brand Colors - Karasu Emlak
  colors: {
    primary: {
      DEFAULT: '#006AFF', // Ana marka rengi (Zillow Blue) - Güven ve profesyonellik
      dark: '#0052CC',
      light: '#1a8cff',
      subtle: '#e6f2ff',
      // HSL for Tailwind
      hsl: '210 100% 50%',
      hslDark: '210 100% 40%',
      hslLight: '210 100% 55%',
    },
    secondary: {
      DEFAULT: '#00A862', // Satılık için yeşil - Büyüme ve güven
      dark: '#00864e',
      light: '#1ad574',
      // HSL for Tailwind
      hsl: '150 100% 33%',
      hslDark: '150 100% 26%',
      hslLight: '150 100% 40%',
    },
    accent: {
      DEFAULT: '#FF5A5F', // Öne çıkan/hot için kırmızı - Dikkat çekici
      dark: '#cc4848',
      light: '#ff8080',
      // HSL for Tailwind
      hsl: '358 100% 68%',
      hslDark: '358 100% 55%',
      hslLight: '358 100% 75%',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    // Status colors
    success: {
      DEFAULT: '#00A862',
      light: '#e6f7f0',
    },
    warning: {
      DEFAULT: '#FFA500',
      light: '#fff4e6',
    },
    error: {
      DEFAULT: '#FF5A5F',
      light: '#ffe6e6',
    },
    info: {
      DEFAULT: '#006AFF',
      light: '#e6f2ff',
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      display: ['Inter', 'system-ui', 'sans-serif'],
    },
    display: {
      fontSize: '3rem', // 48px
      lineHeight: '1.1',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    h1: {
      fontSize: '2rem', // 32px
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.4',
      fontWeight: '600',
    },
    body: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      fontWeight: '400',
    },
    small: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: '400',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      fontWeight: '400',
    },
  },

  // Spacing System (8px base)
  spacing: {
    section: {
      py: 'py-12', // 48px - Standart bölüm arası boşluk
      pyLarge: 'py-16', // 64px - Büyük bölümler için
      pySmall: 'py-8', // 32px - Küçük bölümler için
    },
    container: {
      px: 'px-4', // 16px - Mobil
      pxMd: 'md:px-6', // 24px - Tablet
      pxLg: 'lg:px-8', // 32px - Desktop
    },
    gap: {
      small: 'gap-4', // 16px
      medium: 'gap-6', // 24px
      large: 'gap-8', // 32px
    },
  },

  // Border Radius
  borderRadius: {
    sm: 'rounded-lg', // 8px
    md: 'rounded-xl', // 12px
    lg: 'rounded-2xl', // 16px
    full: 'rounded-full',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    card: 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
    cardHover: 'shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
  },

  // Transitions
  transitions: {
    default: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    colors: 'transition-colors duration-200',
    transform: 'transition-transform duration-200',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// Tailwind class helpers
export const brandClasses = {
  // Buttons
  button: {
    primary: 'bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-6 py-3 transition-colors duration-200',
    secondary: 'bg-white dark:bg-gray-900 border-2 border-primary text-primary hover:bg-primary-subtle dark:hover:bg-gray-800 font-semibold rounded-lg px-6 py-3 transition-colors duration-200',
    outline: 'bg-transparent border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-50 hover:border-primary hover:text-primary font-semibold rounded-lg px-6 py-3 transition-colors duration-200',
  },
  
  // Sections
  section: {
    default: 'py-12 bg-white dark:bg-gray-950',
    alt: 'py-12 bg-gray-50 dark:bg-gray-900',
    large: 'py-16 bg-white dark:bg-gray-950',
    largeAlt: 'py-16 bg-gray-50 dark:bg-gray-900',
  },
  
  // Headings
  heading: {
    h1: 'text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight',
    h2: 'text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight',
    h3: 'text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight',
  },
  
  // Cards
  card: {
    default: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-all duration-200',
    elevated: 'bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-lg transition-all duration-200',
    listing: 'bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group',
  },
};

// Brand identity constants
export const brandIdentity = {
  name: 'Karasu Emlak',
  tagline: 'Hayalinizdeki Evi Bulun',
  description: 'Karasu emlak danışmanlığı - Satılık ve kiralık gayrimenkul ilanları',
  logo: {
    text: 'Karasu Emlak',
    icon: '/logo.svg', // Will be created
  },
  colors: {
    primary: designSystem.colors.primary.DEFAULT,
    secondary: designSystem.colors.secondary.DEFAULT,
    accent: designSystem.colors.accent.DEFAULT,
  },
} as const;

