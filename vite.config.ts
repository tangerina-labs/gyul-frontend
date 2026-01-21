import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Generate clean output for better SSG
    manifest: true,
    ssrManifest: true,
    // Increase chunk size limit to avoid warnings for large vendors (tldraw, lottie)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router', '@tanstack/react-query'],
          'vendor-tldraw': ['tldraw'],
          'vendor-lottie': ['lottie-web'],
        },
      },
    },
  },
})
