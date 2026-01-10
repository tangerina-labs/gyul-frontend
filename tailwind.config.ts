import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors - Teal palette (primary)
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Accent colors for node types
        accent: {
          tweet: '#14b8a6',
          question: '#a78bfa',
          note: '#b45309',
        },
        // Gray scale (matching existing design)
        gray: {
          0: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Semantic state colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        // Note background
        'note-bg': '#fffbeb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      borderRadius: {
        'node': '10px',
      },
      boxShadow: {
        'node': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'node-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'node-selected': '0 0 0 2px rgba(20, 184, 166, 0.15)',
        'node-selected-tweet': '0 0 0 2px rgba(20, 184, 166, 0.15)',
        'node-selected-question': '0 0 0 2px rgba(167, 139, 250, 0.25)',
        'node-selected-note': '0 0 0 2px rgba(180, 83, 9, 0.2)',
        'menu': '0 12px 24px rgba(0, 0, 0, 0.12)',
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
          '0%, 100%': { boxShadow: 'inset 0 0 60px rgba(20, 184, 166, 0.15)' },
          '50%': { boxShadow: 'inset 0 0 80px rgba(20, 184, 166, 0.12)' },
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
