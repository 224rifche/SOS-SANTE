import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: "Won-Mally - Plateforme d'urgences medicales",
        short_name: 'Won-Mally',
        description: "Chaque seconde compte. Chaque vie merite une reponse.",
        start_url: '/',
        id: '/',
        display: 'standalone',
        background_color: '#FAFAFA',
        theme_color: '#E53935',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:8080\/api\/v1\/(citizens|alerts)\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wonmally-api-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  define: {
    // Polyfill requis par sockjs-client (dependance de @stomp/stompjs),
    // qui reference l'objet "global" de Node.js, absent dans le navigateur.
    // Sans ce polyfill : "Uncaught ReferenceError: global is not defined"
    // qui casse tout le bundle au chargement (page blanche).
    global: 'globalThis',
  },
})