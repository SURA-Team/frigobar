/** Seletor visual de ícone de categoria (grade com os ícones do registro). */
import { Component, type KeyboardEvent } from 'react';
import { ICONE_IDS, ICONE_PADRAO, ICONES, type IconeId } from '../../icons/registry';
import { erroDecap, estilos, type PropsWidget } from './comum';

export class IconControl extends Component<PropsWidget> {
  private atual(): IconeId {
    const v = this.props.value;
    return ICONE_IDS.includes(v as IconeId) ? (v as IconeId) : ICONE_PADRAO;
  }

  isValid = () =>
    ICONE_IDS.includes(this.props.value as IconeId) || this.props.value === undefined
      ? true
      : erroDecap('Escolha um ícone da lista.');

  private aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    const deslocamento = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!deslocamento) return;
    e.preventDefault();
    const i = ICONE_IDS.indexOf(this.atual());
    const proximo = ICONE_IDS[(i + deslocamento + ICONE_IDS.length) % ICONE_IDS.length]!;
    this.props.onChange(proximo);
    const botao = e.currentTarget.querySelector<HTMLButtonElement>(`[data-icone="${proximo}"]`);
    botao?.focus();
  };

  render() {
    const atual = this.atual();
    return (
      <div
        id={this.props.forID}
        role="radiogroup"
        aria-label="Ícone da categoria"
        onKeyDown={this.aoTeclar}
        style={{
          ...estilos.caixa,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
          gap: 6,
        }}
      >
        {ICONE_IDS.map((id) => {
          const { componente: Icone, rotulo } = ICONES[id];
          const selecionado = id === atual;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selecionado}
              data-icone={id}
              tabIndex={selecionado ? 0 : -1}
              onClick={() => this.props.onChange(id)}
              style={{
                display: 'grid',
                justifyItems: 'center',
                gap: 4,
                padding: '8px 4px',
                border: `2px solid ${selecionado ? '#3a69c7' : '#dfdfe3'}`,
                borderRadius: 6,
                background: selecionado ? '#eef3fc' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              <Icone size={22} aria-hidden="true" />
              {rotulo}
            </button>
          );
        })}
      </div>
    );
  }
}
