# Contrato: URLs públicas

`<base>` = `https://sura-team.github.io/frigobar/` enquanto não houver subdomínio; depois,
`https://<subdominio>/`. O endereço que vai no QR code é o `urlPublica` de `content/site.json`.

| URL | Público | Comportamento |
|-----|---------|---------------|
| `<base>` | Hóspede | Página do frigobar (FR-001 a FR-012) |
| `<base>#cat/<slug-categoria>` | Hóspede | Rola até a categoria |
| `<base>#item/<slug-item>` | Hóspede | Abre o detalhe do item; "voltar" fecha (FR-004b). Slug inexistente → página normal, sem erro |
| `<base>admin/` | Administrador | Decap CMS (login GitHub) |
| `<base>admin/qrcode.html` | Administrador | Gerador de QR code (FR-023). Não exige login: o QR code só contém a URL pública |

## Estabilidade (constituição — Restrições Técnicas)

- `<base>` e o formato `#item/<slug>` são estáveis: QR codes impressos e links compartilhados
  não podem quebrar.
- Ao mudar para subdomínio próprio, o GitHub Pages redireciona `sura-team.github.io/frigobar/`
  para o novo domínio automaticamente; `urlPublica` e `enderecoDefinitivo` devem ser atualizados
  no CMS no mesmo dia.
