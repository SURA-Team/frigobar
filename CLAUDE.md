# CLAUDE.md

Página estática (React + TypeScript + Vite) acessada por QR code nos quartos da Andrade Hotéis,
apresentando o frigobar. Publicada gratuitamente no GitHub Pages. Conteúdo e visual (textos,
cores, ícones, fotos) são editáveis por administradores.

## Regras do projeto

- **Spec-Driven Development com Spec Kit.** Leia [.specify/memory/constitution.md](.specify/memory/constitution.md)
  antes de qualquer trabalho; ela prevalece sobre estas notas.
- Não escreva código de aplicação sem spec + plano + tarefas em `specs/NNN-slug/`. Se o pedido
  for uma feature nova, sugira `/speckit-specify` em vez de implementar direto.
- Specs, planos, tarefas, mensagens de commit e documentação em **português do Brasil**.
- Conteúdo exibido ao hóspede nunca fica fixado em componente — sempre vem dos arquivos de
  conteúdo/tema validados por schema.
- Custo zero: nada de serviço pago ou backend próprio.

## Fluxo

`/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze`
→ `/speckit-implement` → PR para `main`.

- Uma branch por feature (`NNN-slug`), criada automaticamente pelo `/speckit-specify` (extensão git).
- Scripts do Spec Kit são PowerShell (`.specify/scripts/powershell/`).

## Pendências conhecidas

- Subdomínio da Andrade Hotéis ainda não definido: o build precisa suportar o base path
  `/frigobar/` (github.io) e a raiz (domínio próprio) por configuração.
- Mecanismo de edição por administradores: a decidir no plano da primeira feature (opções
  compatíveis com GitHub Pages: CMS baseado em Git como Sveltia/Decap CMS, ou serviço com
  plano gratuito).
