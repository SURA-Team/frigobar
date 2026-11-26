/**
 * Gate de conteúdo do build e do CI: schema, contraste, existência e tamanho dos arquivos.
 * Uso: `npm run validate` (lê FRIGOBAR_CONTENT_DIR e FRIGOBAR_UPLOADS_DIR).
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { listarMidias } from '../src/content/media';
import {
  descreverErro,
  errosDoZod,
  LIMITES,
  NOMES_ARQUIVO,
  PREFIXO_UPLOADS,
  SCHEMAS,
  type ArquivoConteudo,
  type Catalogo,
  type ErroConteudo,
  type Site,
  type Tema,
} from '../src/content/schema';
import { validarContrasteTema } from '../src/theme/contrast';

export interface OpcoesValidacao {
  dirConteudo: string;
  dirUploads: string;
}

function formatarMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** Resolve `uploads/x.jpg` para o arquivo dentro da pasta de uploads. */
export function resolverUpload(dirUploads: string, caminho: string): string {
  return path.join(dirUploads, caminho.slice(PREFIXO_UPLOADS.length));
}

export function validarConteudo({ dirConteudo, dirUploads }: OpcoesValidacao): ErroConteudo[] {
  const erros: ErroConteudo[] = [];
  const validos: { site?: Site; tema?: Tema; catalogo?: Catalogo } = {};

  for (const chave of Object.keys(NOMES_ARQUIVO) as ArquivoConteudo[]) {
    const nome = NOMES_ARQUIVO[chave];
    const caminho = path.join(dirConteudo, nome);
    let dados: unknown;
    try {
      dados = JSON.parse(readFileSync(caminho, 'utf8'));
    } catch (e) {
      const motivo = existsSync(caminho) ? 'JSON inválido' : 'arquivo não encontrado';
      erros.push({ arquivo: nome, campo: '', mensagem: `${motivo} (${(e as Error).message}).` });
      continue;
    }
    const resultado = SCHEMAS[chave].safeParse(dados);
    if (resultado.success) {
      (validos as Record<string, unknown>)[chave] = resultado.data;
    } else {
      erros.push(...errosDoZod(resultado.error, nome));
    }
  }

  if (validos.tema) {
    for (const violacao of validarContrasteTema(validos.tema.cores)) {
      erros.push({ arquivo: 'theme.json', campo: 'cores', mensagem: violacao.mensagem ?? '' });
    }
  }

  for (const ref of listarMidias(validos)) {
    const arquivo = resolverUpload(dirUploads, ref.caminho);
    if (!existsSync(arquivo)) {
      erros.push({
        arquivo: ref.arquivo,
        campo: ref.campo,
        mensagem: `O arquivo "${ref.caminho}" não foi encontrado. Envie-o novamente pelo painel.`,
      });
      continue;
    }
    const tamanho = statSync(arquivo).size;
    const limite = ref.tipo === 'fonte' ? LIMITES.fonteBytes : LIMITES.imagemBytes;
    if (tamanho > limite) {
      erros.push({
        arquivo: ref.arquivo,
        campo: ref.campo,
        mensagem: `"${ref.caminho}" tem ${formatarMB(tamanho)}; o limite é ${formatarMB(limite)}.`,
      });
    }
  }

  return erros;
}

function executarCli(): void {
  const dirConteudo = path.resolve(process.env.FRIGOBAR_CONTENT_DIR ?? 'content');
  const dirUploads = path.resolve(process.env.FRIGOBAR_UPLOADS_DIR ?? 'public/uploads');
  const erros = validarConteudo({ dirConteudo, dirUploads });
  if (erros.length === 0) {
    console.log(`Conteúdo válido (${path.relative(process.cwd(), dirConteudo) || '.'}).`);
    return;
  }
  console.error(`Conteúdo inválido — ${erros.length} problema(s):`);
  for (const erro of erros) console.error(`  - ${descreverErro(erro)}`);
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  executarCli();
}
