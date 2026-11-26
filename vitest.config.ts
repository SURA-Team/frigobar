import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Os testes nunca leem o content/ real (editado pelo hotel): usam o conteúdo congelado.
      '@conteudo': path.resolve('tests/fixtures/content'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts?(x)'],
  },
});
