import { ICONES, ICONE_PADRAO, type IconeId } from '../icons/registry';

export function IconeCategoria({ icone, tamanho = 20 }: { icone: IconeId; tamanho?: number }) {
  const Icone = (ICONES[icone] ?? ICONES[ICONE_PADRAO]).componente;
  return <Icone size={tamanho} aria-hidden="true" focusable="false" />;
}
