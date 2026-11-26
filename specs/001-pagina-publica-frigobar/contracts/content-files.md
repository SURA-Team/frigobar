# Contrato: arquivos de conteúdo

Interface entre o **CMS** (que escreve) e o **site** (que lê). Qualquer mudança neste contrato
exige atualizar juntos: `src/content/schema.ts`, `src/admin/config.ts` e este documento.
Regras de validação completas: [../data-model.md](../data-model.md).

Caminhos de mídia são **relativos** (sem `/` inicial), ex.: `uploads/coca-cola.jpg`, para
funcionar com qualquer base path.

## `content/site.json`

```json
{
  "nomeHotel": "Andrade Hotéis",
  "boasVindas": "Seja bem-vindo! Confira os itens do seu frigobar.",
  "logo": "uploads/logo.svg",
  "fotoCapa": "uploads/capa.jpg",
  "informacoesGerais": "Os itens consumidos são cobrados no check-out.\nEm caso de dúvidas, fale com a recepção.",
  "rodape": "Andrade Hotéis",
  "contatos": {
    "telefone": "(51) 3333-4444",
    "whatsapp": "(51) 99999-8888",
    "email": "recepcao@exemplo.com.br",
    "ramal": "9"
  },
  "urlPublica": "https://sura-team.github.io/frigobar/",
  "enderecoDefinitivo": false
}
```

Campos opcionais podem ser omitidos ou vazios (`""`); ambos significam "não preenchido".

## `content/theme.json`

```json
{
  "cores": {
    "principal": "#1F3A5F",
    "secundaria": "#C8A96A",
    "fundo": "#FFFFFF",
    "texto": "#1A1A1A",
    "destaque": "#C8A96A"
  },
  "fontes": {
    "titulos": { "origem": "padrao", "padrao": "playfair-display" },
    "textos": { "origem": "propria", "nome": "Marca Sans", "arquivo": "uploads/fonts/marca-sans.woff2" }
  }
}
```

## `content/catalog.json`

```json
{
  "categorias": [
    {
      "nome": "Bebidas",
      "icone": "cup-soda",
      "visivel": true,
      "itens": [
        {
          "nome": "Água mineral sem gás 500 ml",
          "descricao": "",
          "preco": 6,
          "foto": "uploads/agua.jpg",
          "etiquetas": [],
          "visivel": true
        },
        {
          "nome": "Cerveja long neck",
          "descricao": "Cerveja pilsen 355 ml.",
          "preco": 14.5,
          "etiquetas": ["alcoolico"],
          "visivel": true
        }
      ]
    }
  ]
}
```

## Garantias do contrato

1. Conteúdo que não passa no schema **nunca** é publicado: o build falha e o GitHub Pages
   mantém a versão anterior.
2. A ordem das listas é a ordem de exibição.
3. Campos desconhecidos fazem a validação falhar (schema estrito), evitando erros de digitação
   silenciosos.
