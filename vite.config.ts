import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/arc-bard-design-systems/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        portal: fileURLToPath(new URL('./index.html', import.meta.url)),
        arc: fileURLToPath(new URL('./arc/index.html', import.meta.url)),
        bard: fileURLToPath(new URL('./bard/index.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
