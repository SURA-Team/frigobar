/** Cálculo de contraste WCAG 2.1 e regras de bloqueio do tema (research R7, FR-018, SC-005). */
import type { Cores } from '../content/schema';

function canalLinear(valor: number): number {
  const c = valor / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function paraRgb(hex: string): [number, number, number] {
  const limpo = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) {
    throw new Error(`Cor inválida: ${hex}`);
  }
  return [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16)) as [number, number, number];
}

export function luminanciaRelativa(hex: string): number {
  const [r, g, b] = paraRgb(hex).map(canalLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function razaoContraste(a: string, b: string): number {
  const la = luminanciaRelativa(a);
  const lb = luminanciaRelativa(b);
  const [claro, escuro] = la > lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (escuro + 0.05);
}

export const PRETO = '#000000';
export const BRANCO = '#FFFFFF';

/** Preto ou branco, o que tiver maior contraste sobre a cor dada. */
export function melhorTextoSobre(hex: string): typeof PRETO | typeof BRANCO {
  return razaoContraste(hex, PRETO) >= razaoContraste(hex, BRANCO) ? PRETO : BRANCO;
}

export type RegraContraste =
  'texto-fundo' | 'principal-fundo' | 'sobre-principal' | 'sobre-destaque';

export interface VerificacaoContraste {
  regra: RegraContraste;
  descricao: string;
  razao: number;
  minimo: number;
  aprovado: boolean;
  /** Mensagem em português quando reprovado. */
  mensagem?: string;
}

function formatarRazao(razao: number): string {
  return `${razao.toFixed(2).replace('.', ',')}:1`;
}

/** Calcula as 4 verificações de contraste do tema, aprovadas ou não. */
export function verificarContrasteTema(cores: Cores): VerificacaoContraste[] {
  const regras: Array<Omit<VerificacaoContraste, 'aprovado' | 'mensagem'> & { dica: string }> = [
    {
      regra: 'texto-fundo',
      descricao: 'Texto sobre o fundo',
      razao: razaoContraste(cores.texto, cores.fundo),
      minimo: 4.5,
      dica: 'Escureça o texto ou clareie o fundo (ou o contrário).',
    },
    {
      regra: 'principal-fundo',
      descricao: 'Cor principal sobre o fundo (títulos e botões)',
      razao: razaoContraste(cores.principal, cores.fundo),
      minimo: 3,
      dica: 'Escolha uma cor principal mais distante da cor de fundo.',
    },
    {
      regra: 'sobre-principal',
      descricao: 'Texto automático (preto ou branco) sobre a cor principal',
      razao: razaoContraste(melhorTextoSobre(cores.principal), cores.principal),
      minimo: 4.5,
      dica: 'Use uma cor principal mais escura ou mais clara.',
    },
    {
      regra: 'sobre-destaque',
      descricao: 'Texto automático (preto ou branco) sobre a cor de destaque',
      razao: razaoContraste(melhorTextoSobre(cores.destaque), cores.destaque),
      minimo: 4.5,
      dica: 'Use uma cor de destaque mais escura ou mais clara.',
    },
  ];

  return regras.map(({ dica, ...r }) => {
    const aprovado = r.razao >= r.minimo;
    return {
      ...r,
      aprovado,
      mensagem: aprovado
        ? undefined
        : `${r.descricao}: contraste ${formatarRazao(r.razao)}, mínimo ${formatarRazao(r.minimo)}. ${dica}`,
    };
  });
}

/** Retorna só as violações (lista vazia = tema aprovado). */
export function validarContrasteTema(cores: Cores): VerificacaoContraste[] {
  return verificarContrasteTema(cores).filter((v) => !v.aprovado);
}
