import { describe, expect, it } from 'vitest';
import { catalogoSchema, siteSchema, temaSchema } from '../../src/content/schema';
import { lerFixture } from './helpers';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function catalogoComItem(item: Json): Json {
  return {
    categorias: [{ nome: 'Bebidas', icone: 'cup-soda', visivel: true, itens: [item] }],
  };
}

const itemValido = { nome: 'Água', preco: 6, etiquetas: [], visivel: true };

function mensagens(resultado: { success: boolean; error?: { issues: { message: string }[] } }) {
  return resultado.error?.issues.map((i) => i.message) ?? [];
}

describe('schema do conteúdo', () => {
  it('aceita o conteúdo de teste', () => {
    expect(siteSchema.safeParse(lerFixture('site.json')).success).toBe(true);
    expect(temaSchema.safeParse(lerFixture('theme.json')).success).toBe(true);
    expect(catalogoSchema.safeParse(lerFixture('catalog.json')).success).toBe(true);
  });

  it.each([
    ['nome de item vazio', { ...itemValido, nome: '' }, 'Informe o nome do item.'],
    ['preço negativo', { ...itemValido, preco: -1 }, 'O preço não pode ser negativo.'],
    [
      'preço com 3 casas',
      { ...itemValido, preco: 1.234 },
      'O preço deve ter no máximo 2 casas decimais.',
    ],
    [
      'preço acima do limite',
      { ...itemValido, preco: 10000 },
      'O preço deve ser no máximo R$ 9.999,99.',
    ],
    ['etiqueta desconhecida', { ...itemValido, etiquetas: ['picante'] }, 'Etiqueta desconhecida.'],
    [
      'etiqueta repetida',
      { ...itemValido, etiquetas: ['novo', 'novo'] },
      'Cada etiqueta só pode ser usada uma vez no item.',
    ],
    ['foto .gif', { ...itemValido, foto: 'uploads/a.gif' }, 'Use imagem JPEG, PNG ou WebP'],
    ['foto .SVG', { ...itemValido, foto: 'uploads/a.SVG' }, 'Use imagem JPEG, PNG ou WebP'],
    [
      'foto fora de uploads/',
      { ...itemValido, foto: '/etc/a.jpg' },
      'O arquivo deve estar na pasta uploads/',
    ],
  ])('rejeita %s', (_caso, item, esperado) => {
    const msgs = mensagens(catalogoSchema.safeParse(catalogoComItem(item)));
    expect(msgs.some((m) => m.startsWith(esperado))).toBe(true);
  });

  it('aceita preço com 2 casas e foto .JPG em maiúsculas', () => {
    const resultado = catalogoSchema.safeParse(
      catalogoComItem({ ...itemValido, preco: 12.5, foto: 'uploads/FOTO.JPG' }),
    );
    expect(resultado.success).toBe(true);
  });

  it('rejeita categoria com nome duplicado sem diferenciar maiúsculas/acentos', () => {
    const resultado = catalogoSchema.safeParse({
      categorias: [
        { nome: 'Bebidas', icone: 'cup-soda', itens: [] },
        { nome: 'bebidas', icone: 'beer', itens: [] },
        { nome: 'Doces', icone: 'candy', itens: [] },
        { nome: 'DOCÊS', icone: 'candy', itens: [] },
      ],
    });
    expect(resultado.success).toBe(false);
    const caminhos = resultado.error!.issues.map((i) => i.path.join('.'));
    expect(caminhos).toEqual(['categorias.1.nome', 'categorias.3.nome']);
    expect(resultado.error!.issues[0]!.message).toContain(
      'Já existe uma categoria chamada "Bebidas"',
    );
  });

  it('rejeita campo desconhecido', () => {
    const site = { ...lerFixture('site.json'), corFavorita: 'azul' };
    expect(siteSchema.safeParse(site).success).toBe(false);
  });

  it('rejeita cor fora de #RRGGBB', () => {
    const tema = lerFixture<Json>('theme.json');
    tema.cores.fundo = '#FFF';
    expect(mensagens(temaSchema.safeParse(tema))).toContain(
      'Use uma cor no formato #RRGGBB, ex.: #1F3A5F.',
    );
  });

  it('valida telefone, WhatsApp e ramal', () => {
    const base = lerFixture<Json>('site.json');
    const comContatos = (contatos: Json) => siteSchema.safeParse({ ...base, contatos });
    expect(comContatos({ telefone: '(51) 3333-444' }).success).toBe(false); // 9 dígitos
    expect(comContatos({ whatsapp: '51 99999-8888' }).success).toBe(true); // 11 dígitos
    expect(comContatos({ telefone: 'ligue já' }).success).toBe(false);
    expect(comContatos({ ramal: '1234567' }).success).toBe(false); // 7 dígitos
    expect(comContatos({ ramal: '9' }).success).toBe(true);
    expect(comContatos({ email: 'recepcao@' }).success).toBe(false);
  });

  it('trata opcionais vazios como ausentes', () => {
    const site = {
      ...lerFixture('site.json'),
      boasVindas: '',
      fotoCapa: '',
      contatos: { email: '' },
    };
    const resultado = siteSchema.safeParse(site);
    expect(resultado.success).toBe(true);
    expect(resultado.data?.fotoCapa).toBeUndefined();
    expect(resultado.data?.contatos.email).toBeUndefined();
  });

  it('exige https:// no endereço público', () => {
    const site = { ...lerFixture('site.json'), urlPublica: 'http://exemplo.com/' };
    expect(siteSchema.safeParse(site).success).toBe(false);
  });

  it('valida fontes padrão e próprias', () => {
    const tema = lerFixture<Json>('theme.json');
    const comTitulo = (titulos: Json) =>
      temaSchema.safeParse({ ...tema, fontes: { ...tema.fontes, titulos } });
    expect(comTitulo({ origem: 'propria', nome: 'Marca' }).success).toBe(false); // sem arquivo
    expect(
      comTitulo({ origem: 'propria', nome: 'Marca', arquivo: 'uploads/fonts/m.ttc' }).success,
    ).toBe(false);
    expect(
      comTitulo({ origem: 'propria', nome: 'Marca', arquivo: 'uploads/fonts/m.woff2' }).success,
    ).toBe(true);
    expect(comTitulo({ origem: 'padrao', padrao: 'comic-sans' }).success).toBe(false);
  });

  it('aplica padrões de visibilidade e etiquetas', () => {
    const resultado = catalogoSchema.parse({
      categorias: [{ nome: 'Bebidas', icone: 'cup-soda', itens: [{ nome: 'Água', preco: 6 }] }],
    });
    expect(resultado.categorias[0]!.visivel).toBe(true);
    expect(resultado.categorias[0]!.itens[0]).toMatchObject({ visivel: true, etiquetas: [] });
  });
});
