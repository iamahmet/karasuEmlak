import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    // Avoid globbing into pnpm-linked node_modules by targeting only ui source files.
    '../../packages/ui/components/**/*.{ts,tsx}',
    '../../packages/ui/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px', // Max content width per design system
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          dark: 'hsl(var(--primary-dark))',
          light: 'hsl(var(--primary-light))',
          subtle: 'hsl(var(--primary-subtle))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          dark: 'hsl(var(--secondary-dark))',
          light: 'hsl(var(--secondary-light))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          dark: 'hsl(var(--accent-dark))',
          light: 'hsl(var(--accent-light))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Primary Blue - Eski Site Renkleri
        brand: {
          DEFAULT: '#006AFF',
          dark: '#0052CC',
          light: '#1A8CFF',
          subtle: '#E6F2FF',
        },
        // Secondary Green - Satılık için
        success: {
          DEFAULT: '#00A862',
          dark: '#00864E',
          light: '#1AD574',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xs: '0.25rem', // 4px
        full: '9999px',
      },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      display: ['Plus Jakarta Sans', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      apple: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Inter', 'sans-serif'],
    },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 1px 3px rgba(0,0,0,0.1)',
        lg: '0 4px 6px rgba(0,0,0,0.1)',
        xl: '0 10px 15px rgba(0,0,0,0.1)',
        card: '0 1px 3px rgba(0,0,0,0.1)', // Subtle card shadow
        // Adobe 2026 - Modern Shadows
        'glass': '0 8px 32px 0 rgba(0, 106, 255, 0.1)',
        'glow': '0 0 20px rgba(0, 106, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 106, 255, 0.4)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(0, 106, 255, 0.1)',
        'neumorphism': '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'neumorphism-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.1), inset -8px -8px 16px rgba(255, 255, 255, 0.8)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Adobe 2026 Trends - Modern Animations
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 106, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0, 106, 255, 0)' },
        },
               'gradient-shift': {
                 '0%, 100%': { backgroundPosition: '0% 50%' },
                 '50%': { backgroundPosition: '100% 50%' },
               },
               'toast-slide-in': {
                 '0%': { transform: 'translateX(100%)', opacity: '0' },
                 '100%': { transform: 'translateX(0)', opacity: '1' },
               },
               'toast-slide-out': {
                 '0%': { transform: 'translateX(0)', opacity: '1' },
                 '100%': { transform: 'translateX(100%)', opacity: '0' },
               },
               'toast-fade-in': {
                 '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
                 '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
               },
               'tooltip-fade-in': {
                 '0%': { opacity: '0', transform: 'translateY(5px)' },
                 '100%': { opacity: '1', transform: 'translateY(0)' },
               },
               'page-fade-in': {
                 '0%': { opacity: '0', transform: 'translateY(10px)' },
                 '100%': { opacity: '1', transform: 'translateY(0)' },
               },
               'ripple': {
                 '0%': { transform: 'scale(0)', opacity: '1' },
                 '100%': { transform: 'scale(4)', opacity: '0' },
               },
               'skeleton-pulse': {
                 '0%, 100%': { opacity: '1' },
                 '50%': { opacity: '0.5' },
               },
               'progress-bar': {
                 '0%': { transform: 'translateX(-100%)' },
                 '100%': { transform: 'translateX(0)' },
               },
               'badge-pulse': {
                 '0%, 100%': { transform: 'scale(1)' },
                 '50%': { transform: 'scale(1.1)' },
               },
               'gradient-text': {
                 '0%, 100%': { backgroundPosition: '0% 50%' },
                 '50%': { backgroundPosition: '100% 50%' },
               },
               'spin-slow': {
                 '0%': { transform: 'rotate(0deg)' },
                 '100%': { transform: 'rotate(360deg)' },
               },
               'bounce-subtle': {
                 '0%, 100%': { transform: 'translateY(0)' },
                 '50%': { transform: 'translateY(-5px)' },
               },
               'gradient-border': {
                 '0%': { backgroundPosition: '0% 50%' },
                 '50%': { backgroundPosition: '100% 50%' },
                 '100%': { backgroundPosition: '0% 50%' },
               },
             },
             animation: {
               'accordion-down': 'accordion-down 0.2s ease-out',
               'accordion-up': 'accordion-up 0.2s ease-out',
               'fade-in': 'fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
               'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
               'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
               'scale-in': 'scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
               'shimmer': 'shimmer 2s linear infinite',
               'float': 'float 3s ease-in-out infinite',
               'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
               'gradient-shift': 'gradient-shift 3s ease infinite',
               'toast-slide-in': 'toast-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
               'toast-slide-out': 'toast-slide-out 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
               'toast-fade-in': 'toast-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
               'tooltip-fade-in': 'tooltip-fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
               'page-fade-in': 'page-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
               'ripple': 'ripple 0.6s',
               'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
               'progress-bar': 'progress-bar 1s ease-out',
               'badge-pulse': 'badge-pulse 2s ease-in-out infinite',
               'gradient-text': 'gradient-text 3s ease infinite',
               'spin-slow': 'spin-slow 1s linear infinite',
               'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
               'gradient-border': 'gradient-border 3s ease infinite',
             },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, rgba(11, 93, 122, 0.1) 0%, rgba(14, 111, 138, 0.05) 50%, rgba(8, 74, 95, 0.1) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
