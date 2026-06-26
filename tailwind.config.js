/** @type {import('tailwindcss').Config} */
// PrintRelay UK design system — clean industrial / manufacturing direction.
// Crisp white + cool-grey surfaces, a near-black slate ink, and a vivid
// electric-blue brand accent with a neutral steel secondary. A single modern
// sans typeface throughout. Inspired by precision B2B manufacturing services
// (clear, technical, trustworthy) rather than warm editorial or glossy SaaS.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Page background + light surfaces (cool, near-white)
        paper: {
          DEFAULT: '#f4f6fb', // soft cool-grey page background
          light: '#ffffff', // pure white cards / surfaces
          dark: '#e6ebf4', // slightly deeper grey band
        },
        // Primary text / dark elements (deep navy — Sculpteo-style)
        ink: {
          DEFAULT: '#14233f',
          light: '#33425c',
          soft: '#6b7789',
        },
        // Brand — bright azure blue (primary accent + CTAs)
        brand: {
          50: '#eaf4fe',
          100: '#d2e7fd',
          200: '#aacffb',
          300: '#79b2f8',
          400: '#4a93f2',
          500: '#2e86f0', // azure base
          600: '#1f72e0', // primary buttons
          700: '#195fc0',
          800: '#1a4f9b',
          900: '#1b437d',
        },
        // Steel — neutral cool-grey secondary accent
        steel: {
          50: '#f4f6f9',
          100: '#e7ebf1',
          200: '#cfd6e0',
          300: '#aab4c4',
          400: '#7e8aa0',
          500: '#5d6a82',
          600: '#475266',
          700: '#38414f',
          800: '#2a313c',
          900: '#1c2129',
        },
      },
      fontFamily: {
        // One clean, modern system sans for everything — no webfont request, so
        // the app stays fully private (no font-CDN / IP leak) and runs offline.
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // `display` kept as a token (used by existing headings) but pointed at
        // the same sans stack for a consistent industrial look.
        display: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.4rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 14px 32px -18px rgba(15,23,42,0.20)',
        lift: '0 22px 50px -24px rgba(15,23,42,0.30)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
        'drive': {
          '0%,100%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(4px)' },
        },
        'sheen': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
        bob: 'bob 2.6s ease-in-out infinite',
        'spin-slow': 'spin-slow 9s linear infinite',
        'pulse-soft': 'pulse-soft 2.8s ease-in-out infinite',
        drive: 'drive 2.4s ease-in-out infinite',
        sheen: 'sheen 2.5s linear infinite',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
