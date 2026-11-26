---

description: "Task list for feature 001 — Página pública do frigobar com identidade visual editável"
---

# Tasks: Página pública do frigobar com identidade visual editável

**Input**: Design documents from `/specs/001-pagina-publica-frigobar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos. A constituição exige testes automatizados para validação de conteúdo/tema e
para componentes que renderizam conteúdo dinâmico. TDD estrito não é exigido; escreva o teste
junto ou logo após a implementação, mas antes de marcar a tarefa como concluída.

**Organization**: Tarefas agrupadas por história de usuário para permitir implementação e teste
independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: História a que a tarefa pertence (US1, US2, US3, US4)
- Todos os caminhos são relativos à raiz do repositório (projeto único — ver plan.md)

## Convenções para quem implementar

- Código, nomes de variáveis de domínio e mensagens de UI em **português** (ex.: `nomeHotel`,
  `preco`, `etiquetas`); termos técnicos do ecossistema podem ficar em inglês (`props`, `hook`).
- Restrições de campo vêm de [data-model.md](data-model.md); o formato dos JSON de
  [contracts/content-files.md](contracts/content-files.md); URLs de
  [contracts/public-urls.md](contracts/public-urls.md).
- React **18.3** (não 19 — restrição do Decap CMS, research R1).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o projeto Vite + React + TypeScript com ferramentas de qualidade

- [ ] T001 Criar `package.json` (name `frigobar`, `private: true`, `type: "module"`, `engines.node: ">=24"`) com scripts: `dev` (vite), `validate` (`tsx scripts/validate-content.ts`), `images` (`tsx scripts/optimize-images.ts`), `build` (`npm run validate && npm run images && tsc --noEmit && vite build`), `preview` (vite preview), `lint` (`eslint . && prettier --check .`), `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:e2e` (`playwright test`), `cms:local` (executa `decap-server` e `vite` em paralelo); criar `.nvmrc` com `24`
- [ ] T002 Instalar dependências em `package.json`: runtime `react@18.3` `react-dom@18.3` `zod@4` `lucide-react` `@fontsource/inter` `@fontsource/lato` `@fontsource/montserrat` `@fontsource/nunito` `@fontsource/raleway` `@fontsource/playfair-display` `@fontsource/lora` `@fontsource/merriweather`; dev `vite@7` `@vitejs/plugin-react` `typescript@5` `@types/react@18` `@types/react-dom@18` `@types/node` `tsx` `sharp` `vitest` `jsdom` `@testing-library/react` `@testing-library/jest-dom` `@testing-library/user-event` `@playwright/test` `@axe-core/playwright` `eslint` `typescript-eslint` `eslint-plugin-react-hooks` `prettier` `decap-server` `concurrently`
- [ ] T003 [P] Criar `tsconfig.json` (strict, `jsx: react-jsx`, `resolveJsonModule`, `moduleResolution: bundler`, `noUncheckedIndexedAccess`, inclui `src`, `scripts`, `tests`, `vite.config.ts`, `playwright.config.ts`)
- [ ] T004 [P] Criar `eslint.config.js` (flat config com typescript-eslint recommended + react-hooks) e `.prettierrc` / `.prettierignore` (ignorar `dist`, `src/generated`, `public/_img`, `specs`, `.specify`, `.claude`)
- [ ] T005 [P] Criar `vitest.config.ts` (environment `jsdom`, `setupFiles: tests/setup.ts`, include `tests/unit/**/*.test.ts?(x)`) e `tests/setup.ts` importando `@testing-library/jest-dom/vitest`
- [ ] T006 [P] Criar `playwright.config.ts`: projeto único Chromium com viewport 360×740, `isMobile: true`, `hasTouch: true`; `webServer` executando `npm run preview -- --port 4173`; `baseURL` `http://localhost:4173/frigobar/`; testes em `tests/e2e`
- [ ] T007 [P] Acrescentar ao `.gitignore`: `src/generated/`, `public/_img/`, `test-results/`, `playwright-report/`, `.lighthouseci/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema de conteúdo, tema, ícones, pipeline de imagens, validação e CI — base de todas as histórias

**⚠️ CRITICAL**: Nenhuma história pode começar antes desta fase terminar

- [ ] T008 Criar `vite.config.ts` com `@vitejs/plugin-react`, `base: process.env.PAGES_BASE_PATH ?? '/frigobar/'` e `build.rollupOptions.input` contendo `index.html` (entradas do admin serão adicionadas em US2/US4)
- [ ] T009 [P] Criar `src/icons/tags.ts`: enumeração fixa de etiquetas `alcoolico` (rótulo "Alcoólico", ícone `Wine`), `sem-gluten` ("Sem glúten", `WheatOff`), `sem-lactose` ("Sem lactose", `MilkOff`), `vegano` ("Vegano", `Vegan`), `novo` ("Novo", `Sparkles`) de `lucide-react`; exportar `ETIQUETA_IDS` (tupla `as const`) e a constante `AVISO_ALCOOL = "Venda proibida para menores de 18 anos. Beba com moderação."`
- [ ] T010 [P] Criar `src/icons/registry.ts`: registro curado de ~30 ícones de categoria do `lucide-react` (ex.: `cup-soda`, `beer`, `wine`, `martini`, `glass-water`, `milk`, `coffee`, `candy`, `cookie`, `popcorn`, `sandwich`, `apple`, `citrus`, `nut`, `ice-cream-cone`, `croissant`, `pizza`, `package`, `shopping-basket`, `heart`, `star`, `leaf`, `baby`, `pill`, `sparkles`) mapeando id → `{ componente, rotulo }` em português; exportar `ICONE_IDS` (tupla `as const`) e `ICONE_PADRAO = 'package'`
- [ ] T011 [P] Criar `src/theme/fonts.ts` com `FONTES_PADRAO`: ids `inter`, `lato`, `montserrat`, `nunito`, `raleway`, `playfair-display`, `lora`, `merriweather`, cada um com `nome` exibido, `familia` CSS e `fallback` (`system-ui, sans-serif` para sans; `Georgia, serif` para serif) e função `carregarFontePadrao(id)` que faz import dinâmico de `@fontsource/<id>/400.css` e `/700.css`; exportar `FONTE_PADRAO_IDS` (tupla `as const`)
- [ ] T012 Criar `src/content/schema.ts` com Zod **estrito** (`.strict()`), importando `ETIQUETA_IDS`, `ICONE_IDS` e `FONTE_PADRAO_IDS`, exportando schemas e tipos inferidos. Regras de [data-model.md](data-model.md): **Site** — `nomeHotel` "1–80 caracteres"; `boasVindas` "até 300 caracteres"; `logo` obrigatório; `fotoCapa` opcional; `informacoesGerais` "até 2.000 caracteres"; `rodape` "até 200 caracteres"; `contatos.telefone` e `contatos.whatsapp` "10–11 dígitos (DDD + número), aceita máscara"; `contatos.email` "e-mail válido"; `contatos.ramal` "1–6 dígitos"; `urlPublica` "`https://` absoluta"; `enderecoDefinitivo` booleano; opcionais vazios (`""`) tratados como ausentes. **Tema** — 5 cores "hex `#RRGGBB`"; `fontes.titulos`/`fontes.textos` como união discriminada por `origem` (`padrao` exige `padrao` ∈ `FONTE_PADRAO_IDS`; `propria` exige `nome` "1–60 caracteres" e `arquivo`). **Catálogo** — `categorias` "0–30 itens"; Categoria: `nome` "1–40 caracteres; único no catálogo (sem diferenciar maiúsculas/acentos)", `icone` ∈ `ICONE_IDS`, `visivel` padrão `true`, `itens` "0–80"; Item: `nome` "1–60 caracteres", `descricao` "até 500 caracteres", `preco` "≥ 0, no máximo 2 casas decimais, ≤ 9.999,99", `foto` opcional, `etiquetas` "sem repetição" ⊂ `ETIQUETA_IDS`, `visivel` padrão `true`. Mensagens de erro em português (depende de T009–T011)
- [ ] T013 [P] Criar `src/theme/contrast.ts`: `luminanciaRelativa(hex)`, `razaoContraste(a, b)`, `melhorTextoSobre(hex)` (retorna `#000000` ou `#FFFFFF`) e `validarContrasteTema(cores)` retornando lista de violações com mensagem em português para as 4 regras: "`texto` × `fundo` ≥ 4,5:1", "`principal` × `fundo` ≥ 3:1", "melhor entre preto/branco sobre `principal` ≥ 4,5:1", "melhor entre preto/branco sobre `destaque` ≥ 4,5:1"
- [ ] T014 [P] Criar `src/content/format.ts`: `formatarPreco(preco)` → `"Cortesia"` se 0, senão `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` (ex.: `"R$ 12,50"`); `somenteDigitos(texto)`; `linkTelefone(tel)` → `tel:+55<dígitos>`; `linkWhatsapp(numero)` → `https://wa.me/55<dígitos>`; `linkEmail(email)` → `mailto:`
- [ ] T015 [P] Criar `src/content/derive.ts`: `slugificar(texto)` (minúsculas, sem acentos, hífens); `atribuirSlugs(catalogo)` (slug por item a partir do nome com sufixos `-2`, `-3`… para repetidos no catálogo inteiro; slug por categoria); `categoriasExibidas(catalogo)` (`visivel` e ao menos um item visível, itens filtrados por `visivel`); `temAlcoolico(categoria)` (algum item visível com etiqueta `alcoolico`)
- [ ] T016 Criar `src/content/load.ts`: importa `content/site.json`, `content/theme.json`, `content/catalog.json`, faz `parse` com os schemas de `src/content/schema.ts` e exporta `conteudoPublicado` tipado (`{ site, tema, catalogo }`) (depende de T012)
- [ ] T017 [P] Criar `src/theme/tokens.ts`: `temaParaVariaveisCss(tema)` → `--cor-principal`, `--cor-secundaria`, `--cor-fundo`, `--cor-texto`, `--cor-destaque`, `--cor-sobre-principal`, `--cor-sobre-destaque`, `--fonte-titulos`, `--fonte-textos` (com fallback); `aplicarTema(tema, alvo = document.documentElement)` (depende de T011, T013)
- [ ] T018 [P] Criar `src/styles/global.css`: base mobile-first usando apenas as variáveis de T017; container centralizado com `max-width: 640px` e gutter de 16px; `overflow-wrap: anywhere` em textos; nenhum elemento mais largo que a viewport; foco visível; `@media (prefers-reduced-motion: reduce)` desativando rolagem suave e animações
- [ ] T019 [P] Criar conteúdo de exemplo válido em `content/site.json`, `content/theme.json` e `content/catalog.json` seguindo [contracts/content-files.md](contracts/content-files.md): 3 categorias (Bebidas, Snacks, Chocolates), ~10 itens, incluindo 1 item com preço 0, 1 com etiqueta `alcoolico`, 1 oculto, 1 sem foto e 1 com descrição longa; e `public/uploads/logo.svg` (logotipo provisório simples) e 2–3 fotos de exemplo livres de direitos em `public/uploads/`
- [ ] T020 Criar `scripts/validate-content.ts`: valida os 3 JSON com os schemas, roda `validarContrasteTema`, verifica que cada arquivo referenciado existe em `public/`, que imagens são JPEG/PNG/WebP (SVG aceito só para `logo`) com "≤ 10 MB" e fontes são WOFF2/WOFF/TTF/OTF com "≤ 2 MB"; imprime todos os erros em português com o caminho do campo e sai com código 1 se houver erro (depende de T012, T013)
- [ ] T021 Criar `scripts/optimize-images.ts` com sharp: para cada imagem referenciada no conteúdo, gera WebP em larguras 400 e 800 (e 1600 para `fotoCapa`) em `public/_img/<hash-do-arquivo>-<largura>.webp`, sem ampliar imagens menores; SVG é repassado sem conversão; grava `src/generated/image-manifest.json` (`{ [caminhoOriginal]: { largura, altura, variantes: [{ largura, url }] } }`); pula arquivos cujo hash não mudou (depende de T016)
- [ ] T022 [P] Criar `src/images/Picture.tsx`: recebe `src` (caminho relativo do conteúdo), `alt`, `sizes`, `prioridade` (eager vs lazy); monta `srcSet` a partir do manifesto prefixando `import.meta.env.BASE_URL`; define `width`/`height` para não deslocar o layout; sem entrada no manifesto (ex.: blob do preview do CMS) usa `src` direto
- [ ] T023 [P] Testes unitários em `tests/unit/schema.test.ts`: aceita conteúdo de exemplo; rejeita nome de item vazio, preço negativo, preço com 3 casas, preço > 9.999,99, etiqueta desconhecida, etiqueta repetida, categoria com nome duplicado ("Bebidas" vs "bebidas"), cor fora de `#RRGGBB`, campo desconhecido, telefone com 9 dígitos, ramal com 7 dígitos, fonte `propria` sem `arquivo`
- [ ] T024 [P] Testes unitários em `tests/unit/contrast.test.ts` (pares conhecidos: preto/branco = 21:1; `#999999` sobre `#FFFFFF` falha 4,5:1; cada uma das 4 regras gera mensagem própria), `tests/unit/format.test.ts` (`12.5` → `"R$ 12,50"`, `0` → `"Cortesia"`, links de telefone/WhatsApp/e-mail com máscara) e `tests/unit/derive.test.ts` (slug com acentos, sufixos para nomes repetidos, categoria oculta, categoria sem itens visíveis, `temAlcoolico` ignorando item oculto)
- [ ] T025 Criar `.github/workflows/ci.yml`: em `pull_request` (todas as branches, inclusive `cms/**`) e `push` fora da `main`; Node 24 com cache npm; passos `npm ci`, `npm run lint`, `npm run typecheck`, `npm run validate`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run test:e2e`; publicar o relatório do Playwright como artefato em caso de falha

**Checkpoint**: Fundação pronta — conteúdo validado, tema e imagens prontos para uso

---

## Phase 3: User Story 1 - Hóspede consulta o frigobar pelo QR code (Priority: P1) 🎯 MVP

**Goal**: Página pública mobile-first com cabeçalho, atalhos de categoria, cards compactos, detalhe do item, etiquetas, aviso de álcool, informações gerais e contatos — publicada no GitHub Pages

**Independent Test**: Com o conteúdo de exemplo publicado, abrir `<base>` no celular (ou 360px) e validar os cenários 1–8 da US1 em [spec.md](spec.md) e a seção "US1 — Hóspede" do [quickstart.md](quickstart.md)

### Tests for User Story 1

- [ ] T026 [P] [US1] Teste e2e `tests/e2e/hospede.spec.ts` cobrindo os cenários de aceite 1–8 da US1: categorias na ordem do JSON; preço `"R$ 14,50"` e `"Cortesia"`; atalho de categoria rola até ela; tocar no card abre o detalhe e `page.goBack()` fecha e preserva `scrollY`; item oculto ausente; aviso de álcool aparece exatamente uma vez na categoria e também no detalhe; item sem foto mostra ícone da categoria; só contatos preenchidos aparecem; `document.documentElement.scrollWidth <= 360`; abrir `#item/<slug>` direto abre o detalhe
- [ ] T027 [P] [US1] Teste e2e `tests/e2e/acessibilidade.spec.ts` com `@axe-core/playwright` (tags `wcag2a`, `wcag2aa`, `wcag21aa`) na página inicial e com o detalhe aberto: zero violações
- [ ] T028 [P] [US1] Testes de componentes em `tests/unit/components/ItemCard.test.tsx`, `ItemDetail.test.tsx` e `ContactBlock.test.tsx` (descrição com classe de corte em 2 linhas; `alt` da foto = nome do item; Esc fecha o detalhe; bloco de contatos não renderiza sem contatos; ramal sem link)

### Implementation for User Story 1

- [ ] T029 [P] [US1] Criar `src/components/Header.tsx`: logotipo (`Picture`, prioridade alta, `alt` = nome do hotel), `<h1>` com `nomeHotel`, `boasVindas` opcional e `fotoCapa` opcional como fundo/banner com contraste garantido sobre o texto
- [ ] T030 [P] [US1] Criar `src/components/CategoryNav.tsx`: renderiza só se houver mais de uma categoria exibida; links `#cat/<slug>` com ícone e nome, rolagem horizontal interna (sem rolar a página), rolagem suave respeitando `prefers-reduced-motion` (FR-005)
- [ ] T031 [P] [US1] Criar `src/components/TagBadge.tsx` (ícone + rótulo da etiqueta de `src/icons/tags.ts`) e `src/components/AlcoholNotice.tsx` (texto `AVISO_ALCOOL`, papel `note`)
- [ ] T032 [P] [US1] Criar `src/components/ItemCard.tsx`: `<button>` acessível com foto pequena (`Picture` lazy ou ícone da categoria quando sem foto — FR-007), nome, `formatarPreco`, etiquetas e descrição limitada a 2 linhas (`line-clamp` com reticências — FR-004); ao clicar chama `onAbrir(slug)`
- [ ] T033 [US1] Criar `src/components/ItemDetail.tsx` com `<dialog>` nativo: foto ampliada, nome, preço, etiquetas, descrição completa (`white-space: pre-line`) e `AlcoholNotice` se `alcoolico`; ao abrir faz `history.pushState` com `#item/<slug>`; `popstate` fecha; botão "Fechar" e Esc chamam `history.back()`; devolve o foco ao card de origem (FR-004b) (depende de T031)
- [ ] T034 [US1] Criar `src/components/CategorySection.tsx`: `<section id="cat/<slug>">` com `<h2>`, ícone, `AlcoholNotice` uma única vez quando `temAlcoolico` e lista de `ItemCard` (depende de T031, T032)
- [ ] T035 [P] [US1] Criar `src/components/GeneralInfo.tsx` (`informacoesGerais` com `white-space: pre-line`, oculto se vazio — FR-008) e `src/components/ContactBlock.tsx` (botões para `tel:`, WhatsApp e `mailto:` só para contatos preenchidos; ramal só em texto; não renderiza se nenhum contato — FR-008a)
- [ ] T036 [P] [US1] Criar `src/components/EmptyState.tsx` ("No momento não há itens disponíveis. Fale com a recepção.") e `src/components/Footer.tsx` (`rodape`)
- [ ] T037 [US1] Criar `src/App.tsx` recebendo `conteudo: { site, tema, catalogo }` **por props** (necessário para reuso no preview do CMS): aplica slugs e filtros de `derive.ts`, renderiza Header, CategoryNav, seções ou EmptyState, GeneralInfo, ContactBlock e Footer; controla o item aberto a partir de `location.hash` (`#item/<slug>`; slug inexistente é ignorado) e rola para `#cat/<slug>` no carregamento (depende de T029–T036)
- [ ] T038 [US1] Criar `src/main.tsx` (`aplicarTema`, `carregarFontePadrao` das fontes do tema, `createRoot(...).render(<App conteudo={conteudoPublicado} />)`) e `index.html` (`lang="pt-BR"`, viewport, `<title>` e `meta description` com nome do hotel, `theme-color`, `<noscript>` em português) (depende de T037)
- [ ] T039 [US1] Criar `.github/workflows/deploy.yml`: em `push` na `main` e `workflow_dispatch`; permissões `pages: write`, `id-token: write`; build com `PAGES_BASE_PATH: ${{ vars.PAGES_BASE_PATH || '/frigobar/' }}` (roda validação e otimização de imagens); `actions/upload-pages-artifact` com `dist`; `actions/deploy-pages`; `concurrency` de grupo `pages` sem cancelar deploy em andamento

**Checkpoint**: MVP — página do hóspede funcional, testada e publicável. Conteúdo ainda é editado no JSON por desenvolvedores

---

## Phase 4: User Story 2 - Administrador mantém o catálogo de itens (Priority: P2)

**Goal**: Área `/admin/` com Decap CMS (login GitHub, rascunho + pré-visualização fiel + publicação) para editar categorias e itens

**Independent Test**: Com `npm run cms:local`, alterar preço, trocar foto (~8 MB) e ocultar item, ver as mudanças na pré-visualização e em `content/catalog.json`; no fluxo real, publicar e ver a mudança em `<base>` em ≤ 10 min e reverter pelo GitHub (seções US2 do [quickstart.md](quickstart.md))

### Tests for User Story 2

- [ ] T040 [P] [US2] Teste unitário `tests/unit/admin/mesclarConteudo.test.ts`: o rascunho da entrada em edição substitui apenas o arquivo correspondente (`site`, `tema` ou `catalogo`) e os demais vêm do conteúdo publicado; dados incompletos do rascunho (campos ainda vazios) não quebram a renderização
- [ ] T041 [P] [US2] Teste unitário `tests/unit/admin/config.test.ts`: a configuração gerada tem `publish_mode: 'editorial_workflow'`, `locale: 'pt'`, `media_folder: 'public/uploads'`, `public_folder: 'uploads'`, limite de mídia de 10 MB, e as opções de `icone` e `etiquetas` são exatamente `ICONE_IDS` e `ETIQUETA_IDS`

### Implementation for User Story 2

- [ ] T042 [US2] Instalar `decap-cms-app@3` em `package.json`; adicionar `admin/index.html` (`<meta name="robots" content="noindex">`, script `src/admin/cms.tsx`) e incluí-lo em `build.rollupOptions.input` de `vite.config.ts`
- [ ] T043 [US2] Criar `src/admin/config.ts` exportando a configuração do Decap: `load_config_file: false`; `backend: { name: 'github', repo: 'SURA-Team/frigobar', branch: 'main', base_url: <URL do Worker OAuth — constante com TODO até a configuração>, auth_endpoint: 'auth' }`; `local_backend: true`; `publish_mode: 'editorial_workflow'`; `locale: 'pt'`; `media_folder: 'public/uploads'`; `public_folder: 'uploads'`; `media_library` com `max_file_size: 10485760`; coleção de arquivos `catalogo` → `content/catalog.json`, formato `json`, rótulo "Catálogo", com lista `categorias` (campos `nome` string obrigatório com pattern de "1–40 caracteres", `icone` select com opções de `ICONE_IDS`/rótulos do registro, `visivel` boolean padrão `true`, lista `itens` com `nome` "1–60 caracteres", `descricao` text "até 500 caracteres", `preco` number `value_type: float` `min: 0` `max: 9999.99` `step: 0.01`, `foto` image opcional, `etiquetas` select `multiple` com `ETIQUETA_IDS`, `visivel` boolean padrão `true`); textos de ajuda em português em cada campo (depende de T042)
- [ ] T044 [US2] Criar `src/admin/preview/mesclarConteudo.ts`: recebe o conteúdo publicado e os dados da entrada em edição (`entry.get('data').toJS()`) + nome do arquivo e retorna `{ site, tema, catalogo }` com defaults seguros para campos ainda incompletos
- [ ] T045 [US2] Criar `src/admin/preview/PagePreview.tsx`: usa `mesclarConteudo` + `conteudoPublicado`, resolve mídia com `getAsset` (blob URLs para uploads ainda não publicados), aplica `aplicarTema` no `document` do iframe do preview e renderiza `<App conteudo={...} />` (depende de T044)
- [ ] T046 [US2] Criar `src/admin/cms.tsx`: `CMS.init({ config })` com a configuração de T043; `CMS.registerPreviewStyle` com `src/styles/global.css` (import `?url` / `?inline`); `CMS.registerPreviewTemplate('catalogo', PagePreview)` (depende de T043, T045)
- [ ] T047 [P] [US2] Criar `docs/configuracao-cms.md`: passo a passo único para criar o OAuth App do GitHub (callback do Worker), publicar o Worker `sveltia-cms-auth` no Cloudflare (plano gratuito) com `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_DOMAINS`, atualizar `base_url` em `src/admin/config.ts`, ativar GitHub Pages com fonte "GitHub Actions", definir a variável `PAGES_BASE_PATH` e adicionar administradores como colaboradores com permissão Write
- [ ] T048 [P] [US2] Criar `docs/guia-administrador.md` em linguagem não técnica: criar conta GitHub; entrar em `<base>admin/`; editar item/categoria; salvar (vira rascunho); pré-visualizar; mudar status para "Pronto" e "Publicar"; quanto tempo até aparecer; como **reverter** uma publicação pelo botão "Revert" do Pull Request no GitHub (com espaço para capturas de tela); boa prática de avisar a equipe antes de editar o catálogo (risco R11); dicas de foto (horizontal, boa luz, até 10 MB)
- [ ] T049 [US2] Validar manualmente o fluxo da seção "US2/US3 — Administrador" (passos 1–2) e "US2 — Fluxo real de publicação" do [quickstart.md](quickstart.md); registrar resultado e tempos (SC-003, SC-004, SC-006) em `specs/001-pagina-publica-frigobar/validacao.md` (depende de T046–T048)

**Checkpoint**: US1 + US2 — hóspede vê o catálogo e administradores mantêm itens sem código

---

## Phase 5: User Story 3 - Administrador personaliza a identidade visual e os textos (Priority: P3)

**Goal**: Coleções "Identidade visual" (cores com contraste bloqueante, fontes padrão/próprias, logotipo, capa) e "Textos e contatos" no CMS, com pré-visualização fiel

**Independent Test**: Trocar logotipo e cor principal, publicar e ver ambos em `<base>`; tentar texto `#999999` sobre fundo `#FFFFFF` e ver o salvamento bloqueado; enviar `.woff2` e ver a fonte na pré-visualização (seção "US2/US3 — Administrador", passos 3–4, do [quickstart.md](quickstart.md))

### Tests for User Story 3

- [ ] T050 [P] [US3] Teste de componente `tests/unit/admin/PaletteWidget.test.tsx`: exibe razão de contraste de cada regra; `isValid()` retorna erro em português para `#999999` sobre `#FFFFFF` e `true` para a paleta de exemplo
- [ ] T051 [P] [US3] Teste unitário `tests/unit/fonts.test.ts`: fonte `propria` gera `@font-face` com `font-display: swap`, `url` prefixada por `BASE_URL` e família com fallback do sistema; fonte `padrao` resolve família e fallback corretos

### Implementation for User Story 3

- [ ] T052 [US3] Estender `src/theme/fonts.ts` com `registrarFontePropria({ nome, arquivo }, documento = document)`: injeta `@font-face` (`font-family` = nome, `src` = `BASE_URL + arquivo` com `format()` pela extensão, `font-display: swap`) e retorna a pilha `"<nome>", system-ui, sans-serif`; atualizar `src/theme/tokens.ts` e `src/main.tsx` para usar fonte própria quando `origem = 'propria'` (FR-017a)
- [ ] T053 [P] [US3] Criar `src/admin/widgets/PaletteWidget.tsx` (widget Decap de objeto com as 5 cores): `<input type="color">` + campo hex para cada cor, amostra de texto sobre fundo/principal/destaque, lista de verificações de `validarContrasteTema` com razão calculada, e `isValid()` bloqueando salvar enquanto houver violação (FR-018, SC-005)
- [ ] T054 [P] [US3] Criar `src/admin/widgets/FontWidget.tsx` (widget Decap de objeto): escolha de `origem` ("Fonte da lista" / "Fonte própria"); para `padrao`, lista de `FONTES_PADRAO` com amostra "Água, café e pão de queijo — R$ 12,50" renderizada na própria fonte; para `propria`, campo `nome` e upload de arquivo via media library do Decap aceitando WOFF2/WOFF/TTF/OTF até 2 MB; aviso para conferir acentos na pré-visualização
- [ ] T055 [P] [US3] Criar `src/admin/widgets/IconWidget.tsx`: grade de ícones de `src/icons/registry.ts` com rótulo, seleção por clique/teclado; substituir o select de `icone` em `src/admin/config.ts` pelo novo widget
- [ ] T056 [US3] Adicionar a `src/admin/config.ts` as coleções de arquivos `identidade-visual` → `content/theme.json` (rótulo "Identidade visual"; `cores` com `PaletteWidget`; `fontes.titulos` e `fontes.textos` com `FontWidget`) e `textos-contatos` → `content/site.json` (rótulo "Textos e contatos"; `nomeHotel`, `boasVindas`, `logo` image, `fotoCapa` image opcional, `informacoesGerais` text, `rodape`, objeto `contatos` com `telefone`/`whatsapp`/`email`/`ramal` opcionais e `pattern` de validação conforme data-model, `urlPublica`, `enderecoDefinitivo` boolean com texto de ajuda sobre QR codes) (depende de T053–T055)
- [ ] T057 [US3] Em `src/admin/cms.tsx`, registrar os widgets (`CMS.registerWidget('paleta' | 'fonte' | 'icone', ...)`) e o `PagePreview` também para `identidade-visual` e `textos-contatos`; garantir que `PagePreview` registra fonte própria no documento do iframe (depende de T052, T056)
- [ ] T058 [US3] Validar manualmente os passos 3–4 de "US2/US3 — Administrador" do [quickstart.md](quickstart.md) e os cenários de aceite da US3; registrar em `specs/001-pagina-publica-frigobar/validacao.md`

**Checkpoint**: US1–US3 — identidade visual e textos editáveis com proteção de contraste

---

## Phase 6: User Story 4 - Administrador obtém o QR code para impressão (Priority: P3)

**Goal**: Página `admin/qrcode.html` que gera QR code (SVG e PNG 2048×2048, correção M) da `urlPublica` e avisa quando o endereço é provisório

**Independent Test**: Baixar SVG/PNG, imprimir em 5×5 cm e ler com dois celulares; com `enderecoDefinitivo: false`, ver o aviso (seção "US4 — QR code" do [quickstart.md](quickstart.md))

### Tests for User Story 4

- [ ] T059 [P] [US4] Teste e2e `tests/e2e/qrcode.spec.ts`: a página exibe a `urlPublica` do conteúdo, oferece downloads SVG e PNG (verifica `download` e tipo do arquivo) e mostra o aviso de endereço provisório quando `enderecoDefinitivo` é `false`

### Implementation for User Story 4

- [ ] T060 [US4] Instalar `qrcode` e `@types/qrcode` em `package.json`; criar `admin/qrcode.html` (`noindex`, `lang="pt-BR"`) e incluí-lo em `build.rollupOptions.input` de `vite.config.ts`
- [ ] T061 [US4] Criar `src/admin/qrcode.tsx`: lê `conteudoPublicado.site`, gera QR com `errorCorrectionLevel: 'M'` e margem 4; mostra prévia e URL codificada; botões "Baixar SVG" (`QRCode.toString` tipo `svg`) e "Baixar PNG 2048×2048" (`QRCode.toDataURL` com `width: 2048`); aviso destacado quando `enderecoDefinitivo` é `false` explicando que QR codes impressos podem precisar ser trocados (FR-023); orientação de impressão mínima de 3×3 cm; aplica o tema do site (depende de T060)
- [ ] T062 [US4] Adicionar em `src/admin/config.ts` a descrição da coleção `textos-contatos` com link para `admin/qrcode.html` ("Gerar QR code para impressão")

**Checkpoint**: Todas as histórias funcionais e testáveis de forma independente

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Desempenho, segurança, documentação e validação final

- [ ] T063 [P] Adicionar Lighthouse CI não bloqueante em `.github/workflows/ci.yml` com `lighthouserc.json` (preset mobile, asserts de aviso: Performance ≥ 0.9, Accessibility = 1) contra `npm run preview`
- [ ] T064 [P] Criar `scripts/check-bundle-size.ts` e etapa no CI: falha se o JS da página pública (excluindo chunks do admin) passar de 100 KB gzip
- [ ] T065 [P] Adicionar CSP via `<meta http-equiv="Content-Security-Policy">` em `index.html` (`default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'none'; base-uri 'self'; form-action 'none'`) e verificar que a página e o e2e continuam funcionando
- [ ] T066 [P] Atualizar `README.md` com comandos de desenvolvimento (de quickstart.md) e links para `docs/guia-administrador.md` e `docs/configuracao-cms.md`
- [ ] T067 Executar todos os gates do [quickstart.md](quickstart.md) (`lint`, `typecheck`, `validate`, `test`, `build`, `test:e2e`) e o roteiro manual completo; Lighthouse mobile em `<base>` (SC-001, SC-008); registrar em `specs/001-pagina-publica-frigobar/validacao.md`
- [ ] T068 Teste de usabilidade com ao menos 1 funcionário do hotel (SC-003: alterar preço e publicar em ≤ 2 min após ≤ 15 min de orientação; SC-006: reverter em ≤ 5 min) e com 3+ pessoas no papel de hóspede (SC-002: achar preço em ≤ 30 s); registrar em `specs/001-pagina-publica-frigobar/validacao.md` e abrir spec de melhoria se algum critério falhar

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as histórias
- **US1 (Phase 3)**: depende da Fase 2
- **US2 (Phase 4)**: depende da Fase 2 e de `src/App.tsx` com conteúdo por props (T037) para o preview
- **US3 (Phase 5)**: depende da US2 (infraestrutura do CMS: T042–T046)
- **US4 (Phase 6)**: depende só da Fase 2 (pode rodar em paralelo com US1–US3); T062 depende de T056
- **Polish (Phase 7)**: depende das histórias desejadas

### User Story Dependencies

```text
Setup → Foundational ─┬─> US1 (P1, MVP) ──> US2 (P2) ──> US3 (P3)
                      └─> US4 (P3) ............................ (T062 após T056)
```

- **US1**: independente
- **US2**: reutiliza `App` da US1 no preview; testável sozinha com `cms:local`
- **US3**: estende a infraestrutura do CMS da US2
- **US4**: independente (lê `content/site.json`)

### Within Each User Story

- Testes podem ser escritos em paralelo à implementação, mas devem passar antes do checkpoint
- Componentes folha antes dos compostos (TagBadge/ItemCard → CategorySection → App)
- `src/admin/config.ts` e `src/admin/cms.tsx` são editados em US2, US3 e US4 — essas tarefas são sequenciais

### Parallel Opportunities

- Setup: T003–T007
- Foundational: T009–T011 juntos; depois T013–T015, T017–T019, T022–T024 em paralelo
- US1: T026–T028 (testes) e T029–T032, T035–T036 (componentes folha)
- US2: T040–T041, T047–T048
- US3: T050–T051, T053–T055
- US4 inteira em paralelo com US1–US3
- Polish: T063–T066

---

## Parallel Example: User Story 1

```text
# Testes da US1 juntos:
Task: "Teste e2e tests/e2e/hospede.spec.ts (cenários 1–8)"
Task: "Teste e2e tests/e2e/acessibilidade.spec.ts (axe)"
Task: "Testes de componentes em tests/unit/components/"

# Componentes folha da US1 juntos:
Task: "src/components/Header.tsx"
Task: "src/components/CategoryNav.tsx"
Task: "src/components/TagBadge.tsx + AlcoholNotice.tsx"
Task: "src/components/ItemCard.tsx"
Task: "src/components/GeneralInfo.tsx + ContactBlock.tsx"
Task: "src/components/EmptyState.tsx + Footer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Fase 1 (Setup) → Fase 2 (Foundational)
2. Fase 3 (US1) → **PARAR e VALIDAR** com o quickstart
3. Publicar no GitHub Pages com conteúdo de exemplo/real editado em JSON
4. Ainda **não** imprimir QR codes definitivos (domínio pendente)

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → valida → deploy (MVP: hóspedes já usam)
3. US2 → valida com funcionário → administradores mantêm o catálogo
4. US3 → identidade visual e textos editáveis
5. US4 → QR codes oficiais (após confirmar o subdomínio e `enderecoDefinitivo: true`)
6. Polish → desempenho, segurança e teste de usabilidade

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- [Story] mapeia a tarefa para a história em [spec.md](spec.md)
- Commit ao fim de cada tarefa ou grupo lógico (autocommit do Spec Kit está ativo)
- Qualquer mudança no formato do conteúdo: atualizar juntos `src/content/schema.ts`,
  `src/admin/config.ts` e [contracts/content-files.md](contracts/content-files.md)
