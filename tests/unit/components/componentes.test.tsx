/**
 * Testes de componentes que exibem conteúdo (constituição: componentes dinâmicos têm testes).
 * Usam o conteúdo de tests/fixtures/content via alias @conteudo.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../../src/App';
import { CategoryNav } from '../../../src/components/CategoryNav';
import { ContactBlock } from '../../../src/components/ContactBlock';
import { Footer } from '../../../src/components/Footer';
import { GeneralInfo } from '../../../src/components/GeneralInfo';
import { Header } from '../../../src/components/Header';
import { ItemCard } from '../../../src/components/ItemCard';
import { ItemDetail } from '../../../src/components/ItemDetail';
import { atribuirSlugs, categoriasExibidas } from '../../../src/content/derive';
import { conteudoPublicado } from '../../../src/content/load';

const { site, catalogo } = conteudoPublicado;
const categorias = categoriasExibidas(atribuirSlugs(catalogo));
const todosItens = categorias.flatMap((c) => c.itens);
const item = (nome: string) => todosItens.find((i) => i.nome.startsWith(nome))!;

describe('ItemCard', () => {
  it('corta a descrição em 2 linhas e usa miniatura decorativa', () => {
    const { container } = render(
      <ItemCard item={item('Chocolate 70%')} iconeCategoria="candy" onAbrir={() => {}} />,
    );
    expect(container.querySelector('.card__descricao')).toHaveTextContent('Chocolate amargo');
    const comFoto = render(
      <ItemCard item={item('Cerveja')} iconeCategoria="cup-soda" onAbrir={() => {}} />,
    );
    // O nome já está no botão; a miniatura não repete o nome para leitores de tela.
    expect(comFoto.container.querySelector('img')).toHaveAttribute('alt', '');
    expect(
      screen.getByRole('button', { name: /Cerveja long neck.*R\$ 14,50/ }),
    ).toBeInTheDocument();
  });

  it('chama onAbrir com o slug ao tocar', () => {
    const onAbrir = vi.fn();
    render(<ItemCard item={item('Batata')} iconeCategoria="popcorn" onAbrir={onAbrir} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onAbrir).toHaveBeenCalledWith('batata-chips-45-g', expect.any(HTMLElement));
  });
});

describe('ItemDetail', () => {
  it('mostra foto com alt = nome, descrição completa e aviso de álcool', () => {
    const { container } = render(
      <ItemDetail item={item('Cerveja')} iconeCategoria="cup-soda" onFechar={() => {}} />,
    );
    expect(container.querySelector('dialog img')).toHaveAttribute('alt', 'Cerveja long neck');
    expect(screen.getByRole('note')).toHaveTextContent('Venda proibida para menores de 18 anos.');
  });

  it('Esc (evento cancel) e o botão Fechar pedem o fechamento', () => {
    const onFechar = vi.fn();
    const { container } = render(
      <ItemDetail item={item('Batata')} iconeCategoria="popcorn" onFechar={onFechar} />,
    );
    fireEvent(container.querySelector('dialog')!, new Event('cancel', { cancelable: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onFechar).toHaveBeenCalledTimes(2);
  });

  it('não mostra aviso de álcool para item comum', () => {
    render(<ItemDetail item={item('Batata')} iconeCategoria="popcorn" onFechar={() => {}} />);
    expect(screen.queryByRole('note')).toBeNull();
  });
});

describe('ContactBlock', () => {
  it('não renderiza sem contatos', () => {
    const { container } = render(<ContactBlock contatos={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra só os contatos preenchidos; ramal sem link', () => {
    render(<ContactBlock contatos={site.contatos} />);
    expect(screen.getByRole('link', { name: 'Conversar no WhatsApp' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ligar/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /e-mail/ })).toBeNull();
    const ramal = screen.getByText('9');
    expect(ramal.closest('a')).toBeNull();
  });

  it('gera botões de telefone e e-mail quando preenchidos', () => {
    render(<ContactBlock contatos={{ telefone: '(51) 3333-4444', email: 'a@b.com.br' }} />);
    expect(screen.getByRole('link', { name: 'Ligar para a recepção' })).toHaveAttribute(
      'href',
      'tel:+555133334444',
    );
    expect(screen.getByRole('link', { name: 'Enviar e-mail' })).toHaveAttribute(
      'href',
      'mailto:a@b.com.br',
    );
  });
});

describe('Header', () => {
  it('mostra logotipo com alt = nome do hotel, título e boas-vindas', () => {
    render(<Header site={site} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Andrade Hotéis');
    expect(screen.getByAltText('Andrade Hotéis')).toBeInTheDocument();
    expect(screen.getByText(site.boasVindas!)).toBeInTheDocument();
  });

  it('não deixa elemento vazio sem boas-vindas nem capa', () => {
    const { container } = render(
      <Header site={{ ...site, boasVindas: undefined, fotoCapa: undefined }} />,
    );
    expect(container.querySelector('.cabecalho__boas-vindas')).toBeNull();
    expect(container.querySelector('.cabecalho__capa')).toBeNull();
  });
});

describe('GeneralInfo', () => {
  it('preserva quebras de linha', () => {
    render(<GeneralInfo texto={'Linha 1\nLinha 2'} />);
    const texto = screen.getByText(/Linha 1/);
    expect(texto.textContent).toBe('Linha 1\nLinha 2');
    expect(texto).toHaveClass('info__texto'); // white-space: pre-line no CSS
  });

  it('não renderiza se vazio', () => {
    expect(render(<GeneralInfo texto="" />).container).toBeEmptyDOMElement();
    expect(render(<GeneralInfo />).container).toBeEmptyDOMElement();
  });
});

describe('Footer', () => {
  it('exibe o rodapé e some quando vazio', () => {
    render(<Footer texto="Andrade Hotéis" />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Andrade Hotéis');
    expect(render(<Footer texto="  " />).container).toBeEmptyDOMElement();
  });
});

describe('CategoryNav', () => {
  it('não renderiza com uma única categoria', () => {
    expect(
      render(<CategoryNav categorias={categorias.slice(0, 1)} />).container,
    ).toBeEmptyDOMElement();
  });

  it('um link #cat/<slug> por categoria exibida', () => {
    render(<CategoryNav categorias={categorias} />);
    const links = within(screen.getByRole('navigation')).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#cat/bebidas',
      '#cat/snacks',
      '#cat/chocolates',
    ]);
  });
});

describe('App', () => {
  it('renderiza categorias, informações, contatos e rodapé do conteúdo', () => {
    render(<App conteudo={conteudoPublicado} modoPreview />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Bebidas',
      'Snacks',
      'Chocolates',
      'Informações',
      'Fale com a recepção',
    ]);
  });

  it('com todos os itens ocultos mostra o estado vazio, sem atalhos nem seções', () => {
    const oculto = {
      categorias: catalogo.categorias.map((c) => ({
        ...c,
        itens: c.itens.map((i) => ({ ...i, visivel: false })),
      })),
    };
    const { container } = render(
      <App conteudo={{ ...conteudoPublicado, catalogo: oculto }} modoPreview />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Fale com a recepção');
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(container.querySelectorAll('section.categoria')).toHaveLength(0);
  });

  it('no modo preview abre e fecha o detalhe sem mexer no histórico', () => {
    const pushState = vi.spyOn(history, 'pushState');
    render(<App conteudo={conteudoPublicado} modoPreview />);
    fireEvent.click(screen.getByRole('button', { name: /Batata chips/ }));
    expect(screen.getByRole('heading', { level: 2, name: /Batata chips/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('heading', { level: 2, name: /Batata chips/ })).toBeNull();
    expect(pushState).not.toHaveBeenCalled();
  });
});
