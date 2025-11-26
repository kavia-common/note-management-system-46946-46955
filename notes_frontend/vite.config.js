import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 4 config (Node 18 compatible) for React + Vite.
 * Basic dev/preview server host/port for local and containerized use.
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
