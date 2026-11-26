/**
 * Plugin do Vite que valida e normaliza o conteúdo no build e o entrega ao navegador como
 * JSON pronto (módulo `virtual:conteudo`). Assim o Zod não entra no bundle da página pública:
 * o conteúdo já foi validado por `npm run validate` e é reparseado aqui, em Node.
 * Também preenche título, descrição e theme-color do HTML (nada fixo no código).
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import {
  catalogoSchema,
  descreverErro,
  errosDoZod,
  siteSchema,
  temaSchema,
  type Conteudo,
} from '../src/content/schema';
import type { ImageManifest } from '../src/images/manifest';

const ID_VIRTUAL = 'virtual:conteudo';
const ID_RESOLVIDO = `\0${ID_VIRTUAL}`;

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function carregarConteudo(dirConteudo: string): Conteudo {
  const ler = (nome: string): unknown =>
    JSON.parse(readFileSync(path.join(dirConteudo, nome), 'utf8'));
  const partes = [
    ['site.json', siteSchema],
    ['theme.json', temaSchema],
    ['catalog.json', catalogoSchema],
  ] as const;
  const erros: string[] = [];
  const dados = partes.map(([nome, schema]) => {
    const resultado = schema.safeParse(ler(nome));
    if (!resultado.success) erros.push(...errosDoZod(resultado.error, nome).map(descreverErro));
    return resultado.data;
  });
  if (erros.length > 0) {
    throw new Error(`Conteúdo inválido em ${dirConteudo}:\n  - ${erros.join('\n  - ')}`);
  }
  const [site, tema, catalogo] = dados as [
    Conteudo['site'],
    Conteudo['tema'],
    Conteudo['catalogo'],
  ];
  return { site, tema, catalogo };
}

const ARQUIVO_MANIFESTO = path.resolve('src/generated/image-manifest.json');

/**
 * `<link rel="preload">` da imagem do topo (capa ou, sem capa, o logotipo), que é o elemento de
 * LCP. Sem isso o navegador só descobre a imagem depois de executar o JS.
 */
function preloadImagemDoTopo(site: Conteudo['site'], base: string): string {
  if (!existsSync(ARQUIVO_MANIFESTO)) return '';
  const manifesto = JSON.parse(readFileSync(ARQUIVO_MANIFESTO, 'utf8')) as ImageManifest;
  const entrada = manifesto[site.fotoCapa ?? site.logo];
  if (!entrada || entrada.variantes.length === 0) return '';
  const url = (u: string) => escaparHtml(`${base}${u}`);
  const maior = entrada.variantes[entrada.variantes.length - 1]!;
  const srcset = entrada.variantes.map((v) => `${url(v.url)} ${v.largura}w`).join(', ');
  const atributos = site.fotoCapa
    ? ` imagesrcset="${srcset}" imagesizes="(max-width: 640px) 100vw, 640px"`
    : '';
  return `<link rel="preload" as="image" href="${url(maior.url)}"${atributos} fetchpriority="high" />`;
}

export function conteudoPlugin(dirConteudo: string): Plugin {
  const arquivos = ['site.json', 'theme.json', 'catalog.json'].map((n) =>
    path.join(dirConteudo, n),
  );
  let base = '/';
  return {
    name: 'frigobar-conteudo',
    configResolved(config) {
      base = config.base;
    },
    resolveId(id) {
      return id === ID_VIRTUAL ? ID_RESOLVIDO : undefined;
    },
    load(id) {
      if (id !== ID_RESOLVIDO) return undefined;
      for (const arquivo of arquivos) this.addWatchFile(arquivo);
      return `export default ${JSON.stringify(carregarConteudo(dirConteudo))};`;
    },
    handleHotUpdate({ file, server }) {
      if (arquivos.includes(path.resolve(file))) {
        const modulo = server.moduleGraph.getModuleById(ID_RESOLVIDO);
        if (modulo) server.moduleGraph.invalidateModule(modulo);
        server.ws.send({ type: 'full-reload' });
      }
    },
    transformIndexHtml(html) {
      if (!html.includes('%NOME_HOTEL%') && !html.includes('%COR_PRINCIPAL%')) return html;
      const { site, tema } = carregarConteudo(dirConteudo);
      return html
        .replaceAll('%NOME_HOTEL%', escaparHtml(site.nomeHotel))
        .replaceAll('%COR_PRINCIPAL%', escaparHtml(tema.cores.principal))
        .replace('<!-- %PRELOAD_IMAGEM% -->', preloadImagemDoTopo(site, base));
    },
  };
}
