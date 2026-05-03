## 1. Setup do Projeto

- [x] 1.1 Instalar dependências: `fastify`, `better-sqlite3`, `@fastify/static`
- [x] 1.2 Criar estrutura de pastas: `src/routes/`, `src/public/`, `data/`
- [x] 1.3 Criar `src/db.js` com conexão SQLite e criação do schema `bills` via `CREATE TABLE IF NOT EXISTS`
- [x] 1.4 Criar `src/server.js` com instância Fastify, registro de rotas e plugin static para `src/public/`
- [x] 1.5 Adicionar script `"start": "node src/server.js"` no `package.json`
- [x] 1.6 Adicionar `data/` ao `.gitignore`

## 2. API — Despesas (CRUD)

- [x] 2.1 `GET /api/months/:yearMonth/bills` — listar despesas do mês, com filtro opcional `?status=pending|paid`
- [x] 2.2 `POST /api/months/:yearMonth/bills` — criar despesa com `name` e `amount` obrigatórios; status padrão `pending`
- [x] 2.3 `PATCH /api/bills/:id` — atualizar `name`, `amount` ou `status` individualmente
- [x] 2.4 `DELETE /api/bills/:id` — excluir despesa por ID

## 3. API — Meses e Resumo

- [x] 3.1 `GET /api/months/:yearMonth/summary` — retornar `{ total, paid, pending, pendingCount }` calculados via SQL
- [x] 3.2 `POST /api/months/:yearMonth/duplicate-from/:sourceYearMonth` — copiar despesas do mês de origem para o mês destino com `status = 'pending'`
- [x] 3.3 `GET /api/months` — listar todos os meses que possuem despesas, com resumo de cada um

## 4. Frontend — Estrutura Base

- [x] 4.1 Criar `src/public/index.html` com layout: cabeçalho do mês, área de resumo, área de filtros, lista de despesas, formulário de adição
- [x] 4.2 Criar `src/public/style.css` com estilo limpo e responsivo (mobile-first)
- [x] 4.3 Incluir HTMX via CDN no `index.html`
- [x] 4.4 Criar `src/public/app.js` para lógica de navegação de mês e inicialização da página

## 5. Frontend — Navegação entre Meses

- [x] 5.1 Exibir o mês atual no cabeçalho no formato "Mês YYYY" (ex: "Maio 2026")
- [x] 5.2 Botões "< Anterior" e "Próximo >" que atualizam o mês exibido e recarregam a lista
- [x] 5.3 Ao abrir o app, selecionar automaticamente o mês corrente

## 6. Frontend — Lista de Despesas

- [x] 6.1 Renderizar cada despesa com: checkbox de status, nome, valor formatado em R$ e botão de excluir
- [x] 6.2 Aplicar estilo diferenciado para despesas pagas (opacidade reduzida)
- [x] 6.3 Exibir mensagem vazia quando o mês não tem despesas

## 7. Frontend — Filtros de Status

- [x] 7.1 Renderizar botões de filtro: "Todas", "Pendentes", "Pagas"
- [x] 7.2 Ao clicar em um filtro, recarregar a lista passando `?status=` na query

## 8. Frontend — Marcar como Pago / Pendente

- [x] 8.1 Ao clicar no checkbox, enviar `PATCH /api/bills/:id` com `{ status: 'paid' | 'pending' }`
- [x] 8.2 Atualizar visualmente o item e o resumo sem recarregar a página inteira

## 9. Frontend — Edição Inline de Nome e Valor

- [x] 9.1 Tornar o nome da despesa clicável: ao clicar, transformar em `<input>` editável
- [x] 9.2 Ao confirmar (blur ou Enter), enviar `PATCH /api/bills/:id` com `{ name }` e restaurar exibição
- [x] 9.3 Tornar o valor da despesa clicável: ao clicar, transformar em `<input>` numérico
- [x] 9.4 Ao confirmar, enviar `PATCH /api/bills/:id` com `{ amount }`, validar positivo, restaurar exibição e atualizar resumo
- [x] 9.5 Cancelar edição (Escape) restaura o valor original sem salvar

## 10. Frontend — Adicionar Despesa

- [x] 10.1 Exibir formulário inline no topo da lista com campos "Nome" e "Valor" e botão "Adicionar"
- [x] 10.2 Ao submeter, enviar `POST /api/months/:yearMonth/bills` e inserir o novo item na lista
- [x] 10.3 Limpar o formulário após adição bem-sucedida e focar novamente no campo "Nome"

## 11. Frontend — Excluir Despesa

- [x] 11.1 Ao clicar no botão de excluir, exibir confirmação inline ou nativa (confirm())
- [x] 11.2 Ao confirmar, enviar `DELETE /api/bills/:id` e remover o item da lista atualizando o resumo

## 12. Frontend — Resumo Financeiro

- [x] 12.1 Exibir bloco de resumo com: "Total do mês", "Pago", "Pendente" e "Contas pendentes"
- [x] 12.2 Atualizar o resumo chamando `GET /api/months/:yearMonth/summary` após cada operação que altere valores ou status

## 13. Frontend — Duplicar Mês

- [x] 13.1 Exibir botão "Criar a partir do mês anterior" quando o mês selecionado não tem despesas
- [x] 13.2 Ao clicar, calcular o mês anterior e enviar `POST /api/months/:yearMonth/duplicate-from/:sourceYearMonth`
- [x] 13.3 Se o mês atual já tiver despesas, solicitar confirmação antes de acionar a duplicação
- [x] 13.4 Após duplicação bem-sucedida, recarregar a lista e o resumo do mês atual
