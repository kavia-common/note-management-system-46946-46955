import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 5 config (Node 18 compatible) for React + Vite.
 * No SSR, no experimental options required.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
  preview: {
    port: 3000,
    strictPort: false,
    host: true,
  },
});
