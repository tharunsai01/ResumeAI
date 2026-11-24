import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    // Compile-time flag: in live builds the mock layer is dead code and is never bundled.
    define: { __MOCK__: JSON.stringify(mode === 'mock') },
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
    server: {
      port: 5173,
      proxy: {
        // Same-origin API in development keeps the refresh cookie first-party.
        '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true },
      },
    },
    preview: { port: 4173 },
    build: {
      target: 'es2022',
      sourcemap: false,
      // Route-level lazy loading does the splitting; recharts only loads on chart pages.
      chunkSizeWarningLimit: 600,
    },
  };
});
