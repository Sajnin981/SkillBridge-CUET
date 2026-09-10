import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-dev-entry',
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const url = request.url ?? '';
          const acceptsHtml = request.headers.accept?.includes('text/html');
          if (request.method === 'GET' && acceptsHtml && !url.includes('.')) {
            request.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: 'admin.html',
    },
  },
});
