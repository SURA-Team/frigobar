/**
 * Falha se o JS carregado pela página pública passar de 100 KB gzip (plan.md, Performance Goals).
 * Mede os scripts e modulepreloads referenciados por dist/index.html (o painel /admin/ fica de fora).
 * Uso: `npm run size` depois de um build.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const LIMITE_KB = 100;
const DIST = path.resolve('dist');

function arquivosJsDaPagina(html: string): string[] {
  const urls = new Set<string>();
  for (const m of html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)) urls.add(m[1]!);
  for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g))
    urls.add(m[1]!);
  return [...urls];
}

function caminhoNoDist(url: string, base: string): string {
  const semBase = url.startsWith(base) ? url.slice(base.length) : url.replace(/^\//, '');
  return path.join(DIST, semBase);
}

const arquivoHtml = path.join(DIST, 'index.html');
if (!existsSync(arquivoHtml)) {
  console.error('dist/index.html não encontrado. Rode o build antes.');
  process.exit(1);
}

const html = readFileSync(arquivoHtml, 'utf8');
const base = process.env.PAGES_BASE_PATH ?? '/frigobar/';
let total = 0;
for (const url of arquivosJsDaPagina(html)) {
  const tamanho = gzipSync(readFileSync(caminhoNoDist(url, base))).length;
  total += tamanho;
  console.log(`  ${(tamanho / 1024).toFixed(1).padStart(6)} KB  ${url}`);
}

const totalKb = total / 1024;
console.log(`JS da página pública: ${totalKb.toFixed(1)} KB gzip (limite ${LIMITE_KB} KB).`);
if (totalKb > LIMITE_KB) {
  console.error('Acima do limite: reduza dependências da página pública.');
  process.exitCode = 1;
}
