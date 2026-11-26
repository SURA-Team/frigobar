/** Valores derivados do catálogo (não armazenados): slugs, filtros de visibilidade e álcool. */
import type { Catalogo, Categoria, Item } from './schema';

export function slugificar(texto: string): string {
  const slug = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'item';
}

export interface ItemComSlug extends Item {
  slug: string;
}

export interface CategoriaComSlug extends Omit<Categoria, 'itens'> {
  slug: string;
  itens: ItemComSlug[];
}

function criarGeradorDeSlug() {
  const usados = new Map<string, number>();
  return (texto: string): string => {
    const base = slugificar(texto);
    const contagem = (usados.get(base) ?? 0) + 1;
    usados.set(base, contagem);
    return contagem === 1 ? base : `${base}-${contagem}`;
  };
}

/**
 * Atribui slugs a categorias e itens. Itens repetidos no catálogo inteiro recebem sufixos
 * `-2`, `-3`…, na ordem do catálogo (inclusive itens ocultos, para os links não mudarem
 * quando um item é mostrado ou ocultado).
 */
export function atribuirSlugs(catalogo: Catalogo): CategoriaComSlug[] {
  const slugCategoria = criarGeradorDeSlug();
  const slugItem = criarGeradorDeSlug();
  return catalogo.categorias.map((categoria) => ({
    ...categoria,
    slug: slugCategoria(categoria.nome),
    itens: categoria.itens.map((item) => ({ ...item, slug: slugItem(item.nome) })),
  }));
}

/** Categorias exibidas ao hóspede: visíveis e com ao menos um item visível (FR-006). */
export function categoriasExibidas(categorias: CategoriaComSlug[]): CategoriaComSlug[] {
  return categorias
    .filter((categoria) => categoria.visivel)
    .map((categoria) => ({ ...categoria, itens: categoria.itens.filter((item) => item.visivel) }))
    .filter((categoria) => categoria.itens.length > 0);
}

/** A categoria tem algum item visível com a etiqueta "Alcoólico"? */
export function temAlcoolico(categoria: Pick<Categoria, 'itens'>): boolean {
  return categoria.itens.some((item) => item.visivel && item.etiquetas.includes('alcoolico'));
}

export function ehAlcoolico(item: Pick<Item, 'etiquetas'>): boolean {
  return item.etiquetas.includes('alcoolico');
}
