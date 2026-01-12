import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design System Semantic Colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          // Node type accents
          tweet: 'var(--accent-tweet)',
          question: '#a78bfa',
          note: '#b45309',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        border: 'var(--border)',
        input: {
          DEFAULT: 'var(--input)',
          background: 'var(--input-background)',
        },
        ring: 'var(--ring)',
        // Orange scale
        orange: {
          50: 'var(--orange-50)',
          100: 'var(--orange-100)',
          200: 'var(--orange-200)',
          300: 'var(--orange-300)',
          400: 'var(--orange-400)',
          500: 'var(--orange-500)',
          600: 'var(--orange-600)',
          700: 'var(--orange-700)',
          800: 'var(--orange-800)',
          900: 'var(--orange-900)',
        },
        // Gray scale from design system
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
        // Legacy brand colors (mapped to orange for backward compatibility)
        brand: {
          50: 'var(--orange-50)',
          100: 'var(--orange-100)',
          200: 'var(--orange-200)',
          300: 'var(--orange-300)',
          400: 'var(--orange-400)',
          500: 'var(--orange-500)',
          600: 'var(--orange-600)',
          700: 'var(--orange-700)',
          800: 'var(--orange-800)',
          900: 'var(--orange-900)',
        },
        // Note background
        'note-bg': '#fffbeb',
        // Legacy semantic colors
        danger: 'var(--destructive)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        node: '10px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        node: '0 1px 2px rgba(0, 0, 0, 0.05)',
        'node-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'node-selected': '0 0 0 2px rgba(234, 125, 60, 0.15)',
        'node-selected-tweet': '0 0 0 2px rgba(234, 125, 60, 0.15)',
        'node-selected-question': '0 0 0 2px rgba(167, 139, 250, 0.25)',
        'node-selected-note': '0 0 0 2px rgba(180, 83, 9, 0.2)',
        menu: '0 12px 24px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        0: 'var(--spacing-0)',
        1: 'var(--spacing-1)',
        2: 'var(--spacing-2)',
        3: 'var(--spacing-3)',
        4: 'var(--spacing-4)',
        5: 'var(--spacing-5)',
        6: 'var(--spacing-6)',
        8: 'var(--spacing-8)',
        10: 'var(--spacing-10)',
        12: 'var(--spacing-12)',
        16: 'var(--spacing-16)',
        20: 'var(--spacing-20)',
        24: 'var(--spacing-24)',
      },
      animation: {
        'loading-slide': 'loadingSlide 1.5s ease-in-out infinite',
        'node-enter': 'nodeEnter 180ms ease-out',
        'node-exit': 'nodeExit 120ms ease-in',
        'node-delete-exit': 'nodeDeleteExit 150ms ease-in forwards',
        'edge-flow': 'edgeFlow 0.5s linear infinite',
        'fade-in': 'fadeIn 180ms ease-out',
        'spin': 'spin 1s linear infinite',
        'create-mode-glow': 'createModeGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        loadingSlide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        nodeEnter: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        nodeExit: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.9)' },
        },
        nodeDeleteExit: {
          from: { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          to: { opacity: '0', transform: 'scale(0.8) rotate(5deg)' },
        },
        edgeFlow: {
          from: { strokeDashoffset: '12' },
          to: { strokeDashoffset: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        createModeGlow: {
          '0%, 100%': { boxShadow: 'inset 0 0 60px rgba(234, 125, 60, 0.15)' },
          '50%': { boxShadow: 'inset 0 0 80px rgba(234, 125, 60, 0.12)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '180ms',
        'slow': '300ms',
      },
      zIndex: {
        'edges': '0',
        'nodes': '1',
        'controls': '10',
        'menu': '100',
        'modal': '1000',
      },
    },
  },
  plugins: [],
} satisfies Config
