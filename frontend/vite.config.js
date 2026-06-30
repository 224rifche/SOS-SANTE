import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill requis par sockjs-client (dependance de @stomp/stompjs),
    // qui reference l'objet "global" de Node.js, absent dans le navigateur.
    // Sans ce polyfill : "Uncaught ReferenceError: global is not defined"
    // qui casse tout le bundle au chargement (page blanche).
    global: 'globalThis',
  },
}) 