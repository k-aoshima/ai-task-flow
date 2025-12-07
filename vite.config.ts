import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // distディレクトリが存在しない場合は作成
        const distDir = resolve(__dirname, 'dist');
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        // manifest.jsonをdistにコピー
        const manifestSrc = resolve(__dirname, 'public/manifest.json');
        const manifestDest = resolve(__dirname, 'dist/manifest.json');
        if (existsSync(manifestSrc)) {
          copyFileSync(manifestSrc, manifestDest);
        }
        // background.jsをdistにコピー
        const backgroundSrc = resolve(__dirname, 'public/background.js');
        const backgroundDest = resolve(__dirname, 'dist/background.js');
        if (existsSync(backgroundSrc)) {
          copyFileSync(backgroundSrc, backgroundDest);
        }
        // popup.htmlをdistのルートにコピー（パスを修正）
        const popupSrc = resolve(__dirname, 'dist/public/popup.html');
        const popupDest = resolve(__dirname, 'dist/popup.html');
        if (existsSync(popupSrc)) {
          let popupContent = readFileSync(popupSrc, 'utf-8');
          // 絶対パスを相対パスに変換
          popupContent = popupContent.replace(/src="\/assets\//g, 'src="./assets/');
          popupContent = popupContent.replace(/href="\/assets\//g, 'href="./assets/');
          writeFileSync(popupDest, popupContent);
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'public/popup.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup.html') {
            return 'popup.html';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  publicDir: 'public',
});

