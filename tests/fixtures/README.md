# Conteúdo de teste congelado

Base dos testes automatizados (Vitest e Playwright). **Não é editado pelo CMS** e não aparece
no site publicado. Os testes leem daqui em vez de `content/`, para que as edições do hotel não
quebrem o CI (research R13).

- `content/`: `site.json`, `theme.json` e `catalog.json` com casos conhecidos: 3 categorias
  (Bebidas, Snacks, Chocolates), preço 14,50, item "Cortesia", cerveja alcoólica, item oculto,
  item sem foto, descrição de 5 linhas, contatos só com WhatsApp e ramal, endereço provisório e
  apenas fontes padrão.
- `uploads/`: imagens referenciadas por esses arquivos.

Se mudar algo aqui, ajuste os testes que dependem desses valores.
