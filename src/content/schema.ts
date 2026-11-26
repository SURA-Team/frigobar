/**
 * Schema do conteúdo (contrato entre CMS e site). Qualquer mudança exige atualizar juntos:
 * este arquivo, `src/admin/config.ts` e `specs/001-pagina-publica-frigobar/contracts/content-files.md`.
 */
import { z } from 'zod';
import { ETIQUETA_IDS } from '../icons/tags';
import { ICONE_IDS } from '../icons/registry';
import { FONTE_PADRAO_IDS } from '../theme/fonts';
import { somenteDigitos } from './format';

z.config(z.locales.ptBR());

/**
 * Padrões de validação compartilhados com a configuração do CMS (`src/admin/config.ts`),
 * para que painel, pré-visualização e build apliquem exatamente as mesmas regras.
 */
export const PADROES = {
  imagem: /\.(jpe?g|png|webp)$/i,
  logo: /\.(jpe?g|png|webp|svg)$/i,
  fonte: /\.(woff2?|ttf|otf)$/i,
  /** Somente dígitos, espaços, parênteses, hífen, ponto e "+". */
  telefoneMascara: /^[\d\s()+.-]+$/,
  ramal: /^\d{1,6}$/,
  corHex: /^#[0-9A-Fa-f]{6}$/,
} as const;

export const MENSAGENS = {
  imagem: 'Use imagem JPEG, PNG ou WebP (fotos do iPhone são convertidas automaticamente).',
  logo: 'Use logotipo JPEG, PNG, WebP ou SVG.',
  fonte: 'Use arquivo de fonte WOFF2, WOFF, TTF ou OTF.',
  telefone: 'Informe DDD + número (10 ou 11 dígitos), ex.: (51) 99999-8888.',
  ramal: 'O ramal deve ter de 1 a 6 dígitos.',
  corHex: 'Use uma cor no formato #RRGGBB, ex.: #1F3A5F.',
} as const;

/** Todo caminho de mídia no conteúdo é relativo e começa com esta pasta (`public_folder` do CMS). */
export const PREFIXO_UPLOADS = 'uploads/';

export const LIMITES = {
  imagemBytes: 10 * 1024 * 1024,
  fonteBytes: 2 * 1024 * 1024,
} as const;

/** Campos opcionais vazios (`""`) significam "não preenchido". */
function opcional<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (valor) => (valor === '' || valor === null ? undefined : valor),
    schema.optional(),
  );
}

function caminhoMidia(padrao: RegExp, mensagem: string) {
  return z
    .string()
    .min(1, 'Envie um arquivo.')
    .refine((v) => v.startsWith(PREFIXO_UPLOADS) && !v.includes('..') && !v.includes('\\'), {
      message: 'O arquivo deve estar na pasta uploads/ (envie pelo painel), ex.: uploads/foto.jpg.',
    })
    .refine((v) => padrao.test(v), { message: mensagem });
}

const telefone = z
  .string()
  .refine((v) => PADROES.telefoneMascara.test(v), { message: MENSAGENS.telefone })
  .refine(
    (v) => {
      const n = somenteDigitos(v).length;
      return n >= 10 && n <= 11;
    },
    { message: MENSAGENS.telefone },
  );

// ---------------------------------------------------------------------------
// Site
// ---------------------------------------------------------------------------

export const contatosSchema = z.strictObject({
  telefone: opcional(telefone),
  whatsapp: opcional(telefone),
  email: opcional(z.email('Informe um e-mail válido, ex.: recepcao@hotel.com.br.')),
  ramal: opcional(z.string().regex(PADROES.ramal, MENSAGENS.ramal)),
});

export const siteSchema = z.strictObject({
  nomeHotel: z
    .string()
    .trim()
    .min(1, 'Informe o nome do hotel.')
    .max(80, 'O nome do hotel deve ter até 80 caracteres.'),
  boasVindas: opcional(
    z.string().max(300, 'A mensagem de boas-vindas deve ter até 300 caracteres.'),
  ),
  logo: caminhoMidia(PADROES.logo, MENSAGENS.logo),
  fotoCapa: opcional(caminhoMidia(PADROES.imagem, MENSAGENS.imagem)),
  informacoesGerais: opcional(
    z.string().max(2000, 'As informações gerais devem ter até 2.000 caracteres.'),
  ),
  rodape: opcional(z.string().max(200, 'O rodapé deve ter até 200 caracteres.')),
  contatos: z.preprocess((v) => v ?? {}, contatosSchema),
  urlPublica: z
    .url('Informe o endereço completo da página, começando com https://.')
    .refine((v) => v.startsWith('https://'), {
      message: 'O endereço da página deve começar com https://.',
    }),
  enderecoDefinitivo: z.boolean(),
});

// ---------------------------------------------------------------------------
// Tema
// ---------------------------------------------------------------------------

const cor = z.string().regex(PADROES.corHex, MENSAGENS.corHex);

export const fonteSchema = z.discriminatedUnion('origem', [
  z.strictObject({
    origem: z.literal('padrao'),
    padrao: z.enum(FONTE_PADRAO_IDS, 'Escolha uma fonte da lista.'),
  }),
  z.strictObject({
    origem: z.literal('propria'),
    nome: z
      .string()
      .trim()
      .min(1, 'Informe o nome da fonte.')
      .max(60, 'O nome da fonte deve ter até 60 caracteres.'),
    arquivo: caminhoMidia(PADROES.fonte, MENSAGENS.fonte),
  }),
]);

export const temaSchema = z.strictObject({
  cores: z.strictObject({
    principal: cor,
    secundaria: cor,
    fundo: cor,
    texto: cor,
    destaque: cor,
  }),
  fontes: z.strictObject({
    titulos: fonteSchema,
    textos: fonteSchema,
  }),
});

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

const preco = z
  .number('Informe o preço em reais, ex.: 12.50.')
  .min(0, 'O preço não pode ser negativo.')
  .max(9999.99, 'O preço deve ser no máximo R$ 9.999,99.')
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, {
    message: 'O preço deve ter no máximo 2 casas decimais.',
  });

export const itemSchema = z.strictObject({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome do item.')
    .max(60, 'O nome do item deve ter até 60 caracteres.'),
  descricao: opcional(z.string().max(500, 'A descrição deve ter até 500 caracteres.')),
  preco,
  foto: opcional(caminhoMidia(PADROES.imagem, MENSAGENS.imagem)),
  etiquetas: z
    .array(z.enum(ETIQUETA_IDS, 'Etiqueta desconhecida.'))
    .default([])
    .refine((lista) => new Set(lista).size === lista.length, {
      message: 'Cada etiqueta só pode ser usada uma vez no item.',
    }),
  visivel: z.boolean().default(true),
});

export const categoriaSchema = z.strictObject({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome da categoria.')
    .max(40, 'O nome da categoria deve ter até 40 caracteres.'),
  icone: z.enum(ICONE_IDS, 'Escolha um ícone da lista.'),
  visivel: z.boolean().default(true),
  itens: z.array(itemSchema).max(80, 'Cada categoria pode ter até 80 itens.').default([]),
});

/** Normaliza nomes para comparação: sem diferenciar maiúsculas nem acentos. */
export function normalizarNome(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export const catalogoSchema = z
  .strictObject({
    categorias: z
      .array(categoriaSchema)
      .max(30, 'O catálogo pode ter até 30 categorias.')
      .default([]),
  })
  .superRefine((catalogo, ctx) => {
    const vistos = new Map<string, number>();
    catalogo.categorias.forEach((categoria, indice) => {
      const chave = normalizarNome(categoria.nome);
      const anterior = vistos.get(chave);
      if (anterior !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['categorias', indice, 'nome'],
          message: `Já existe uma categoria chamada "${catalogo.categorias[anterior]?.nome}". Use outro nome.`,
        });
      } else {
        vistos.set(chave, indice);
      }
    });
  });

export type Site = z.infer<typeof siteSchema>;
export type Contatos = z.infer<typeof contatosSchema>;
export type Tema = z.infer<typeof temaSchema>;
export type Cores = Tema['cores'];
export type Fonte = z.infer<typeof fonteSchema>;
export type Catalogo = z.infer<typeof catalogoSchema>;
export type Categoria = z.infer<typeof categoriaSchema>;
export type Item = z.infer<typeof itemSchema>;

export interface Conteudo {
  site: Site;
  tema: Tema;
  catalogo: Catalogo;
}

export type ArquivoConteudo = 'site' | 'tema' | 'catalogo';

export const NOMES_ARQUIVO: Record<ArquivoConteudo, string> = {
  site: 'site.json',
  tema: 'theme.json',
  catalogo: 'catalog.json',
};

export const SCHEMAS = {
  site: siteSchema,
  tema: temaSchema,
  catalogo: catalogoSchema,
} as const;

/** Formata um caminho de campo do Zod como `categorias[0].itens[2].preco`. */
export function formatarCaminho(caminho: readonly PropertyKey[]): string {
  return caminho.reduce<string>((acc, parte) => {
    if (typeof parte === 'number') return `${acc}[${parte}]`;
    const texto = String(parte);
    return acc ? `${acc}.${texto}` : texto;
  }, '');
}

export interface ErroConteudo {
  arquivo: string;
  campo: string;
  mensagem: string;
}

/** Converte um erro do Zod em lista de erros legíveis, em português. */
export function errosDoZod(erro: z.ZodError, arquivo: string): ErroConteudo[] {
  return erro.issues.map((issue) => ({
    arquivo,
    campo: formatarCaminho(issue.path),
    mensagem: issue.message,
  }));
}

export function descreverErro(erro: ErroConteudo): string {
  return erro.campo
    ? `${erro.arquivo} › ${erro.campo}: ${erro.mensagem}`
    : `${erro.arquivo}: ${erro.mensagem}`;
}
