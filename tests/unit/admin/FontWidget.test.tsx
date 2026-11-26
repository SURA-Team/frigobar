import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AMOSTRA_FONTE, FontControl } from '../../../src/admin/widgets/FontWidget';
import { validarFonte } from '../../../src/admin/widgets/validacao';

type Props = Partial<React.ComponentProps<typeof FontControl>>;

function renderizar(props: Props = {}) {
  const ref = createRef<FontControl>();
  const onChange = vi.fn();
  render(<FontControl ref={ref} onChange={onChange} forID="fonte" {...props} />);
  return { ref, onChange };
}

const arquivoDe = (tamanho: number) => ({ fileObj: { size: tamanho } as File });

describe('FontWidget', () => {
  it('recusa extensão .ttc', () => {
    const { ref } = renderizar({
      value: { origem: 'propria', nome: 'Marca', arquivo: 'uploads/marca.ttc' },
    });
    expect(ref.current!.isValid()).toEqual({
      error: { type: 'CUSTOM', message: 'Use arquivo de fonte WOFF2, WOFF, TTF ou OTF.' },
    });
  });

  it('recusa arquivo de 2 MB + 1 byte', () => {
    const { ref } = renderizar({
      value: { origem: 'propria', nome: 'Marca', arquivo: 'uploads/marca.woff2' },
      getAsset: () => arquivoDe(2 * 1024 * 1024 + 1),
    });
    expect(ref.current!.isValid()).toMatchObject({
      error: { message: 'O arquivo da fonte deve ter até 2 MB.' },
    });
  });

  it('aceita .woff2 de 100 KB', () => {
    const { ref } = renderizar({
      value: { origem: 'propria', nome: 'Marca', arquivo: 'uploads/marca.woff2' },
      getAsset: () => arquivoDe(100 * 1024),
    });
    expect(ref.current!.isValid()).toBe(true);
  });

  it('com origem padrão exige um id da lista', () => {
    expect(
      renderizar({ value: { origem: 'padrao', padrao: 'comic-sans' } }).ref.current!.isValid(),
    ).toMatchObject({
      error: { message: 'Escolha uma fonte da lista.' },
    });
  });

  it('mostra amostras das fontes padrão e troca para fonte própria', () => {
    const { onChange } = renderizar({ value: { origem: 'padrao', padrao: 'lora' } });
    expect(screen.getAllByText(AMOSTRA_FONTE)).toHaveLength(8);
    fireEvent.click(screen.getByLabelText('Fonte própria (arquivo da marca)'));
    expect(onChange).toHaveBeenCalledWith({ origem: 'propria', nome: '', arquivo: '' });
  });

  it('abre a biblioteca de mídia com o limite de 2 MB do campo', () => {
    const onOpenMediaLibrary = vi.fn();
    const config = { get: () => 2 * 1024 * 1024 };
    renderizar({
      value: { origem: 'propria', nome: 'Marca', arquivo: '' },
      onOpenMediaLibrary,
      field: { get: () => undefined, getIn: () => config },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar arquivo' }));
    expect(onOpenMediaLibrary).toHaveBeenCalledWith(
      expect.objectContaining({ forImage: false, allowMultiple: false, config }),
    );
  });
});

describe('validarFonte', () => {
  it('cobre nome vazio, nome longo e arquivo ausente', () => {
    expect(validarFonte({ origem: 'propria', nome: '', arquivo: 'uploads/a.woff' })).toBe(
      'Informe o nome da fonte.',
    );
    expect(
      validarFonte({ origem: 'propria', nome: 'x'.repeat(61), arquivo: 'uploads/a.woff' }),
    ).toBe('O nome da fonte deve ter até 60 caracteres.');
    expect(validarFonte({ origem: 'propria', nome: 'Marca' })).toBe('Envie o arquivo da fonte.');
    expect(validarFonte({})).toBe('Escolha "Fonte da lista" ou "Fonte própria".');
    expect(validarFonte({ origem: 'padrao', padrao: 'inter' })).toBeNull();
  });
});
