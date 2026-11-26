import { describe, expect, it } from 'vitest';
import {
  cssFontePropria,
  pilhaFontePadrao,
  registrarFontePropria,
  urlDoConteudo,
} from '../../src/theme/fonts';
import { pilhaFonte, temaParaVariaveisCss } from '../../src/theme/tokens';
import type { Tema } from '../../src/content/schema';
import { lerFixture } from './helpers';

describe('fontes', () => {
  it('fonte própria gera @font-face com swap, URL com base path e formato pela extensão', () => {
    const css = cssFontePropria({ nome: 'Marca Sans', arquivo: 'uploads/fonts/marca.woff2' });
    expect(css).toContain('font-family: "Marca Sans";');
    expect(css).toContain(
      `src: url("${import.meta.env.BASE_URL}uploads/fonts/marca.woff2") format("woff2");`,
    );
    expect(css).toContain('font-display: swap;');
    expect(cssFontePropria({ nome: 'X', arquivo: 'uploads/x.ttf' })).toContain(
      'format("truetype")',
    );
    expect(cssFontePropria({ nome: 'X', arquivo: 'uploads/x.otf' })).toContain(
      'format("opentype")',
    );
  });

  it('URL do conteúdo respeita o base path e mantém blob/absolutas', () => {
    expect(urlDoConteudo('uploads/a.woff', '/frigobar/')).toBe('/frigobar/uploads/a.woff');
    expect(urlDoConteudo('blob:http://x/1', '/frigobar/')).toBe('blob:http://x/1');
  });

  it('registra a fonte própria no documento e devolve pilha com fallback do sistema', () => {
    const pilha = registrarFontePropria({ nome: 'Marca', arquivo: 'uploads/m.woff2' });
    expect(pilha).toBe('"Marca", system-ui, sans-serif');
    const estilos = document.head.querySelectorAll('style[data-fonte-propria="Marca"]');
    expect(estilos).toHaveLength(1);
    registrarFontePropria({ nome: 'Marca', arquivo: 'uploads/m2.woff2' });
    expect(document.head.querySelectorAll('style[data-fonte-propria="Marca"]')).toHaveLength(1);
    expect(estilos[0]!.textContent).toContain('m2.woff2');
  });

  it('fonte padrão resolve família e fallback corretos', () => {
    expect(pilhaFontePadrao('inter')).toBe('"Inter", system-ui, sans-serif');
    expect(pilhaFontePadrao('playfair-display')).toBe('"Playfair Display", Georgia, serif');
    expect(pilhaFonte({ origem: 'propria', nome: 'Marca', arquivo: 'uploads/m.woff2' })).toBe(
      '"Marca", system-ui, sans-serif',
    );
  });

  it('tema vira variáveis CSS com texto automático sobre principal e destaque', () => {
    const tema = lerFixture<Tema>('theme.json');
    expect(temaParaVariaveisCss(tema)).toMatchObject({
      '--cor-principal': '#1F3A5F',
      '--cor-sobre-principal': '#FFFFFF',
      '--cor-sobre-destaque': '#000000',
      '--fonte-titulos': '"Playfair Display", Georgia, serif',
      '--fonte-textos': '"Inter", system-ui, sans-serif',
    });
  });
});
