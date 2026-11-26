import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { conteudoPublicado } from './content/load';
import './styles/global.css';
import { prepararFontes } from './theme/fonts';
import { aplicarTema } from './theme/tokens';

aplicarTema(conteudoPublicado.tema);
void prepararFontes(conteudoPublicado.tema.fontes);

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Elemento #raiz não encontrado em index.html');

createRoot(raiz).render(
  <StrictMode>
    <App conteudo={conteudoPublicado} />
  </StrictMode>,
);
