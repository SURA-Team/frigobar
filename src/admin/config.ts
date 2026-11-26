/**
 * Configuração do Decap CMS em TypeScript (research R1). As listas de ícones, etiquetas e
 * padrões de validação vêm do mesmo código usado pelo site e pelo schema (sem duplicação).
 * Qualquer mudança no formato do conteúdo exige atualizar juntos: este arquivo,
 * `src/content/schema.ts` e `specs/001-pagina-publica-frigobar/contracts/content-files.md`.
 */
import type { CmsCollection, CmsConfig, CmsField } from 'decap-cms-core';
import { LIMITES, MENSAGENS, PADROES } from '../content/schema';
import { ICONES, ICONE_IDS } from '../icons/registry';
import { ETIQUETAS, ETIQUETA_IDS } from '../icons/tags';

export const REPOSITORIO = 'SURA-Team/frigobar';

export interface OpcoesConfig {
  /** Painel rodando em localhost com `decap-server` (`npm run cms:local`). */
  local: boolean;
  /** URL do Worker OAuth (VITE_CMS_AUTH_URL); obrigatória fora do modo local. */
  urlAuth?: string;
}

/** Limita o tamanho do upload no próprio painel (o Decap recusa antes de enviar). */
function limiteUpload(bytes: number) {
  return { media_library: { config: { max_file_size: bytes } } } as Record<string, unknown>;
}

function campoImagem(nome: string, rotulo: string, opcoes: Partial<CmsField> & { logo?: boolean }) {
  const { logo, ...resto } = opcoes;
  return {
    name: nome,
    label: rotulo,
    widget: 'image',
    choose_url: false,
    pattern: logo ? [PADROES.logo, MENSAGENS.logo] : [PADROES.imagem, MENSAGENS.imagem],
    ...limiteUpload(LIMITES.imagemBytes),
    ...resto,
  } as CmsField;
}

/** Campo de texto com limite de tamanho (pattern) e obrigatoriedade. */
function campoTexto(
  nome: string,
  rotulo: string,
  maximo: number,
  opcoes: Partial<CmsField> & { multilinha?: boolean; obrigatorio?: boolean } = {},
): CmsField {
  const { multilinha, obrigatorio = false, ...resto } = opcoes;
  return {
    name: nome,
    label: rotulo,
    widget: multilinha ? 'text' : 'string',
    required: obrigatorio,
    pattern: [`^[\\s\\S]{${obrigatorio ? 1 : 0},${maximo}}$`, `Use até ${maximo} caracteres.`],
    ...resto,
  } as CmsField;
}

export function camposCatalogo(): CmsField[] {
  return [
    {
      name: 'categorias',
      label: 'Categorias',
      label_singular: 'categoria',
      widget: 'list',
      summary: '{{fields.nome}}',
      hint: 'Arraste para mudar a ordem em que as categorias aparecem para o hóspede.',
      fields: [
        campoTexto('nome', 'Nome da categoria', 40, {
          obrigatorio: true,
          hint: 'Ex.: Bebidas, Snacks, Chocolates. Não repita nomes.',
        }),
        {
          name: 'icone',
          label: 'Ícone',
          widget: 'icone',
          // Opções também ficam na config para documentar e testar o registro de ícones.
          options: ICONE_IDS.map((id) => ({ value: id, label: ICONES[id].rotulo })),
          default: 'package',
          hint: 'Aparece ao lado do nome da categoria e quando um item não tem foto.',
        } as CmsField,
        {
          name: 'visivel',
          label: 'Mostrar para o hóspede',
          widget: 'boolean',
          default: true,
        },
        {
          name: 'itens',
          label: 'Itens',
          label_singular: 'item',
          widget: 'list',
          summary: '{{fields.nome}} — R$ {{fields.preco}}',
          hint: 'Arraste para mudar a ordem dos itens.',
          fields: [
            campoTexto('nome', 'Nome do item', 60, {
              obrigatorio: true,
              hint: 'Ex.: Água mineral sem gás 500 ml',
            }),
            campoTexto('descricao', 'Descrição', 500, {
              multilinha: true,
              hint: 'Opcional. Aparece em até 2 linhas na lista e completa ao tocar no item.',
            }),
            {
              name: 'preco',
              label: 'Preço (R$)',
              widget: 'number',
              value_type: 'float',
              min: 0,
              max: 9999.99,
              step: 0.01,
              required: true,
              hint: 'Use ponto para os centavos, ex.: 12.50. Preço 0 aparece como "Cortesia".',
            } as CmsField,
            campoImagem('foto', 'Foto', {
              required: false,
              hint: 'Opcional. JPEG, PNG ou WebP até 10 MB; prefira foto horizontal e bem iluminada.',
            }),
            {
              name: 'etiquetas',
              label: 'Etiquetas',
              widget: 'select',
              multiple: true,
              required: false,
              options: ETIQUETA_IDS.map((id) => ({ value: id, label: ETIQUETAS[id].rotulo })),
              hint: '"Alcoólico" mostra automaticamente o aviso de venda proibida para menores.',
            } as CmsField,
            {
              name: 'visivel',
              label: 'Mostrar para o hóspede',
              widget: 'boolean',
              default: true,
            },
          ],
        },
      ],
    } as CmsField,
  ];
}

export function camposIdentidadeVisual(): CmsField[] {
  return [
    {
      name: 'cores',
      label: 'Cores',
      widget: 'paleta',
      hint: 'Principal: títulos e botões. Destaque: etiquetas. O sistema confere o contraste.',
    } as CmsField,
    {
      name: 'fontes',
      label: 'Fontes',
      widget: 'object',
      collapsed: false,
      fields: [
        {
          name: 'titulos',
          label: 'Fonte dos títulos',
          widget: 'fonte',
          ...limiteUpload(LIMITES.fonteBytes),
        } as CmsField,
        {
          name: 'textos',
          label: 'Fonte dos textos',
          widget: 'fonte',
          ...limiteUpload(LIMITES.fonteBytes),
        } as CmsField,
      ],
    } as CmsField,
  ];
}

function campoContato(
  nome: string,
  rotulo: string,
  padrao: RegExp,
  mensagem: string,
  dica: string,
): CmsField {
  return {
    name: nome,
    label: rotulo,
    widget: 'string',
    required: false,
    pattern: [padrao, mensagem],
    hint: dica,
  } as CmsField;
}

export function camposTextosContatos(): CmsField[] {
  return [
    campoTexto('nomeHotel', 'Nome do hotel', 80, { obrigatorio: true }),
    campoTexto('boasVindas', 'Mensagem de boas-vindas', 300, {
      multilinha: true,
      hint: 'Aparece no topo da página, abaixo do nome do hotel.',
    }),
    campoImagem('logo', 'Logotipo', {
      logo: true,
      required: true,
      hint: 'JPEG, PNG, WebP ou SVG. Prefira fundo transparente.',
    }),
    campoImagem('fotoCapa', 'Foto de capa', {
      required: false,
      hint: 'Opcional. Fica atrás do nome do hotel, escurecida para o texto continuar legível.',
    }),
    campoTexto('informacoesGerais', 'Informações gerais', 2000, {
      multilinha: true,
      hint: 'Ex.: forma de cobrança, observações. As quebras de linha são mantidas.',
    }),
    campoTexto('rodape', 'Rodapé', 200),
    {
      name: 'contatos',
      label: 'Contatos da recepção',
      widget: 'object',
      collapsed: false,
      hint: 'Todos opcionais: só os preenchidos aparecem para o hóspede.',
      fields: [
        campoContato(
          'telefone',
          'Telefone',
          PADROES.telefone,
          MENSAGENS.telefone,
          'Vira um botão que liga para a recepção. Ex.: (51) 3333-4444',
        ),
        campoContato(
          'whatsapp',
          'WhatsApp',
          PADROES.telefone,
          MENSAGENS.telefone,
          'Vira um botão que abre a conversa. Ex.: (51) 99999-8888',
        ),
        campoContato(
          'email',
          'E-mail',
          PADROES.email,
          MENSAGENS.email,
          'Vira um botão que abre o aplicativo de e-mail.',
        ),
        campoContato(
          'ramal',
          'Ramal interno',
          PADROES.ramal,
          MENSAGENS.ramal,
          'Aparece só como texto (é discado do telefone do quarto). Ex.: 9',
        ),
      ],
    } as CmsField,
    {
      name: 'urlPublica',
      label: 'Endereço da página',
      widget: 'string',
      required: true,
      pattern: [PADROES.urlHttps, MENSAGENS.urlHttps],
      hint: 'É o endereço que vai no QR code. Só mude quando o subdomínio definitivo estiver pronto.',
    } as CmsField,
    {
      name: 'enderecoDefinitivo',
      label: 'Endereço definitivo',
      widget: 'boolean',
      default: false,
      required: false,
      hint: 'Desligado = endereço provisório: o gerador de QR code avisa que os QR codes impressos podem precisar ser trocados.',
    } as CmsField,
  ];
}

export function colecoes(): CmsCollection[] {
  return [
    {
      name: 'catalogo',
      label: 'Catálogo',
      description: 'Categorias e itens do frigobar, com preços, fotos e etiquetas.',
      format: 'json',
      editor: { preview: true },
      files: [
        {
          name: 'catalogo',
          label: 'Catálogo do frigobar',
          file: 'content/catalog.json',
          fields: camposCatalogo(),
        },
      ],
    },
    {
      name: 'identidade-visual',
      label: 'Identidade visual',
      description: 'Cores e fontes da página. O contraste das cores é conferido automaticamente.',
      format: 'json',
      editor: { preview: true },
      files: [
        {
          name: 'identidade-visual',
          label: 'Cores e fontes',
          file: 'content/theme.json',
          fields: camposIdentidadeVisual(),
        },
      ],
    },
    {
      name: 'textos-contatos',
      label: 'Textos e contatos',
      description: 'Nome do hotel, logotipo, boas-vindas, informações, rodapé e contatos.',
      format: 'json',
      editor: { preview: true },
      files: [
        {
          name: 'textos-contatos',
          label: 'Textos, logotipo e contatos',
          file: 'content/site.json',
          fields: camposTextosContatos(),
        },
      ],
    },
  ];
}

export function criarConfig({ local, urlAuth }: OpcoesConfig): CmsConfig {
  const config: CmsConfig = {
    load_config_file: false,
    locale: 'pt',
    backend: {
      name: 'github',
      repo: REPOSITORIO,
      branch: 'main',
      ...(urlAuth ? { base_url: urlAuth, auth_endpoint: 'auth' } : {}),
    },
    media_folder: 'public/uploads',
    public_folder: 'uploads',
    collections: colecoes(),
  };

  if (local) {
    // decap-server não reproduz rascunhos/Pull Requests: salvar grava direto em content/.
    config.local_backend = true;
    config.publish_mode = 'simple';
  } else {
    config.publish_mode = 'editorial_workflow';
  }

  return config;
}
