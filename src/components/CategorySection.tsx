import { temAlcoolico, type CategoriaComSlug } from '../content/derive';
import { AlcoholNotice } from './AlcoholNotice';
import { IconeCategoria } from './IconeCategoria';
import { ItemCard } from './ItemCard';
import { idCategoria } from './rolagem';

export interface CategorySectionProps {
  categoria: CategoriaComSlug;
  onAbrir: (slug: string, origem: HTMLElement) => void;
}

export function CategorySection({ categoria, onAbrir }: CategorySectionProps) {
  const idTitulo = `titulo-${categoria.slug}`;
  return (
    // id com "/" segue o contrato public-urls.md; localize com getElementById.
    <section id={idCategoria(categoria.slug)} className="categoria" aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className="categoria__titulo">
        <IconeCategoria icone={categoria.icone} tamanho={22} />
        {categoria.nome}
      </h2>
      {temAlcoolico(categoria) && <AlcoholNotice />}
      <ul className="categoria__itens">
        {categoria.itens.map((item) => (
          <li key={item.slug}>
            <ItemCard item={item} iconeCategoria={categoria.icone} onAbrir={onAbrir} />
          </li>
        ))}
      </ul>
    </section>
  );
}
