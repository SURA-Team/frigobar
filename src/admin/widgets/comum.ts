/** Utilitários compartilhados pelos widgets customizados do Decap. */
import type { CSSProperties } from 'react';

/** O Decap entrega valores de objeto como Immutable Map; após onChange, como objeto comum. */
export function paraObjeto<T extends object>(valor: unknown): Partial<T> {
  if (valor && typeof (valor as { toJS?: unknown }).toJS === 'function') {
    return (valor as { toJS: () => Partial<T> }).toJS();
  }
  return valor && typeof valor === 'object' ? (valor as Partial<T>) : {};
}

/** Resposta de erro no formato que o Decap exibe sob o campo. */
export function erroDecap(mensagem: string) {
  return { error: { type: 'CUSTOM', message: mensagem } };
}

export interface PropsWidget<V = unknown> {
  value?: V;
  onChange: (valor: unknown) => void;
  forID?: string;
  classNameWrapper?: string;
  field?: {
    get: (chave: string, padrao?: unknown) => unknown;
    getIn?: (caminho: string[]) => unknown;
  };
  setActiveStyle?: () => void;
  setInactiveStyle?: () => void;
}

export const estilos = {
  caixa: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 12,
    border: '2px solid #dfdfe3',
    borderRadius: 5,
    background: '#fff',
  } satisfies CSSProperties,
  linha: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  } satisfies CSSProperties,
  rotulo: {
    minWidth: 110,
    fontSize: 13,
    fontWeight: 600,
    color: '#313d3e',
  } satisfies CSSProperties,
  input: {
    padding: '6px 8px',
    border: '1px solid #c8ccd0',
    borderRadius: 4,
    font: 'inherit',
    fontSize: 14,
  } satisfies CSSProperties,
  dica: { fontSize: 12, color: '#5b6770', margin: 0 } satisfies CSSProperties,
} as const;
