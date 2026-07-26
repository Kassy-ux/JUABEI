import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'],
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    VitePWA({
      // The plugin owns the manifest. public/sw.js provides the service worker
      // because generateSW does not run reliably in Start's client+SSR build.
      injectRegister: false,
      manifest: {
        name: 'JuaBei',
        short_name: 'JuaBei',
        description:
          'JuaBei helps farmers get a fair, evidence-backed price for their crops and assess export eligibility.',
        theme_color: '#166534',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})

export default config
