import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ehAlcoolico, type ItemComSlug } from '../content/derive';
import { formatarPreco } from '../content/format';
import type { IconeId } from '../icons/registry';
import { Picture } from '../images/Picture';
import { AlcoholNotice } from './AlcoholNotice';
import { IconeCategoria } from './IconeCategoria';
import { TagList } from './TagBadge';

export interface ItemDetailProps {
  /** Item aberto; `null` fecha o diálogo. */
  item: ItemComSlug | null;
  iconeCategoria: IconeId;
  /** Pedido de fechamento (botão Fechar, Esc). Quem controla o histórico decide como fechar. */
  onFechar: () => void;
}

/** Detalhe do item em <dialog> nativo (FR-004b). O histórico é controlado por `useItemAberto`. */
export function ItemDetail({ item, iconeCategoria, onFechar }: ItemDetailProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (item && !dialogo.open) {
      // jsdom não implementa showModal; o atributo `open` mantém os testes de componente.
      if (typeof dialogo.showModal === 'function') dialogo.showModal();
      else dialogo.setAttribute('open', '');
    } else if (!item && dialogo.open) {
      if (typeof dialogo.close === 'function') dialogo.close();
      else dialogo.removeAttribute('open');
    }
  }, [item]);

  const idTitulo = 'detalhe-titulo';
  return (
    <dialog
      ref={ref}
      className="detalhe"
      aria-labelledby={item ? idTitulo : undefined}
      onCancel={(e) => {
        // Esc: em vez de fechar direto, segue o mesmo caminho do botão (volta no histórico).
        e.preventDefault();
        onFechar();
      }}
      onClose={() => {
        // O navegador pode fechar mesmo com preventDefault (Esc repetido); sincroniza o estado.
        if (item) onFechar();
      }}
    >
      {item && (
        <>
          {item.foto ? (
            <Picture
              src={item.foto}
              alt={item.nome}
              className="detalhe__foto"
              sizes="(max-width: 560px) 100vw, 560px"
              prioridade
            />
          ) : (
            <div className="detalhe__sem-foto" aria-hidden="true">
              <IconeCategoria icone={iconeCategoria} tamanho={64} />
            </div>
          )}
          <div className="detalhe__corpo">
            <div className="detalhe__topo">
              <h2 id={idTitulo} className="detalhe__nome">
                {item.nome}
              </h2>
              <span className="preco">{formatarPreco(item.preco)}</span>
            </div>
            <TagList etiquetas={item.etiquetas} />
            {item.descricao && <p className="detalhe__descricao">{item.descricao}</p>}
            {ehAlcoolico(item) && <AlcoholNotice />}
            <button type="button" className="botao botao--fechar" onClick={onFechar} autoFocus>
              <X size={18} aria-hidden="true" focusable="false" />
              Fechar
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
