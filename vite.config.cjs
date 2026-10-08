const { resolve } = require('node:path');

const tailwindcss = require('@tailwindcss/postcss');
const react = require('@vitejs/plugin-react');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/client'),
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
};
