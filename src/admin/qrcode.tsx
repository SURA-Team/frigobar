/**
 * Página do gerador de QR code (admin/qrcode.html). Não exige login: o QR code contém apenas o
 * endereço público da página (contracts/public-urls.md).
 */
import { Download, TriangleAlert } from 'lucide-react';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { conteudoPublicado } from '../content/load';
import '../styles/global.css';
import { aplicarTema } from '../theme/tokens';
import { gerarPng, gerarSvg, LARGURA_PNG, nomeArquivo } from './qrcode/gerar';
import './qrcode/qrcode.css';

interface Gerado {
  svg: string;
  png: string;
}

export function PaginaQrCode({ url, definitivo }: { url: string; definitivo: boolean }) {
  const [gerado, setGerado] = useState<Gerado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([gerarSvg(url), gerarPng(url)])
      .then(([svg, png]) => ativo && setGerado({ svg, png }))
      .catch(() => ativo && setErro('Não foi possível gerar o QR code. Recarregue a página.'));
    return () => {
      ativo = false;
    };
  }, [url]);

  const nome = nomeArquivo(url);
  const hrefSvg = gerado
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(gerado.svg)}`
    : '';

  return (
    <main className="container qr">
      <h1 className="qr__titulo">QR code do frigobar</h1>
      <p>
        Endereço codificado: <strong className="qr__url">{url}</strong>
      </p>

      {!definitivo && (
        <div className="qr__aviso" role="alert">
          <TriangleAlert size={20} aria-hidden="true" />
          <p>
            <strong>Endereço provisório.</strong> O endereço definitivo da página (subdomínio do
            hotel) ainda não foi confirmado. QR codes impressos agora podem precisar ser
            substituídos depois. Para uso definitivo, atualize o endereço em{' '}
            <em>Textos e contatos</em> no painel e marque <em>Endereço definitivo</em>.
          </p>
        </div>
      )}

      {erro && <p role="alert">{erro}</p>}

      {gerado && (
        <>
          <div
            className="qr__previa"
            role="img"
            aria-label={`QR code que abre ${url}`}
            dangerouslySetInnerHTML={{ __html: gerado.svg }}
          />
          <div className="qr__botoes">
            <a className="botao" href={hrefSvg} download={`${nome}.svg`}>
              <Download size={18} aria-hidden="true" />
              Baixar SVG (gráfica)
            </a>
            <a className="botao" href={gerado.png} download={`${nome}.png`}>
              <Download size={18} aria-hidden="true" />
              Baixar PNG {LARGURA_PNG}×{LARGURA_PNG}
            </a>
          </div>
        </>
      )}

      <section className="qr__dicas" aria-labelledby="dicas-titulo">
        <h2 id="dicas-titulo">Para imprimir</h2>
        <ul>
          <li>Tamanho mínimo de impressão: 3 × 3 cm (recomendado 5 × 5 cm).</li>
          <li>Mantenha a margem branca ao redor do código e imprima em preto sobre fundo claro.</li>
          <li>Antes de imprimir em quantidade, teste a leitura com dois celulares diferentes.</li>
          <li>O QR code não muda quando você altera itens, preços ou cores.</li>
        </ul>
      </section>
    </main>
  );
}

const raiz = document.getElementById('raiz');
if (raiz) {
  aplicarTema(conteudoPublicado.tema);
  createRoot(raiz).render(
    <StrictMode>
      <PaginaQrCode
        url={conteudoPublicado.site.urlPublica}
        definitivo={conteudoPublicado.site.enderecoDefinitivo}
      />
    </StrictMode>,
  );
}
