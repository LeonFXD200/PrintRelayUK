import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
//
// `base: './'` makes all asset URLs relative. This is the safest setting for
// GitHub Pages project sites (served from https://<user>.github.io/<repo>/)
// because we also use a HashRouter, so no server-side routing config is needed.
// If you deploy to a custom domain at the root, you can change this to '/'.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // Keep the bundle inspectable for a portfolio project.
    sourcemap: false,
    // three.js is fairly large; raise the warning limit so the build stays quiet.
    chunkSizeWarningLimit: 1200,
  },
  // Vitest config (read only when running `npm test`; ignored by `vite build`).
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: ['./src/test/setup.js'],
  },
})
