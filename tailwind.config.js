/** @type {import('tailwindcss').Config} */
// PrintRelay UK design system — warm editorial direction.
// Light "paper" background, warm near-black ink, a terracotta (clay) primary
// accent and a deep teal (pine) secondary, with a serif display face.
// Inspired by narrative-driven, editorial agency sites rather than glossy SaaS.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Page background + light surfaces
        paper: {
          DEFAULT: '#f4f1ea', // warm off-white page background
          light: '#fbf9f4',
          dark: '#ece6d9',
        },
        // Primary text / dark elements (warm near-black)
        ink: {
          DEFAULT: '#1c1813',
          light: '#3a342b',
          soft: '#6b6357',
        },
        // Clay — terracotta primary accent
        clay: {
          50: '#faf2ec',
          100: '#f2ddcf',
          200: '#e6bca3',
          300: '#d99974',
          400: '#cd7a4e',
          500: '#c25a32', // base
          600: '#a64926',
          700: '#883a22',
          800: '#6f311f',
          900: '#5c2b1d',
        },
        // Pine — deep teal/green secondary accent
        pine: {
          50: '#ecf4f1',
          100: '#d2e6df',
          200: '#a6cdc2',
          300: '#73ad9f',
          400: '#3f8b79',
          500: '#1f6b5b', // base
          600: '#175548',
          700: '#134138',
          800: '#11342e',
          900: '#0d2823',
        },
      },
      fontFamily: {
        // Editorial serif display (self-hosted via @fontsource-variable/fraunces)
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'Cambria', 'serif'],
        // Clean system sans for body + UI (no webfont, fully private)
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.4rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,24,19,0.04), 0 12px 32px -16px rgba(28,24,19,0.18)',
        lift: '0 18px 50px -24px rgba(28,24,19,0.35)',
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
          'linear-gradient(rgba(28,24,19,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(28,24,19,0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
