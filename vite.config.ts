import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Use the existing manifest.json in public/
      manifest: false,
      workbox: {
        // Precache all JS, CSS, HTML, WASM and ONNX model files so they are
        // available offline after the first load.
        globPatterns: ['**/*.{js,css,html,ico,svg,gif,png,wasm,onnx}'],
        // WASM files are up to 26 MB — raise the default 2 MB limit.
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        // Cache ONNX models with a long TTL (they never change between deploys).
        runtimeCaching: [
          {
            urlPattern: /\/models\/.*\.onnx$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'onnx-models',
              expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
            },
          },
          {
            urlPattern: /.*\.wasm$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-cache',
              expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],

  server: {
    // In local dev, proxy /api/* to the FastAPI backend at :8000.
    // This avoids CORS issues and means the frontend never needs to
    // hard-code the backend port.
    // In production, VITE_API_URL is set externally so this block is unused.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
