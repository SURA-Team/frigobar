/** Manifesto de imagens gerado por `scripts/optimize-images.ts` (fora do Git). */
export interface VarianteImagem {
  largura: number;
  /** Relativa à raiz do site, sem base path (ex.: `_img/abc123-400.webp`). */
  url: string;
}

export interface ImagemOtimizada {
  largura: number;
  altura: number;
  variantes: VarianteImagem[];
}

export type ImageManifest = Record<string, ImagemOtimizada>;

// `import.meta.glob` tolera o arquivo ausente (ex.: `npm run dev` antes de `npm run images`).
const modulos = import.meta.glob<{ default: ImageManifest }>('../generated/image-manifest.json', {
  eager: true,
});

export const manifestoImagens: ImageManifest = Object.values(modulos)[0]?.default ?? {};
