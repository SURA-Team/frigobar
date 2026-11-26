/**
 * Conteúdo publicado, já validado e normalizado no build pelo plugin `frigobar-conteudo`
 * (scripts/vite-plugin-conteudo.ts). A origem é `content/` por padrão ou
 * `tests/fixtures/content` nos testes (variável FRIGOBAR_CONTENT_DIR).
 */
import conteudo from 'virtual:conteudo';
import type { Conteudo } from './schema';

export const conteudoPublicado: Conteudo = conteudo;
