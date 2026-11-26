import { readFileSync } from 'node:fs';
import path from 'node:path';

export const DIR_FIXTURES = path.resolve('tests/fixtures');
export const DIR_CONTEUDO_TESTE = path.join(DIR_FIXTURES, 'content');
export const DIR_UPLOADS_TESTE = path.join(DIR_FIXTURES, 'uploads');

/** Lê um JSON do conteúdo de teste como objeto novo (seguro para mutar no teste). */
export function lerFixture<T = Record<string, unknown>>(nome: string): T {
  return JSON.parse(readFileSync(path.join(DIR_CONTEUDO_TESTE, nome), 'utf8')) as T;
}
