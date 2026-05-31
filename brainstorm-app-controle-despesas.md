# Brainstorm — Aplicação Web Simples para Controle de Despesas Mensais

## 1. Objetivo do produto

Criar uma aplicação web simples para substituir o controle manual em papel das despesas mensais.

A ideia principal é manter a mesma lógica que já funciona hoje:

- listar as despesas do mês;
- informar o valor previsto ou valor da conta;
- marcar se a despesa foi paga ou não;
- visualizar rapidamente o que ainda falta pagar;
- manter tudo simples, direto e fácil de atualizar.

O produto não deve nascer como um app financeiro complexo. Ele deve ser, antes de tudo, uma versão digital, organizada e prática do controle atual.

---

## 2. Princípios do produto

### Simplicidade em primeiro lugar

A aplicação deve parecer mais com uma folha organizada ou uma planilha simples do que com um sistema financeiro cheio de gráficos, categorias e relatórios complexos.

### Poucos cliques

O usuário deve conseguir registrar, editar e marcar uma despesa como paga rapidamente.

### Clareza visual

Ao abrir o app, o usuário deve entender em poucos segundos:

- quais contas existem no mês;
- quais já foram pagas;
- quais ainda estão pendentes;
- quanto já foi pago;
- quanto ainda falta pagar.

### Controle mensal

O app deve girar em torno do mês. A unidade principal não é uma transação isolada, mas sim o conjunto de despesas daquele mês.

### Evitar excesso de funcionalidades

O app deve evitar virar um sistema completo de finanças pessoais logo no início. O foco é controle de despesas mensais, não orçamento avançado, investimentos, conciliação bancária ou relatórios fiscais.

---

## 3. Ideia central da tela principal

A tela principal pode ser uma lista mensal parecida com o caderno atual.

Exemplo conceitual:

| Status | Despesa | Valor | Pago? |
|---|---|---:|---|
| Pendente | Aluguel | R$ 1.748,07 | ☐ |
| Pago | Energia elétrica | R$ 353,66 | ☑ |
| Pago | Água e esgoto | R$ 202,50 | ☑ |
| Pendente | Internet | R$ 107,47 | ☐ |

A diferença é que o app pode calcular automaticamente os totais e facilitar a navegação entre meses.

---

## 4. Funcionalidades essenciais para a primeira versão

### 4.1 Criar despesas mensais

O usuário deve conseguir cadastrar uma despesa com informações simples:

- nome da despesa;
- valor;
- mês de referência;
- status: pago ou pendente.

Campos opcionais que podem existir depois:

- vencimento;
- observação;
- categoria;
- recorrência;
- forma de pagamento.

### 4.2 Marcar como pago

A ação mais importante do app deve ser muito simples: marcar uma despesa como paga.

Idealmente, isso deve acontecer com um único clique ou toque.

### 4.3 Editar valor

Algumas despesas mudam de valor todo mês, como energia, água ou mercado.

O app deve permitir editar rapidamente o valor sem abrir telas complexas.

### 4.4 Excluir despesa

O usuário deve conseguir remover uma despesa do mês caso ela não exista mais.

### 4.5 Visualizar totais do mês

O app pode exibir um pequeno resumo no topo da página:

- total de despesas do mês;
- total pago;
- total pendente;
- quantidade de contas pendentes.

Exemplo:

```text
Abril 2026
Total do mês: R$ 7.500,00
Pago: R$ 4.200,00
Pendente: R$ 3.300,00
Contas pendentes: 5
```

### 4.6 Navegar entre meses

O usuário deve conseguir trocar facilmente entre os meses:

```text
< Março 2026 | Abril 2026 | Maio 2026 >
```

Isso permite consultar meses anteriores e planejar os próximos.

---

## 5. Funcionalidades simples, mas muito úteis

### 5.1 Duplicar despesas do mês anterior

Como muitas contas se repetem todo mês, uma função muito útil seria:

> Criar mês com base no mês anterior.

Exemplo:

- o usuário fecha abril;
- clica em “Criar maio a partir de abril”;
- o app copia os nomes das despesas;
- os valores podem vir preenchidos com os valores anteriores ou zerados;
- os status voltam para “pendente”.

Essa funcionalidade preserva a simplicidade e reduz o trabalho manual.

### 5.2 Despesas recorrentes

Outra opção seria permitir que algumas despesas sejam marcadas como recorrentes.

Exemplos:

- aluguel;
- internet;
- financiamento;
- assinaturas;
- mensalidades.

Mas essa funcionalidade pode ficar para depois, pois pode adicionar complexidade.

Uma alternativa mais simples é usar apenas a função de duplicar mês.

### 5.3 Ordenação manual

No caderno, a ordem das despesas provavelmente tem significado para você.

O app poderia permitir arrastar e soltar as despesas para organizar a lista do jeito desejado.

Também poderia oferecer ordenações simples:

- por status;
- por nome;
- por valor;
- por vencimento.

### 5.4 Destaque visual para pendências

As despesas pendentes podem aparecer com destaque leve.

Exemplo:

- checkbox vazio;
- texto normal;
- valor destacado;
- etiqueta “pendente”.

As despesas pagas podem aparecer com visual mais suave:

- checkbox marcado;
- texto levemente apagado;
- talvez uma linha riscada opcional.

### 5.5 Modo “somente pendentes”

Um botão simples poderia filtrar apenas as contas ainda não pagas.

Isso ajudaria no momento de pagar contas.

Exemplo:

```text
[ Todas ] [ Pendentes ] [ Pagas ]
```

---

## 6. Ideias para a experiência de uso

### 6.1 O app deve parecer uma checklist financeira

A sensação ideal não é de um “sistema bancário”, mas sim de uma checklist mensal.

A pergunta principal do app seria:

> O que eu ainda preciso pagar este mês?

### 6.2 Atualização rápida inline

Sempre que possível, o usuário deveria editar direto na lista:

- clicar no nome e alterar;
- clicar no valor e alterar;
- clicar no checkbox e marcar como pago.

Evitar abrir formulários grandes para pequenas alterações.

### 6.3 Pouca fricção para lançar despesas

Adicionar uma despesa poderia ser algo rápido:

```text
Nome da despesa | Valor | Adicionar
```

Sem exigir muitos campos obrigatórios.

### 6.4 Visual limpo

A interface pode ter poucos elementos:

- mês atual no topo;
- resumo financeiro;
- lista de despesas;
- botão para adicionar despesa;
- filtros simples.

---

## 7. Possíveis telas do app

### 7.1 Dashboard mensal

Tela principal do app.

Conteúdo:

- mês selecionado;
- resumo do mês;
- lista de despesas;
- filtros de status;
- botão para adicionar nova despesa;
- ação para duplicar mês anterior.

### 7.2 Histórico de meses

Tela para visualizar meses passados.

Conteúdo:

- lista de meses;
- total de cada mês;
- percentual pago;
- acesso rápido para abrir um mês.

Exemplo:

| Mês | Total | Pago | Pendente |
|---|---:|---:|---:|
| Abril 2026 | R$ 7.500,00 | R$ 4.200,00 | R$ 3.300,00 |
| Março 2026 | R$ 7.300,00 | R$ 7.300,00 | R$ 0,00 |

### 7.3 Cadastro rápido de despesa

Pode ser uma pequena área dentro da própria tela principal.

Campos iniciais:

- nome;
- valor.

Campos opcionais em uma seção avançada:

- vencimento;
- categoria;
- observação.

### 7.4 Configurações simples

Configurações mínimas:

- moeda padrão;
- primeiro mês disponível;
- preferência de exibição;
- categorias, caso existam no futuro.

---

## 8. Modelo mental do usuário

O usuário não quer necessariamente “gerenciar finanças”.

Ele quer responder perguntas simples:

1. Quais contas tenho este mês?
2. Quais já paguei?
3. Quais ainda faltam?
4. Quanto ainda falta pagar?
5. O mês está sob controle?

Toda funcionalidade do app deveria ajudar diretamente uma dessas perguntas.

---

## 9. Ideias de campos para cada despesa

### Versão mínima

- nome;
- valor;
- pago ou pendente;
- mês de referência.

### Versão um pouco mais completa

- nome;
- valor previsto;
- valor pago;
- vencimento;
- data de pagamento;
- status;
- observação;
- categoria.

### Versão com mais controle

- recorrente ou não;
- forma de pagamento;
- conta/cartão associado;
- prioridade;
- comprovante/anexo;
- tags.

Para manter a simplicidade, a versão inicial deveria ficar próxima da versão mínima.

---

## 10. Categorias possíveis

Categorias podem ser úteis, mas não precisam ser obrigatórias no início.

Exemplos:

- Moradia;
- Contas básicas;
- Alimentação;
- Transporte;
- Saúde;
- Educação;
- Lazer;
- Assinaturas;
- Família;
- Outros.

Uma boa decisão seria permitir categorias, mas não exigir que o usuário use.

---

## 11. Estados possíveis de uma despesa

A versão mais simples precisa apenas de:

- pendente;
- paga.

No futuro, poderiam existir outros estados:

- atrasada;
- agendada;
- parcial;
- cancelada.

Mas adicionar muitos estados cedo pode deixar o app mais pesado do que o necessário.

---

## 12. Pequenas automações úteis

### 12.1 Reset automático ao criar novo mês

Ao criar um novo mês com base no anterior:

- copiar despesas;
- manter valores ou limpar valores variáveis;
- marcar tudo como pendente.

### 12.2 Sugestão de valor anterior

Quando o usuário cadastrar uma despesa já conhecida, o app pode sugerir o último valor usado.

Exemplo:

> “Energia elétrica teve valor de R$ 353,66 no mês anterior.”

### 12.3 Alerta de vencimento

Caso o app tenha campo de vencimento, poderia mostrar alertas simples:

- vence hoje;
- vence amanhã;
- vencida.

Mas notificações podem ficar para uma etapa posterior.

---

## 13. Relatórios simples

A primeira versão talvez não precise de relatórios, mas alguns indicadores simples podem ser úteis.

### Indicadores possíveis

- total por mês;
- evolução do total mensal;
- maior despesa do mês;
- total por categoria;
- média mensal por despesa.

### Cuidado

Relatórios não devem virar o foco inicial. O foco principal deve continuar sendo controle e pagamento das despesas do mês.

---

## 14. Ideias de layout

### Opção 1: Lista simples

Mais próxima do caderno atual.

```text
Abril 2026

[+] Adicionar despesa

☑ Energia elétrica        R$ 353,66
☑ Água e esgoto           R$ 202,50
☐ Internet                R$ 107,47
☐ Telefone claro          R$ 39,27
```

### Opção 2: Tabela simples

Mais próxima de uma planilha.

```text
Despesa             Valor        Status
Energia elétrica    R$ 353,66    Pago
Internet            R$ 107,47    Pendente
Telefone claro      R$ 39,27     Pendente
```

### Opção 3: Cards compactos

Boa para uso no celular.

```text
Internet
R$ 107,47
[ Marcar como pago ]
```

### Sugestão

Usar lista ou tabela no desktop e cards compactos no celular.

---

## 15. Funcionalidades que talvez devam ficar fora da primeira versão

Para manter o produto simples, talvez seja melhor evitar no início:

- integração com banco;
- leitura automática de boleto;
- importação de extrato;
- controle de investimentos;
- metas financeiras complexas;
- múltiplas contas bancárias;
- múltiplos usuários;
- anexos e comprovantes;
- notificações avançadas;
- gráficos complexos;
- inteligência artificial.

Essas funcionalidades podem ser interessantes no futuro, mas não são necessárias para validar a ideia principal.

---

## 16. Possível MVP

Uma primeira versão realmente útil poderia ter apenas:

1. selecionar mês;
2. adicionar despesa com nome e valor;
3. listar despesas do mês;
4. marcar como paga ou pendente;
5. editar nome e valor;
6. excluir despesa;
7. mostrar total pago e total pendente;
8. duplicar mês anterior.

Com isso, o app já substituiria o caderno de forma prática.

---

## 17. Ideias para versões futuras

### Versão 2

- vencimento;
- filtro por pendentes;
- categorias opcionais;
- histórico mensal;
- ordenação manual.

### Versão 3

- despesas recorrentes;
- alertas de vencimento;
- comparação entre meses;
- exportação para CSV;
- backup dos dados.

### Versão 4

- anexar comprovantes;
- divisão por pessoa;
- orçamento por categoria;
- visão anual;
- versão mobile mais refinada.

---

## 18. Perguntas para refinar a ideia depois

1. Você quer controlar apenas contas fixas ou também gastos variáveis do mês?
2. Você quer registrar a data de vencimento ou apenas o status pago/pendente já basta?
3. O valor da despesa deve ser o valor previsto, o valor real ou ambos?
4. Você quer separar despesas pessoais, familiares e da casa?
5. Você quer ver histórico ou apenas controlar o mês atual?
6. Você quer cadastrar despesas recorrentes ou prefere duplicar o mês anterior manualmente?
7. Você usaria mais no computador ou no celular?
8. Você precisa exportar os dados para Excel/CSV?
9. Você quer categorias ou isso adicionaria complexidade desnecessária?
10. O app deve ser privado e individual ou pode ter compartilhamento no futuro?

---

## 19. Direção recomendada

A melhor direção parece ser criar uma aplicação com o seguinte posicionamento:

> Uma checklist mensal de despesas, simples como papel, mas com totais automáticos, histórico e reaproveitamento dos meses anteriores.

Essa abordagem mantém o que já funciona no método atual e adiciona apenas o que o digital faz melhor:

- cálculo automático;
- histórico;
- edição rápida;
- duplicação de mês;
- filtros;
- visualização clara de pendências.

---

## 20. Frase guia do produto

> “Eu quero abrir o app e saber rapidamente quais contas do mês eu já paguei, quais ainda faltam e quanto ainda preciso desembolsar.”

Essa frase pode servir como guia para decidir o que entra ou não no produto.
