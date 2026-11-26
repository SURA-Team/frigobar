import { ETIQUETAS, type EtiquetaId } from '../icons/tags';

export function TagBadge({ etiqueta, inline = false }: { etiqueta: EtiquetaId; inline?: boolean }) {
  const { rotulo, icone: Icone } = ETIQUETAS[etiqueta];
  const Tag = inline ? 'span' : 'li';
  return (
    <Tag className="etiqueta">
      <Icone size={14} aria-hidden="true" focusable="false" />
      {rotulo}
    </Tag>
  );
}

/**
 * Etiquetas do item. `inline` usa apenas <span> (dentro do card, que é um <button> e só
 * aceita conteúdo inline); fora dele, usa lista.
 */
export function TagList({
  etiquetas,
  inline = false,
}: {
  etiquetas: EtiquetaId[];
  inline?: boolean;
}) {
  if (etiquetas.length === 0) return null;
  const badges = etiquetas.map((etiqueta) => (
    <TagBadge key={etiqueta} etiqueta={etiqueta} inline={inline} />
  ));
  return inline ? (
    <span className="etiquetas">{badges}</span>
  ) : (
    <ul className="etiquetas" aria-label="Etiquetas">
      {badges}
    </ul>
  );
}
