import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      // TanStack Start has no static index.html for Vite to transform, so
      // the plugin's automatic <script>/<link> injection doesn't apply —
      // the manifest link and SW registration are added by hand instead
      // (see src/routes/__root.tsx).
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
        icons: [
          // TODO: add real 192x192 / 512x512 PNG icons under public/ before
          // shipping — these paths are placeholders so the manifest is valid.
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})

export default config
