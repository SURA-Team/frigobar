import { describe, expect, it } from 'vitest';
import {
  atribuirSlugs,
  categoriasExibidas,
  slugificar,
  temAlcoolico,
} from '../../src/content/derive';
import { catalogoSchema } from '../../src/content/schema';

const catalogo = catalogoSchema.parse({
  categorias: [
    {
      nome: 'Bebidas & Cia',
      icone: 'cup-soda',
      itens: [
        { nome: 'Água Mineral', preco: 6 },
        { nome: 'Cerveja', preco: 14.5, etiquetas: ['alcoolico'], visivel: false },
      ],
    },
    { nome: 'Ocultos', icone: 'package', visivel: false, itens: [{ nome: 'X', preco: 1 }] },
    {
      nome: 'Vazia',
      icone: 'package',
      itens: [{ nome: 'Água mineral', preco: 5, visivel: false }],
    },
    { nome: 'Doces', icone: 'candy', itens: [{ nome: 'Água mineral', preco: 5 }] },
  ],
});

describe('derivados do catálogo', () => {
  it('gera slugs sem acentos nem símbolos', () => {
    expect(slugificar('Água Mineral 500 ml')).toBe('agua-mineral-500-ml');
    expect(slugificar('Bebidas & Cia')).toBe('bebidas-cia');
    expect(slugificar('!!!')).toBe('item');
  });

  it('desambigua nomes repetidos no catálogo inteiro', () => {
    const categorias = atribuirSlugs(catalogo);
    expect(categorias[0]!.slug).toBe('bebidas-cia');
    expect(categorias[0]!.itens[0]!.slug).toBe('agua-mineral');
    expect(categorias[2]!.itens[0]!.slug).toBe('agua-mineral-2');
    expect(categorias[3]!.itens[0]!.slug).toBe('agua-mineral-3');
  });

  it('exibe só categorias visíveis com itens visíveis', () => {
    const exibidas = categoriasExibidas(atribuirSlugs(catalogo));
    expect(exibidas.map((c) => c.nome)).toEqual(['Bebidas & Cia', 'Doces']);
    expect(exibidas[0]!.itens.map((i) => i.nome)).toEqual(['Água Mineral']);
  });

  it('ignora item alcoólico oculto', () => {
    expect(temAlcoolico(catalogo.categorias[0]!)).toBe(false);
    const comCervejaVisivel = {
      itens: catalogo.categorias[0]!.itens.map((i) => ({ ...i, visivel: true })),
    };
    expect(temAlcoolico(comCervejaVisivel)).toBe(true);
  });
});
