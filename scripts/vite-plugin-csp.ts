/**
 * Content-Security-Policy da página pública, injetada só no build (no `vite dev` o React
 * Refresh usa script inline). O painel (/admin/) não recebe a CSP: o Decap carrega recursos
 * do GitHub e do Worker de login.
 */
import path from 'node:path';
import type { Plugin } from 'vite';

export const CSP_PAGINA_PUBLICA = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

export function cspPlugin(): Plugin {
  return {
    name: 'frigobar-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const relativo = path.relative(process.cwd(), ctx.filename).replace(/\\/g, '/');
        if (relativo !== 'index.html') return html;
        const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP_PAGINA_PUBLICA}" />`;
        return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${meta}`);
      },
    },
  };
}
