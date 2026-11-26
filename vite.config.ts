import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { conteudoPlugin } from './scripts/vite-plugin-conteudo';

// Base path configurável: '/frigobar/' no github.io ou '/' com domínio próprio (research R3).
const base = process.env.PAGES_BASE_PATH ?? '/frigobar/';

// Origem do conteúdo: content/ real por padrão; tests/fixtures/content nos testes (research R13).
const dirConteudo = path.resolve(process.env.FRIGOBAR_CONTENT_DIR ?? 'content');

export default defineConfig({
  base,
  plugins: [react(), conteudoPlugin(dirConteudo)],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        admin: path.resolve('admin/index.html'),
        qrcode: path.resolve('admin/qrcode.html'),
      },
    },
  },
});
