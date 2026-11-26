# Frigobar — Andrade Hotéis

Página estática acessada por QR code nos quartos da Andrade Hotéis, apresentando o frigobar
(itens, preços, fotos e informações). Textos, cores, fontes, ícones e fotos são editáveis por
administradores em um painel (`/admin/`), sem necessidade de programar.

- **Stack**: React 19 + TypeScript + Vite 7; painel com [Decap CMS](https://decapcms.org/)
- **Hospedagem**: GitHub Pages (gratuito), com subdomínio próprio a definir
- **Metodologia**: Spec-Driven Development com [GitHub Spec Kit](https://github.com/github/spec-kit)

## Documentação

| Para quem | Documento |
|-----------|-----------|
| Funcionários do hotel que atualizam a página | [docs/guia-administrador.md](docs/guia-administrador.md) |
| Quem administra o repositório (configuração única do painel, login e Pages) | [docs/configuracao-cms.md](docs/configuracao-cms.md) |
| Desenvolvedores (spec, plano, validação) | [specs/001-pagina-publica-frigobar/](specs/001-pagina-publica-frigobar/) |

## Desenvolvimento

Pré-requisitos: Node.js 24 LTS (`.nvmrc`) e npm.

```powershell
npm install
npx playwright install chromium   # navegador dos testes e2e

npm run dev          # página em http://localhost:5173/frigobar/
npm run cms:local    # + painel sem login em http://localhost:5173/frigobar/admin/ (grava em content/)
```

### Gates (os mesmos do CI)

```powershell
npm run lint         # ESLint + Prettier
npm run typecheck    # tsc --noEmit
npm run validate     # valida content/ (schema, contraste, arquivos e tamanhos)
npm test             # Vitest (unitários e componentes, sobre tests/fixtures/)
npm run build        # validação + otimização de imagens + build em dist/
npm run test:e2e     # Playwright a 360px + axe, sobre um build de tests/fixtures/
npm run size         # JS da página pública ≤ 100 KB gzip
npm run lighthouse   # Lighthouse CI (acessibilidade = 100 bloqueante)
```

### Onde fica cada coisa

```
content/                 # conteúdo editado pelo painel (site.json, theme.json, catalog.json)
public/uploads/          # fotos, logotipo e fontes enviadas pelo painel
src/
  App.tsx, components/   # página do hóspede (também usada na pré-visualização do painel)
  content/schema.ts      # schema Zod: contrato do conteúdo (muda junto com src/admin/config.ts)
  theme/                 # contraste WCAG, fontes e variáveis CSS do tema
  admin/                 # painel Decap (config, pré-visualização, widgets) e gerador de QR code
scripts/                 # validação de conteúdo, imagens, plugins do Vite, tamanho do bundle
tests/fixtures/          # conteúdo de teste congelado (não editado pelo painel)
```

Regras do projeto: conteúdo exibido ao hóspede nunca fica fixo em componente; mudou o formato
do conteúdo, atualize juntos `src/content/schema.ts`, `src/admin/config.ts` e
`specs/001-pagina-publica-frigobar/contracts/content-files.md`.

## Como trabalhamos (Spec-Driven Development)

Nenhuma funcionalidade é implementada sem spec. Os princípios do projeto estão em
[.specify/memory/constitution.md](.specify/memory/constitution.md).

| Etapa | Skill (Claude Code) | Resultado |
|-------|---------------------|-----------|
| 1. Especificar | `/speckit-specify <descrição>` | branch `NNN-slug` + `specs/NNN-slug/spec.md` (o quê e por quê) |
| 2. Clarificar (recomendado) | `/speckit-clarify` | ambiguidades resolvidas na spec |
| 3. Planejar | `/speckit-plan <diretrizes técnicas>` | `plan.md`, `research.md`, `data-model.md`… (como) |
| 4. Checklist (opcional) | `/speckit-checklist` | checklist de qualidade dos requisitos |
| 5. Tarefas | `/speckit-tasks` | `tasks.md` com tarefas ordenadas |
| 6. Analisar (recomendado) | `/speckit-analyze` | relatório de consistência spec ↔ plano ↔ tarefas |
| 7. Implementar | `/speckit-implement` | código + testes |

Depois: Pull Request para `main` → CI → merge publica no GitHub Pages.

Pré-requisitos do fluxo: [Claude Code](https://claude.com/claude-code),
[uv](https://docs.astral.sh/uv/) + Specify CLI
(`uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`) e PowerShell
(os scripts do Spec Kit deste repositório usam `ps`).
