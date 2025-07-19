import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
      plugins: [
        react(),
        {
          name: 'copy-liff',
          writeBundle() {
            try {
              copyFileSync('liff.html', 'dist/liff.html');
              console.log('liff.html copied to dist/');
            } catch (err) {
              console.log('Failed to copy liff.html:', err.message);
            }
          }
        }
      ],
    };
});
