import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fileMetadataPlugin from './plugins/fileMetadataPlugin';


export default defineConfig({
  plugins: [react(), fileMetadataPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    force: true
  },
  build: {
    sourcemap: true,
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/data': 'http://localhost:3001'
    }
  },

});
