# Fase 7 — PWA setup (manifest + service worker + meta tags)

## Goal

Transformar o app numa PWA instalável no Android. Degrau 1: só instalável, sem offline. Chrome no Android oferece "Instalar app" → ícone na home, abre em `display: standalone`, status bar verde.

## Dependencies

- **Fase 2** — precisa dos PNGs gerados (`icon-192.png`, `icon-512.png`, maskable variants, favicons)
- Em paralelo a 3/4/5/6 está OK, mas convém deixar pro fim pra deploy junto com tudo

## Decisões referenciadas

- **Q7** — Android only
- **Q8** — Degrau 1: só instalável, sem offline
- **Q10** — `theme_color: #006c49`, `background_color: #f7f9fb`
- **Q11** — Service worker pass-through (sem cache)
- **Q9** — Ícone Conceito C
- Defaults: `display: standalone`, `orientation: portrait`, `name: "BillTrack"`, `short_name: "BillTrack"`

## Files to create

- `src/public/manifest.json`
- `src/public/sw.js`

## Files to change

- `src/public/index.html` — meta tags + link manifest + favicon links + SW registration
- `src/public/login.html` — mesma coisa (SW pode ser registrado em qualquer página)
- `src/public/app.js` — SW registration
- `src/public/login.js` — SW registration (ou só em uma das duas páginas; ver decisão abaixo)
- `src/app.js` — CSP do helmet (adicionar `manifest-src`, `worker-src`) + `Cache-Control: no-cache` no `/sw.js`

## Detailed steps

### 1. Criar `src/public/manifest.json`

```json
{
  "name": "BillTrack",
  "short_name": "BillTrack",
  "description": "Controle mensal de contas — checklist financeira simples.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#006c49",
  "background_color": "#f7f9fb",
  "lang": "pt-BR",
  "dir": "ltr",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 2. Criar `src/public/sw.js`

Pass-through completo, ~10 linhas:

```js
// Service worker pass-through — exists só pra Chrome considerar o app instalável.
// Não cacheia nada: cada requisição vai direto pra rede.
// Quando você deployar mudança, o app já pega a versão nova no próximo open.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Sem `event.respondWith` — browser usa rede normalmente.
});
```

**Por que precisa do `fetch` listener vazio?** Chrome só considera "PWA instalável" se houver SW registrado **com** handler de `fetch`. Sem o listener, o critério falha. Listener vazio satisfaz o requisito sem interceptar nada.

### 3. Atualizar `<head>` de `src/public/index.html`

Adicionar logo depois do `<link rel="stylesheet" href="/style.css" />`:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#006c49" />
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
```

### 4. Atualizar `<head>` de `src/public/login.html`

Mesmas 4 linhas acima.

### 5. Registrar Service Worker

Decisão: registrar **em ambas** as páginas (`app.js` e `login.js`) — Chrome dedupa pela URL do SW, registro duplo é idempotente.

Adicionar no topo de `src/public/app.js` e `src/public/login.js`:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}
```

### 6. CSP — `src/app.js`

Localizar o bloco `fastifyHelmet`. Adicionar `manifest-src` e `worker-src` por explicitude (defaults caem em `default-src`, mas dependência implícita é frágil):

```js
await fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      frameAncestors: ["'none'"],
      manifestSrc: ["'self'"],   // NOVO
      workerSrc: ["'self'"],     // NOVO
      imgSrc: ["'self'", 'data:'] // NOVO — futuros assets png, e base64 caso precise
    },
  },
});
```

### 7. Cache-Control no `/sw.js` e `/manifest.json`

Adicionar hook no `src/app.js` que define `Cache-Control: no-cache` pro service worker (essencial — se o SW ficar cached, updates não chegam):

```js
fastify.addHook('onSend', (req, reply, payload, done) => {
  if (req.url === '/sw.js' || req.url === '/manifest.json') {
    reply.header('Cache-Control', 'no-cache');
  }
  done(null, payload);
});
```

Pode estender o hook `onSend` existente que já cuida do `/api` em vez de criar novo.

### 8. Conferir Content-Type do manifest

`@fastify/static` provavelmente serve `manifest.json` como `application/json`. Pro Chrome considerar PWA correto, o ideal é `application/manifest+json` mas o `application/json` funciona na prática. Se quiser ser estrito, adicionar override no hook:

```js
if (req.url === '/manifest.json') {
  reply.header('Content-Type', 'application/manifest+json; charset=utf-8');
}
```

Decisão: **deixar como está** (sem override) na primeira passada. Validar no Lighthouse na Fase 8. Se reclamar, adicionar.

## Definition of done

- [ ] `src/public/manifest.json` existe e valida (`cat manifest.json | jq .` deve parsear)
- [ ] `src/public/sw.js` existe com 3 listeners (install, activate, fetch)
- [ ] `<head>` de `index.html` e `login.html` tem: `<link rel="manifest">`, `<meta theme-color>`, 2 `<link rel="icon">`
- [ ] `app.js` e `login.js` têm o registro do SW no `load`
- [ ] `src/app.js` CSP tem `manifest-src`, `worker-src`, `img-src` adicionados
- [ ] Hook `onSend` define `no-cache` em `/sw.js` e `/manifest.json`
- [ ] Servidor local (`npm start` ou `node src/server.js`): `curl localhost:PORT/manifest.json` retorna 200 + JSON; `curl localhost:PORT/sw.js` retorna 200 + JS com header `cache-control: no-cache`
- [ ] DevTools (em qualquer browser desktop) → Application → Manifest → todos os campos aparecem, ícone preview funciona, nenhum erro vermelho
- [ ] DevTools → Application → Service Workers → SW registrado, status "activated and is running"
- [ ] `npm test` passa
- [ ] **Verificação no Android fica pra Fase 8** (precisa deploy HTTPS)

## Commit

```
feat(pwa): make BillTrack installable as Android PWA (degrau 1)

- manifest.json with standalone display, portrait orientation,
  theme #006c49, background #f7f9fb, Concept C icons (any + maskable).
- sw.js: pass-through service worker (no cache) — satisfies Chrome's
  installability criteria without the "stuck on old version" footgun.
- Adds <link rel="manifest">, theme-color meta, favicons to both
  index.html and login.html.
- Registers the SW on load from app.js and login.js.
- Helmet CSP gets explicit manifest-src, worker-src, img-src 'self'.
- onSend hook forces Cache-Control: no-cache on /sw.js and
  /manifest.json so updates always propagate.

Out of scope: offline support, cache strategies, push notifications,
iOS (degrau 1 lock-in per the polish-pwa plan).
```

## Risks / open issues

- **Risco médio:** Chrome pode não considerar PWA "instalável" se algum critério faltar (falta de ícone 512, falta de fetch handler, manifest.json malformado). Mitigação: rodar Lighthouse → PWA audit; ele lista exatamente o que falta.
- **Risco baixo:** `application/manifest+json` Content-Type vs `application/json` — funciona na prática mas o Lighthouse pode warn. Decidido ignorar na primeira passada.
- **Risco baixo:** se você já navegou pro site antes da Fase 7, browser pode cachear sem SW. Mitigação: testar no Android com Chrome em aba anônima, ou clear site data.
- **Risco médio:** maskable icon pode estar com safe zone errada (cortar a marca). Se acontecer, ver Chrome DevTools → Application → Manifest → preview de "circle, rounded, square" shape — verifica se a marca aparece inteira em todos.
- **Risco baixo:** se `imgSrc: 'self', 'data:'` quebrar algo (improvável, app não usa data: hoje), tirar `'data:'`.
