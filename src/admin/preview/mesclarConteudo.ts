/**
 * Pré-visualização: junta o conteúdo publicado com o rascunho em edição e calcula os erros que
 * impediriam a publicação (research R4 — cobre o que o Decap não valida sozinho, como nome de
 * categoria repetido).
 */
import {
  errosDoZod,
  NOMES_ARQUIVO,
  SCHEMAS,
  type ArquivoConteudo,
  type Catalogo,
  type Conteudo,
  type ErroConteudo,
  type Fonte,
  type Site,
  type Tema,
} from '../../content/schema';
import { ICONE_IDS, ICONE_PADRAO, type IconeId } from '../../icons/registry';
import { ETIQUETA_IDS, type EtiquetaId } from '../../icons/tags';
import { validarContrasteTema } from '../../theme/contrast';
import { FONTE_PADRAO_IDS } from '../../theme/fonts';

/** Nome do arquivo de cada entrada do CMS (nome do arquivo na coleção) → parte do conteúdo. */
export const ARQUIVO_DA_ENTRADA: Record<string, ArquivoConteudo> = {
  catalogo: 'catalogo',
  'identidade-visual': 'tema',
  'textos-contatos': 'site',
};

type Bruto = Record<string, unknown>;

const ehObjeto = (v: unknown): v is Bruto =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const texto = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v : undefined;
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const hex = (v: unknown, padrao: string) =>
  typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : padrao;

function normalizarCatalogo(dados: Bruto): Catalogo {
  return {
    categorias: lista(dados.categorias)
      .filter(ehObjeto)
      .map((categoria) => ({
        nome: texto(categoria.nome) ?? '',
        icone: ICONE_IDS.includes(categoria.icone as IconeId)
          ? (categoria.icone as IconeId)
          : ICONE_PADRAO,
        visivel: categoria.visivel !== false,
        itens: lista(categoria.itens)
          .filter(ehObjeto)
          .map((item) => {
            const preco = Number(item.preco);
            return {
              nome: texto(item.nome) ?? '',
              descricao: texto(item.descricao),
              preco: Number.isFinite(preco) && preco >= 0 ? preco : 0,
              foto: texto(item.foto),
              etiquetas: [
                ...new Set(
                  lista(item.etiquetas).filter((e): e is EtiquetaId =>
                    ETIQUETA_IDS.includes(e as EtiquetaId),
                  ),
                ),
              ],
              visivel: item.visivel !== false,
            };
          }),
      })),
  };
}

function normalizarFonte(dados: unknown, publicada: Fonte): Fonte {
  if (!ehObjeto(dados)) return publicada;
  if (dados.origem === 'padrao' && FONTE_PADRAO_IDS.includes(dados.padrao as never)) {
    return {
      origem: 'padrao',
      padrao: dados.padrao as Extract<Fonte, { origem: 'padrao' }>['padrao'],
    };
  }
  if (dados.origem === 'propria' && texto(dados.nome) && texto(dados.arquivo)) {
    return { origem: 'propria', nome: String(dados.nome), arquivo: String(dados.arquivo) };
  }
  return publicada;
}

function normalizarTema(dados: Bruto, publicado: Tema): Tema {
  const cores = ehObjeto(dados.cores) ? dados.cores : {};
  const fontes = ehObjeto(dados.fontes) ? dados.fontes : {};
  return {
    cores: {
      principal: hex(cores.principal, publicado.cores.principal),
      secundaria: hex(cores.secundaria, publicado.cores.secundaria),
      fundo: hex(cores.fundo, publicado.cores.fundo),
      texto: hex(cores.texto, publicado.cores.texto),
      destaque: hex(cores.destaque, publicado.cores.destaque),
    },
    fontes: {
      titulos: normalizarFonte(fontes.titulos, publicado.fontes.titulos),
      textos: normalizarFonte(fontes.textos, publicado.fontes.textos),
    },
  };
}

function normalizarSite(dados: Bruto, publicado: Site): Site {
  const contatos = ehObjeto(dados.contatos) ? dados.contatos : {};
  return {
    nomeHotel: texto(dados.nomeHotel) ?? '',
    boasVindas: texto(dados.boasVindas),
    logo: texto(dados.logo) ?? publicado.logo,
    fotoCapa: texto(dados.fotoCapa),
    informacoesGerais: texto(dados.informacoesGerais),
    rodape: texto(dados.rodape),
    contatos: {
      telefone: texto(contatos.telefone),
      whatsapp: texto(contatos.whatsapp),
      email: texto(contatos.email),
      ramal: texto(contatos.ramal),
    },
    urlPublica: texto(dados.urlPublica) ?? publicado.urlPublica,
    enderecoDefinitivo: dados.enderecoDefinitivo === true,
  };
}

/**
 * Conteúdo para a pré-visualização: o arquivo em edição vem do rascunho (com valores seguros
 * para campos ainda incompletos); os demais, do conteúdo publicado.
 */
export function mesclarConteudo(
  publicado: Conteudo,
  dadosDaEntrada: unknown,
  arquivo: ArquivoConteudo,
): Conteudo {
  const dados = ehObjeto(dadosDaEntrada) ? dadosDaEntrada : {};
  switch (arquivo) {
    case 'catalogo':
      return { ...publicado, catalogo: normalizarCatalogo(dados) };
    case 'tema':
      return { ...publicado, tema: normalizarTema(dados, publicado.tema) };
    case 'site':
      return { ...publicado, site: normalizarSite(dados, publicado.site) };
  }
}

const ROTULOS_CAMPO: Record<string, string> = {
  categorias: 'Categoria',
  itens: 'item',
  nome: 'nome',
  icone: 'ícone',
  visivel: 'visibilidade',
  descricao: 'descrição',
  preco: 'preço',
  foto: 'foto',
  etiquetas: 'etiquetas',
  nomeHotel: 'Nome do hotel',
  boasVindas: 'Boas-vindas',
  logo: 'Logotipo',
  fotoCapa: 'Foto de capa',
  informacoesGerais: 'Informações gerais',
  rodape: 'Rodapé',
  contatos: 'Contatos',
  telefone: 'telefone',
  whatsapp: 'WhatsApp',
  email: 'e-mail',
  ramal: 'ramal',
  urlPublica: 'Endereço da página',
  cores: 'Cores',
  fontes: 'Fontes',
  titulos: 'títulos',
  textos: 'textos',
  arquivo: 'arquivo',
};

/** `categorias[1].itens[0].preco` → `Categoria 2 › item 1 › preço` (para o administrador). */
export function campoAmigavel(campo: string): string {
  return campo
    .split('.')
    .map((parte) => {
      const m = /^([^[]+)(?:\[(\d+)\])?$/.exec(parte);
      if (!m) return parte;
      const rotulo = ROTULOS_CAMPO[m[1]!] ?? m[1]!;
      return m[2] !== undefined ? `${rotulo} ${Number(m[2]) + 1}` : rotulo;
    })
    .join(' › ');
}

export function descreverParaAdmin(erro: ErroConteudo): string {
  return erro.campo ? `${campoAmigavel(erro.campo)}: ${erro.mensagem}` : erro.mensagem;
}

/** Erros que impediriam publicar o rascunho (schema completo + contraste), em português. */
export function errosDoRascunho(arquivo: ArquivoConteudo, dadosDaEntrada: unknown): ErroConteudo[] {
  const nome = NOMES_ARQUIVO[arquivo];
  const resultado = SCHEMAS[arquivo].safeParse(dadosDaEntrada);
  if (!resultado.success) return errosDoZod(resultado.error, nome);
  if (arquivo === 'tema') {
    return validarContrasteTema((resultado.data as Tema).cores).map((v) => ({
      arquivo: nome,
      campo: 'cores',
      mensagem: v.mensagem ?? '',
    }));
  }
  return [];
}
