# Guia do administrador do frigobar

Este guia é para quem atualiza a página do frigobar (preços, itens, fotos e textos). Não é
preciso saber programar.

**Endereço do painel**: `https://sura-team.github.io/frigobar/admin/`

---

## Antes de começar (uma vez só)

1. **Crie uma conta no GitHub** (gratuita): acesse <https://github.com/signup>, informe seu
   e-mail, crie uma senha e um nome de usuário.
2. **Peça acesso** à pessoa responsável pelo site, informando seu nome de usuário do GitHub.
   Você vai receber um convite por e-mail: clique em **Aceitar**.
3. Abra o endereço do painel e clique em **Entrar com GitHub**.

> 📷 *Espaço para captura de tela: tela de entrada do painel.*

---

## Como o painel funciona

- Toda alteração vira primeiro um **rascunho**. Os hóspedes **não** veem rascunhos.
- À direita da tela aparece a **pré-visualização**: é exatamente a página do hóspede, do tamanho
  de um celular.
- Quando estiver tudo certo, você **publica**. Em até 10 minutos a mudança aparece para os
  hóspedes.

---

## Alterar um item (preço, nome, foto…)

1. No painel, clique em **Catálogo** → **Catálogo do frigobar**.
2. Clique na categoria (ex.: *Bebidas*) para abri-la e depois no item.
3. Altere o que precisar:
   - **Preço**: use ponto para os centavos, ex.: `12.50`. Preço `0` aparece como "Cortesia".
   - **Foto**: clique em *Escolher uma imagem* e envie do celular ou do computador (JPEG, PNG ou
     WebP, até 10 MB; fotos do iPhone funcionam normalmente). Prefira foto **horizontal** e
     **bem iluminada**.
   - **Mostrar para o hóspede**: desligue para esconder o item sem apagá-lo.
   - **Etiquetas**: *Alcoólico* mostra automaticamente o aviso "Venda proibida para menores de
     18 anos".
4. Confira a pré-visualização à direita.
5. Clique em **Salvar**. Isso cria o rascunho.

Para **mudar a ordem** de categorias ou itens, arraste pelo ícone ☰.

> 📷 *Espaço para captura de tela: edição de um item com a pré-visualização.*

---

## Publicar

1. Confira que **não há aviso vermelho** no topo da pré-visualização. Se houver, ele diz
   exatamente o que corrigir (ex.: "Já existe uma categoria chamada Bebidas").
2. No topo, mude o status para **Pronto**.
3. **Aguarde 1 a 2 minutos**: depois de salvar, o sistema faz uma verificação automática do
   rascunho. Enquanto ela roda, "Publicar" mostra erro — basta esperar e tentar de novo.
4. Clique em **Publicar** → **Publicar agora**.
5. Em até **10 minutos** a página dos hóspedes mostra a mudança.

> 📷 *Espaço para captura de tela: botões de status e Publicar.*

### Se "Publicar" der erro

| O que aparece | O que fazer |
|---|---|
| Aviso vermelho na pré-visualização | Corrija o que o aviso lista, salve e tente de novo. |
| Erro logo depois de salvar | A verificação automática ainda está rodando: espere 1–2 minutos e tente de novo. |
| Erro de **conflito** | Outra pessoa publicou uma alteração no mesmo conteúdo antes de você. Clique em **Excluir alterações não publicadas**, abra o catálogo de novo e refaça a sua alteração. |

---

## Desfazer uma publicação

Se algo foi publicado por engano, dá para voltar à versão anterior em poucos minutos:

1. Acesse <https://github.com/SURA-Team/frigobar/pulls?q=is%3Apr+is%3Amerged> (lista de
   publicações).
2. Abra a publicação que quer desfazer (o título diz o que foi alterado e quando).
3. Clique em **Revert** (no fim da página).
4. Na tela seguinte, clique em **Create pull request** e depois em **Merge pull request** →
   **Confirm merge**.
5. Em até 10 minutos a página volta a mostrar o conteúdo anterior.

> 📷 *Espaço para capturas de tela de cada clique (botão Revert, Create pull request, Merge).*

### Recuperar um salvamento anterior do mesmo rascunho

Cada vez que você clica em **Salvar**, o sistema guarda uma versão. Se outra pessoa salvou por
cima do seu rascunho, abra o rascunho no GitHub (link *Ver no GitHub* no painel), aba
**Commits**, e peça ajuda à pessoa responsável para restaurar a versão desejada.

---

## Boas práticas

- **Avise a equipe** antes de editar o catálogo, para duas pessoas não editarem ao mesmo tempo.
- Use nomes curtos e claros (até 60 caracteres para itens, 40 para categorias).
- Não repita nomes de categoria.
- Fotos: horizontais, fundo limpo, boa luz, até 10 MB.
- O QR code dos quartos **não muda** quando você altera itens ou preços.

## Precisa de ajuda?

Fale com a pessoa responsável pelo site. Para a configuração técnica, veja
[configuracao-cms.md](configuracao-cms.md).
