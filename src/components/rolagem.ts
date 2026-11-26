/** Id da seção de uma categoria (contrato public-urls.md). Contém "/": use getElementById. */
export function idCategoria(slug: string): string {
  return `cat/${slug}`;
}

export function rolarParaCategoria(slug: string): boolean {
  const alvo = document.getElementById(idCategoria(slug));
  if (!alvo) return false;
  const reduzirMovimento =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: reduzirMovimento ? 'auto' : 'smooth', block: 'start' });
  return true;
}
