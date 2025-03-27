import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import chunkSplitPlugin from 'vite-plugin-chunk-split';

export default defineConfig({
  plugins: [
    vue(),
    chunkSplitPlugin({
      strategy: 'default',
      customSplitting: {
        'vendor': [/node_modules/],
        'codemirror': [/codemirror/],
        'mui': [/mui/],
        'lodash': [/lodash/],
      },
    }),
  ],
  build: {
    minify: 'esbuild',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    compress: true,
  },
});