## ADDED Requirements

### Requirement: Marcar despesa como paga
O sistema SHALL permitir ao usuário marcar uma despesa pendente como paga com um único clique ou toque.

#### Scenario: Marcar como paga
- **WHEN** o usuário clica no checkbox de uma despesa com status `pending`
- **THEN** o sistema atualiza o status para `paid`, aplica visual de "paga" (texto levemente apagado) e atualiza o resumo financeiro imediatamente

### Requirement: Desmarcar pagamento
O sistema SHALL permitir ao usuário reverter uma despesa paga para o status pendente.

#### Scenario: Desmarcar pagamento
- **WHEN** o usuário clica no checkbox de uma despesa com status `paid`
- **THEN** o sistema atualiza o status para `pending`, restaura o visual normal e atualiza o resumo financeiro imediatamente

### Requirement: Destaque visual de status
O sistema SHALL diferenciar visualmente despesas pendentes e pagas na lista.

#### Scenario: Visual de despesa pendente
- **WHEN** uma despesa tem status `pending`
- **THEN** o sistema exibe o checkbox vazio e o texto em estilo normal com destaque leve

#### Scenario: Visual de despesa paga
- **WHEN** uma despesa tem status `paid`
- **THEN** o sistema exibe o checkbox marcado e o texto em estilo suavizado (opacidade reduzida ou cor neutra)
