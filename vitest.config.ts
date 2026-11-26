import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { conteudoPlugin } from './scripts/vite-plugin-conteudo';

export default defineConfig({
  // Os testes nunca leem o content/ real (editado pelo hotel): usam o conteúdo congelado.
  plugins: [react(), conteudoPlugin(path.resolve('tests/fixtures/content'))],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts?(x)'],
  },
});
