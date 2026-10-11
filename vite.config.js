import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,png,woff2}'] },
      manifest: {
        name: 'thefacebook',
        short_name: 'thefacebook',
        description: 'A simple personal history.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0a1020',
        theme_color: '#0a1020',
        categories: ['lifestyle', 'personal'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          {
            name: 'New entry',
            url: '/?tab=publish',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      }
    })
  ]
});
