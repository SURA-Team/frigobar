import { describe, expect, it } from 'vitest';
import {
  melhorTextoSobre,
  razaoContraste,
  validarContrasteTema,
  verificarContrasteTema,
} from '../../src/theme/contrast';
import { lerFixture } from './helpers';
import type { Tema } from '../../src/content/schema';

const coresOk = lerFixture<Tema>('theme.json').cores;

describe('contraste WCAG', () => {
  it('calcula pares conhecidos', () => {
    expect(razaoContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(razaoContraste('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(razaoContraste('#999999', '#FFFFFF')).toBeLessThan(4.5);
  });

  it('escolhe preto ou branco com maior contraste', () => {
    expect(melhorTextoSobre('#1F3A5F')).toBe('#FFFFFF');
    expect(melhorTextoSobre('#C8A96A')).toBe('#000000');
  });

  it('aprova a paleta de teste', () => {
    expect(validarContrasteTema(coresOk)).toEqual([]);
    expect(verificarContrasteTema(coresOk)).toHaveLength(4);
  });

  it('reprova texto #999999 sobre fundo #FFFFFF com mensagem em português', () => {
    const violacoes = validarContrasteTema({ ...coresOk, texto: '#999999' });
    expect(violacoes.map((v) => v.regra)).toEqual(['texto-fundo']);
    expect(violacoes[0]!.mensagem).toMatch(/^Texto sobre o fundo: contraste 2,85:1, mínimo 4,50:1/);
  });

  it('gera mensagem própria para cada regra reprovada', () => {
    const violacoes = validarContrasteTema({
      ...coresOk,
      principal: '#7A7A7A',
      fundo: '#808080',
      texto: '#8A8A8A',
    });
    expect(violacoes.map((v) => v.regra).sort()).toEqual(['principal-fundo', 'texto-fundo']);
    expect(violacoes[0]!.mensagem).not.toBe(violacoes[1]!.mensagem);
    expect(violacoes.find((v) => v.regra === 'principal-fundo')!.mensagem).toMatch(
      /^Cor principal sobre o fundo .*: contraste .* mínimo 3,00:1/,
    );
  });

  it('texto automático (preto ou branco) sempre atinge 4,5:1 sobre qualquer cor', () => {
    // O pior caso teórico é ~4,58:1, por isso as regras "sobre-principal" e "sobre-destaque"
    // funcionam como garantia: nenhuma cor escolhida pelo administrador as reprova.
    for (let v = 0; v <= 255; v += 1) {
      const hex = `#${v.toString(16).padStart(2, '0').repeat(3)}`;
      expect(razaoContraste(melhorTextoSobre(hex), hex)).toBeGreaterThanOrEqual(4.5);
    }
    const regras = verificarContrasteTema({
      ...coresOk,
      principal: '#767676',
      destaque: '#7F7F7F',
    });
    expect(regras.filter((r) => r.regra.startsWith('sobre-')).every((r) => r.aprovado)).toBe(true);
  });
});
