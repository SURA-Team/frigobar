import { describe, expect, it } from 'vitest';
import { criarConfig } from '../../../src/admin/config';
import { LIMITES, PADROES } from '../../../src/content/schema';
import { ICONE_IDS } from '../../../src/icons/registry';
import { ETIQUETA_IDS } from '../../../src/icons/tags';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function campo(campos: Json[], nome: string): Json {
  const encontrado = campos.find((c) => c.name === nome);
  if (!encontrado) throw new Error(`campo ${nome} não encontrado`);
  return encontrado;
}

function camposDoArquivo(config: Json, colecao: string, arquivo: string): Json[] {
  const c = config.collections.find((x: Json) => x.name === colecao);
  return c.files.find((f: Json) => f.name === arquivo).fields;
}

describe('configuração do CMS', () => {
  const config = criarConfig({ local: false, urlAuth: 'https://exemplo.workers.dev' }) as Json;

  it('usa editorial workflow, GitHub e o Worker de login', () => {
    expect(config.publish_mode).toBe('editorial_workflow');
    expect(config.load_config_file).toBe(false);
    expect(config.locale).toBe('pt');
    expect(config.backend).toMatchObject({
      name: 'github',
      repo: 'SURA-Team/frigobar',
      branch: 'main',
      base_url: 'https://exemplo.workers.dev',
      auth_endpoint: 'auth',
    });
    expect(config.local_backend).toBeUndefined();
  });

  it('grava mídia em public/uploads com caminho relativo uploads/', () => {
    expect(config.media_folder).toBe('public/uploads');
    expect(config.public_folder).toBe('uploads');
  });

  it('catálogo: foto com limite de 10 MB e extensões do schema; ícones e etiquetas do código', () => {
    const categorias = campo(camposDoArquivo(config, 'catalogo', 'catalogo'), 'categorias');
    const itens = campo(categorias.fields, 'itens');
    const foto = campo(itens.fields, 'foto');
    expect(foto.widget).toBe('image');
    expect(foto.pattern[0]).toBe(PADROES.imagem);
    expect(foto.media_library.config.max_file_size).toBe(LIMITES.imagemBytes);
    expect(LIMITES.imagemBytes).toBe(10 * 1024 * 1024);

    const icone = campo(categorias.fields, 'icone');
    expect(icone.options.map((o: Json) => o.value)).toEqual([...ICONE_IDS]);
    const etiquetas = campo(itens.fields, 'etiquetas');
    expect(etiquetas.options.map((o: Json) => o.value)).toEqual([...ETIQUETA_IDS]);

    const preco = campo(itens.fields, 'preco');
    expect(preco).toMatchObject({ widget: 'number', min: 0, max: 9999.99, required: true });
  });

  it('limites de texto seguem o data-model', () => {
    const categorias = campo(camposDoArquivo(config, 'catalogo', 'catalogo'), 'categorias');
    const nomeCategoria = campo(categorias.fields, 'nome');
    const regex = new RegExp(nomeCategoria.pattern[0]);
    expect(regex.test('x'.repeat(40))).toBe(true);
    expect(regex.test('x'.repeat(41))).toBe(false);
    expect(regex.test('')).toBe(false);
  });

  it('modo local usa decap-server sem rascunhos', () => {
    const local = criarConfig({ local: true }) as Json;
    expect(local.local_backend).toBe(true);
    expect(local.publish_mode).not.toBe('editorial_workflow');
    expect(local.backend.base_url).toBeUndefined();
  });
});
