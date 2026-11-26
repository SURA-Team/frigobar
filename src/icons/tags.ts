import { MilkOff, Sparkles, Vegan, WheatOff, Wine, type LucideIcon } from 'lucide-react';

/** Etiquetas fixas definidas pelo sistema (FR-004a). Criar etiquetas novas está fora do escopo. */
export const ETIQUETA_IDS = ['alcoolico', 'sem-gluten', 'sem-lactose', 'vegano', 'novo'] as const;

export type EtiquetaId = (typeof ETIQUETA_IDS)[number];

export interface DefinicaoEtiqueta {
  rotulo: string;
  icone: LucideIcon;
}

export const ETIQUETAS: Record<EtiquetaId, DefinicaoEtiqueta> = {
  alcoolico: { rotulo: 'Alcoólico', icone: Wine },
  'sem-gluten': { rotulo: 'Sem glúten', icone: WheatOff },
  'sem-lactose': { rotulo: 'Sem lactose', icone: MilkOff },
  vegano: { rotulo: 'Vegano', icone: Vegan },
  novo: { rotulo: 'Novo', icone: Sparkles },
};

/** Aviso legal fixo exibido para itens alcoólicos (não editável). */
export const AVISO_ALCOOL = 'Venda proibida para menores de 18 anos. Beba com moderação.';
