/** Lista os arquivos de mídia referenciados pelo conteúdo (usado pela validação e pelas imagens). */
import type { Catalogo, Site, Tema } from './schema';

export type TipoMidia = 'imagem' | 'logo' | 'capa' | 'fonte';

export interface ReferenciaMidia {
  /** Arquivo de conteúdo onde a referência está (ex.: `catalog.json`). */
  arquivo: string;
  /** Caminho do campo (ex.: `categorias[0].itens[1].foto`). */
  campo: string;
  /** Caminho como está no conteúdo (ex.: `uploads/agua.jpg`). */
  caminho: string;
  tipo: TipoMidia;
}

export function listarMidias(partes: {
  site?: Site;
  tema?: Tema;
  catalogo?: Catalogo;
}): ReferenciaMidia[] {
  const refs: ReferenciaMidia[] = [];
  const { site, tema, catalogo } = partes;

  if (site) {
    refs.push({ arquivo: 'site.json', campo: 'logo', caminho: site.logo, tipo: 'logo' });
    if (site.fotoCapa) {
      refs.push({ arquivo: 'site.json', campo: 'fotoCapa', caminho: site.fotoCapa, tipo: 'capa' });
    }
  }

  if (tema) {
    for (const papel of ['titulos', 'textos'] as const) {
      const fonte = tema.fontes[papel];
      if (fonte.origem === 'propria') {
        refs.push({
          arquivo: 'theme.json',
          campo: `fontes.${papel}.arquivo`,
          caminho: fonte.arquivo,
          tipo: 'fonte',
        });
      }
    }
  }

  catalogo?.categorias.forEach((categoria, i) => {
    categoria.itens.forEach((item, j) => {
      if (item.foto) {
        refs.push({
          arquivo: 'catalog.json',
          campo: `categorias[${i}].itens[${j}].foto`,
          caminho: item.foto,
          tipo: 'imagem',
        });
      }
    });
  });

  return refs;
}
