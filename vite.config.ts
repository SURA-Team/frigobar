import { readFileSync } from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Base path configurável: '/frigobar/' no github.io ou '/' com domínio próprio (research R3).
const base = process.env.PAGES_BASE_PATH ?? '/frigobar/';

// Origem do conteúdo: content/ real por padrão; tests/fixtures/content nos testes (research R13).
const dirConteudo = path.resolve(process.env.FRIGOBAR_CONTENT_DIR ?? 'content');

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Preenche título, descrição e theme-color do HTML a partir do conteúdo (nada fixo no código). */
function conteudoNoHtml(): Plugin {
  return {
    name: 'frigobar-conteudo-no-html',
    transformIndexHtml(html) {
      const ler = (nome: string) => JSON.parse(readFileSync(path.join(dirConteudo, nome), 'utf8'));
      const site = ler('site.json') as { nomeHotel?: string };
      const tema = ler('theme.json') as { cores?: { principal?: string } };
      return html
        .replaceAll('%NOME_HOTEL%', escaparHtml(site.nomeHotel ?? ''))
        .replaceAll('%COR_PRINCIPAL%', escaparHtml(tema.cores?.principal ?? '#000000'));
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), conteudoNoHtml()],
  resolve: {
    alias: {
      '@conteudo': dirConteudo,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
      },
    },
  },
});
