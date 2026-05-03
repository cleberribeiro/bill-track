## ADDED Requirements

### Requirement: Duplicar despesas do mês anterior
O sistema SHALL permitir ao usuário criar as despesas de um mês copiando os nomes e valores do mês anterior, com todos os status resetados para `pending`.

#### Scenario: Duplicação com sucesso
- **WHEN** o usuário aciona "Criar mês a partir do anterior" em um mês sem despesas e o mês anterior tem despesas
- **THEN** o sistema cria cópias de todas as despesas do mês anterior no mês atual, com os mesmos nomes, os mesmos valores e todos os status como `pending`

#### Scenario: Mês anterior sem despesas
- **WHEN** o usuário aciona a duplicação e o mês anterior não tem despesas cadastradas
- **THEN** o sistema exibe uma mensagem informando que não há despesas no mês anterior para copiar e nenhuma ação é realizada

#### Scenario: Mês atual já tem despesas
- **WHEN** o usuário aciona a duplicação e o mês atual já tem despesas cadastradas
- **THEN** o sistema solicita confirmação antes de prosseguir, informando que as despesas existentes serão mantidas e as do mês anterior serão adicionadas

#### Scenario: Ordem preservada na duplicação
- **WHEN** a duplicação é realizada com sucesso
- **THEN** as despesas criadas preservam a mesma ordem (`sort_order`) das despesas do mês de origem
