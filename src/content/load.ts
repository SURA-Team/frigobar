/**
 * Conteúdo publicado, importado no build. O alias `@conteudo` aponta para `content/` (padrão)
 * ou para `tests/fixtures/content` nos testes (variável FRIGOBAR_CONTENT_DIR).
 */
import catalogoJson from '@conteudo/catalog.json';
import siteJson from '@conteudo/site.json';
import temaJson from '@conteudo/theme.json';
import { catalogoSchema, siteSchema, temaSchema, type Conteudo } from './schema';

export const conteudoPublicado: Conteudo = {
  site: siteSchema.parse(siteJson),
  tema: temaSchema.parse(temaJson),
  catalogo: catalogoSchema.parse(catalogoJson),
};
