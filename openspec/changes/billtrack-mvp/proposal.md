## Why

Substituir o controle manual de despesas mensais feito em papel por uma aplicação web simples que mantenha a mesma lógica atual: listar contas do mês, marcar o que foi pago, e ver rapidamente o que ainda falta pagar. A necessidade surge de eliminar o trabalho manual de cálculo de totais e facilitar a consulta de meses anteriores.

## What Changes

- Novo app web criado do zero (projeto não tem implementação anterior)
- Criação do backend Node.js com API REST para gestão de despesas mensais
- Criação do frontend web com interface de lista/checklist mensal
- Persistência local de dados (SQLite ou arquivo JSON)
- Nenhuma integração bancária, autenticação de usuários ou funcionalidade financeira avançada

## Capabilities

### New Capabilities

- `monthly-expenses`: Listagem das despesas de um mês, com filtros de status (todas, pendentes, pagas) e navegação entre meses
- `expense-management`: Criação, edição inline e exclusão de despesas (nome, valor, status)
- `payment-tracking`: Marcar/desmarcar despesa como paga com um único clique
- `monthly-summary`: Resumo financeiro automático do mês — total, total pago, total pendente, quantidade de pendentes
- `duplicate-month`: Copiar as despesas de um mês para o próximo, resetando todos os status para pendente

### Modified Capabilities

<!-- Nenhuma — projeto novo, sem specs existentes -->

## Impact

- Criação de toda a estrutura do projeto (backend, frontend, banco de dados)
- Dependências novas: framework web Node.js (Fastify ou Express), ORM/driver SQLite, framework frontend (vanilla JS ou Preact para manter leveza)
- Sem impacto em sistemas externos
