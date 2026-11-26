# Implementation Plan: Página pública do frigobar com identidade visual editável

**Branch**: `001-pagina-publica-frigobar` | **Date**: 2026-11-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-pagina-publica-frigobar/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Site estático em React publicado no GitHub Pages: uma página mobile-first que lista os itens do
frigobar por categoria (card compacto + detalhe ao tocar, etiquetas, aviso legal de álcool,
contatos opcionais) e uma área `/admin/` com **Decap CMS** onde administradores, logados com
conta GitHub, editam catálogo, textos, cores, fontes, ícones e fotos. Cada alteração vira um
rascunho com pré-visualização renderizada pelos mesmos componentes do site; ao publicar, o
rascunho é mesclado na `main` e o GitHub Actions valida o conteúdo, otimiza imagens e publica.
O histórico do Git é o registro oficial e permite reverter qualquer publicação. Custo: R$ 0
(GitHub Pages + Actions + Cloudflare Worker gratuito só para o login OAuth).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 24 LTS (build/CI)

**Primary Dependencies**: React 18.3, Vite 7, Decap CMS 3.x (`decap-cms-app`, só no `/admin/`),
Zod 4 (schema de conteúdo), lucide-react (ícones), @fontsource/* (8 fontes padrão), qrcode
(gerador de QR), sharp (otimização de imagens no build)

**Storage**: Arquivos JSON versionados em `content/` + mídia em `public/uploads/` (Git é o banco
de dados e o histórico). Sem banco de dados.

**Testing**: Vitest + Testing Library (unitários/componentes), Playwright + @axe-core/playwright
(e2e e acessibilidade em 360×740) sobre conteúdo de teste congelado em `tests/fixtures/`,
Lighthouse CI (acessibilidade bloqueante; desempenho como aviso)

**Target Platform**: Navegadores móveis modernos (Safari iOS 16+, Chrome Android 2 últimas
versões); desktop funcional. Hospedagem: GitHub Pages.

**Project Type**: Aplicação web estática (SPA de página única + painel CMS), projeto único

**Performance Goals**: LCP < 2,5 s em 4G (Princípio V) — conteúdo inicial visível ≤ 3 s (SC-001);
Lighthouse Performance ≥ 90 mobile; JS da página pública ≤ 100 KB gzip (sem o CMS)

**Constraints**: Custo zero; sem servidor próprio; repositório público (sem segredos/dados
pessoais); base path configurável (`/frigobar/` ou `/`); React 18 (compatibilidade Decap);
publicação visível ≤ 10 min (SC-004)

**Scale/Scope**: 1 hotel; ≤ 30 categorias e ≤ 80 itens por categoria (tipicamente 20–60 itens
no total); ≤ 5 administradores; tráfego de dezenas a centenas de acessos/dia

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Restrição | Como o plano atende | Status |
|---|---|---|
| I. Spec antes de código | Spec + clarificações aprovadas; plano e tarefas antes de implementar | ✅ |
| II. Estático e custo zero | GitHub Pages + Actions; único serviço externo é o Worker OAuth gratuito, justificado em [research.md R2](research.md) e em Complexity Tracking. Se cair, só o login do admin é afetado | ✅ (justificado) |
| III. Conteúdo separado do código | Todo conteúdo em `content/*.json` validado por schema Zod no CMS, na pré-visualização e no CI (proteção de branch impede publicar conteúdo inválido); tema aplicado via variáveis CSS | ✅ |
| IV. Edição sem programar | Decap CMS com formulários em português; histórico via PRs; restauração pelo botão "Revert" do GitHub com guia ([R10](research.md)); acesso só para colaboradores; segredo OAuth só no Worker | ✅ |
| V. Mobile-first, rápido, acessível | Layout 360px+, imagens WebP responsivas geradas no build, fontes só as selecionadas com `swap`, contraste bloqueante, axe no e2e | ✅ |
| VI. Simplicidade | Sem roteador, sem gerenciador de estado, sem backend; cada dependência justificada em research.md | ✅ |
| Restrição: base path / domínio | `PAGES_BASE_PATH` + mídia com caminhos relativos ([contracts/public-urls.md](contracts/public-urls.md)) | ✅ |
| Restrição: estabilidade do QR | `urlPublica` + `enderecoDefinitivo` com aviso no gerador de QR | ✅ |
| Restrição: repositório público | Nenhum dado pessoal; segredos fora do repo | ✅ |
| Fluxo: gates de CI | lint, type-check, testes, validação de schema, build e e2e em todo PR (inclusive PRs do CMS) | ✅ |
| Testes obrigatórios | Validação de conteúdo/tema e componentes dinâmicos cobertos por Vitest/Playwright | ✅ |

**Re-check pós-design (Phase 1)**: ✅ sem novas violações. Riscos registrados abaixo.

## Project Structure

### Documentation (this feature)

```text
specs/001-pagina-publica-frigobar/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões técnicas (R1–R14)
├── data-model.md        # Phase 1 — entidades, validações, estados
├── quickstart.md        # Phase 1 — como rodar e validar
├── contracts/
│   ├── content-files.md # Formato dos JSON de conteúdo (CMS ↔ site)
│   └── public-urls.md   # URLs públicas e garantias de estabilidade
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Phase 2 (/speckit-tasks — ainda não criado)
```

### Source Code (repository root)

```text
content/                      # Conteúdo editado pelo CMS (fonte da verdade)
├── site.json
├── theme.json
└── catalog.json

public/
├── uploads/                  # Fotos, logotipo, capa e fontes enviadas pelo CMS
└── CNAME                     # Só quando houver subdomínio próprio

index.html                    # Entrada da página pública
admin/
├── index.html                # Entrada do Decap CMS
└── qrcode.html               # Entrada do gerador de QR code

src/
├── main.tsx                  # Bootstrap da página pública
├── App.tsx
├── components/               # Header, CategoryNav, CategorySection, ItemCard, ItemDetail,
│                             # TagBadge, AlcoholNotice, ContactBlock, GeneralInfo, EmptyState
├── content/
│   ├── schema.ts             # Schema Zod + tipos (contrato dos JSON)
│   ├── load.ts               # Importa e valida content/*.json
│   ├── derive.ts             # slugs, categorias exibidas, temAlcoolico
│   └── format.ts             # preço pt-BR, links de telefone/WhatsApp/e-mail
├── theme/
│   ├── contrast.ts           # Cálculo e regras WCAG
│   ├── tokens.ts             # Tema → variáveis CSS
│   └── fonts.ts              # Lista padrão + carregamento dinâmico + @font-face própria
├── icons/
│   ├── registry.ts           # Ícones de categoria disponíveis no CMS
│   └── tags.ts               # Etiquetas fixas + aviso legal
├── images/
│   └── Picture.tsx           # <img srcset> a partir do manifesto
├── styles/
│   └── global.css
├── admin/
│   ├── cms.tsx               # Inicializa Decap (manual init), registra preview e widgets
│   ├── config.ts             # Configuração do Decap em TS: backend, coleções e campos; listas
│   │                         # de ícones/etiquetas/fontes importadas do código (sem duplicação)
│   ├── preview/PagePreview.tsx   # Renderiza <App> com conteúdo publicado + rascunho
│   ├── widgets/              # PaletteWidget (contraste), FontWidget, IconWidget
│   └── qrcode.tsx            # Página do gerador de QR code
└── generated/                # Manifesto de imagens (gerado no build, fora do Git)

scripts/
├── validate-content.ts       # Gate de schema/contraste/arquivos existentes
└── optimize-images.ts        # sharp → WebP 400/800/1600 + manifesto

tests/
├── fixtures/                 # Conteúdo de teste congelado (nunca editado pelo CMS)
│   ├── content/              # site.json, theme.json, catalog.json
│   └── uploads/              # imagens referenciadas pelos fixtures
├── unit/                     # schema, contrast, format, derive, validate-content, componentes
└── e2e/                      # jornadas US1 + axe (Playwright)

docs/
├── configuracao-cms.md       # Configuração única: OAuth, Worker, Pages, proteção de branch
└── guia-administrador.md     # Passo a passo para não técnicos (editar, publicar, reverter)

.github/workflows/
├── ci.yml                    # PRs: lint, typecheck, validate, test, build, e2e
└── deploy.yml                # push na main: build + deploy no GitHub Pages
```

**Structure Decision**: projeto web único (sem backend). A página pública e o CMS são duas
entradas do mesmo build Vite e compartilham componentes, schema e tema — é isso que garante que a
pré-visualização do CMS seja idêntica à página do hóspede. O bundle do Decap só é carregado em
`/admin/`, mantendo a página pública leve.

## Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Decap ainda sem React 19 | Ficamos em React 18.3 | Sem impacto funcional; reavaliar quando Decap suportar |
| Dois administradores no **mesmo** rascunho ao mesmo tempo ([R11](research.md)) | Último salvamento prevalece dentro do rascunho (recuperável no histórico, como prevê o FR-022) | Guia orienta avisar a equipe; ≤ 5 admins |
| Conteúdo inválido publicado pelo CMS ([R4](research.md)) | Deploy falharia e o site ficaria na versão anterior sem aviso | Validação no CMS + aviso na pré-visualização + proteção de branch exigindo CI antes do merge |
| Restauração via GitHub "Revert" pode ser difícil para não técnicos | SC-006 (≤ 5 min) não atingido | Guia com capturas; validar com funcionário; se falhar, spec de página "Histórico" própria |
| Administradores precisam de conta GitHub | Atrito no onboarding | Guia de criação de conta; é um passo único |
| Fotos acumulam no repositório | Repo cresce com o tempo | Otimização no build não altera originais; limite de 10 MB por foto; revisar se passar de 500 MB |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Serviço externo: Cloudflare Worker (OAuth) | GitHub exige `client_secret` para emitir token; site estático não pode guardá-lo (Princípio IV) | Token pessoal colado no CMS não é suportado pelo Decap e é inviável para não técnicos; Netlify Identity está depreciado |
| Segunda entrada de build (`/admin/`) com Decap CMS (bundle grande) | Edição sem código com rascunho e preview fiel (FR-020, Princípio IV) | Painel próprio exigiria reimplementar formulários, upload, rascunhos e auth (fere VI) |
