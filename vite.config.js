import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: 'esbuild', // Ensure minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vue: ['vue'],
          codemirror: ['vue-codemirror', 'codemirror'],
          lodash: ['lodash'],
        },
      },
    },
  },
  server: {
    compress: true, // Enable gzip compression
  },
});