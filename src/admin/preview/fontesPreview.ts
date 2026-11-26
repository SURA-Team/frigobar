/**
 * Fontes dentro do iframe da pré-visualização do CMS. As fontes padrão são carregadas no
 * documento do painel (imports do @fontsource) e suas regras @font-face são copiadas para o
 * iframe; fontes próprias são registradas direto no iframe (com blob URL se ainda não publicadas).
 */
import type { Fonte } from '../../content/schema';
import { carregarFontePadrao, FONTES_PADRAO, registrarFontePropria } from '../../theme/fonts';

function familiaDaRegra(regra: CSSFontFaceRule): string {
  return regra.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
}

function regrasFontFace(documento: Document, familias: Set<string>): string[] {
  const css: string[] = [];
  for (const folha of Array.from(documento.styleSheets)) {
    let regras: CSSRuleList;
    try {
      regras = folha.cssRules;
    } catch {
      continue; // folha de outra origem
    }
    for (const regra of Array.from(regras)) {
      if (regra instanceof CSSFontFaceRule && familias.has(familiaDaRegra(regra))) {
        css.push(regra.cssText);
      }
    }
  }
  return css;
}

export async function aplicarFontesNoPreview(
  fontes: { titulos: Fonte; textos: Fonte },
  docPreview: Document,
  resolverUrl: (caminho: string) => string | undefined,
): Promise<void> {
  const padrao = [fontes.titulos, fontes.textos].filter(
    (f): f is Extract<Fonte, { origem: 'padrao' }> => f.origem === 'padrao',
  );
  await Promise.all(padrao.map((f) => carregarFontePadrao(f.padrao)));

  const familias = new Set(padrao.map((f) => FONTES_PADRAO[f.padrao].familia));
  let estilo = docPreview.head.querySelector<HTMLStyleElement>('style[data-fontes-padrao]');
  if (!estilo) {
    estilo = docPreview.createElement('style');
    estilo.dataset.fontesPadrao = '';
    docPreview.head.appendChild(estilo);
  }
  estilo.textContent = regrasFontFace(document, familias).join('\n');

  for (const fonte of [fontes.titulos, fontes.textos]) {
    if (fonte.origem === 'propria') {
      registrarFontePropria(fonte, docPreview, resolverUrl(fonte.arquivo));
    }
  }
}
