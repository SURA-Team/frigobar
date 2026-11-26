import { describe, expect, it } from 'vitest';
import { formatarPreco, linkEmail, linkTelefone, linkWhatsapp } from '../../src/content/format';

describe('formatação', () => {
  it('formata preços em reais', () => {
    expect(formatarPreco(12.5)).toBe('R$ 12,50');
    expect(formatarPreco(14.5)).toBe('R$ 14,50');
    expect(formatarPreco(1234.5)).toBe('R$ 1.234,50');
    expect(formatarPreco(0)).toBe('Cortesia');
  });

  it('gera links de contato a partir de números com máscara', () => {
    expect(linkTelefone('(51) 3333-4444')).toBe('tel:+555133334444');
    expect(linkWhatsapp('(51) 99999-8888')).toBe('https://wa.me/5551999998888');
    expect(linkEmail(' recepcao@hotel.com.br ')).toBe('mailto:recepcao@hotel.com.br');
  });
});
