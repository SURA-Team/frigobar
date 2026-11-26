import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PaletteControl } from '../../../src/admin/widgets/PaletteWidget';
import type { Tema } from '../../../src/content/schema';
import { lerFixture } from '../helpers';

const coresOk = lerFixture<Tema>('theme.json').cores;

function renderizar(value: unknown, onChange = vi.fn()) {
  const ref = createRef<PaletteControl>();
  render(<PaletteControl ref={ref} value={value} onChange={onChange} forID="cores" />);
  return { ref, onChange };
}

describe('PaletteWidget', () => {
  it('mostra a razão de contraste de cada uma das 4 regras', () => {
    renderizar(coresOk);
    const itens = screen
      .getByRole('list', { name: 'Verificação de contraste' })
      .querySelectorAll('li');
    expect([...itens].map((li) => li.dataset.regra)).toEqual([
      'texto-fundo',
      'principal-fundo',
      'sobre-principal',
      'sobre-destaque',
    ]);
    expect(itens[0]).toHaveTextContent(/✓ Texto sobre o fundo: 17,\d\d:1 \(mínimo 4,50:1\)/);
  });

  it('isValid aceita a paleta de exemplo', () => {
    const { ref } = renderizar(coresOk);
    expect(ref.current!.isValid()).toBe(true);
  });

  it('isValid bloqueia texto #999999 sobre fundo #FFFFFF com mensagem em português', () => {
    const { ref } = renderizar({ ...coresOk, texto: '#999999' });
    const resultado = ref.current!.isValid();
    expect(resultado).toMatchObject({
      error: { message: expect.stringContaining('Contraste insuficiente') },
    });
    expect(JSON.stringify(resultado)).toContain('Texto sobre o fundo: contraste 2,85:1');
    expect(screen.getByText(/✗ Texto sobre o fundo/)).toBeInTheDocument();
  });

  it('isValid bloqueia cor fora de #RRGGBB', () => {
    const { ref } = renderizar({ ...coresOk, fundo: '#FFF' });
    expect(ref.current!.isValid()).toMatchObject({
      error: { message: expect.stringContaining('#RRGGBB') },
    });
  });

  it('aceita valor Immutable (como o Decap entrega) e envia a paleta completa ao alterar', () => {
    const immutable = { toJS: () => coresOk };
    const { onChange } = renderizar(immutable);
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: '#000000' } });
    expect(onChange).toHaveBeenCalledWith({ ...coresOk, texto: '#000000' });
  });
});
