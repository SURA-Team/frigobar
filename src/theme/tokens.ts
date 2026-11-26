/** Tema → variáveis CSS aplicadas no :root (research R7). */
import type { Fonte, Tema } from '../content/schema';
import { melhorTextoSobre } from './contrast';
import { pilhaFontePadrao, pilhaFontePropria } from './fonts';

export function pilhaFonte(fonte: Fonte): string {
  return fonte.origem === 'padrao' ? pilhaFontePadrao(fonte.padrao) : pilhaFontePropria(fonte.nome);
}

export function temaParaVariaveisCss(tema: Tema): Record<string, string> {
  const { cores, fontes } = tema;
  return {
    '--cor-principal': cores.principal,
    '--cor-secundaria': cores.secundaria,
    '--cor-fundo': cores.fundo,
    '--cor-texto': cores.texto,
    '--cor-destaque': cores.destaque,
    '--cor-sobre-principal': melhorTextoSobre(cores.principal),
    '--cor-sobre-destaque': melhorTextoSobre(cores.destaque),
    '--fonte-titulos': pilhaFonte(fontes.titulos),
    '--fonte-textos': pilhaFonte(fontes.textos),
  };
}

export function aplicarTema(tema: Tema, alvo: HTMLElement = document.documentElement): void {
  for (const [nome, valor] of Object.entries(temaParaVariaveisCss(tema))) {
    alvo.style.setProperty(nome, valor);
  }
}
