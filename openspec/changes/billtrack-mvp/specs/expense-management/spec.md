## ADDED Requirements

### Requirement: Adicionar despesa ao mês
O sistema SHALL permitir ao usuário adicionar uma nova despesa ao mês selecionado, com nome e valor obrigatórios.

#### Scenario: Adição com sucesso
- **WHEN** o usuário preenche o nome e o valor e confirma
- **THEN** o sistema cria a despesa com status `pending` no mês selecionado e a exibe na lista

#### Scenario: Nome em branco
- **WHEN** o usuário tenta adicionar uma despesa sem informar o nome
- **THEN** o sistema rejeita a operação e exibe mensagem de erro indicando que o nome é obrigatório

#### Scenario: Valor inválido
- **WHEN** o usuário informa um valor negativo ou não numérico
- **THEN** o sistema rejeita a operação e exibe mensagem de erro indicando que o valor deve ser um número positivo

### Requirement: Editar nome da despesa
O sistema SHALL permitir ao usuário editar o nome de uma despesa existente diretamente na lista (inline), sem abrir uma tela separada.

#### Scenario: Edição de nome com sucesso
- **WHEN** o usuário clica no nome de uma despesa, altera o texto e confirma
- **THEN** o sistema salva o novo nome e o exibe na lista

#### Scenario: Nome editado para vazio
- **WHEN** o usuário apaga o nome de uma despesa e tenta salvar
- **THEN** o sistema rejeita a alteração e restaura o nome anterior

### Requirement: Editar valor da despesa
O sistema SHALL permitir ao usuário editar o valor de uma despesa existente diretamente na lista (inline), sem abrir uma tela separada.

#### Scenario: Edição de valor com sucesso
- **WHEN** o usuário clica no valor de uma despesa, altera para um número válido e confirma
- **THEN** o sistema salva o novo valor e atualiza o resumo financeiro do mês

#### Scenario: Valor editado para inválido
- **WHEN** o usuário edita o valor para um número negativo ou não numérico
- **THEN** o sistema rejeita a alteração e restaura o valor anterior

### Requirement: Excluir despesa
O sistema SHALL permitir ao usuário excluir uma despesa do mês.

#### Scenario: Exclusão com confirmação
- **WHEN** o usuário aciona a ação de exclusão em uma despesa e confirma
- **THEN** o sistema remove a despesa permanentemente e atualiza a lista e o resumo financeiro

#### Scenario: Cancelar exclusão
- **WHEN** o usuário aciona a ação de exclusão mas cancela a confirmação
- **THEN** o sistema não realiza nenhuma alteração
