import { describe, expect, it } from 'vitest';
import {
  campoAmigavel,
  errosDoRascunho,
  mesclarConteudo,
} from '../../../src/admin/preview/mesclarConteudo';
import { conteudoPublicado } from '../../../src/content/load';
import { lerFixture } from '../helpers';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

describe('mesclarConteudo', () => {
  it('o rascunho substitui só o arquivo em edição', () => {
    const rascunho = { categorias: [{ nome: 'Novidades', icone: 'star', itens: [] }] };
    const resultado = mesclarConteudo(conteudoPublicado, rascunho, 'catalogo');
    expect(resultado.catalogo.categorias.map((c) => c.nome)).toEqual(['Novidades']);
    expect(resultado.site).toBe(conteudoPublicado.site);
    expect(resultado.tema).toBe(conteudoPublicado.tema);

    const tema = lerFixture<Json>('theme.json');
    tema.cores.principal = '#7A1F1F';
    const comTema = mesclarConteudo(conteudoPublicado, tema, 'tema');
    expect(comTema.tema.cores.principal).toBe('#7A1F1F');
    expect(comTema.catalogo).toBe(conteudoPublicado.catalogo);
  });

  it('dados incompletos não quebram a renderização', () => {
    const rascunho = {
      categorias: [
        {
          nome: '',
          icone: 'inexistente',
          itens: [{ nome: 'Novo item', preco: '', etiquetas: ['picante', 'novo', 'novo'] }, null],
        },
      ],
    };
    const { catalogo } = mesclarConteudo(conteudoPublicado, rascunho, 'catalogo');
    const categoria = catalogo.categorias[0]!;
    expect(categoria).toMatchObject({ nome: '', icone: 'package', visivel: true });
    expect(categoria.itens).toEqual([
      {
        nome: 'Novo item',
        descricao: undefined,
        preco: 0,
        foto: undefined,
        etiquetas: ['novo'],
        visivel: true,
      },
    ]);

    const tema = mesclarConteudo(conteudoPublicado, { cores: { fundo: '#FFF' } }, 'tema').tema;
    expect(tema.cores.fundo).toBe(conteudoPublicado.tema.cores.fundo);
    expect(tema.fontes).toEqual(conteudoPublicado.tema.fontes);

    const site = mesclarConteudo(conteudoPublicado, undefined, 'site').site;
    expect(site.logo).toBe(conteudoPublicado.site.logo);
  });
});

describe('errosDoRascunho', () => {
  it('lista vazia para o conteúdo de teste', () => {
    expect(errosDoRascunho('catalogo', lerFixture('catalog.json'))).toEqual([]);
    expect(errosDoRascunho('tema', lerFixture('theme.json'))).toEqual([]);
    expect(errosDoRascunho('site', lerFixture('site.json'))).toEqual([]);
  });

  it('acusa nome de categoria repetido e campo obrigatório vazio', () => {
    const catalogo = lerFixture<Json>('catalog.json');
    catalogo.categorias[1].nome = 'bebidas';
    catalogo.categorias[2].itens[0].nome = '';
    const erros = errosDoRascunho('catalogo', catalogo);
    expect(erros.map((e) => e.campo)).toEqual([
      'categorias[2].itens[0].nome',
      'categorias[1].nome',
    ]);
    expect(erros[1]!.mensagem).toContain('Já existe uma categoria chamada "Bebidas"');
  });

  it('acusa violação de contraste', () => {
    const tema = lerFixture<Json>('theme.json');
    tema.cores.texto = '#999999';
    const erros = errosDoRascunho('tema', tema);
    expect(erros).toHaveLength(1);
    expect(erros[0]!.mensagem).toContain('Texto sobre o fundo');
  });

  it('descreve o campo de forma amigável para o administrador', () => {
    expect(campoAmigavel('categorias[1].itens[0].preco')).toBe('Categoria 2 › item 1 › preço');
    expect(campoAmigavel('contatos.whatsapp')).toBe('Contatos › WhatsApp');
  });
});
