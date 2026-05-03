## Context

Projeto novo, sem código existente. O usuário mantém um controle mensal de despesas em papel: lista as contas, marca o que foi pago e calcula os totais manualmente. O objetivo é digitalizar esse fluxo mantendo a mesma simplicidade, sem virar um app de finanças pessoais completo.

Restrições principais:
- Um único usuário (sem autenticação)
- Dados persistidos localmente (sem servidor remoto ou banco de dados externo)
- Interface responsiva (desktop + celular)
- Instalação e execução simples (`npm start`)

## Goals / Non-Goals

**Goals:**
- API REST em Node.js para gestão de despesas por mês
- Interface web com lista/checklist das despesas do mês
- Persistência local via SQLite (arquivo `.db` na raiz do projeto)
- Suporte a navegação entre meses e duplicação de mês

**Non-Goals:**
- Autenticação de usuários
- Integração bancária ou importação de extratos
- Notificações push ou e-mail
- Relatórios avançados ou gráficos
- Deploy em cloud / múltiplos usuários

## Decisions

### Decisão 1 — Backend: Fastify

**Escolha:** Fastify  
**Alternativas consideradas:** Express, Hono  
**Rationale:** Fastify tem performance superior ao Express, API moderna com async/await nativa, validação de schema built-in com JSON Schema, e gera menos boilerplate. Para um projeto pequeno, evita dependências extras que o Express normalmente exige (body-parser, etc.).

### Decisão 2 — Banco de dados: SQLite via `better-sqlite3`

**Escolha:** SQLite + better-sqlite3  
**Alternativas consideradas:** JSON em arquivo, LowDB, PostgreSQL  
**Rationale:** SQLite é ideal para aplicações single-user locais. `better-sqlite3` é síncrono, simples e sem overhead de conexão. Não exige servidor externo. JSON em arquivo teria problemas de concorrência e falta de queries. PostgreSQL seria overkill.

### Decisão 3 — Frontend: Vanilla JS + HTMX

**Escolha:** HTMX + HTML/CSS servido pelo Fastify  
**Alternativas consideradas:** React, Preact, Vue, Vanilla JS puro  
**Rationale:** HTMX permite interatividade (marcar como pago, editar inline) sem build step, sem bundler e sem framework JS. O servidor serve HTML diretamente; HTMX faz as chamadas AJAX e atualiza partes da página. Isso alinha perfeitamente com o princípio de simplicidade — sem `npm run build`, sem bundler.

Se HTMX se mostrar insuficiente para edição inline, a alternativa é Vanilla JS puro com fetch API.

### Decisão 4 — Modelo de dados

```
bills
  id           INTEGER PRIMARY KEY AUTOINCREMENT
  name         TEXT NOT NULL
  amount       REAL NOT NULL DEFAULT 0
  month_ref    TEXT NOT NULL  -- formato "YYYY-MM"
  status       TEXT NOT NULL DEFAULT 'pending'  -- 'pending' | 'paid'
  sort_order   INTEGER NOT NULL DEFAULT 0
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
```

Não há entidade separada para `Month` — o mês é derivado do campo `month_ref`. Um mês "existe" quando há pelo menos uma despesa com aquele `month_ref`.

### Decisão 5 — Estrutura do projeto

```
bill-track/
  src/
    server.js          # ponto de entrada Fastify
    db.js              # conexão e inicialização do SQLite
    routes/
      bills.js         # rotas /api/bills
      months.js        # rotas /api/months
    public/
      index.html       # SPA simples ou template principal
      style.css
      app.js           # lógica frontend (ou HTMX attributes inline)
  data/
    billtrack.db       # arquivo SQLite (gitignored)
```

## Risks / Trade-offs

- **HTMX pode limitar UX de edição inline** → se a experiência de edição se mostrar ruim, migrar para Vanilla JS com fetch (sem mudar o backend)
- **SQLite sem migrations formais** → para o MVP, o schema é criado na inicialização via `CREATE TABLE IF NOT EXISTS`; se o schema mudar, o usuário precisará recriar o banco. Aceitável para MVP single-user.
- **Sem backup automático** → dados ficam em um arquivo local; recomendado ao usuário fazer cópias do `.db`. Backup pode ser adicionado depois.
- **`sort_order` manual não implementado no MVP** → a ordenação no MVP será por `sort_order ASC, created_at ASC`; drag-and-drop fica para versão futura.
