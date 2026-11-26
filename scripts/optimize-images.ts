/**
 * Gera variantes WebP das imagens do conteúdo e o manifesto usado por <Picture> (research R5).
 * Uso: `npm run images` (lê FRIGOBAR_CONTENT_DIR e FRIGOBAR_UPLOADS_DIR).
 */
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { listarMidias, type TipoMidia } from '../src/content/media';
import { catalogoSchema, siteSchema } from '../src/content/schema';
import type { ImageManifest, ImagemOtimizada } from '../src/images/manifest';
import { resolverUpload } from './validate-content';

const DIR_SAIDA = path.resolve('public/_img');
const ARQUIVO_MANIFESTO = path.resolve('src/generated/image-manifest.json');

const LARGURAS: Record<Exclude<TipoMidia, 'fonte'>, number[]> = {
  imagem: [400, 800],
  logo: [400, 800],
  capa: [400, 800, 1600],
};

function hashArquivo(conteudo: Buffer): string {
  return createHash('sha256').update(conteudo).digest('hex').slice(0, 12);
}

async function otimizar(
  origem: string,
  tipo: Exclude<TipoMidia, 'fonte'>,
): Promise<ImagemOtimizada> {
  const bytes = readFileSync(origem);
  const hash = hashArquivo(bytes);
  const meta = await sharp(bytes).rotate().metadata();
  // `rotate()` aplica a orientação EXIF (fotos de celular); largura/altura já orientadas.
  const girada = (meta.orientation ?? 1) >= 5;
  const largura = (girada ? meta.height : meta.width) ?? 0;
  const altura = (girada ? meta.width : meta.height) ?? 0;

  if (path.extname(origem).toLowerCase() === '.svg') {
    const nome = `${hash}.svg`;
    const destino = path.join(DIR_SAIDA, nome);
    if (!existsSync(destino)) copyFileSync(origem, destino);
    return { largura, altura, variantes: [{ largura, url: `_img/${nome}` }] };
  }

  const alvo = LARGURAS[tipo].filter((l) => l <= largura);
  if (alvo.length === 0) alvo.push(largura); // imagem menor que 400px: não amplia

  const variantes = [];
  for (const l of alvo) {
    const nome = `${hash}-${l}.webp`;
    const destino = path.join(DIR_SAIDA, nome);
    if (!existsSync(destino)) {
      await sharp(bytes)
        .rotate()
        .resize({ width: l, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(destino);
    }
    variantes.push({ largura: l, url: `_img/${nome}` });
  }
  return { largura, altura, variantes };
}

async function main(): Promise<void> {
  const dirConteudo = path.resolve(process.env.FRIGOBAR_CONTENT_DIR ?? 'content');
  const dirUploads = path.resolve(process.env.FRIGOBAR_UPLOADS_DIR ?? 'public/uploads');
  const ler = (nome: string) => JSON.parse(readFileSync(path.join(dirConteudo, nome), 'utf8'));
  const site = siteSchema.parse(ler('site.json'));
  const catalogo = catalogoSchema.parse(ler('catalog.json'));

  mkdirSync(DIR_SAIDA, { recursive: true });
  mkdirSync(path.dirname(ARQUIVO_MANIFESTO), { recursive: true });

  const manifesto: ImageManifest = {};
  for (const ref of listarMidias({ site, catalogo })) {
    if (ref.tipo === 'fonte' || manifesto[ref.caminho]) continue;
    manifesto[ref.caminho] = await otimizar(resolverUpload(dirUploads, ref.caminho), ref.tipo);
  }

  // Remove variantes que o conteúdo atual não usa (ex.: sobras do build de teste).
  const usados = new Set(
    Object.values(manifesto).flatMap((img) => img.variantes.map((v) => path.basename(v.url))),
  );
  let removidos = 0;
  for (const nome of readdirSync(DIR_SAIDA)) {
    if (!usados.has(nome)) {
      rmSync(path.join(DIR_SAIDA, nome));
      removidos++;
    }
  }

  writeFileSync(ARQUIVO_MANIFESTO, `${JSON.stringify(manifesto, null, 2)}\n`);
  const total = Object.keys(manifesto).length;
  console.log(`Imagens otimizadas: ${total} (removidas ${removidos} variantes antigas).`);
}

main().catch((erro: unknown) => {
  console.error('Falha ao otimizar imagens:', erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
});
