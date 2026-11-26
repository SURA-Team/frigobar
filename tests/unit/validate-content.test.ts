import { cpSync, mkdtempSync, readFileSync, rmSync, truncateSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { validarConteudo } from '../../scripts/validate-content';
import { DIR_FIXTURES } from './helpers';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

let raiz: string;
let dirConteudo: string;
let dirUploads: string;

function ler(nome: string): Json {
  return JSON.parse(readFileSync(path.join(dirConteudo, nome), 'utf8'));
}
function gravar(nome: string, dados: Json): void {
  writeFileSync(path.join(dirConteudo, nome), JSON.stringify(dados));
}
function validar() {
  return validarConteudo({ dirConteudo, dirUploads });
}

beforeEach(() => {
  raiz = mkdtempSync(path.join(tmpdir(), 'frigobar-validacao-'));
  cpSync(DIR_FIXTURES, raiz, { recursive: true });
  dirConteudo = path.join(raiz, 'content');
  dirUploads = path.join(raiz, 'uploads');
});

afterEach(() => {
  rmSync(raiz, { recursive: true, force: true });
});

describe('validarConteudo', () => {
  it('aprova o conteúdo de teste', () => {
    expect(validar()).toEqual([]);
  });

  it('reporta arquivo referenciado inexistente com o caminho do campo', () => {
    const catalogo = ler('catalog.json');
    catalogo.categorias[0].itens[0].foto = 'uploads/nao-existe.jpg';
    gravar('catalog.json', catalogo);
    expect(validar()).toEqual([
      {
        arquivo: 'catalog.json',
        campo: 'categorias[0].itens[0].foto',
        mensagem: expect.stringContaining('"uploads/nao-existe.jpg" não foi encontrado'),
      },
    ]);
  });

  it('recusa foto acima de 10 MB', () => {
    truncateSync(path.join(dirUploads, 'agua.jpg'), 10 * 1024 * 1024 + 1); // arquivo esparso
    const erros = validar();
    expect(erros).toHaveLength(1);
    expect(erros[0]!.mensagem).toContain('o limite é 10,0 MB');
  });

  it('recusa fonte própria acima de 2 MB', () => {
    const fonte = path.join(dirUploads, 'marca.woff2');
    writeFileSync(fonte, '');
    truncateSync(fonte, 2 * 1024 * 1024 + 1);
    const tema = ler('theme.json');
    tema.fontes.textos = { origem: 'propria', nome: 'Marca', arquivo: 'uploads/marca.woff2' };
    gravar('theme.json', tema);
    const erros = validar();
    expect(erros).toHaveLength(1);
    expect(erros[0]).toMatchObject({ arquivo: 'theme.json', campo: 'fontes.textos.arquivo' });
    expect(erros[0]!.mensagem).toContain('o limite é 2,0 MB');
  });

  it('aceita logo SVG mas recusa foto SVG (extensão validada pelo schema)', () => {
    const catalogo = ler('catalog.json');
    catalogo.categorias[0].itens[0].foto = 'uploads/logo.svg';
    gravar('catalog.json', catalogo);
    const erros = validar();
    expect(erros).toHaveLength(1);
    expect(erros[0]!.mensagem).toContain('Use imagem JPEG, PNG ou WebP');
  });

  it('recusa fonte .ttc', () => {
    const tema = ler('theme.json');
    tema.fontes.titulos = { origem: 'propria', nome: 'Marca', arquivo: 'uploads/marca.ttc' };
    gravar('theme.json', tema);
    expect(validar()[0]!.mensagem).toBe('Use arquivo de fonte WOFF2, WOFF, TTF ou OTF.');
  });

  it('reporta contraste insuficiente', () => {
    const tema = ler('theme.json');
    tema.cores.texto = '#999999';
    gravar('theme.json', tema);
    expect(validar()).toEqual([
      {
        arquivo: 'theme.json',
        campo: 'cores',
        mensagem: expect.stringContaining('Texto sobre o fundo'),
      },
    ]);
  });

  it('reporta JSON inválido e erros de vários arquivos juntos', () => {
    writeFileSync(path.join(dirConteudo, 'site.json'), '{ quebrado');
    const catalogo = ler('catalog.json');
    catalogo.categorias[0].itens[0].preco = -1;
    gravar('catalog.json', catalogo);
    const erros = validar();
    expect(erros.map((e) => e.arquivo)).toEqual(['site.json', 'catalog.json']);
    expect(erros[0]!.mensagem).toMatch(/^JSON inválido/);
    expect(erros[1]).toMatchObject({ campo: 'categorias[0].itens[0].preco' });
  });
});
