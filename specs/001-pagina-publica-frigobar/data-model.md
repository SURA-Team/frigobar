# Data Model: Página pública do frigobar

**Feature**: `001-pagina-publica-frigobar` | **Date**: 2026-11-26 | **Plan**: [plan.md](plan.md)

O conteúdo vive em três arquivos JSON em `content/`, validados pelo schema em
`src/content/schema.ts`. Formato exato dos arquivos: [contracts/content-files.md](contracts/content-files.md).

```text
content/site.json     → ConfiguracaoSite (1 por site)
content/theme.json    → Tema (1 por site) ──usa──> Fonte (2: títulos e textos)
content/catalog.json  → Catalogo ──contém──> Categoria (N, ordenadas)
                                              └──contém──> Item (N, ordenados) ──usa──> Etiqueta (0..5)
```

---

## ConfiguracaoSite (`content/site.json`)

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `nomeHotel` | texto | sim | 1–80 caracteres |
| `boasVindas` | texto | não | até 300 caracteres |
| `logo` | caminho de imagem | sim | arquivo existente em `uploads/`; JPEG/PNG/WebP/SVG |
| `fotoCapa` | caminho de imagem | não | arquivo existente; JPEG/PNG/WebP |
| `informacoesGerais` | texto multilinha | não | até 2.000 caracteres; quebras de linha preservadas |
| `rodape` | texto | não | até 200 caracteres |
| `contatos.telefone` | texto | não | telefone BR: 10–11 dígitos (DDD + número), aceita máscara |
| `contatos.whatsapp` | texto | não | 10–11 dígitos (DDD + número); link gerado com prefixo 55 |
| `contatos.email` | texto | não | e-mail válido |
| `contatos.ramal` | texto | não | 1–6 dígitos |
| `urlPublica` | URL | sim | `https://` absoluta |
| `enderecoDefinitivo` | booleano | sim | `false` enquanto o subdomínio não estiver confirmado |

**Regras derivadas**: bloco de contatos é exibido somente se ao menos um contato estiver
preenchido (FR-008a).

---

## Tema (`content/theme.json`)

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `cores.principal` | cor hex `#RRGGBB` | sim | ver regras de contraste |
| `cores.secundaria` | cor hex | sim | — |
| `cores.fundo` | cor hex | sim | — |
| `cores.texto` | cor hex | sim | — |
| `cores.destaque` | cor hex | sim | — |
| `fontes.titulos` | Fonte | sim | — |
| `fontes.textos` | Fonte | sim | — |

**Regras de contraste (bloqueiam salvar e publicar — FR-018, SC-005)**:
- `texto` × `fundo` ≥ 4,5:1
- `principal` × `fundo` ≥ 3:1
- melhor entre preto/branco sobre `principal` ≥ 4,5:1
- melhor entre preto/branco sobre `destaque` ≥ 4,5:1

**Valores derivados (não armazenados)**: `sobrePrincipal`, `sobreDestaque` (preto ou branco).

## Fonte (objeto aninhado no Tema)

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `origem` | `"padrao"` \| `"propria"` | sim | — |
| `padrao` | id da lista padrão | se `origem = padrao` | um de: `inter`, `lato`, `montserrat`, `nunito`, `raleway`, `playfair-display`, `lora`, `merriweather` |
| `arquivo` | caminho de arquivo | se `origem = propria` | WOFF2/WOFF/TTF/OTF, ≤ 2 MB |
| `nome` | texto | se `origem = propria` | 1–60 caracteres (nome exibido no CMS e usado no `@font-face`) |

---

## Catalogo (`content/catalog.json`)

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `categorias` | lista de Categoria | sim | 0–30 itens; a ordem da lista é a ordem de exibição |

## Categoria

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `nome` | texto | sim | 1–40 caracteres; único no catálogo (sem diferenciar maiúsculas/acentos) |
| `icone` | id de ícone | sim | um dos ids de `src/icons/registry.ts` |
| `visivel` | booleano | sim | padrão `true` |
| `itens` | lista de Item | sim | 0–80; a ordem da lista é a ordem de exibição |

**Derivados**: `slug` (de `nome`), `temAlcoolico` (algum item visível com etiqueta `alcoolico`),
`exibida` = `visivel` e ao menos um item visível (FR-006).

## Item

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `nome` | texto | sim | 1–60 caracteres |
| `descricao` | texto multilinha | não | até 500 caracteres |
| `preco` | número (reais) | sim | ≥ 0, no máximo 2 casas decimais, ≤ 9.999,99 |
| `foto` | caminho de imagem | não | arquivo existente; JPEG/PNG/WebP; ≤ 10 MB |
| `etiquetas` | lista de Etiqueta | não | sem repetição |
| `visivel` | booleano | sim | padrão `true` |

**Derivados**: `slug` = slug(`nome`), com sufixo `-2`, `-3`… em caso de repetição no catálogo;
`precoFormatado` = `"Cortesia"` se `preco = 0`, senão `Intl.NumberFormat('pt-BR', { style:
'currency', currency: 'BRL' })` → `"R$ 12,50"`.

## Etiqueta (enumeração fixa)

| id | Rótulo | Ícone | Efeito |
|----|--------|-------|--------|
| `alcoolico` | Alcoólico | `Wine` | aciona aviso legal no detalhe e uma vez na categoria |
| `sem-gluten` | Sem glúten | `WheatOff` | — |
| `sem-lactose` | Sem lactose | `MilkOff` | — |
| `vegano` | Vegano | `Vegan` | — |
| `novo` | Novo | `Sparkles` | — |

Aviso legal fixo (não editável): **"Venda proibida para menores de 18 anos. Beba com moderação."**

---

## Entidades fora dos arquivos de conteúdo

- **Administrador**: conta GitHub com permissão de escrita no repositório. Identidade registrada
  como autor dos commits/PRs.
- **Rascunho**: branch `cms/<coleção>/<entrada>` + Pull Request aberto pelo Decap.
- **Versão publicada**: commit de merge na `main`.

## Transições de estado (por entrada de conteúdo)

```text
[Publicada] --editar e salvar--> [Rascunho] --mudar status--> [Em revisão] --> [Pronto]
     ^                              |                                            |
     |                              +--descartar--> [Publicada] (sem mudanças)   |
     +------------------- Publicar (merge na main → deploy ≤ 10 min) <-----------+
[Publicada N] --Revert do PR no GitHub--> [Publicada N+1 = conteúdo de N-1]
```

O administrador pode publicar diretamente a partir do status "Pronto"; "Em revisão" é opcional
(não há aprovação de terceiros — FR-020).
