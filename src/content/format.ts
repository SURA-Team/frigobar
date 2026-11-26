import { somenteDigitos } from './schema';

export { somenteDigitos };

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
// Espaço não separável (U+00A0) e espaço estreito (U+202F) que o Intl usa após "R$".
const ESPACOS_ESPECIAIS = new RegExp(`[${String.fromCharCode(0xa0, 0x202f)}]`, 'g');

/** Preço em reais no formato brasileiro; zero vira "Cortesia" (FR-004). */
export function formatarPreco(preco: number): string {
  if (preco === 0) return 'Cortesia';
  return moeda.format(preco).replace(ESPACOS_ESPECIAIS, ' ');
}

export function linkTelefone(telefone: string): string {
  return `tel:+55${somenteDigitos(telefone)}`;
}

export function linkWhatsapp(numero: string): string {
  return `https://wa.me/55${somenteDigitos(numero)}`;
}

export function linkEmail(email: string): string {
  return `mailto:${email.trim()}`;
}
