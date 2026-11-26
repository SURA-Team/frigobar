# Configuração única do painel de administração

Passo a passo feito **uma vez** por quem administra o repositório `SURA-Team/frigobar`. Depois
disso, os funcionários do hotel só precisam do [guia do administrador](guia-administrador.md).

Tudo usa planos gratuitos (GitHub e Cloudflare). Nenhum segredo fica no repositório.

> **Base**: enquanto não houver subdomínio, o site fica em
> `https://sura-team.github.io/frigobar/` e o painel em `https://sura-team.github.io/frigobar/admin/`.

## 1. Publicar o site no GitHub Pages

1. Repositório → **Settings → Pages** → em *Build and deployment*, *Source*: **GitHub Actions**.
2. Repositório → **Settings → Secrets and variables → Actions → Variables** → **New repository
   variable**:
   - `PAGES_BASE_PATH` = `/frigobar/` (troque para `/` quando houver domínio próprio; veja a
     seção 6).
3. Faça um push na `main` (ou rode o workflow **Deploy** manualmente em *Actions*). Em 1–3 min o
   site aparece no endereço acima.

## 2. Criar o serviço de login (Cloudflare Worker)

O GitHub exige uma chave secreta para o login, e um site estático não pode guardá-la. Um
Worker gratuito do Cloudflare guarda essa chave e faz a troca (research R2).

1. Crie uma conta gratuita em <https://dash.cloudflare.com/>.
2. Publique o Worker de código aberto **sveltia-cms-auth** (compatível com o Decap):
   <https://github.com/sveltia/sveltia-cms-auth> → botão *Deploy to Cloudflare Workers*.
3. Anote a URL do Worker, ex.: `https://sveltia-cms-auth.<sua-conta>.workers.dev`.

## 3. Criar o OAuth App no GitHub

1. GitHub → foto do perfil → **Settings → Developer settings → OAuth Apps → New OAuth App**
   (se preferir, crie na organização `SURA-Team`).
2. Preencha:
   - *Application name*: `Frigobar — painel`
   - *Homepage URL*: `https://sura-team.github.io/frigobar/`
   - *Authorization callback URL*: `https://<URL do Worker>/callback`
3. Gere um **Client secret** e anote o **Client ID** e o **Client secret**.

## 4. Ligar o Worker ao OAuth App

No Cloudflare → *Workers & Pages* → o Worker → **Settings → Variables and Secrets**:

| Nome | Valor | Tipo |
|------|-------|------|
| `GITHUB_CLIENT_ID` | Client ID do passo 3 | texto |
| `GITHUB_CLIENT_SECRET` | Client secret do passo 3 | **secreto** |
| `ALLOWED_DOMAINS` | `sura-team.github.io` (e o subdomínio próprio, quando houver) | texto |

## 5. Informar o Worker ao painel

Repositório → **Settings → Secrets and variables → Actions → Variables** → nova variável:

- `CMS_AUTH_URL` = URL do Worker (passo 2), sem barra no final.

O deploy injeta esse valor no painel (`VITE_CMS_AUTH_URL`). Sem ele, `/admin/` mostra o aviso
"O login do painel ainda não foi configurado". Rode o workflow **Deploy** de novo depois de criar
a variável.

## 6. Proteger a `main` (obrigatório)

É isso que impede publicar conteúdo inválido (research R4): o "Publicar" do painel só funciona
quando a verificação automática do rascunho passou.

Repositório → **Settings → Branches → Add branch ruleset** (ou *Add classic branch protection
rule*) para a branch `main`:

- [x] **Require a pull request before merging**
  - [ ] **Require approvals** — **desmarque**. A tela do GitHub costuma marcar por padrão; com
    ela ligada, nenhum administrador consegue publicar sozinho (FR-020).
- [x] **Require status checks to pass** → adicione o check **`ci`**.
- [ ] *Require branches to be up to date* — deixe desmarcado (evita trabalho extra para quem
  publica; conflitos reais já impedem o merge).

## 7. Adicionar os administradores

Para cada funcionário (até 5):

1. Ele cria uma conta gratuita no GitHub (passo a passo no guia do administrador).
2. Repositório → **Settings → Collaborators → Add people** → permissão **Write**.

Só contas com permissão de escrita conseguem entrar no painel e publicar. Para remover alguém,
retire a pessoa dos colaboradores.

## 8. Conferir

- [ ] `https://sura-team.github.io/frigobar/` abre a página do frigobar.
- [ ] `https://sura-team.github.io/frigobar/admin/` mostra o botão **Entrar com GitHub**.
- [ ] Um colaborador entra, altera um preço, salva → aparece um Pull Request `cms/catalogo/...`
  com o check `ci` rodando.
- [ ] Uma conta **sem** permissão de escrita não consegue entrar.

## Quando houver subdomínio próprio

1. Crie `public/CNAME` com o domínio (ex.: `frigobar.andradehoteis.com.br`) e configure o DNS
   conforme a documentação do GitHub Pages.
2. Mude `PAGES_BASE_PATH` para `/`.
3. Acrescente o domínio em `ALLOWED_DOMAINS` no Worker e atualize a *Homepage URL* do OAuth App.
4. No painel → **Textos e contatos**: atualize o endereço da página e marque *endereço
   definitivo*; só então imprima os QR codes definitivos.

## Desenvolvimento local

`npm run cms:local` abre o painel em `http://localhost:5173/frigobar/admin/` sem login, gravando
direto em `content/` (sem rascunhos). Veja o [quickstart](../specs/001-pagina-publica-frigobar/quickstart.md).
