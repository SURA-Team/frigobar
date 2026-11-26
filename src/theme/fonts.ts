/** Fontes padrão auto-hospedadas via @fontsource (research R6). */
export const FONTE_PADRAO_IDS = [
  'inter',
  'lato',
  'montserrat',
  'nunito',
  'raleway',
  'playfair-display',
  'lora',
  'merriweather',
] as const;

export type FontePadraoId = (typeof FONTE_PADRAO_IDS)[number];

export interface DefinicaoFonte {
  nome: string;
  familia: string;
  fallback: string;
}

const SANS = 'system-ui, sans-serif';
const SERIF = 'Georgia, serif';

export const FONTES_PADRAO: Record<FontePadraoId, DefinicaoFonte> = {
  inter: { nome: 'Inter', familia: 'Inter', fallback: SANS },
  lato: { nome: 'Lato', familia: 'Lato', fallback: SANS },
  montserrat: { nome: 'Montserrat', familia: 'Montserrat', fallback: SANS },
  nunito: { nome: 'Nunito', familia: 'Nunito', fallback: SANS },
  raleway: { nome: 'Raleway', familia: 'Raleway', fallback: SANS },
  'playfair-display': { nome: 'Playfair Display', familia: 'Playfair Display', fallback: SERIF },
  lora: { nome: 'Lora', familia: 'Lora', fallback: SERIF },
  merriweather: { nome: 'Merriweather', familia: 'Merriweather', fallback: SERIF },
};

// Imports estáticos por família para o Vite gerar um chunk por fonte; só as escolhidas são baixadas.
const CARREGADORES: Record<FontePadraoId, () => Promise<unknown>> = {
  inter: () =>
    Promise.all([import('@fontsource/inter/400.css'), import('@fontsource/inter/700.css')]),
  lato: () => Promise.all([import('@fontsource/lato/400.css'), import('@fontsource/lato/700.css')]),
  montserrat: () =>
    Promise.all([
      import('@fontsource/montserrat/400.css'),
      import('@fontsource/montserrat/700.css'),
    ]),
  nunito: () =>
    Promise.all([import('@fontsource/nunito/400.css'), import('@fontsource/nunito/700.css')]),
  raleway: () =>
    Promise.all([import('@fontsource/raleway/400.css'), import('@fontsource/raleway/700.css')]),
  'playfair-display': () =>
    Promise.all([
      import('@fontsource/playfair-display/400.css'),
      import('@fontsource/playfair-display/700.css'),
    ]),
  lora: () => Promise.all([import('@fontsource/lora/400.css'), import('@fontsource/lora/700.css')]),
  merriweather: () =>
    Promise.all([
      import('@fontsource/merriweather/400.css'),
      import('@fontsource/merriweather/700.css'),
    ]),
};

/** Carrega os pesos 400 e 700 de uma fonte padrão. Falhas não bloqueiam a página (fallback). */
export async function carregarFontePadrao(id: FontePadraoId): Promise<void> {
  try {
    await CARREGADORES[id]();
  } catch {
    // A pilha de fallback mantém o texto visível (FR-017a).
  }
}

/** Pilha CSS de `font-family` para uma fonte padrão, com fallback do sistema. */
export function pilhaFontePadrao(id: FontePadraoId): string {
  const fonte = FONTES_PADRAO[id];
  return `"${fonte.familia}", ${fonte.fallback}`;
}

function nomeSeguro(nome: string): string {
  return nome.replace(/["\\<>]/g, '').trim();
}

/** Pilha CSS para uma fonte própria: se ela não carregar, o texto usa a fonte do sistema. */
export function pilhaFontePropria(nome: string): string {
  return `"${nomeSeguro(nome)}", system-ui, sans-serif`;
}

const FORMATOS: Record<string, string> = {
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
};

/** URL pública de um arquivo do conteúdo (`uploads/...`), respeitando o base path. */
export function urlDoConteudo(caminho: string, base: string = import.meta.env.BASE_URL): string {
  if (/^(blob:|data:|https?:|\/)/.test(caminho)) return caminho;
  return `${base}${caminho}`;
}

/** Regra `@font-face` de uma fonte própria, com `font-display: swap` (texto nunca invisível). */
export function cssFontePropria(fonte: { nome: string; arquivo: string }, url?: string): string {
  const extensao = fonte.arquivo.split('.').pop()?.toLowerCase() ?? '';
  const formato = FORMATOS[extensao];
  const origem = (url ?? urlDoConteudo(fonte.arquivo)).replace(/"/g, '%22');
  return [
    '@font-face {',
    `  font-family: "${nomeSeguro(fonte.nome)}";`,
    `  src: url("${origem}")${formato ? ` format("${formato}")` : ''};`,
    '  font-weight: 100 900;',
    '  font-display: swap;',
    '}',
  ].join('\n');
}

/**
 * Injeta (ou atualiza) o `@font-face` de uma fonte própria no documento e devolve a pilha CSS.
 * `url` permite usar um blob da pré-visualização do CMS.
 */
export function registrarFontePropria(
  fonte: { nome: string; arquivo: string },
  documento: Document = document,
  url?: string,
): string {
  const chave = nomeSeguro(fonte.nome);
  let estilo = documento.head.querySelector<HTMLStyleElement>(
    `style[data-fonte-propria="${CSS.escape(chave)}"]`,
  );
  if (!estilo) {
    estilo = documento.createElement('style');
    estilo.dataset.fontePropria = chave;
    documento.head.appendChild(estilo);
  }
  estilo.textContent = cssFontePropria(fonte, url);
  return pilhaFontePropria(fonte.nome);
}

type FonteDoTema =
  | { origem: 'padrao'; padrao: FontePadraoId }
  | { origem: 'propria'; nome: string; arquivo: string };

/** Carrega as fontes de títulos e textos do tema (padrão por import; própria por @font-face). */
export async function prepararFontes(
  fontes: { titulos: FonteDoTema; textos: FonteDoTema },
  documento: Document = document,
  resolverUrl?: (caminho: string) => string | undefined,
): Promise<void> {
  const tarefas = [fontes.titulos, fontes.textos].map((fonte) => {
    if (fonte.origem === 'padrao') return carregarFontePadrao(fonte.padrao);
    registrarFontePropria(fonte, documento, resolverUrl?.(fonte.arquivo));
    return Promise.resolve();
  });
  await Promise.all(tarefas);
}
