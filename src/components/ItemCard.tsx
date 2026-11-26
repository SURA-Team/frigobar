import type { ItemComSlug } from '../content/derive';
import { formatarPreco } from '../content/format';
import type { IconeId } from '../icons/registry';
import { Picture } from '../images/Picture';
import { IconeCategoria } from './IconeCategoria';
import { TagList } from './TagBadge';

export interface ItemCardProps {
  item: ItemComSlug;
  iconeCategoria: IconeId;
  onAbrir: (slug: string, origem: HTMLElement) => void;
}

/** Card compacto: foto pequena, nome, preço, etiquetas e descrição em até 2 linhas (FR-004). */
export function ItemCard({ item, iconeCategoria, onAbrir }: ItemCardProps) {
  const idDescricao = `desc-${item.slug}`;
  return (
    <button
      type="button"
      className="card"
      data-slug={item.slug}
      aria-haspopup="dialog"
      aria-describedby={item.descricao ? idDescricao : undefined}
      onClick={(e) => onAbrir(item.slug, e.currentTarget)}
    >
      {item.foto ? (
        // O nome já está no card: a miniatura é decorativa para leitores de tela.
        <Picture src={item.foto} alt="" className="card__foto" sizes="72px" />
      ) : (
        <span className="card__sem-foto" data-testid="sem-foto">
          <IconeCategoria icone={iconeCategoria} tamanho={28} />
        </span>
      )}
      <span className="card__corpo">
        <span className="card__topo">
          <span className="card__nome">{item.nome}</span>
          <span className="preco">{formatarPreco(item.preco)}</span>
        </span>
        <TagList etiquetas={item.etiquetas} inline />
        {item.descricao && (
          <span id={idDescricao} className="card__descricao">
            {item.descricao}
          </span>
        )}
      </span>
    </button>
  );
}
