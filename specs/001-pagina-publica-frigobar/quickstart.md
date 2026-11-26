# Quickstart: validação da feature 001

Guia para rodar e **provar** que a feature funciona de ponta a ponta. Detalhes de dados em
[data-model.md](data-model.md); formato dos arquivos em [contracts/content-files.md](contracts/content-files.md);
URLs em [contracts/public-urls.md](contracts/public-urls.md).

## Pré-requisitos

- Node.js 24 LTS e npm
- Navegadores do Playwright: `npx playwright install chromium`
- Para validar o CMS com login real: OAuth App do GitHub + Cloudflare Worker configurados
  (ver "Configuração única do CMS" abaixo)

## Rodar localmente

```powershell
npm install
npm run dev            # site em http://localhost:5173/frigobar/
npm run cms:local      # CMS local sem login (decap-server) em http://localhost:5173/frigobar/admin/
```

`cms:local` usa o modo `local_backend` do Decap: edita os arquivos de `content/` direto no disco,
útil para testar formulários, widgets e preview sem GitHub. Nesse modo **não há rascunhos**:
salvar grava direto no arquivo. O fluxo de rascunho, publicação e reversão só existe com o
backend GitHub (seção "Fluxo real de publicação").

Os testes automatizados não usam o `content/` real: usam o conteúdo congelado em
`tests/fixtures/` (variáveis `FRIGOBAR_CONTENT_DIR` e `FRIGOBAR_UPLOADS_DIR`).

## Gates automatizados (os mesmos do CI)

```powershell
npm run lint           # ESLint + Prettier
npm run typecheck      # tsc --noEmit
npm run validate       # valida o content/ real contra o schema (contraste, arquivos, tamanhos)
npm test               # Vitest (unitários e componentes, sobre tests/fixtures/)
npm run build          # otimiza imagens + build de produção em dist/
npm run test:e2e       # Playwright em 360×740 + axe, contra um build de tests/fixtures/
```

Esperado: todos terminam com código 0.

## Cenários de validação manual

### US1 — Hóspede (P1)

1. `npm run build && npm run preview`; abra a URL no celular (mesma rede) ou no DevTools a 360px.
2. Verifique: logotipo, nome, boas-vindas; categorias na ordem do `catalog.json`; preços como
   `R$ 14,50`; item com preço 0 como "Cortesia"; nenhuma rolagem horizontal.
3. Toque em um atalho de categoria → rola até ela.
4. Toque em um item → abre detalhe; use o "voltar" do celular → volta à lista na mesma posição.
   Abra em nova aba `<base>#item/<slug>` → o detalhe abre; "voltar" fecha e continua no site.
5. Categoria com cerveja (`alcoolico`) → aviso legal aparece uma vez na categoria e no detalhe.
6. Marque um item como `"visivel": false` → some da página.
7. Deixe só `whatsapp` e `ramal` em `contatos` → aparecem só o botão de WhatsApp e o ramal.

### US2/US3 — Administrador (P2/P3), com `npm run cms:local`

1. Edite o preço de um item, troque uma foto (envie uma de ~8 MB) e oculte outro item → a
   pré-visualização mostra as mudanças; `content/catalog.json` é atualizado.
2. Tente salvar item sem nome → bloqueado com mensagem. Tente usar uma foto `.gif` → bloqueado
   com mensagem de formatos aceitos.
3. Crie duas categorias "Bebidas" e "bebidas" → a pré-visualização mostra o aviso vermelho de
   nome repetido.
4. Na Identidade visual, coloque texto `#999999` sobre fundo `#FFFFFF` → aviso de contraste e
   salvamento bloqueado.
5. Escolha "Fonte própria" e envie um `.woff2` → pré-visualização usa a fonte. Envie uma fonte
   de 3 MB → recusada.

### US2 — Fluxo real de publicação (GitHub)

1. Entre em `<base>admin/` com uma conta GitHub colaboradora.
2. Altere um preço → salve → o rascunho aparece no "Workflow" e um PR é aberto no GitHub.
3. Mude para "Pronto" → aguarde o check `ci` do PR ficar verde (caminho rápido, ≤ 2 min, pois o
   PR só altera `content/`) → "Publicar" → o deploy roda; em ≤ 10 min o preço novo aparece em
   `<base>` (SC-004).
4. No GitHub, abra o PR mesclado → "Revert" → "Merge" → o preço antigo volta (SC-006).
5. Crie um rascunho inválido (ex.: categorias com nome repetido) e tente "Publicar" → o Decap
   mostra erro de publicação porque o CI do PR falhou; a página pública não muda.
6. Dois rascunhos do catálogo a partir da mesma versão, alterando o mesmo item: publique o
   primeiro, depois o segundo → o segundo é recusado com erro de conflito (FR-022).

### US4 — QR code

1. Abra `<base>admin/qrcode.html` → baixe SVG e PNG.
2. Com `enderecoDefinitivo: false` → aviso de endereço provisório visível.
3. Imprima em 5×5 cm e leia com dois celulares diferentes → ambos abrem `<base>`.

### Desempenho e acessibilidade

- Lighthouse (mobile) em `<base>`: Performance ≥ 90, Accessibility = 100 (SC-001, FR-010).
- `npm run test:e2e` inclui varredura axe sem violações.

## Configuração única do CMS (uma vez por repositório)

1. GitHub → Settings → Developer settings → **OAuth Apps** → novo app com callback
   `https://<worker>.workers.dev/callback`.
2. Publicar o Worker `sveltia-cms-auth` na conta Cloudflare (plano gratuito) com os segredos
   `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` e `ALLOWED_DOMAINS` = domínio do site.
3. Repositório → Settings → Secrets and variables → **Variables**: `CMS_AUTH_URL` = URL do
   Worker (o deploy a injeta como `VITE_CMS_AUTH_URL`; nada é fixado no código).
4. Repositório → Settings → **Pages** → Source: GitHub Actions. Variável `PAGES_BASE_PATH`
   (`/frigobar/` ou `/` com domínio próprio).
5. Repositório → Settings → **Branches** (ou Rulesets) → regra para `main`: exigir Pull Request
   e o status check `ci` aprovado antes do merge, **sem** aprovações obrigatórias (desmarcar
   "Require approvals" — o administrador publica sozinho, FR-020).
6. Adicionar cada administrador como colaborador com permissão **Write**.
