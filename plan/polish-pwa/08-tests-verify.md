# Fase 8 — Testes + verificação Android via Render

## Goal

Garantir que tudo funciona: testes automatizados não quebraram, fixou 2 novos testes pra PWA endpoints, e validação manual completa no Android via Render.

## Dependencies

- **Todas as fases anteriores** (1-7) precisam estar aplicadas
- Deploy ativo no Render (configurado via `render.yaml` já presente)

## Decisões referenciadas

Esta fase consolida tudo: cada decisão (Q3, Q6-Q16) é testada de uma forma ou outra.

## Files to change / create

- `tests/app.test.js` — adicionar 2 testes (manifest, sw)
- Nada mais. Deploy é via push pro `main` (Render conecta no GitHub).

## Detailed steps

### 1. Rodar suite automatizada

```bash
npm test
```

Esperado: tudo passa. Se algo quebrar, **NÃO** seguir com a verificação manual — debugar primeiro.

Possíveis quebras comuns:
- Fase 4 mudou hit-targets — testes existentes não tocam em CSS, deve passar
- Fase 6 mudou texto de empty state — se algum teste verificava `'Nenhuma conta cadastrada'`, vai quebrar; trocar pelo novo texto
- Fase 7 adicionou CSP rules — testes não tocam em CSP, deve passar

### 2. Adicionar testes pros endpoints PWA

Anexar ao `tests/app.test.js`, depois do `describe('BillTrack production session cookies', ...)`:

```js
describe('BillTrack PWA assets', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('serves manifest.json', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/manifest.json',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.name).toBe('BillTrack');
    expect(body.display).toBe('standalone');
    expect(body.theme_color).toBe('#006c49');
    expect(body.background_color).toBe('#f7f9fb');
    expect(Array.isArray(body.icons)).toBe(true);
    expect(body.icons.length).toBeGreaterThanOrEqual(2);
  });

  test('serves sw.js with no-cache header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/sw.js',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-cache');
    expect(response.payload).toMatch(/serviceWorker|self\.addEventListener|skipWaiting/);
  });
});
```

### 3. Deploy pra Render

Antes de deployar:

```bash
git status                          # confirma que tudo das fases 1-7 está commitado
git log --oneline -10               # confirma 7 commits, um por fase (este é o 8)
```

Deploy:

```bash
git push origin main
```

Render detecta o push, builda, publica. Acompanhar:

- Render dashboard → log do deploy
- Tempo típico de build pra esse app: 1-3 minutos

### 4. Verificação manual no celular Android

**Pré-requisitos:**
- Celular Android com Chrome (versão recente, 90+)
- URL HTTPS do Render (algo como `https://bill-track.onrender.com`)
- Senha do app (configurada via `APP_PASSWORD` no env do Render)

**Roteiro:**

#### A. Login (Fase 1)
- [ ] Abrir URL no Chrome Android
- [ ] Tela de login aparece com **card centralizado, com borda e padding**
- [ ] Ícone Conceito C 56×56 centralizado no topo do card (Fase 3)
- [ ] BILLTRACK (caption) e "Entrar" centralizados (Fase 3)
- [ ] Input e botão alinhados, com gap correto
- [ ] DevTools (chrome://inspect): sem CSP violation no Console

#### B. PWA install (Fase 7)
- [ ] Após carregar a página (login OU app), Chrome mostra **prompt "Adicionar à tela inicial"** ou opção no menu (3-pontos) → "Install app" / "Instalar app"
- [ ] Instalar
- [ ] Ícone aparece na home do Android com a marca Conceito C
- [ ] Lançador pode ter cortado em circle/squircle — verificar que a marca continua visível (não cortou)
- [ ] Abrir o ícone instalado:
  - [ ] App abre em **standalone** (sem barra do navegador)
  - [ ] **Status bar verde** (`theme_color`)
  - [ ] **Splash branca com ícone verde** centralizado (durante o carregamento, brevíssimo)
  - [ ] Orientação travada em **portrait** (girar o celular não vira)

#### C. Header + nav (Fase 3)
- [ ] Header tem ícone 20×20 + "BILLTRACK" lado a lado
- [ ] Tocar no brand → leva ao mês atual (se você navegou pra outro mês antes)
- [ ] Botões ← Anterior / Próximo → navegam entre meses
- [ ] Botão Sair faz logout

#### D. Mobile + táteis (Fase 4)
- [ ] Tipografia 16px — números das contas legíveis sem zoom
- [ ] Botões parecem tamanho de outros apps Android (≥ 48px)
- [ ] Tocar em qualquer botão → feedback tátil visível (background change, scale sutil no `.btn-primary`)
- [ ] **Sem flash azul claro** padrão do Android (tap-highlight removido)
- [ ] Toque longo em botão **não** seleciona texto
- [ ] Checkbox: tocar em volta dos 18×18 funciona (não precisa mirar)

#### E. Animações (Fase 5)
- [ ] Marcar conta como paga → row faz fade pra opacidade reduzida (não salta)
- [ ] Tocar no checkbox → caixinha dá um pulso curto
- [ ] Adicionar conta → novo `<li>` aparece deslizando + fade in
- [ ] Deletar conta → `<li>` desliza pra cima + fade out, depois some
- [ ] Resumo (R$) → atualiza instantâneo (sem slot machine)

Bonus opcional — ativar nas Settings do Android "Remove animations" e revisitar:
- [ ] Todas as transições viram instantâneas (`prefers-reduced-motion`)

#### F. Empty state (Fase 6)
- [ ] Navegar pra mês futuro vazio (ex: 12 meses pra frente):
  - [ ] Aparecer **Mês em branco** (h2), subtítulo, botão **Copiar do mês anterior**
- [ ] Em mês com contas, filtro **Pendentes** quando todas estão pagas:
  - [ ] Mensagem: **Nada pendente. ✓**
- [ ] Em mês com contas, filtro **Pagas** quando nada foi pago:
  - [ ] Mensagem: **Nada pago ainda.**

#### G. Smoke test geral
- [ ] Adicionar 3 contas, marcar 1 como paga, editar valor de outra, deletar a terceira — tudo persiste após reload
- [ ] Logout + login → sessão expira corretamente, volta pra login
- [ ] Sem internet (modo avião): app abre (cache do navegador), mas requests da API falham — esperado pro degrau 1

### 5. Lighthouse audit (opcional, mas recomendado)

Em desktop Chrome:
- Abrir URL do Render
- DevTools → Lighthouse → Categoria "Progressive Web App" → "Analyze page load"

Esperado:
- ✅ Installable
- ✅ PWA optimized
- Possíveis warnings (aceitáveis):
  - "Does not provide a valid `apple-touch-icon`" — Android-only, OK
  - "Does not include themed `<meta>` color" — falso negativo (a gente tem)

Se algo der ❌ red, debugar antes de declarar Fase 8 fechada.

## Definition of done

- [ ] `npm test` passa (incluindo os 2 testes novos)
- [ ] Push pro main, deploy do Render concluído sem erro
- [ ] Roteiro de verificação manual no Android completo (A-G)
- [ ] Lighthouse PWA category sem ❌ vermelho
- [ ] README atualizado: `[ ]` → `[x]` nas 8 fases do `plan/polish-pwa/README.md`

## Commit

```
test(pwa): cover manifest.json and sw.js endpoints

- GET /manifest.json: serves expected fields (name, display,
  theme_color, background_color, icons).
- GET /sw.js: serves with Cache-Control: no-cache and contains
  the expected service worker code.

Closes the polish-pwa plan. Manual verification on Android via
Render deploy documented in plan/polish-pwa/08-tests-verify.md.
```

## Risks / open issues

- **Risco médio:** Chrome no Android pode demorar 30-60s pós-load pra oferecer "Install" — só aparece depois de o user "engajar" (scroll, tap). Se não aparecer, ir pelo menu 3-pontos manual.
- **Risco médio:** Render free tier dorme. Primeiro acesso depois de inatividade demora 30s+. Não é bug, é cold start.
- **Risco baixo:** se o teste do `sw.js` falhar com "regex didn't match", verificar conteúdo real do `sw.js` e ajustar o `match` ou afrouxar (`expect(response.payload.length).toBeGreaterThan(0)`).
- **Risco médio:** versionamento do SW: o navegador detecta SW novo por byte-diff. Em deploys subsequentes ao primeiro, garantir que a versão nova é byte-different (mesmo conteúdo = sem update). Como o `sw.js` é estático e raramente muda, não é problema imediato. Se virar problema, adicionar um comentário com `// build: <timestamp>` no SW antes do build.

## Fechamento do round

Após Fase 8 done:

1. Atualizar `plan/polish-pwa/README.md` marcando todas as fases como `[x]`
2. Considerar próximos rounds (fora deste escopo, mas anotar pra futuro):
   - Dark mode (revisitar Q12)
   - iOS support
   - V2 features do brainstorm: due dates, categorias, recurring bills
   - Offline real (degrau 2 PWA)
3. Commit final mexendo só no README é opcional — se preferir, mantém o README como pulse do trabalho em andamento.
