import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url'; // Import the necessary function

// The directory of the current module.
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        offscreen: resolve(__dirname, 'public/offscreen.html'),
        // For files in the public folder that are actual entry points,
        // you should resolve their path from the root.
        background: resolve(__dirname, 'public/background.js'),
        offscreen_js: resolve(__dirname, 'public/offscreen.js'),
      },
      output: {
        // Ensure consistent naming for manifest references
        entryFileNames: `[name].js`,
        chunkFileNames: `assets/js/[name].js`,
        assetFileNames: (assetInfo) => {
          // Keep the original name for HTML files
          if (assetInfo.name?.endsWith('.html')) {
            return '[name].[ext]';
          }
          return `assets/[name].[ext]`;
        },
      },
    },
  },
});