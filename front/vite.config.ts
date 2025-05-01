import { fileURLToPath, URL } from 'node:url';
import { dirname, resolve, join } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

// Get the absolute path to project root
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': join(projectRoot, 'shared'),
    },
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ['@shared/types/blog'],
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    fs: {
      // Allow serving files from one level up (the project root)
      allow: ['..'],
      strict: false,
    },
  },
});
