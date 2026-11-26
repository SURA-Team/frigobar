# Validação da feature 001

Registro das validações de [quickstart.md](quickstart.md) e dos critérios de sucesso da
[spec](spec.md). Atualize este arquivo a cada rodada de validação.

## Rodada 1 — 2026-11-26 (implementação, ambiente local)

### Gates automatizados (T071)

| Gate | Resultado |
|------|-----------|
| `npm run lint` | ✅ sem erros |
| `npm run typecheck` | ✅ sem erros |
| `npm run validate` (content/ real) | ✅ conteúdo válido |
| `npm test` | ✅ 88 testes em 11 arquivos |
| `npm run build` | ✅ |
| `npm run size` | ✅ 82,6 KB gzip (limite 100 KB) |
| `npm run test:e2e` (360×740, axe) | ✅ 20 testes: jornada do hóspede (cenários 1–8 da US1), link direto, acessibilidade sem violações (página, detalhe e QR code), CSP sem erros, downloads do QR code |
| `npm ci` a partir do lockfile | ✅ |

### Lighthouse local (build de `tests/fixtures`, celular 360px, 4G simulado)

| Rodada | Performance | Acessibilidade | Boas práticas | FCP | LCP | CLS |
|--------|-------------|----------------|---------------|-----|-----|-----|
| 1 | 83 | 100 | 96 | 0,91 s | 2,48 s | 0 |
| 2 | 92 | 100 | 96 | 0,85 s | 2,48 s | 0 |
| 3 | 82 | 100 | 96 | 0,92 s | 2,49 s | 0 |

- SC-001 (nome do hotel e primeira categoria em ≤ 3 s): **atendido** — o conteúdo aparece no
  FCP (~0,9 s).
- Meta de LCP < 2,5 s (Princípio V): **atendida no limite** (2,48 s; elemento de LCP = foto de
  capa, já pré-carregada). A variação de Performance vem de TBT da máquina local.
- **Recomendação**: para ganhar folga no LCP, pré-renderizar o HTML no build (SSG). Fica como
  melhoria futura (exige spec própria; não bloqueia a feature).

### Verificações manuais feitas no painel local (`npm run cms:local`)

| Verificação | Resultado |
|-------------|-----------|
| Painel abre em português, coleções Catálogo, Identidade visual e Textos e contatos | ✅ |
| Pré-visualização usa os componentes do site, em moldura de celular, com cores e fontes do tema | ✅ |
| Categoria renomeada para nome repetido → aviso vermelho "Categoria 2 › nome: Já existe…" | ✅ (nada gravado em content/) |
| Texto `#999999` sobre fundo `#FFFFFF` → salvamento bloqueado com mensagem de contraste | ✅ (nada gravado em content/) |
| QR code gerado decodifica para a URL pública em 2048 px e reduzido a 236 px (~5 cm) | ✅ (decodificador independente `jsqr`) |

### Pendente (depende de configuração externa ou de pessoas)

| Item | Tarefa | O que falta |
|------|--------|-------------|
| Configuração única: OAuth App, Worker, `CMS_AUTH_URL`, Pages, proteção da `main`, colaboradores | T051 | Executar [docs/configuracao-cms.md](../../docs/configuracao-cms.md) com as contas do GitHub/Cloudflare |
| Fluxo real de publicação (rascunho → PR → CI → publicar → ≤ 10 min), publicação recusada e conflito, reversão | T052 | Depende de T051 |
| Cenários de aceite da US3 com publicação real (logotipo, cor principal, fonte própria `.woff2`) | T062 | Depende de T051; fonte própria precisa de um arquivo `.woff2` da marca |
| Lighthouse no endereço publicado e roteiro manual completo no celular | T071 | Depende do primeiro deploy |
| Teste de usabilidade com funcionário (SC-003, SC-006) e 3+ pessoas como hóspede (SC-002) | T072 | Pessoas reais |
