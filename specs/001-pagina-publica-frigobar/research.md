# Research: Página pública do frigobar com identidade visual editável

**Feature**: `001-pagina-publica-frigobar` | **Date**: 2026-11-26 | **Plan**: [plan.md](plan.md)

Cada decisão segue o formato Decisão / Racional / Alternativas consideradas.

---

## R1. Mecanismo de edição por administradores

**Decisão**: **Decap CMS 3.x** (CMS baseado em Git), servido em `/admin/` pelo próprio site
estático, com backend `github`, `publish_mode: editorial_workflow` e interface em português
(`locale: pt`). O conteúdo editado vive em arquivos JSON versionados no repositório.

**Racional**:
- Atende o Princípio II (sem servidor próprio, custo zero) e o Princípio IV (edição sem código,
  histórico no Git, acesso restrito).
- `editorial_workflow` implementa exatamente o FR-020: cada alteração vira um rascunho (branch +
  Pull Request); o próprio administrador muda o status para "Pronto" e clica em "Publicar", o que
  faz o merge na `main` e dispara o deploy.
- `registerPreviewTemplate` permite renderizar a pré-visualização com **os mesmos componentes
  React da página pública** (FR-020: "exatamente como o hóspede a verá").
- `registerWidget` permite widgets customizados em React (paleta com checagem de contraste,
  seletor de fonte, seletor de ícone).
- Decap é React; compartilhar componentes entre site e preview é direto.

**Alternativas consideradas**:
- **Sveltia CMS**: mais moderno e rápido, compatível com a configuração do Decap, mas não
  suporta editorial workflow nem templates de preview customizados — requisitos centrais
  (FR-020). Pode ser reavaliado no futuro, pois a migração a partir do Decap é simples.
- **Painel próprio (React + GitHub API)**: controle total, mas reimplementa rascunho,
  upload de mídia, formulários e autenticação — viola o Princípio VI (Simplicidade).
- **Backend como serviço (Supabase/Firebase)**: edição instantânea, mas adiciona banco de dados
  e dependência externa em runtime para a página pública (fere Princípios II e VI), e o
  histórico deixaria de ser o Git.
- **Editar JSON direto no GitHub**: zero esforço, mas exige conhecimento técnico (fere IV).

**Restrição derivada**: Decap 3.x suporta React 18 (suporte a React 19 ainda em aberto —
issue decaporg/decap-cms#7365). O projeto inteiro usa **React 18.3** para compartilhar
componentes com o preview do CMS.

---

## R2. Autenticação dos administradores

**Decisão**: Login com **conta GitHub individual** via OAuth App do GitHub, intermediado por
um **Cloudflare Worker** gratuito que troca o código OAuth por token (projeto open source
`sveltia-cms-auth`, compatível com Decap). Só usuários com permissão de escrita no repositório
conseguem salvar/publicar.

**Racional**:
- O GitHub exige um `client_secret` na troca do token; um site estático não pode guardá-lo.
  O Worker guarda o segredo fora do repositório (Princípio IV — segredos fora do bundle).
- Credencial individual (FR-013) e autoria nos commits (FR-021) vêm de graça.
- Plano gratuito do Cloudflare Workers (100 mil requisições/dia) excede em ordens de grandeza o
  uso (algumas dezenas de logins por mês).
- **Se o Worker cair**: administradores não conseguem entrar; a página pública não é afetada
  (FR-011 / Princípio II).

**Alternativas consideradas**:
- **Netlify Identity / Git Gateway**: depreciado e acopla a outro provedor de hospedagem.
- **Token pessoal (PAT) colado no CMS**: Decap não suporta, e é ruim para não técnicos.
- **Decap Turbo (SaaS)**: pago.

**Pré-requisito operacional**: cada administrador precisa de uma conta GitHub e ser adicionado
como colaborador com permissão de escrita no repositório `SURA-Team/frigobar`.

---

## R3. Hospedagem, deploy e endereço

**Decisão**: **GitHub Pages** com deploy via **GitHub Actions** (`actions/deploy-pages`) a cada
push na `main`. O base path é configurável por variável de repositório `PAGES_BASE_PATH`
(padrão `/frigobar/`; `/` quando houver subdomínio próprio com arquivo `public/CNAME`).

**Racional**: custo zero para repositório público; deploy em ~1–3 min, dentro do SC-004
(≤ 10 min). Ao configurar domínio próprio, o GitHub redireciona automaticamente
`sura-team.github.io/frigobar/` para o novo domínio, preservando QR codes já impressos.

**Alternativas consideradas**: Cloudflare Pages / Netlify (gratuitos, mas a constituição fixa
GitHub Pages e eles adicionariam outra conta para administrar).

---

## R4. Formato e validação do conteúdo

**Decisão**: Três arquivos JSON em `content/` — `site.json` (textos e contatos), `theme.json`
(cores e fontes) e `catalog.json` (categorias com itens aninhados). Um **schema Zod** único em
`src/content/schema.ts` gera os tipos TypeScript e valida o conteúdo:
1. no CMS (validações de campo + widgets customizados) — bloqueia salvar;
2. no build (`scripts/validate-content.ts`, executado antes do `vite build` e no CI) — se o
   conteúdo publicado for inválido, o deploy falha e o site continua na versão anterior.

**Racional**:
- Catálogo em um único arquivo permite que a pré-visualização mostre a página completa e que a
  ordem de categorias/itens seja simplesmente a ordem da lista (arrastar e soltar no Decap).
- Volume esperado (dezenas de itens) cabe com folga em um arquivo.
- Itens não precisam de ID digitado: o identificador para link do detalhe é derivado do nome
  (slug) com desambiguação automática.

**Alternativas consideradas**:
- Um arquivo por item (folder collection): reduz colisões de edição, mas obriga campo numérico
  de ordem (pior para não técnicos) e o preview de um item não vê os demais.
- YAML/Markdown com front matter: sem ganho; JSON é nativo para o app.

---

## R5. Imagens (fotos, logotipo, capa)

**Decisão**: Uploads do CMS vão para `public/uploads/`. No build, `scripts/optimize-images.ts`
(usando **sharp**) gera variantes **WebP** em 400px e 800px de largura (e 1600px para a capa),
mais um manifesto (`src/generated/image-manifest.json`, não versionado). Componentes usam
`<img srcset>` com `loading="lazy"` fora da primeira dobra e `width/height` explícitos para não
deslocar o layout. Limite de upload de 10 MB configurado no media library do Decap
(`max_file_size`).

**Racional**: fotos de celular (3–8 MB) viram ~40–120 KB por variante; atende Princípio V e
SC-001. Otimizar no build mantém o CMS simples.

**Sobre HEIC**: iOS Safari converte HEIC para JPEG ao enviar por `<input type="file">`; o build
aceita JPEG, PNG e WebP e falha com mensagem clara para outros formatos.

**Alternativas consideradas**: `vite-imagetools` (exige imports estáticos, mas as imagens vêm do
JSON); serviço de imagens externo (Cloudinary — custo/conta extra).

---

## R6. Fontes

**Decisão**:
- **Lista padrão (8 fontes)** auto-hospedadas via pacotes `@fontsource` (sem dependência de
  Google Fonts em runtime): Inter, Lato, Montserrat, Nunito, Raleway, Playfair Display, Lora,
  Merriweather — todas com suporte completo a acentuação latina.
- **Fonte própria**: upload pelo CMS (WOFF2/WOFF/TTF/OTF, ≤ 2 MB, validado no build), registrada
  via `@font-face` com `font-display: swap`.
- Todas as famílias têm pilha de fallback do sistema (`system-ui, sans-serif` ou `Georgia, serif`),
  garantindo texto sempre visível (FR-017a).
- Somente as fontes selecionadas são carregadas (import dinâmico por família).

**Alternativas consideradas**: Google Fonts CDN (requisição de terceiro e dados do visitante
expostos); lista aberta de fontes (sem garantia de legibilidade).

---

## R7. Tema, cores e contraste

**Decisão**: `theme.json` → variáveis CSS (`--cor-principal`, `--cor-fundo`, etc.) aplicadas no
`:root`. A cor do texto sobre `principal` e `destaque` é calculada automaticamente (preto ou
branco, o que tiver maior contraste). Regras de bloqueio (WCAG 2.1 AA):
- `texto` × `fundo` ≥ 4,5:1
- `principal` × `fundo` ≥ 3:1 (títulos e elementos de interface)
- texto automático sobre `principal` e sobre `destaque` ≥ 4,5:1

Implementado em `src/theme/contrast.ts` (função pura, testada), usado pelo widget de paleta do
CMS (`isValid` bloqueia salvar) e pela validação do build.

**Alternativas consideradas**: apenas avisar sem bloquear (fere SC-005); paleta fixa escolhida
de presets (limita a identidade visual pedida).

---

## R8. Ícones

**Decisão**: **lucide-react**, com um registro curado (`src/icons/registry.ts`) de ~30 ícones
relevantes (bebidas, snacks, doces, café etc.) exposto ao CMS como lista de seleção. Etiquetas
usam ícones fixos: Alcoólico (`Wine`), Sem glúten (`WheatOff`), Sem lactose (`MilkOff`),
Vegano (`Vegan`), Novo (`Sparkles`).

**Racional**: tree-shaking garante que só os ícones do registro entram no bundle; licença ISC.

---

## R9. Detalhe do item e navegação

**Decisão**: Sem roteador. O detalhe é um `<dialog>` nativo; ao abrir, faz `history.pushState`
com hash `#item/<slug>`; o evento `popstate` (botão voltar) fecha o diálogo; Esc e botão fechar
chamam `history.back()`. A posição de rolagem é preservada porque a lista nunca é desmontada.
Acessar uma URL com `#item/<slug>` abre o detalhe diretamente. Atalhos de categoria usam
âncoras `#cat/<slug>` com rolagem suave (respeitando `prefers-reduced-motion`).

**Alternativas consideradas**: React Router (dependência desnecessária para uma página).

---

## R10. Histórico e restauração (FR-021, SC-006)

**Decisão**: Cada publicação é um Pull Request mesclado (editorial workflow), com autor e data.
Para restaurar, o administrador abre a lista de PRs publicados no GitHub e usa o botão
**"Revert"** do PR, seguido de "Merge" — passo a passo documentado com capturas de tela no guia
do administrador (`docs/guia-administrador.md`). Tempo estimado: 2–3 minutos.

**Racional**: zero código extra; usa o histórico do Git como registro oficial (Princípio IV).

**Alternativas consideradas**: página "Histórico" própria no admin usando a GitHub API —
melhor UX, mas código e acoplamento ao formato interno de sessão do Decap. Fica como melhoria
futura se o guia não atingir o SC-006 nos testes com funcionários.

---

## R11. Edições simultâneas (FR-022)

**Decisão**: Cada entrada (Textos e contatos / Identidade visual / Catálogo) tem seu próprio
rascunho. Rascunhos de entradas diferentes não colidem. Se dois rascunhos da **mesma** entrada
forem publicados, o segundo merge entra em conflito e o Decap exibe erro de publicação — nada é
sobrescrito na `main`.

**Risco aceito**: dois administradores editando o **mesmo rascunho** ao mesmo tempo
compartilham a mesma branch; o último a salvar prevalece dentro do rascunho, mas ambos os
salvamentos ficam no histórico da branch (recuperáveis). Mitigação: guia do administrador
orienta a avisar a equipe antes de editar o catálogo; com até 5 administradores o risco é baixo.
Reavaliar se ocorrer na prática.

---

## R12. QR code

**Decisão**: Página `admin/qrcode.html` (segunda entrada do Vite) que gera o QR code no
navegador com a biblioteca **qrcode** a partir de `site.json → urlPublica`, oferecendo download
em **SVG** (vetorial, ideal para gráfica) e **PNG 2048×2048**, com correção de erro nível **M**.
Se `enderecoDefinitivo` for `false`, exibe aviso destacado de endereço provisório (FR-023).
Link para a página aparece na descrição da coleção "Textos e contatos" no CMS.

---

## R13. Testes e qualidade

**Decisão**:
- **Vitest + Testing Library** (jsdom): schema, formatação de preço, contraste, slug, componentes.
- **Playwright** (viewport 360×740, Chromium) + **@axe-core/playwright**: jornadas da US1
  (carregar, atalho de categoria, abrir/fechar detalhe com voltar, item oculto, aviso de álcool,
  contatos) e verificação de acessibilidade sem violações.
- **Lighthouse CI** (não bloqueante no início) para acompanhar Performance ≥ 90.
- **ESLint** (typescript-eslint) + **Prettier** + `tsc --noEmit`.

CI (`.github/workflows/ci.yml`) roda em PRs — inclusive nos PRs de rascunho do CMS — com os
gates da constituição: lint, type-check, validação de conteúdo, testes unitários, build e e2e.

---

## R14. Versões

| Item | Versão |
|------|--------|
| Node.js | 24 LTS |
| TypeScript | 5.x |
| React / React DOM | 18.3 (restrição do Decap — R1) |
| Vite | 7.x |
| Decap CMS (`decap-cms-app`) | 3.x |
| Zod | 4.x |
| Vitest / Playwright | versões estáveis atuais |
