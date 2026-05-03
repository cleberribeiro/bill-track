## ADDED Requirements

### Requirement: Exibir resumo financeiro do mês
O sistema SHALL exibir um resumo automático no topo da tela com os totais do mês selecionado.

#### Scenario: Resumo com despesas mistas
- **WHEN** o mês tem despesas pagas e pendentes
- **THEN** o sistema exibe: total do mês, total pago, total pendente e quantidade de contas pendentes — todos calculados automaticamente

#### Scenario: Resumo com todas as despesas pagas
- **WHEN** todas as despesas do mês estão com status `paid`
- **THEN** o sistema exibe total pendente como R$ 0,00 e quantidade de pendentes como 0

#### Scenario: Resumo de mês sem despesas
- **WHEN** o mês não tem nenhuma despesa
- **THEN** o sistema exibe todos os valores zerados

### Requirement: Atualizar resumo em tempo real
O sistema SHALL recalcular e atualizar o resumo financeiro imediatamente após qualquer operação que altere valores ou status de despesas.

#### Scenario: Atualização ao marcar como paga
- **WHEN** o usuário marca uma despesa como paga
- **THEN** o resumo atualiza imediatamente: total pago aumenta pelo valor da despesa e total pendente diminui pelo mesmo valor

#### Scenario: Atualização ao adicionar despesa
- **WHEN** o usuário adiciona uma nova despesa
- **THEN** o resumo atualiza imediatamente: total do mês e total pendente aumentam pelo valor da nova despesa e a contagem de pendentes incrementa em 1

#### Scenario: Atualização ao excluir despesa
- **WHEN** o usuário exclui uma despesa
- **THEN** o resumo atualiza imediatamente refletindo a remoção do valor e do status da despesa excluída
