import { manifestoImagens, type ImageManifest } from './manifest';

export interface PictureProps {
  /** Caminho como está no conteúdo (ex.: `uploads/agua.jpg`), blob URL ou URL absoluta. */
  src: string;
  alt: string;
  sizes?: string;
  /** `true` para imagens acima da dobra (carregamento imediato). */
  prioridade?: boolean;
  className?: string;
  /** Permite injetar outro manifesto (testes). */
  manifesto?: ImageManifest;
}

function comBase(url: string): string {
  if (/^(blob:|data:|https?:|\/)/.test(url)) return url;
  return `${import.meta.env.BASE_URL}${url}`;
}

/** <img srcset> a partir do manifesto; sem entrada (preview do CMS) usa o `src` direto. */
export function Picture({
  src,
  alt,
  sizes = '100vw',
  prioridade = false,
  className,
  manifesto = manifestoImagens,
}: PictureProps) {
  const entrada = manifesto[src];
  const carregamento = prioridade ? 'eager' : 'lazy';

  if (!entrada || entrada.variantes.length === 0) {
    return (
      <img
        src={comBase(src)}
        alt={alt}
        className={className}
        loading={carregamento}
        decoding="async"
      />
    );
  }

  const maior = entrada.variantes[entrada.variantes.length - 1]!;
  const srcSet = entrada.variantes.map((v) => `${comBase(v.url)} ${v.largura}w`).join(', ');
  return (
    <img
      src={comBase(maior.url)}
      srcSet={entrada.variantes.length > 1 ? srcSet : undefined}
      sizes={entrada.variantes.length > 1 ? sizes : undefined}
      width={entrada.largura || undefined}
      height={entrada.altura || undefined}
      alt={alt}
      className={className}
      loading={carregamento}
      decoding="async"
      fetchPriority={prioridade ? 'high' : undefined}
    />
  );
}
