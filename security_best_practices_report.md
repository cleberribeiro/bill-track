# BillTrack — Relatório de Segurança (Best Practices)

Data: 2026-05-29
Escopo analisado: backend Fastify (`src/app.js`, `src/routes/*`, `src/db.js`, `src/server.js`), frontend vanilla JS (`src/public/*`), configuração de deploy (`render.yaml`), `.env`, `.env.example`, `package.json`.

> Observação metodológica: o projeto usa **Fastify**, e não Express. As referências da skill `security-best-practices` são para Express, mas a maioria dos princípios (CSRF, sessões seguras, headers de segurança, rate limit, validação de input, traversal, etc.) é agnóstica de framework e foi aplicada aqui.

---

## Sumário executivo

A aplicação tem uma boa base: senha comparada com `timingSafeEqual`, queries parametrizadas via `@libsql/client`, cookies de sessão com `httpOnly`/`sameSite=lax`/`secure` condicional, e o frontend escreve dados do usuário com `textContent` (sem `innerHTML`). Porém há **achados de severidade alta** relacionados a:

- Segredo real (`APP_PASSWORD`) e antigo token JWT do Turso presentes em `.env` no disco (e o JWT em comentário; presume‑se rotacionado, mas precisa confirmação).
- Ausência de **CSRF** em rotas que mudam estado e dependem de cookie de sessão.
- Ausência de **rate limiting** no endpoint de login (alvo clássico de brute‑force, ainda mais com gate de senha única).
- **Session store em memória** em produção (default do `@fastify/session`, com aviso explícito `MemoryStore is not designed for a production environment`).
- **Falta de headers de segurança** (Helmet/CSP/X-Frame-Options/etc.).
- **Falta de regeneração da sessão no login** (risco de session fixation).
- Validação de input incompleta em algumas rotas (`PATCH /api/bills/:id` sem schema, `yearMonth`/`id` sem validação de formato).

Recomendo priorizar os achados Altos antes de qualquer deploy público.

---

## Achados Críticos

### F-01 — Possível vazamento de segredos no `.env` (e histórico de token JWT)
- **Severidade:** Crítica
- **Local:** `.env` linhas 4-9
- **Evidência:**

```4:9:.env
# TURSO_DATABASE_URL=libsql://billtracker-cleberribeiro.aws-us-east-2.turso.io
# TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQ...
# Single-password gate for the app
APP_PASSWORD=xXc572!
```

- **Impacto:** O token JWT do Turso, mesmo comentado, está armazenado no arquivo. Se já foi usado em produção e nunca rotacionado, qualquer pessoa com acesso ao arquivo (incluindo backups, IDE remoto, vazamentos futuros, ou commits acidentais) tem permissão de leitura/escrita no banco. A senha `xXc572!` parece real e está em texto plano. Embora `.env` esteja no `.gitignore` e nunca tenha sido commitado (`git log --all -- .env` não retorna nada), o segredo permanece exposto localmente.
- **Fix:**
  1. **Rotacione imediatamente** o `TURSO_AUTH_TOKEN` (`turso db tokens create <db>` e revogue o antigo com `turso db tokens revoke`).
  2. Troque o `APP_PASSWORD` se ele já foi usado em produção real.
  3. Remova as linhas comentadas do `.env`. Mantenha apenas placeholders no `.env.example`.
  4. Confirme via `git log --all` que nenhum desses valores apareceu em commits.
- **Notas:** o `git log --all -- .env` foi rodado durante esta análise e não acusou commits; o risco é local.

---

## Achados Altos

### F-02 — Sem proteção CSRF em endpoints autenticados por cookie
- **Severidade:** Alta
- **Local:** `src/app.js` (configuração de sessão), `src/routes/bills.js` (POST/PATCH/DELETE), `src/routes/months.js` (POST `duplicate-from`)
- **Evidência:**

```30:40:src/app.js
  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me-please',
    cookieName: 'billtrack.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  });
```

```70:76:src/routes/bills.js
  fastify.delete('/api/bills/:id', async (req, reply) => {
    const { id } = req.params;
    const existing = await db.execute({ sql: `SELECT * FROM bills WHERE id = ?`, args: [id] });
    if (existing.rows.length === 0) return reply.code(404).send({ error: 'Not found' });
    await db.execute({ sql: `DELETE FROM bills WHERE id = ?`, args: [id] });
```

- **Impacto:** Como o login é por cookie de sessão, qualquer página externa pode criar um `<form method="POST" action="https://app/api/bills/123">` ou um `fetch` com `credentials: 'include'` (caso CORS permita) e disparar mutações em nome do usuário logado. `SameSite=lax` mitiga *navegações de topo*, mas:
  - Não cobre POSTs feitos via formulário HTML mesmo com `lax`? Cobre, sim, *mas só formulários top‑level*. Como atenuante, é razoável; ainda assim, é boa prática ter defesa em profundidade.
  - Não cobre cenários onde o navegador interpreta a request como "same‑site" por subdomínios.
  - Não cobre ataques via XSS no próprio site.
- **Fix:** Adicionar `@fastify/csrf-protection` ou um header obrigatório (ex.: `X-Requested-With: fetch`) que o frontend mande em todas as requisições mutadoras. Em apps SPA pequenas o segundo padrão é o "double submit token" via header customizado. Exemplo mínimo:

```js
import fastifyCsrf from '@fastify/csrf-protection';
await fastify.register(fastifyCsrf, { sessionPlugin: '@fastify/session' });
// rotas mutadoras: { preHandler: fastify.csrfProtection }
```

E o frontend lê o token (`GET /api/csrf`) e envia em cada POST/PATCH/DELETE.

### F-03 — Sem rate limit no `/api/login` (brute‑force contra senha única)
- **Severidade:** Alta
- **Local:** `src/app.js` linhas 57-72
- **Evidência:**

```57:72:src/app.js
  fastify.post('/api/login', {
    schema: {
      body: {
        type: 'object',
        required: ['password'],
        properties: { password: { type: 'string' } },
      },
    },
  }, (req, reply) => {
    const expected = process.env.APP_PASSWORD || '';
    if (!expected || !passwordMatches(req.body.password, expected)) {
      return reply.code(401).send({ error: 'Senha inválida' });
    }
    req.session.authenticated = true;
    return { ok: true };
  });
```

- **Impacto:** A app inteira é protegida por **uma única senha**. Sem rate limit, um atacante pode fazer milhares de tentativas/min. Como a senha pode ser curta (ex.: `xXc572!` tem 7 caracteres), brute‑force / dicionário é viável.
- **Fix:** registrar `@fastify/rate-limit` global (com limite mais permissivo) e específico para `/api/login` (ex.: 5 tentativas a cada 15 min por IP):

```js
await fastify.register(import('@fastify/rate-limit'), { global: false });
fastify.post('/api/login', {
  config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
  schema: { /* ... */ },
}, handler);
```

### F-04 — Session store em memória (default) em produção
- **Severidade:** Alta
- **Local:** `src/app.js` linhas 31-40
- **Evidência:** `@fastify/session` é registrado **sem `store`**, então usa o `MemoryStore` interno. O próprio package documenta: *"the default session store, MemoryStore, is not designed for a production environment, as it will leak memory, and will not scale past a single process."*
- **Impacto:**
  - Vazamento de memória ao longo do tempo; sessões perdidas a cada deploy/restart (no Render free plan o serviço dorme).
  - Em multi‑instância, sessões inconsistentes.
  - Não há rotação/limpeza, e a `maxAge` é de 30 dias.
- **Fix:** usar um store persistente. Como o projeto já usa Turso/SQLite, a opção mais simples é `connect-sqlite3` (em modo local) ou um Redis gratuito; também há `connect-libsql`. Mínimo:

```js
import sqliteStore from 'better-sqlite3-session-store';
// ou um store backed pelo libSQL
await fastify.register(fastifySession, {
  store: new SQLiteStore(/* ... */),
  /* ... */
});
```

Se o tráfego é de uma única pessoa e o serviço é interno, isso pode ser aceito como dívida técnica documentada no `README.md`.

### F-05 — Falta de regeneração da sessão no login (risco de session fixation)
- **Severidade:** Alta
- **Local:** `src/app.js` linhas 65-72
- **Evidência:** após validar a senha, o código apenas seta `req.session.authenticated = true`, mantendo o mesmo `sessionId` que o cliente já tinha (potencialmente fixado por um atacante via, por exemplo, bug de XSS ou cookie injetado em rede).
- **Impacto:** um atacante poderia plantar um cookie `billtrack.sid` no navegador da vítima e, após o login, "herdar" a sessão autenticada.
- **Fix:** regenerar a sessão antes de marcar como autenticado:

```js
}, async (req, reply) => {
  const expected = process.env.APP_PASSWORD || '';
  if (!expected || !passwordMatches(req.body.password, expected)) {
    return reply.code(401).send({ error: 'Senha inválida' });
  }
  await req.session.regenerate(); // emite novo session id
  req.session.authenticated = true;
  return { ok: true };
});
```

### F-06 — Falta de headers de segurança (Helmet/CSP/X-Frame-Options/etc.)
- **Severidade:** Alta (para CSP) / Média para os demais
- **Local:** `src/app.js` (não há `@fastify/helmet`)
- **Evidência:** nenhum middleware seta `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy` ou `X-Frame-Options`. Os HTMLs servidos importam fontes do Google (`fonts.googleapis.com`/`fonts.gstatic.com`) e há um `<script>` inline em `login.html` (linhas 73-95).
- **Impacto:** sem CSP, qualquer XSS (por ex. via texto de uma `bill.name` se algum dia alguém usar `innerHTML`) tem impacto máximo. Sem `X-Frame-Options`/`frame-ancestors`, a página de login pode ser embutida em iframe e usada para clickjacking.
- **Fix:** instalar `@fastify/helmet`:

```js
import helmet from '@fastify/helmet';
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // mover o script inline de login.html para um arquivo
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
});
```

E mover o `<script>` inline do `src/public/login.html` para `src/public/login.js`, evitando `'unsafe-inline'` no CSP.

### F-07 — `SESSION_SECRET` com fallback inseguro
- **Severidade:** Alta (em produção)
- **Local:** `src/app.js` linha 32
- **Evidência:**

```32:32:src/app.js
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me-please',
```

- **Impacto:** se `SESSION_SECRET` não estiver setado em produção, a aplicação sobe com um segredo público e conhecido, permitindo que qualquer atacante forge cookies de sessão válidos. O `render.yaml` usa `generateValue: true`, então no ambiente atual o problema é mitigado, mas o fallback "amigável" no código é um *footgun* permanente.
- **Fix:** falhar explicitamente em produção se `SESSION_SECRET` não estiver definido:

```js
const sessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === 'production' && (!sessionSecret || sessionSecret.length < 32)) {
  throw new Error('SESSION_SECRET must be set (>=32 chars) in production');
}
```

---

## Achados Médios

### F-08 — Validação de input ausente/parcial em rotas mutadoras
- **Severidade:** Média
- **Local:**
  - `src/routes/bills.js` linhas 46-68 (`PATCH /api/bills/:id` não tem `schema`)
  - `src/routes/bills.js` linha 47 (`id` é usado como `?` na query mas nunca validado como inteiro)
  - `src/routes/bills.js` linha 4-19 e 21-44 (`yearMonth` é usado direto, sem validação de formato `YYYY-MM`)
  - `src/routes/months.js` linha 33-58 (`yearMonth` e `sourceYearMonth` sem validação)
- **Evidência:**

```46:68:src/routes/bills.js
  fastify.patch('/api/bills/:id', async (req, reply) => {
    const { id } = req.params;
    const { name, amount, status } = req.body;
    const existing = await db.execute({ sql: `SELECT * FROM bills WHERE id = ?`, args: [id] });
    ...
```

- **Impacto:** SQL injection está descartado (queries parametrizadas), mas:
  - É possível inserir/duplicar bills com `month_ref` arbitrário (ex.: `"; DROP--"`, `../../etc`, strings enormes), poluindo dados e os agregados de `/api/months`.
  - É possível enviar `id` não numérico, gerando consultas que retornam vazio sem 400.
  - Sem `schema` em `PATCH`, body com chaves extras é aceito silenciosamente.
- **Fix:** adicionar JSON Schema do Fastify em todas as rotas mutadoras e validar formato `YYYY-MM` em params:

```js
const yearMonthSchema = { type: 'string', pattern: '^[0-9]{4}-(0[1-9]|1[0-2])$' };
const idSchema = { type: 'integer', minimum: 1 };

fastify.patch('/api/bills/:id', {
  schema: {
    params: { type: 'object', properties: { id: idSchema }, required: ['id'] },
    body: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 200 },
        amount: { type: 'number', minimum: 0 },
        status: { type: 'string', enum: ['pending', 'paid'] },
      },
      minProperties: 1,
    },
  },
}, handler);
```

### F-09 — Error handler global pode vazar mensagens internas em produção
- **Severidade:** Média
- **Local:** `src/app.js` linhas 83-86
- **Evidência:**

```83:86:src/app.js
  fastify.setErrorHandler((error, req, reply) => {
    const statusCode = error.statusCode || 500;
    reply.code(statusCode).send({ error: error.message });
  });
```

- **Impacto:** mensagens como erros do libSQL (incluindo SQL bruto, paths, `ECONNREFUSED`, etc.) podem chegar ao cliente.
- **Fix:** logar o erro internamente; devolver mensagem genérica para 5xx:

```js
fastify.setErrorHandler((error, req, reply) => {
  req.log.error({ err: error }, 'request error');
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
  reply.code(statusCode).send({ error: error.message });
});
```

E lembre que `logger: false` em `buildApp` desabilita o logger; em produção (`server.js`) já está com `{ logger: true }`.

### F-10 — `trustProxy` "tudo ou nada" baseado em `NODE_ENV`
- **Severidade:** Média
- **Local:** `src/app.js` linha 26
- **Evidência:**

```26:26:src/app.js
    trustProxy: process.env.NODE_ENV === 'production',
```

- **Impacto:** `trustProxy: true` confia em **todos** os proxies da cadeia, inclusive em headers `X-Forwarded-For` arbitrários. Hoje o app não toma decisões de segurança baseadas em `req.ip` (não há rate limit nem audit log por IP), então o impacto direto é baixo. Mas se você adicionar rate limit (F-03), `req.ip` pode ser facilmente spoofável.
- **Fix:** restringir ao saltos do Render:

```js
trustProxy: process.env.NODE_ENV === 'production' ? 1 : false,
```

ou a uma lista de subnets do provedor.

### F-11 — `healthCheckPath` apontando para `/login.html` (não revela problemas reais)
- **Severidade:** Média (operacional, não de segurança direta)
- **Local:** `render.yaml` linha 9
- **Impacto:** o health check passa mesmo se o backend/banco estiverem off (apenas serve um arquivo estático). Não é vulnerabilidade, mas mascara incidentes de disponibilidade.
- **Fix:** criar uma rota `GET /api/health` que faça `db.execute('SELECT 1')` e devolva `{ ok: true }`, e usar essa rota.

---

## Achados Baixos / Defense‑in‑depth

### F-12 — Falta de cabeçalho `Cache-Control: no-store` nos endpoints `/api`
- **Severidade:** Baixa
- **Impacto:** respostas com dados financeiros podem ser cacheadas por proxies ou pelo navegador. Defina `Cache-Control: no-store` para todas as rotas `/api/*` autenticadas.

### F-13 — Sem proteção contra ID enumeráveis (auto‑increment)
- **Severidade:** Baixa (app single‑tenant)
- **Local:** `src/db.js` linhas 23-32 (`id INTEGER PRIMARY KEY AUTOINCREMENT`)
- **Impacto:** baixo neste contexto (uma única conta com senha), mas o guia geral da skill desaconselha IDs incrementais expostos publicamente. Como esta é uma app de uso pessoal, é aceitável manter; documente a decisão.

### F-14 — `<script>` inline em `login.html` força `'unsafe-inline'` em qualquer CSP futura
- **Severidade:** Baixa
- **Local:** `src/public/login.html` linhas 73-95
- **Fix:** mover para `login.js` separado. Junto com F-06.

### F-15 — `noindex`/`X-Robots-Tag` ausentes
- **Severidade:** Baixa
- **Impacto:** se o domínio for público, o Google pode indexar `/login.html`. Adicione `<meta name="robots" content="noindex">` no `login.html` e/ou um header.

### F-16 — Frontend redireciona pra `/login.html` em 401, mas não trata outros erros
- **Severidade:** Baixa (UX/segurança leve)
- **Local:** `src/public/app.js` linhas 50-58
- **Impacto:** mensagens de erro do backend são exibidas diretamente em `alert()` (linha 305) e em alguns spans com `textContent` — bom; só verifique que nenhuma futura mudança use `innerHTML`.

---

## O que está correto (mantenha assim)

- Comparação de senha em tempo constante com `crypto.timingSafeEqual` (`src/app.js` linhas 15-20).
- 100% das queries SQL usam placeholders `?` com `args` (`src/db.js`, `src/routes/*.js`) — sem SQL injection.
- Cookie de sessão com `httpOnly: true`, `sameSite: 'lax'`, `secure` condicionado a `NODE_ENV=production` (correto para evitar quebra em dev local sem TLS).
- `cookieName` não é o default `connect.sid` (boa para fingerprinting).
- Frontend usa `textContent`/`createElement` em vez de `innerHTML` para dados de usuário.
- `.env` no `.gitignore` (e nunca commitado, conforme `git log --all`).
- `render.yaml` gera `SESSION_SECRET` automaticamente e marca segredos com `sync: false`.

---

## Próximos passos sugeridos (em ordem)

1. **Rotacionar segredos do `.env`** (F-01) — ação imediata, antes de qualquer fix de código.
2. Implementar **rate limit no `/api/login`** (F-03) — `npm i @fastify/rate-limit`.
3. Adicionar **regeneração de sessão no login** + falhar sem `SESSION_SECRET` em prod (F-05, F-07) — diff de poucas linhas.
4. Trocar `MemoryStore` por um **store persistente** (F-04).
5. Instalar **`@fastify/helmet`** com CSP, mover `<script>` inline do login (F-06, F-14).
6. Adicionar **CSRF** (F-02) — `@fastify/csrf-protection`.
7. Apertar **schemas** em rotas mutadoras + validar `yearMonth`/`id` (F-08).
8. Hardening do **error handler** (F-09) e do **trust proxy** (F-10).
9. Health check real (F-11), cache headers (F-12) e `noindex` (F-15).

Posso começar implementando os fixes na ordem acima — recomendo um commit por achado para facilitar revisão. Quer que eu comece pelo F-01 (rotação de segredos) e em seguida pelo F-03 + F-05 + F-07, que são alterações pequenas e de alto impacto?
