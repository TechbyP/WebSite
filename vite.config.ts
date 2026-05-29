import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fileMetadataPlugin from './plugins/fileMetadataPlugin';
import { imagetools } from 'vite-imagetools';

const normalizeModuleId = (id: string) => id.replace(/\\/g, '/');

const getNodeModulePackageName = (id: string) => {
  const normalizedId = normalizeModuleId(id);
  const parts = normalizedId.split('/node_modules/');
  const packagePath = parts[parts.length - 1];

  if (!packagePath) return null;

  const segments = packagePath.split('/');
  const startIndex = segments[0] === '.pnpm' ? 2 : 0;
  const scopeOrName = segments[startIndex];

  if (!scopeOrName) return null;

  if (scopeOrName.startsWith('@')) {
    const packageName = segments[startIndex + 1];
    return packageName ? `${scopeOrName}/${packageName}` : scopeOrName;
  }

  return scopeOrName;
};


export default defineConfig({
  plugins: [react(), fileMetadataPlugin(),  imagetools()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    sourcemap: false,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = normalizeModuleId(id);

          if (normalizedId.includes('/node_modules/')) {
            const packageName = getNodeModulePackageName(normalizedId);

            if (
              packageName === 'firebase'
              || packageName?.startsWith('firebase/')
              || packageName?.startsWith('@firebase/')
            ) return 'firebase';
            if (packageName === 'framer-motion') return 'motion';
            if (packageName === 'react-router' || packageName === 'react-router-dom' || packageName === '@remix-run/router') return 'router';
            if (
              packageName === 'react'
              || packageName === 'react-dom'
              || packageName === 'scheduler'
              || packageName === 'use-sync-external-store'
            ) return 'react-vendor';
            if (packageName === 'lucide-react') return 'icons';

            return undefined;
          }

          return undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/data': 'http://localhost:3001'
    }
  },

});
