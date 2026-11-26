/** Validações puras dos widgets (testáveis sem o Decap). */
import { LIMITES, MENSAGENS, PADROES } from '../../content/schema';
import { FONTE_PADRAO_IDS, type FontePadraoId } from '../../theme/fonts';

export interface ValorFonte {
  origem?: 'padrao' | 'propria';
  padrao?: string;
  nome?: string;
  arquivo?: string;
}

/**
 * Valida a escolha de fonte. `tamanhoBytes` é o tamanho do arquivo enviado (quando o navegador
 * o conhece, isto é, antes de publicar); o limite de 2 MB também é conferido pelo CI.
 * Retorna a mensagem de erro em português ou `null`.
 */
export function validarFonte(valor: ValorFonte, tamanhoBytes?: number): string | null {
  if (valor.origem === 'padrao') {
    return FONTE_PADRAO_IDS.includes(valor.padrao as FontePadraoId)
      ? null
      : 'Escolha uma fonte da lista.';
  }
  if (valor.origem === 'propria') {
    const nome = valor.nome?.trim() ?? '';
    if (nome.length === 0) return 'Informe o nome da fonte.';
    if (nome.length > 60) return 'O nome da fonte deve ter até 60 caracteres.';
    if (!valor.arquivo) return 'Envie o arquivo da fonte.';
    if (!PADROES.fonte.test(valor.arquivo)) return MENSAGENS.fonte;
    if (tamanhoBytes !== undefined && tamanhoBytes > LIMITES.fonteBytes) {
      return 'O arquivo da fonte deve ter até 2 MB.';
    }
    return null;
  }
  return 'Escolha "Fonte da lista" ou "Fonte própria".';
}
