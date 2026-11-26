/** Geração do QR code da página pública (research R12, FR-023). */
import QRCode from 'qrcode';

const OPCOES = { errorCorrectionLevel: 'M', margin: 4 } as const;

export const LARGURA_PNG = 2048;

export async function gerarSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...OPCOES, type: 'svg' });
}

export async function gerarPng(url: string): Promise<string> {
  return QRCode.toDataURL(url, { ...OPCOES, type: 'image/png', width: LARGURA_PNG });
}

/** Nome de arquivo legível a partir do endereço, ex.: `qrcode-sura-team-github-io-frigobar`. */
export function nomeArquivo(url: string): string {
  const base = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `qrcode-${base || 'frigobar'}`;
}
