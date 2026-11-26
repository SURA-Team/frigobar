# Frigobar Andrade Hotéis Constitution

## Core Principles

### I. Spec antes de código

- Toda funcionalidade nasce como spec em `specs/NNN-slug/` via `/speckit-specify`, passa por
  `/speckit-plan` e `/speckit-tasks`, e só então é implementada com `/speckit-implement`.
- Código de aplicação MUST NOT ser escrito sem spec e plano aprovados. Correções triviais
  (typo, ajuste de estilo isolado) são a única exceção e devem ser registradas no PR.
- Specs, planos, tarefas e documentação MUST ser escritos em português do Brasil.
- Quando o código divergir da spec, a spec é atualizada primeiro; a spec é a fonte da verdade.

**Racional**: o projeto é pequeno, mas será mantido por pessoas diferentes ao longo do tempo;
specs explícitas evitam que regras de negócio do hotel fiquem só na cabeça de quem codificou.

### II. Estático e custo zero

- O produto MUST ser um site estático publicado no GitHub Pages, sem servidor próprio.
- Nenhum serviço pago pode ser introduzido. Serviços de terceiros com plano gratuito só são
  aceitos se o plano justificar a necessidade e descrever o que acontece se o serviço sair do ar.
- O site publicado MUST funcionar mesmo que serviços auxiliares (ex.: painel de edição) estejam
  indisponíveis: o hóspede sempre vê a última versão publicada.

**Racional**: hospedagem gratuita é requisito do negócio; dependências externas viram custo e
ponto de falha.

### III. Conteúdo separado do código

- Todo conteúdo exibido ao hóspede — textos, itens e preços do frigobar, cores, fontes, ícones,
  fotos, logotipo, links e contatos — MUST vir de arquivos de conteúdo/configuração versionados
  no repositório, nunca fixado dentro de componentes.
- Os arquivos de conteúdo MUST ter um schema validado automaticamente; conteúdo inválido falha
  o build e nunca chega à produção.
- O visual MUST ser controlado por design tokens (variáveis CSS) derivados da configuração de
  tema, de modo que trocar uma cor ou fonte não exija alterar componentes.

**Racional**: é o que viabiliza a edição por administradores (Princípio IV) e mantém o código
estável enquanto o conteúdo muda com frequência.

### IV. Edição por administradores, sem programar

- Administradores MUST conseguir alterar textos, cores, ícones e fotos sem editar código nem
  conhecer Git, por meio de uma interface de edição.
- Toda alteração de conteúdo MUST ser rastreável (quem, quando, o quê) e reversível — o
  histórico do Git é o registro oficial.
- O acesso de edição MUST ser restrito a pessoas autorizadas; a página pública é somente leitura.
- Segredos (tokens, chaves) MUST NOT ser commitados nem embutidos no bundle público.

**Racional**: o time do hotel precisa autonomia para atualizar o frigobar sem depender de
desenvolvedores, sem abrir mão de controle e auditoria.

### V. Mobile-first, rápido e acessível

- O acesso principal é via QR code no celular do hóspede: o layout MUST ser projetado primeiro
  para telas a partir de 360px de largura e funcionar sem horizontal scroll.
- Metas de desempenho: LCP < 2,5s em 4G e Lighthouse Performance ≥ 90 em mobile.
- Imagens MUST ser otimizadas (formato moderno, dimensões adequadas, lazy-loading fora da
  primeira dobra).
- Acessibilidade MUST atender WCAG 2.1 AA: contraste mínimo (inclusive para cores definidas
  por administradores — o editor deve alertar ou impedir contraste insuficiente), texto
  alternativo em imagens e navegação por teclado/leitor de tela.

**Racional**: o hóspede abre a página uma vez, no quarto, possivelmente com conexão ruim; a
primeira impressão precisa ser imediata e legível para todos.

### VI. Simplicidade

- Escolher sempre a solução mais simples que atende à spec (YAGNI). Toda dependência nova
  MUST ser justificada no plano.
- Sem backend, banco de dados, autenticação de hóspedes ou analytics invasivo, a menos que uma
  spec aprovada exija e a constituição seja emendada.

**Racional**: um projeto simples continua barato de manter e fácil de entregar a outra pessoa.

## Restrições Técnicas e de Publicação

- **Stack**: React + TypeScript + Vite. Gerenciador de pacotes: npm.
- **Hospedagem**: GitHub Pages, publicado via GitHub Actions a cada merge na `main`.
- **Domínio**: o build MUST suportar tanto `https://<org>.github.io/frigobar/` (base path
  `/frigobar/`) quanto um subdomínio próprio na raiz (arquivo `CNAME`), alternando apenas por
  configuração. TODO(DOMINIO): subdomínio da Andrade Hotéis ainda não confirmado.
- **Estabilidade do QR code**: QR codes são impressos e espalhados pelos quartos; a URL
  codificada MUST ser estável. QR codes definitivos só devem ser impressos após o domínio final
  estar configurado, e qualquer mudança de URL MUST manter redirecionamento da URL antiga.
- **Repositório público**: tudo o que estiver no repositório é público. Nenhum dado pessoal de
  hóspedes ou informação interna sensível pode ser commitado.
- **Idioma**: a interface pública é em português do Brasil; outros idiomas exigem spec própria.

## Fluxo de Desenvolvimento

1. `/speckit-specify` cria a branch `NNN-slug` e a spec em `specs/NNN-slug/spec.md`.
2. `/speckit-clarify` (recomendado) resolve ambiguidades antes do plano.
3. `/speckit-plan` gera o plano técnico e MUST passar pelo "Constitution Check".
4. `/speckit-tasks` quebra o plano em tarefas; `/speckit-analyze` (recomendado) checa
   consistência entre spec, plano e tarefas.
5. `/speckit-implement` executa as tarefas.
6. Pull Request para `main`. Gates obrigatórios no CI: build, lint, type-check, testes e
   validação de schema do conteúdo.
7. Merge na `main` publica automaticamente no GitHub Pages.

Testes: lógica de validação de conteúdo/tema e componentes que renderizam conteúdo dinâmico
MUST ter testes automatizados. TDD estrito não é exigido.

## Governance

- Esta constituição prevalece sobre qualquer outra prática do repositório. Planos que violem
  um princípio MUST registrar a justificativa na seção de complexidade do plano ou ser revistos.
- Emendas são feitas via `/speckit-constitution`, em Pull Request próprio, com descrição do
  impacto nas specs existentes.
- Versionamento semântico: MAJOR para remoção ou redefinição de princípio; MINOR para princípio
  ou seção nova; PATCH para clarificações de texto.
- Revisões de PR MUST verificar aderência aos princípios. Orientações operacionais do dia a dia
  ficam em `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-11-26 | **Last Amended**: 2026-11-26
