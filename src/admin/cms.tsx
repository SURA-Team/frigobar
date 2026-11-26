/**
 * Painel de administração (Decap CMS) em /admin/. Ver research R1/R2 e docs/configuracao-cms.md.
 */
import CMS from 'decap-cms-app';
import type { CmsWidgetControlProps } from 'decap-cms-core';
import type { ComponentType } from 'react';
import { pt } from 'decap-cms-locales';
import estiloSite from '../styles/global.css?inline';
import { criarConfig } from './config';
import { PagePreview } from './preview/PagePreview';
import estiloPreview from './preview/preview.css?inline';
import { FontControl } from './widgets/FontWidget';
import { IconControl } from './widgets/IconWidget';
import { PaletteControl } from './widgets/PaletteWidget';

const local = ['localhost', '127.0.0.1'].includes(location.hostname);
const urlAuth = import.meta.env.VITE_CMS_AUTH_URL?.trim() || undefined;

/** Os widgets aceitam `value` ausente (campo novo); o tipo do Decap o declara obrigatório. */
const comoWidget = (controle: unknown) => controle as ComponentType<CmsWidgetControlProps>;

function avisarLoginNaoConfigurado(): void {
  document.title = 'Painel não configurado';
  const aviso = document.createElement('main');
  aviso.className = 'aviso-config';
  aviso.innerHTML = `
    <h1>O login do painel ainda não foi configurado</h1>
    <p>Falta informar o endereço do serviço de login (variável <code>CMS_AUTH_URL</code> do
    repositório). Veja <code>docs/configuracao-cms.md</code>.</p>`;
  document.body.appendChild(aviso);
}

if (!local && !urlAuth) {
  avisarLoginNaoConfigurado();
} else {
  CMS.registerLocale('pt', pt);
  CMS.registerPreviewStyle(estiloSite, { raw: true });
  CMS.registerPreviewStyle(estiloPreview, { raw: true });
  CMS.registerWidget('paleta', comoWidget(PaletteControl));
  CMS.registerWidget('fonte', comoWidget(FontControl));
  CMS.registerWidget('icone', comoWidget(IconControl));
  for (const arquivo of ['catalogo', 'identidade-visual', 'textos-contatos']) {
    CMS.registerPreviewTemplate(arquivo, PagePreview);
  }
  CMS.init({ config: criarConfig({ local, urlAuth }) });
}
