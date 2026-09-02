import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 10000,
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    host: '0.0.0.0',
    port: 3000,
  },
});
