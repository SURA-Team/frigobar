import type { PreviewTemplateComponentProps } from 'decap-cms-core';
import { useEffect, useMemo } from 'react';
import { App } from '../../App';
import { conteudoPublicado } from '../../content/load';
import type { Conteudo } from '../../content/schema';
import { manifestoImagens } from '../../images/manifest';
import { aplicarTema } from '../../theme/tokens';
import { aplicarFontesNoPreview } from './fontesPreview';
import {
  ARQUIVO_DA_ENTRADA,
  descreverParaAdmin,
  errosDoRascunho,
  mesclarConteudo,
} from './mesclarConteudo';

type Props = Pick<PreviewTemplateComponentProps, 'entry' | 'getAsset' | 'document'>;

/** URL para exibir um arquivo do conteúdo no preview (blob se o upload ainda não foi publicado). */
function criarResolvedor(getAsset: Props['getAsset']) {
  return (caminho: string): string | undefined => {
    if (manifestoImagens[caminho]) return undefined; // Picture usa as variantes otimizadas
    try {
      const asset = getAsset(caminho) as unknown as { url?: string; toString(): string } | null;
      const url = asset?.url ?? asset?.toString();
      return url && url !== '[object Object]' ? url : undefined;
    } catch {
      return undefined;
    }
  };
}

function trocarMidias(conteudo: Conteudo, resolver: (c: string) => string | undefined): Conteudo {
  const trocar = (c?: string) => (c ? (resolver(c) ?? c) : c);
  return {
    ...conteudo,
    site: {
      ...conteudo.site,
      logo: trocar(conteudo.site.logo)!,
      fotoCapa: trocar(conteudo.site.fotoCapa),
    },
    catalogo: {
      categorias: conteudo.catalogo.categorias.map((categoria) => ({
        ...categoria,
        itens: categoria.itens.map((item) => ({ ...item, foto: trocar(item.foto) })),
      })),
    },
  };
}

/**
 * Pré-visualização do CMS: renderiza a página do hóspede com os mesmos componentes (FR-020),
 * numa moldura de celular, e avisa o que impediria a publicação (research R4).
 */
export function PagePreview({ entry, getAsset, document: docPreview }: Props) {
  const slug = String(entry.get('slug') ?? 'catalogo');
  const arquivo = ARQUIVO_DA_ENTRADA[slug] ?? 'catalogo';
  const dadosImmutable = entry.get('data');
  const dados = useMemo<unknown>(
    () =>
      dadosImmutable && typeof dadosImmutable.toJS === 'function' ? dadosImmutable.toJS() : {},
    [dadosImmutable],
  );

  const resolver = useMemo(() => criarResolvedor(getAsset), [getAsset]);
  const conteudo = useMemo(
    () => trocarMidias(mesclarConteudo(conteudoPublicado, dados, arquivo), resolver),
    [dados, arquivo, resolver],
  );
  const erros = useMemo(() => errosDoRascunho(arquivo, dados), [arquivo, dados]);

  useEffect(() => {
    if (docPreview) aplicarTema(conteudo.tema, docPreview.documentElement);
  }, [conteudo.tema, docPreview]);

  useEffect(() => {
    if (docPreview) void aplicarFontesNoPreview(conteudo.tema.fontes, docPreview, resolver);
  }, [conteudo.tema.fontes, docPreview, resolver]);

  return (
    <div className="preview-area">
      {erros.length > 0 && (
        <div className="preview-erros" role="alert">
          <strong>Este rascunho não pode ser publicado:</strong>
          <ul>
            {erros.map((erro, i) => (
              <li key={i}>{descreverParaAdmin(erro)}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="preview-celular" aria-label="Pré-visualização no celular">
        <App conteudo={conteudo} modoPreview />
      </div>
    </div>
  );
}
