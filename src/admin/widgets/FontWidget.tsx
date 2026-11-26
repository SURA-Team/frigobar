/**
 * Widget de fonte: escolhe uma fonte da lista padrão (com amostra na própria fonte) ou envia um
 * arquivo de fonte própria pela biblioteca de mídia do Decap (FR-017a).
 */
import { Component } from 'react';
import {
  carregarFontePadrao,
  FONTE_PADRAO_IDS,
  FONTES_PADRAO,
  pilhaFontePadrao,
} from '../../theme/fonts';
import { erroDecap, estilos, paraObjeto, type PropsWidget } from './comum';
import { validarFonte, type ValorFonte } from './validacao';

export const AMOSTRA_FONTE = 'Água, café e pão de queijo — R$ 12,50';

interface ImmutableLike {
  get: (chave: string, padrao?: unknown) => unknown;
  getIn?: (caminho: string[]) => unknown;
}

interface PropsFonte extends PropsWidget {
  onOpenMediaLibrary?: (opcoes: Record<string, unknown>) => void;
  onRemoveInsertedMedia?: (controlID: string) => void;
  mediaPaths?: ImmutableLike;
  getAsset?: (caminho: string) => { fileObj?: File } | null | undefined;
}

let contador = 0;

export class FontControl extends Component<PropsFonte> {
  private readonly controlID = `fonte-${++contador}`;

  componentDidMount() {
    // Carrega as 8 fontes padrão no painel para a amostra aparecer na fonte certa.
    FONTE_PADRAO_IDS.forEach((id) => void carregarFontePadrao(id));
  }

  componentDidUpdate() {
    // A biblioteca de mídia devolve o caminho escolhido em mediaPaths[controlID].
    const caminho = this.props.mediaPaths?.get(this.controlID);
    if (typeof caminho === 'string' && caminho !== this.valor().arquivo) {
      this.alterar({ arquivo: caminho });
      this.props.onRemoveInsertedMedia?.(this.controlID);
    }
  }

  private valor(): ValorFonte {
    return paraObjeto<ValorFonte>(this.props.value);
  }

  private tamanhoDoArquivo(): number | undefined {
    const { arquivo } = this.valor();
    if (!arquivo || !this.props.getAsset) return undefined;
    try {
      return this.props.getAsset(arquivo)?.fileObj?.size;
    } catch {
      return undefined;
    }
  }

  /** Chamado pelo Decap ao salvar. */
  isValid = () => {
    const erro = validarFonte(this.valor(), this.tamanhoDoArquivo());
    return erro ? erroDecap(erro) : true;
  };

  private alterar(parcial: Partial<ValorFonte>) {
    const atual = this.valor();
    const proximo = { ...atual, ...parcial };
    // Mantém só os campos da origem escolhida (o schema é estrito).
    const limpo =
      proximo.origem === 'propria'
        ? { origem: 'propria', nome: proximo.nome ?? '', arquivo: proximo.arquivo ?? '' }
        : { origem: 'padrao', padrao: proximo.padrao ?? 'inter' };
    this.props.onChange(limpo);
  }

  private abrirBiblioteca = () => {
    const configCampo = this.props.field?.getIn?.(['media_library', 'config']);
    this.props.onOpenMediaLibrary?.({
      controlID: this.controlID,
      forImage: false,
      privateUpload: false,
      value: this.valor().arquivo,
      allowMultiple: false,
      config: configCampo,
      field: this.props.field,
    });
  };

  render() {
    const valor = this.valor();
    const origem = valor.origem ?? 'padrao';
    const base = this.props.forID ?? this.controlID;

    return (
      <div style={estilos.caixa} id={this.props.forID}>
        <div role="radiogroup" aria-label="Origem da fonte" style={estilos.linha}>
          {(
            [
              ['padrao', 'Fonte da lista'],
              ['propria', 'Fonte própria (arquivo da marca)'],
            ] as const
          ).map(([id, rotulo]) => (
            <label key={id} style={{ ...estilos.linha, fontSize: 14 }}>
              <input
                type="radio"
                name={`${base}-origem`}
                checked={origem === id}
                onChange={() => this.alterar({ origem: id })}
              />
              {rotulo}
            </label>
          ))}
        </div>

        {origem === 'padrao' ? (
          <div
            role="radiogroup"
            aria-label="Fontes disponíveis"
            style={{ display: 'grid', gap: 6 }}
          >
            {FONTE_PADRAO_IDS.map((id) => (
              <label
                key={id}
                style={{
                  display: 'grid',
                  gap: 2,
                  padding: '8px 10px',
                  border: `2px solid ${valor.padrao === id ? '#3a69c7' : '#dfdfe3'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <span style={estilos.linha}>
                  <input
                    type="radio"
                    name={`${base}-padrao`}
                    checked={valor.padrao === id}
                    onChange={() => this.alterar({ origem: 'padrao', padrao: id })}
                  />
                  <strong style={{ fontSize: 13 }}>{FONTES_PADRAO[id].nome}</strong>
                </span>
                <span style={{ fontFamily: pilhaFontePadrao(id), fontSize: 18 }}>
                  {AMOSTRA_FONTE}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={estilos.linha}>
              <span style={estilos.rotulo}>Nome da fonte</span>
              <input
                type="text"
                value={valor.nome ?? ''}
                maxLength={60}
                onChange={(e) => this.alterar({ nome: e.target.value })}
                style={{ ...estilos.input, flex: 1 }}
              />
            </label>
            <div style={estilos.linha}>
              <span style={estilos.rotulo}>Arquivo</span>
              <code style={{ fontSize: 13 }}>{valor.arquivo || 'nenhum arquivo enviado'}</code>
              <button type="button" onClick={this.abrirBiblioteca} style={estilos.input}>
                {valor.arquivo ? 'Trocar arquivo' : 'Enviar arquivo'}
              </button>
            </div>
            <p style={estilos.dica}>
              WOFF2, WOFF, TTF ou OTF, até 2 MB. Confira na pré-visualização se acentos (á, ç, ã, ê)
              aparecem corretamente antes de publicar. Se a fonte não carregar no celular do
              hóspede, a página usa automaticamente uma fonte padrão legível.
            </p>
          </div>
        )}
      </div>
    );
  }
}
