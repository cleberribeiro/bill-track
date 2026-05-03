## ADDED Requirements

### Requirement: Listar despesas do mês
O sistema SHALL exibir todas as despesas cadastradas para o mês de referência selecionado, ordenadas por `sort_order ASC, created_at ASC`.

#### Scenario: Mês com despesas
- **WHEN** o usuário acessa o mês "2026-04"
- **THEN** o sistema exibe a lista de despesas daquele mês na ordem definida

#### Scenario: Mês sem despesas
- **WHEN** o usuário acessa um mês sem despesas cadastradas
- **THEN** o sistema exibe uma mensagem indicando que não há despesas e oferece a opção de adicionar a primeira

### Requirement: Navegar entre meses
O sistema SHALL permitir ao usuário navegar para o mês anterior e para o mês seguinte a partir do mês atualmente selecionado.

#### Scenario: Navegar para o mês anterior
- **WHEN** o usuário clica em "mês anterior"
- **THEN** o sistema exibe as despesas do mês imediatamente anterior ao mês atual

#### Scenario: Navegar para o mês seguinte
- **WHEN** o usuário clica em "próximo mês"
- **THEN** o sistema exibe as despesas do mês imediatamente posterior ao mês atual

#### Scenario: Mês padrão ao abrir o app
- **WHEN** o usuário abre o aplicativo sem selecionar um mês
- **THEN** o sistema exibe automaticamente o mês corrente (ano e mês do servidor)

### Requirement: Filtrar despesas por status
O sistema SHALL permitir ao usuário filtrar a lista de despesas por status: todas, apenas pendentes, ou apenas pagas.

#### Scenario: Filtro "Todas"
- **WHEN** o usuário seleciona o filtro "Todas"
- **THEN** o sistema exibe todas as despesas do mês independente do status

#### Scenario: Filtro "Pendentes"
- **WHEN** o usuário seleciona o filtro "Pendentes"
- **THEN** o sistema exibe apenas as despesas com status `pending`

#### Scenario: Filtro "Pagas"
- **WHEN** o usuário seleciona o filtro "Pagas"
- **THEN** o sistema exibe apenas as despesas com status `paid`
