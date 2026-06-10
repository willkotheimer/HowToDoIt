import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // mirrors the "baseUrl": "src" from tsconfig
      src: path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
