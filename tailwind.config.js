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
        // Primary text / dark elements (cool near-black slate)
        ink: {
          DEFAULT: '#0f172a',
          light: '#334155',
          soft: '#64748b',
        },
        // Brand — vivid electric blue (primary accent + CTAs)
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b8d2ff',
          300: '#8ab4ff',
          400: '#5a8eff',
          500: '#3b6cff',
          600: '#1b51f0', // base — primary buttons
          700: '#1640c4',
          800: '#17379b',
          900: '#182f7a',
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
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
