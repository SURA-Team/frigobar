import type { MouseEvent } from 'react';
import type { CategoriaComSlug } from '../content/derive';
import { IconeCategoria } from './IconeCategoria';
import { rolarParaCategoria } from './rolagem';

/** Atalhos para as categorias; só aparece com mais de uma categoria exibida (FR-005). */
export function CategoryNav({ categorias }: { categorias: CategoriaComSlug[] }) {
  if (categorias.length <= 1) return null;

  function aoClicar(evento: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (rolarParaCategoria(slug)) {
      evento.preventDefault();
      // Atualiza o endereço sem criar entrada no histórico ("voltar" não percorre atalhos).
      history.replaceState(history.state, '', `#cat/${slug}`);
    }
  }

  return (
    <nav className="atalhos" aria-label="Categorias">
      <ul className="atalhos__lista">
        {categorias.map((categoria) => (
          <li key={categoria.slug}>
            <a
              className="atalhos__link"
              href={`#cat/${categoria.slug}`}
              onClick={(e) => aoClicar(e, categoria.slug)}
            >
              <IconeCategoria icone={categoria.icone} tamanho={18} />
              {categoria.nome}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
