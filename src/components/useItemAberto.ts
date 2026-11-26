import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIXO = '#item/';

function slugDoHash(hash: string): string | null {
  if (!hash.startsWith(PREFIXO)) return null;
  try {
    return decodeURIComponent(hash.slice(PREFIXO.length)) || null;
  } catch {
    return null;
  }
}

function enderecoSemHash(): string {
  return `${location.pathname}${location.search}`;
}

/**
 * Controla o item aberto pelo histórico do navegador (research R9, FR-004b):
 * - clique: `pushState(#item/<slug>)`; "voltar", Esc e "Fechar" voltam uma entrada;
 * - link direto `#item/<slug>`: troca a entrada atual por `<base>` e empilha o item, para que
 *   "voltar" feche o detalhe sem sair do site;
 * - slug inexistente: ignorado (página normal).
 * Com `usarHistorico = false` (pré-visualização do CMS) tudo acontece só em memória.
 */
export function useItemAberto(slugsValidos: ReadonlySet<string>, usarHistorico = true) {
  const [aberto, setAberto] = useState<string | null>(null);
  const origem = useRef<HTMLElement | null>(null);
  const validos = useRef(slugsValidos);
  validos.current = slugsValidos;
  const linkDiretoTratado = useRef(false);

  // Link direto no carregamento (uma vez só, mesmo com StrictMode).
  useEffect(() => {
    if (!usarHistorico || linkDiretoTratado.current) return;
    linkDiretoTratado.current = true;
    const slug = slugDoHash(location.hash);
    if (slug && validos.current.has(slug)) {
      history.replaceState(null, '', enderecoSemHash());
      history.pushState({ item: slug }, '', `${PREFIXO}${encodeURIComponent(slug)}`);
      setAberto(slug);
    }
  }, [usarHistorico]);

  // "Voltar"/"avançar" do navegador.
  useEffect(() => {
    if (!usarHistorico) return;
    function aoNavegar() {
      const slug = slugDoHash(location.hash);
      setAberto(slug && validos.current.has(slug) ? slug : null);
    }
    window.addEventListener('popstate', aoNavegar);
    return () => window.removeEventListener('popstate', aoNavegar);
  }, [usarHistorico]);

  // Devolve o foco ao card de origem ao fechar.
  useEffect(() => {
    if (aberto === null && origem.current) {
      origem.current.focus({ preventScroll: true });
      origem.current = null;
    }
  }, [aberto]);

  const abrir = useCallback(
    (slug: string, elementoOrigem?: HTMLElement) => {
      origem.current = elementoOrigem ?? null;
      if (usarHistorico) {
        history.pushState({ item: slug }, '', `${PREFIXO}${encodeURIComponent(slug)}`);
      }
      setAberto(slug);
    },
    [usarHistorico],
  );

  const fechar = useCallback(() => {
    if (usarHistorico && slugDoHash(location.hash)) {
      history.back(); // o popstate fecha
    } else {
      setAberto(null);
    }
  }, [usarHistorico]);

  return { aberto, abrir, fechar };
}
