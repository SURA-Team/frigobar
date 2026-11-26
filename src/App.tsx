import { useEffect, useMemo } from 'react';
import { CategoryNav } from './components/CategoryNav';
import { CategorySection } from './components/CategorySection';
import { ContactBlock } from './components/ContactBlock';
import { EmptyState } from './components/EmptyState';
import { Footer } from './components/Footer';
import { GeneralInfo } from './components/GeneralInfo';
import { Header } from './components/Header';
import { ItemDetail } from './components/ItemDetail';
import { rolarParaCategoria } from './components/rolagem';
import { useItemAberto } from './components/useItemAberto';
import { atribuirSlugs, categoriasExibidas } from './content/derive';
import type { Conteudo } from './content/schema';

export interface AppProps {
  /** Conteúdo por props: a página pública passa o publicado; o preview do CMS, o rascunho. */
  conteudo: Conteudo;
  /** Na pré-visualização do CMS o detalhe abre/fecha sem mexer no histórico. */
  modoPreview?: boolean;
}

export function App({ conteudo, modoPreview = false }: AppProps) {
  const { site, catalogo } = conteudo;
  const categorias = useMemo(() => categoriasExibidas(atribuirSlugs(catalogo)), [catalogo]);

  const itensPorSlug = useMemo(() => {
    const mapa = new Map<
      string,
      {
        item: (typeof categorias)[number]['itens'][number];
        icone: (typeof categorias)[number]['icone'];
      }
    >();
    for (const categoria of categorias) {
      for (const item of categoria.itens) mapa.set(item.slug, { item, icone: categoria.icone });
    }
    return mapa;
  }, [categorias]);

  const slugs = useMemo(() => new Set(itensPorSlug.keys()), [itensPorSlug]);
  const { aberto, abrir, fechar } = useItemAberto(slugs, !modoPreview);
  const selecionado = aberto ? itensPorSlug.get(aberto) : undefined;

  // Link direto para uma categoria (#cat/<slug>).
  useEffect(() => {
    if (modoPreview) return;
    const correspondencia = /^#cat\/(.+)$/.exec(location.hash);
    if (correspondencia?.[1]) rolarParaCategoria(decodeURIComponent(correspondencia[1]));
  }, [modoPreview]);

  return (
    <>
      <Header site={site} />
      <CategoryNav categorias={categorias} />
      <main className="container catalogo" id="conteudo">
        {categorias.length === 0 ? (
          <EmptyState />
        ) : (
          categorias.map((categoria) => (
            <CategorySection key={categoria.slug} categoria={categoria} onAbrir={abrir} />
          ))
        )}
      </main>
      <GeneralInfo texto={site.informacoesGerais} />
      <ContactBlock contatos={site.contatos} />
      <Footer texto={site.rodape} />
      <ItemDetail
        item={selecionado?.item ?? null}
        iconeCategoria={selecionado?.icone ?? 'package'}
        onFechar={fechar}
      />
    </>
  );
}
