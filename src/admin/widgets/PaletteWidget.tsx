/**
 * Widget de paleta: as 5 cores do tema, com amostras e verificação de contraste WCAG que
 * bloqueia salvar enquanto houver violação (FR-018, SC-005, Princípio V).
 */
import { Component } from 'react';
import type { Cores } from '../../content/schema';
import { PADROES } from '../../content/schema';
import { melhorTextoSobre, verificarContrasteTema } from '../../theme/contrast';
import { erroDecap, estilos, paraObjeto, type PropsWidget } from './comum';

export const CHAVES_COR = ['principal', 'secundaria', 'fundo', 'texto', 'destaque'] as const;

const ROTULOS: Record<(typeof CHAVES_COR)[number], string> = {
  principal: 'Principal',
  secundaria: 'Secundária',
  fundo: 'Fundo',
  texto: 'Texto',
  destaque: 'Destaque',
};

const PADRAO: Cores = {
  principal: '#1F3A5F',
  secundaria: '#C8A96A',
  fundo: '#FFFFFF',
  texto: '#1A1A1A',
  destaque: '#C8A96A',
};

function formatarRazao(razao: number): string {
  return `${razao.toFixed(2).replace('.', ',')}:1`;
}

export class PaletteControl extends Component<PropsWidget> {
  private cores(): Record<keyof Cores, string> {
    const atual = paraObjeto<Cores>(this.props.value);
    return { ...PADRAO, ...atual } as Record<keyof Cores, string>;
  }

  private coresValidas(): Cores | null {
    const cores = this.cores();
    return CHAVES_COR.every((k) => PADROES.corHex.test(cores[k])) ? cores : null;
  }

  /** Chamado pelo Decap ao salvar: bloqueia cor inválida ou contraste insuficiente. */
  isValid = () => {
    const cores = this.coresValidas();
    if (!cores) return erroDecap('Use cores no formato #RRGGBB, ex.: #1F3A5F.');
    const violacoes = verificarContrasteTema(cores).filter((v) => !v.aprovado);
    if (violacoes.length > 0) {
      return erroDecap(
        `Contraste insuficiente — o texto ficaria difícil de ler. ${violacoes
          .map((v) => v.mensagem)
          .join(' ')}`,
      );
    }
    return true;
  };

  private alterar(chave: keyof Cores, valor: string) {
    this.props.onChange({ ...this.cores(), [chave]: valor.trim().toUpperCase() });
  }

  render() {
    const cores = this.cores();
    const validas = this.coresValidas();
    const verificacoes = validas ? verificarContrasteTema(validas) : [];

    return (
      <div style={estilos.caixa} id={this.props.forID}>
        {CHAVES_COR.map((chave) => {
          const valor = cores[chave];
          const ok = PADROES.corHex.test(valor);
          const id = `${this.props.forID ?? 'paleta'}-${chave}`;
          return (
            <div key={chave} style={estilos.linha}>
              <label htmlFor={id} style={estilos.rotulo}>
                {ROTULOS[chave]}
              </label>
              <input
                type="color"
                aria-label={`Escolher cor ${ROTULOS[chave]}`}
                value={ok ? valor.toLowerCase() : '#000000'}
                onChange={(e) => this.alterar(chave, e.target.value)}
                style={{ width: 44, height: 32, padding: 0, border: 'none', background: 'none' }}
              />
              <input
                id={id}
                type="text"
                value={valor}
                maxLength={7}
                aria-invalid={!ok}
                onChange={(e) => this.alterar(chave, e.target.value)}
                style={{ ...estilos.input, width: 100, borderColor: ok ? '#c8ccd0' : '#b42318' }}
              />
            </div>
          );
        })}

        {validas && (
          <div style={{ ...estilos.linha, gap: 6 }} aria-label="Amostras">
            {(
              [
                ['Texto sobre o fundo', validas.fundo, validas.texto],
                ['Botão', validas.principal, melhorTextoSobre(validas.principal)],
                ['Etiqueta', validas.destaque, melhorTextoSobre(validas.destaque)],
              ] as const
            ).map(([rotulo, fundo, texto]) => (
              <span
                key={rotulo}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: fundo,
                  color: texto,
                  border: '1px solid #dfdfe3',
                  fontSize: 13,
                }}
              >
                {rotulo}
              </span>
            ))}
          </div>
        )}

        <ul
          style={{ margin: 0, paddingLeft: 0, listStyle: 'none', fontSize: 13 }}
          aria-label="Verificação de contraste"
        >
          {verificacoes.map((v) => (
            <li
              key={v.regra}
              data-regra={v.regra}
              style={{ color: v.aprovado ? '#1b6b3a' : '#b42318' }}
            >
              {v.aprovado ? '✓' : '✗'} {v.descricao}: {formatarRazao(v.razao)} (mínimo{' '}
              {formatarRazao(v.minimo)})
            </li>
          ))}
        </ul>
        <p style={estilos.dica}>
          O sistema não deixa salvar cores com pouco contraste, para que todos os hóspedes consigam
          ler a página.
        </p>
      </div>
    );
  }
}
