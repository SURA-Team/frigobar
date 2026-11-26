# Feature Specification: Página pública do frigobar com identidade visual editável

**Feature Branch**: `001-pagina-publica-frigobar`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "Página pública do frigobar acessada via QR code no quarto, listando os itens com foto, nome, descrição e preço, organizados por categoria, com identidade visual editável por administradores (textos, cores, ícones, fotos e logotipo)."

## Clarifications

### Session 2026-11-26

- Q: Os itens devem ter selos/etiquetas e aviso legal automático para bebidas alcoólicas? → A: Sim — etiquetas de uma lista fixa (Alcoólico, Sem glúten, Sem lactose, Vegano, Novo); itens "Alcoólico" exibem automaticamente o aviso "Venda proibida para menores de 18 anos. Beba com moderação."
- Q: O administrador pode trocar a fonte (tipografia) da página? → A: Sim — escolhe uma fonte para títulos e outra para textos, a partir de uma lista padrão de 6 a 10 fontes testadas, ou envia um arquivo de fonte próprio (ex.: fonte oficial da marca).
- Q: Ao tocar em um item, abre um detalhe ampliado ou tudo fica visível na lista? → A: Lista compacta (foto pequena, nome, preço, etiquetas, descrição em até 2 linhas); ao tocar, abre o detalhe com foto grande, descrição completa e aviso legal quando houver.
- Q: Os contatos devem ser botões clicáveis (ligar/WhatsApp) ou texto livre? → A: Botões, porém opcionais — telefone da recepção, WhatsApp, e-mail e ramal (só texto) são campos opcionais; só aparecem os preenchidos. O texto livre de informações gerais continua existindo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hóspede consulta o frigobar pelo QR code (Priority: P1)

O hóspede, no quarto, aponta a câmera do celular para o QR code fixado no frigobar. A página abre
direto, sem login, aplicativo ou cadastro, mostrando o logotipo e o nome do hotel, uma mensagem
de boas-vindas e os itens do frigobar agrupados por categoria (ex.: Bebidas, Snacks, Chocolates),
cada um com foto, nome, descrição e preço. Ao final, o hóspede encontra informações gerais, como
a forma de cobrança e o contato da recepção.

**Why this priority**: é o motivo de existir da página. Sozinha, já substitui o cardápio impresso
e entrega valor ao hóspede e ao hotel, mesmo que o conteúdo inicial seja carregado pela equipe de
desenvolvimento.

**Independent Test**: com um catálogo de exemplo publicado, ler o QR code com um celular e
verificar que todos os itens visíveis aparecem corretamente, por categoria, com preço em reais.

**Acceptance Scenarios**:

1. **Given** um catálogo publicado com 3 categorias e 15 itens, **When** o hóspede lê o QR code,
   **Then** a página abre sem pedir login e exibe as 3 categorias, na ordem definida, com seus itens.
2. **Given** um item com preço 12,5, **When** a página é exibida, **Then** o preço aparece como
   "R$ 12,50".
3. **Given** um catálogo com várias categorias, **When** o hóspede toca no atalho de uma categoria,
   **Then** a página leva diretamente àquela categoria.
4. **Given** um item marcado como oculto pelo administrador, **When** o hóspede abre a página,
   **Then** o item não aparece.
5. **Given** um item sem foto cadastrada, **When** a página é exibida, **Then** o item aparece com
   uma imagem padrão (ícone da categoria), sem espaço quebrado.
6. **Given** uma cerveja cadastrada com a etiqueta "Alcoólico", **When** a página é exibida,
   **Then** o card mostra a etiqueta, a categoria da cerveja mostra uma vez o aviso "Venda
   proibida para menores de 18 anos. Beba com moderação." e o detalhe da cerveja também o exibe.
7. **Given** um item com descrição de 5 linhas, **When** o hóspede toca no card, **Then** abre o
   detalhe com foto ampliada e descrição completa; **When** ele usa o "voltar" do celular,
   **Then** retorna à lista na mesma posição em que estava.
8. **Given** um administrador que preencheu apenas o WhatsApp e o ramal da recepção, **When** o
   hóspede abre a página, **Then** vê um botão de WhatsApp que abre a conversa e o ramal em texto,
   e nenhum botão de telefone ou e-mail.

---

### User Story 2 - Administrador mantém o catálogo de itens (Priority: P2)

Um funcionário autorizado do hotel, sem conhecimento técnico, entra na área de administração e
cadastra, edita, reordena, oculta ou remove categorias e itens: nome, descrição, preço, foto e
categoria. As alterações ficam em rascunho; ele pré-visualiza a página como o hóspede a verá e,
quando estiver satisfeito, publica, e elas passam a valer para os hóspedes.

**Why this priority**: preços e itens mudam com frequência; sem isso o hotel depende de um
desenvolvedor para cada ajuste, o que viola o objetivo de autonomia do projeto.

**Independent Test**: um funcionário altera o preço de um item, troca a foto de outro e oculta um
terceiro; após publicar, as três mudanças aparecem na página pública.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** ele altera o preço de um item e publica,
   **Then** o novo preço aparece na página pública dentro do prazo de publicação.
2. **Given** um administrador que alterou um item mas ainda não publicou, **When** ele abre a
   pré-visualização, **Then** vê a página com a alteração, enquanto a página pública continua
   exibindo a versão anterior.
3. **Given** um administrador cadastrando um item, **When** ele tenta publicar sem nome ou sem
   preço, **Then** a publicação é bloqueada com uma mensagem indicando o campo faltante.
4. **Given** um administrador enviando uma foto de 8 MB tirada no celular, **When** ele salva,
   **Then** a foto é aceita e exibida aos hóspedes em tamanho adequado para celular.
5. **Given** uma pessoa não autorizada, **When** ela tenta acessar a área de administração,
   **Then** o acesso é negado e nenhuma informação de edição é exposta.
6. **Given** uma alteração publicada por engano, **When** o administrador consulta o histórico e
   escolhe a versão anterior, **Then** a página volta a exibir o conteúdo anterior.

---

### User Story 3 - Administrador personaliza a identidade visual e os textos (Priority: P3)

O administrador altera o logotipo, a foto de capa, as cores da página (principal, secundária,
fundo, texto e destaque), os ícones das categorias e os textos fixos (nome do hotel, mensagem de
boas-vindas, informações gerais e rodapé), sem alterar a estrutura da página.

**Why this priority**: a página funciona com uma identidade visual padrão; a personalização é
importante para a marca, mas muda com menos frequência que o catálogo.

**Independent Test**: o administrador troca o logotipo e a cor principal, publica, e a página
pública passa a refletir as duas mudanças sem nenhuma outra alteração.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** ele envia um novo logotipo e publica,
   **Then** o novo logotipo aparece no topo da página pública.
2. **Given** um administrador escolhendo cor de texto e cor de fundo com contraste insuficiente,
   **When** ele tenta publicar, **Then** o sistema avisa sobre a baixa legibilidade e impede a
   publicação até que o contraste seja corrigido.
3. **Given** um administrador editando uma categoria, **When** ele escolhe um ícone da biblioteca
   disponível, **Then** o ícone aparece ao lado do nome da categoria na página pública.
4. **Given** um administrador alterando a mensagem de boas-vindas, **When** ele publica,
   **Then** o novo texto aparece na página pública.

---

### User Story 4 - Administrador obtém o QR code para impressão (Priority: P3)

O administrador baixa, pela área de administração, a imagem do QR code que aponta para a página
pública, em resolução adequada para impressão, para fixar nos frigobares.

**Why this priority**: o QR code pode ser gerado manualmente por outras ferramentas, mas tê-lo
no próprio sistema evita QR codes apontando para endereços errados ou provisórios.

**Independent Test**: baixar o QR code, imprimir em 5 cm × 5 cm, ler com dois modelos de celular
diferentes e confirmar que ambos abrem a página pública.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** ele solicita o QR code, **Then** recebe uma
   imagem para impressão que, lida pela câmera do celular, abre a página pública.
2. **Given** que o endereço definitivo da página ainda não foi configurado, **When** o
   administrador solicita o QR code, **Then** o sistema avisa que o endereço é provisório e que
   QR codes impressos com ele poderão precisar ser substituídos.

---

### Edge Cases

- **Conexão lenta**: textos e preços aparecem primeiro; fotos carregam progressivamente sem
  deslocar o conteúdo já exibido.
- **Nomes ou descrições longas**: o texto quebra em linhas sem estourar o layout nem gerar
  rolagem horizontal; na lista, a descrição é cortada em 2 linhas com reticências e aparece
  completa no detalhe.
- **Categoria sem itens visíveis**: a categoria não é exibida, nem nos atalhos.
- **Catálogo sem nenhum item visível**: a página exibe uma mensagem orientando o hóspede a
  contatar a recepção.
- **Item com preço zero**: exibido como "Cortesia" em vez de "R$ 0,00".
- **Foto em formato não suportado ou acima do limite de envio**: o envio é recusado com mensagem
  clara indicando formatos e tamanho aceitos.
- **Fonte enviada inválida, acima de 2 MB ou sem acentos do português**: o envio é recusado com
  mensagem clara (ou, se faltarem acentos, o administrador é avisado na pré-visualização antes de
  publicar).
- **Dois administradores editando ao mesmo tempo**: nenhuma alteração é perdida silenciosamente;
  quem publicar por último é avisado do conflito.
- **Área de administração indisponível**: a página pública continua exibindo a última versão
  publicada normalmente.
- **QR code lido em computador ou tablet**: a página continua legível, centralizada e sem
  elementos esticados.

## Requirements *(mandatory)*

### Functional Requirements

**Página pública (hóspede)**

- **FR-001**: O sistema MUST permitir o acesso à página pública diretamente pelo QR code, sem
  login, cadastro ou instalação de aplicativo.
- **FR-002**: A página MUST exibir, no topo, o logotipo, o nome do hotel e a mensagem de
  boas-vindas configurados pelo administrador.
- **FR-003**: A página MUST exibir os itens agrupados por categoria, na ordem de categorias e de
  itens definida pelo administrador; cada categoria exibe nome e ícone.
- **FR-004**: Na lista, cada item MUST ser exibido como um card compacto com foto pequena, nome,
  preço em reais no formato brasileiro (ex.: "R$ 12,50"; preço zero exibido como "Cortesia"),
  etiquetas e descrição limitada a 2 linhas.
- **FR-004a**: Cada item MAY ter uma ou mais etiquetas de uma lista fixa — Alcoólico, Sem glúten,
  Sem lactose, Vegano, Novo — exibidas no card e no detalhe do item com texto e ícone. Itens com
  a etiqueta "Alcoólico" MUST exibir o aviso "Venda proibida para menores de 18 anos. Beba com
  moderação." no detalhe do item, e categorias que contenham itens alcoólicos MUST exibir o mesmo
  aviso uma vez na lista, sem que o administrador precise digitá-lo. Criar etiquetas novas está
  fora do escopo.
- **FR-004b**: Ao tocar em um item, o sistema MUST abrir o detalhe do item com foto ampliada,
  nome, preço, etiquetas, descrição completa e o aviso legal quando aplicável. O detalhe MUST
  poder ser fechado pelo botão de fechar, pelo gesto/botão "voltar" do celular, ou pela tecla Esc,
  retornando o hóspede à mesma posição da lista.
- **FR-005**: Quando houver mais de uma categoria visível, a página MUST oferecer atalhos que
  levam diretamente a cada categoria.
- **FR-006**: Itens ocultos e categorias sem itens visíveis MUST NOT aparecer na página pública.
- **FR-007**: Itens sem foto MUST exibir uma imagem padrão baseada no ícone da categoria.
- **FR-008**: A página MUST exibir uma seção de informações gerais configurável em texto livre
  (ex.: forma de cobrança, observações), preservando parágrafos e quebras de linha.
- **FR-008a**: O administrador MAY preencher contatos opcionais — telefone da recepção, WhatsApp,
  e-mail e ramal interno. Cada contato preenchido MUST aparecer na página: telefone como botão
  que inicia a ligação, WhatsApp como botão que abre a conversa, e-mail como botão que abre o
  aplicativo de e-mail, e ramal apenas como texto (é discado do telefone do quarto). Contatos não
  preenchidos MUST NOT aparecer; se nenhum for preenchido, o bloco de contatos não é exibido.
  O sistema MUST validar o formato de telefone e e-mail antes de publicar.
- **FR-009**: A página pública MUST ser somente leitura e MUST NOT coletar dados pessoais do
  hóspede.
- **FR-010**: A página MUST ser legível e utilizável em telas a partir de 360px de largura, sem
  rolagem horizontal, e atender aos critérios de acessibilidade WCAG 2.1 nível AA (contraste,
  texto alternativo nas imagens, navegação por leitor de tela).
- **FR-011**: A página pública MUST continuar disponível com a última versão publicada mesmo
  quando a área de administração estiver indisponível.
- **FR-012**: O sistema MUST atender a um único hotel, com um único catálogo, uma única página
  pública e um único QR code. Suporte a múltiplas unidades fica para uma feature futura.

**Área de administração**

- **FR-013**: A área de administração MUST ser acessível somente a administradores autorizados,
  cada um com credencial individual.
- **FR-014**: Administradores MUST poder criar, editar, reordenar, ocultar e remover categorias
  (nome, ícone, ordem, visibilidade).
- **FR-015**: Administradores MUST poder criar, editar, reordenar, ocultar e remover itens (nome,
  descrição, preço, foto, categoria, etiquetas, ordem, visibilidade).
- **FR-016**: Administradores MUST poder editar os textos fixos da página (nome do hotel, mensagem
  de boas-vindas, informações gerais e rodapé) e os contatos opcionais.
- **FR-017**: Administradores MUST poder alterar a identidade visual: logotipo, foto de capa,
  cores (principal, secundária, fundo, texto e destaque), fontes e ícones das categorias,
  escolhidos de uma biblioteca de ícones disponível no sistema.
- **FR-017a**: O administrador MUST poder escolher uma fonte para títulos e outra para textos,
  a partir de uma lista padrão de 6 a 10 fontes testadas para legibilidade em celular e com
  suporte completo a acentuação do português; e MUST poder enviar um arquivo de fonte próprio
  (formatos WOFF2, WOFF, TTF ou OTF, até 2 MB) para uso em títulos e/ou textos. Se uma fonte
  enviada não puder ser carregada pelo hóspede, a página MUST exibir o texto com uma fonte
  padrão legível, nunca texto invisível.
- **FR-018**: O sistema MUST validar o conteúdo antes de publicar — campos obrigatórios (nome do
  item, preço maior ou igual a zero, nome da categoria) e contraste mínimo entre texto e fundo — e
  bloquear a publicação com mensagens claras indicando o que corrigir.
- **FR-019**: O sistema MUST aceitar fotos nos formatos comuns de celular (JPEG, PNG, HEIC/WebP
  quando suportado) de até 10 MB e exibi-las ao hóspede otimizadas para celular.
- **FR-020**: Alterações MUST ficar em rascunho até serem publicadas. O administrador MUST
  poder pré-visualizar a página exatamente como o hóspede a verá antes de publicar, e o próprio
  administrador publica, sem aprovação de terceiros. Rascunhos não publicados MUST NOT aparecer
  na página pública.
- **FR-021**: O sistema MUST manter histórico de todas as alterações publicadas (quem, quando,
  o quê) e permitir restaurar qualquer versão anterior.
- **FR-022**: O sistema MUST impedir que alterações simultâneas de dois administradores se
  sobrescrevam silenciosamente.
- **FR-023**: O sistema MUST permitir baixar o QR code da página pública em resolução adequada
  para impressão e avisar quando o endereço da página ainda for provisório.

### Key Entities *(include if feature involves data)*

- **Configuração do site**: nome do hotel, mensagem de boas-vindas, informações gerais, rodapé,
  logotipo, foto de capa, endereço público da página e contatos opcionais (telefone da recepção,
  WhatsApp, e-mail, ramal interno).
- **Tema**: conjunto de cores da página (principal, secundária, fundo, texto, destaque) e fontes
  (títulos e textos); aplicado a toda a página pública.
- **Fonte**: da lista padrão do sistema ou enviada pelo administrador (nome e arquivo); usada
  pelo tema para títulos e/ou textos.
- **Categoria**: nome, ícone, posição na ordem, visível/oculta; contém itens.
- **Item**: nome, descrição, preço (em reais), foto (opcional), categoria, etiquetas (zero ou
  mais), posição na ordem dentro da categoria, visível/oculto.
- **Etiqueta**: lista fixa definida pelo sistema — Alcoólico, Sem glúten, Sem lactose, Vegano,
  Novo — cada uma com nome e ícone; "Alcoólico" aciona o aviso legal de consumo de álcool.
- **Administrador**: pessoa autorizada a editar e publicar; identificada individualmente no
  histórico.
- **Rascunho**: alterações salvas pelo administrador e ainda não publicadas; visível apenas na
  pré-visualização da área de administração.
- **Versão publicada**: retrato completo do conteúdo e do tema em um momento, com autor, data e
  descrição da alteração; base para o histórico e a restauração.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em conexão móvel 4G típica, o hóspede vê o nome do hotel e a primeira categoria de
  itens em até 3 segundos após ler o QR code.
- **SC-002**: Em teste de usabilidade, pelo menos 90% dos hóspedes encontram o preço de um item
  específico em até 30 segundos, sem ajuda.
- **SC-003**: Um funcionário sem conhecimento técnico, após no máximo 15 minutos de orientação,
  altera o preço de um item e publica em até 2 minutos, sem ajuda.
- **SC-004**: Alterações publicadas ficam visíveis aos hóspedes em até 10 minutos.
- **SC-005**: 100% das combinações de cor de texto e fundo publicadas atendem ao contraste mínimo
  de acessibilidade (WCAG AA).
- **SC-006**: Qualquer alteração publicada pode ser desfeita, restaurando a versão anterior, em
  até 5 minutos.
- **SC-007**: O custo mensal de hospedagem e operação da página é R$ 0.
- **SC-008**: A página é exibida sem rolagem horizontal e com textos legíveis em 100% dos
  dispositivos testados com largura a partir de 360px.

## Assumptions

- A página é um catálogo informativo: pedidos, pagamentos e controle de consumo pela página estão
  fora do escopo. O consumo continua sendo apurado e cobrado pelo processo atual do hotel.
- O QR code leva à mesma página em todos os quartos (não identifica o quarto).
- A página atende a um único hotel; múltiplas unidades com catálogos próprios são uma feature
  futura.
- A interface pública é somente em português do Brasil; outros idiomas exigirão spec própria.
- Preços são exibidos em reais, já com impostos, sem promoções ou preços diferenciados por horário
  ou tipo de quarto.
- Haverá poucos administradores (até 5), todos com o mesmo nível de permissão.
- O hotel fornece logotipo, fotos, textos e eventuais fontes próprias e tem direito de uso
  sobre eles (incluindo licença da fonte para uso na web).
- Os ícones vêm de uma biblioteca predefinida no sistema; envio de ícones próprios está fora do
  escopo desta feature (o logotipo e as fotos podem ser enviados livremente).
- O endereço definitivo da página (subdomínio da Andrade Hotéis) ainda não está confirmado; até
  lá a página usa um endereço provisório, e QR codes definitivos só devem ser impressos depois da
  confirmação.
- Medição de acessos (analytics) está fora do escopo desta feature.
