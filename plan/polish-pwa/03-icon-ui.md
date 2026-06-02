# Fase 3 — Aplicar ícone (Conceito C) em header + login

## Goal

Trazer o brand mark da Fase 2 pra dentro da UI:

- Header do app: ícone 20×20 inline com texto "BILLTRACK" (clicável → mês atual)
- Login: ícone 56×56 hero centralizado + "BILLTRACK" rebaixado pra caption

Resolve o "feio" central do login (sem identidade visual) e do header (texto solto sem mark).

## Dependencies

- **Fase 1** (login fix) — sem ela o login não renderiza estilo nenhum, daí não tem como testar visualmente
- **Fase 2** (ícone SVG) — precisa do `icon.svg` final

## Decisões referenciadas

- **Q13 opção A** — ícone + texto em todos os lugares
- **Q9** — Conceito C como o ícone
- Bonus: brand do header vira clicável → mês atual

## Files to change

- `src/public/index.html` — header (substituir `<span>` por `<a>` com SVG inline + texto)
- `src/public/login.html` — login (adicionar SVG inline 56×56 hero, rebaixar `.login-brand`, centralizar `.login-title`)
- `src/public/style.css` — adicionar `.brand-icon`, `.login-icon`; ajustar `.app-brand` pra flex; ajustar `.login-brand` e `.login-title` pra centralizar
- `src/public/app.js` — adicionar handler em `#brand-link` que volta pro mês atual

## Detailed steps

### 1. SVG inline embutido (mesmo em 2 lugares)

Usar SVG inline (não `<img src="icon.svg">`) por 3 motivos:
- Sem request extra
- Funciona se o `/icons/icon.svg` não responder
- Herda `color` via `currentColor` (se quiséssemos no futuro)

O SVG embutido é o mesmo da Fase 2, só sem `width`/`height` atributos (vamos controlar via CSS):

```html
<svg class="brand-icon" viewBox="0 0 512 512" aria-hidden="true">
  <rect width="512" height="512" rx="64" fill="#006c49"/>
  <rect x="128" y="248" width="120" height="16" rx="8" fill="#ffffff"/>
  <path d="M 296 256 L 336 296 L 400 224"
        fill="none" stroke="#ffffff" stroke-width="32"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### 2. Header — `src/public/index.html`

Localizar o bloco `<span class="app-brand">BillTrack</span>` (dentro de `.header-inner`). Substituir por:

```html
<a href="#" id="brand-link" class="app-brand" aria-label="Ir para o mês atual">
  <svg class="brand-icon" viewBox="0 0 512 512" aria-hidden="true">
    <rect width="512" height="512" rx="64" fill="#006c49"/>
    <rect x="128" y="248" width="120" height="16" rx="8" fill="#ffffff"/>
    <path d="M 296 256 L 336 296 L 400 224"
          fill="none" stroke="#ffffff" stroke-width="32"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span>BILLTRACK</span>
</a>
```

### 3. Login — `src/public/login.html`

Localizar o bloco `<div class="login-brand">BillTrack</div><h1 class="login-title">Entrar</h1>`. Substituir por:

```html
<svg class="login-icon" viewBox="0 0 512 512" aria-hidden="true">
  <rect width="512" height="512" rx="64" fill="#006c49"/>
  <rect x="128" y="248" width="120" height="16" rx="8" fill="#ffffff"/>
  <path d="M 296 256 L 336 296 L 400 224"
        fill="none" stroke="#ffffff" stroke-width="32"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<div class="login-brand">BillTrack</div>
<h1 class="login-title">Entrar</h1>
```

### 4. CSS — `src/public/style.css`

Adicionar no fim, antes da `@media (max-width: 600px)`:

```css
/* -----------------------------------------------
   Brand icon (header)
----------------------------------------------- */
.brand-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

/* `.app-brand` virou <a>; precisa de display flex pra alinhar ícone + texto */
a.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
a.app-brand:hover { text-decoration: none; }
a.app-brand:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
```

E modificar a seção `Login screen` (criada na Fase 1) — substituir/adicionar:

```css
.login-icon {
  width: 56px;
  height: 56px;
  display: block;
  margin: 0 auto calc(var(--unit) * 3);
  border-radius: 8px;
  overflow: hidden;
}

.login-brand {
  font-size: 11px;          /* era 14px, vira caption */
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
  text-align: center;        /* novo: centralizado */
  margin-bottom: calc(var(--unit) * 1);
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--on-surface);
  text-align: center;        /* novo: centralizado */
  margin-bottom: calc(var(--unit) * 6);
}
```

### 5. Handler de clique em `#brand-link` — `src/public/app.js`

O `app.js` já tem uma função de inicialização que seleciona o mês corrente (provavelmente `selectCurrentMonth()` ou similar). Adicionar logo após o setup dos botões `prev`/`next`:

```js
document.getElementById('brand-link').addEventListener('click', (e) => {
  e.preventDefault();
  // Reusa a mesma lógica que roda no boot pra ir pro mês atual
  selectCurrentMonth(); // <- ajustar o nome conforme app.js
});
```

**Importante:** ler `app.js` antes pra saber o nome real da função que carrega o mês corrente. Se não houver uma função reutilizável, criar uma extraindo do código de boot.

## Definition of done

- [ ] Header renderiza com ícone 20×20 + texto BILLTRACK lado a lado, alinhados verticalmente
- [ ] Header não tem espaço esquisito (ícone colado no texto via `gap: 8px`)
- [ ] Clicar no brand do header leva pro mês atual (testar navegar pra mês passado/futuro e clicar)
- [ ] Login renderiza com ícone 56×56 centralizado no topo do card, BILLTRACK menorzinho abaixo, "Entrar" grande
- [ ] Login: nada alinhado à esquerda — tudo centralizado dentro do card
- [ ] Navegação por teclado funciona no `#brand-link` (Tab + Enter)
- [ ] Sem erros no Console
- [ ] `npm test` passa

## Commit

```
feat(ui): add Concept C brand mark to header and login

- Header: 20x20 inline SVG icon + BILLTRACK wordmark inside an
  <a> that navigates back to the current month.
- Login: 56x56 hero SVG icon centered above the BILLTRACK caption
  and "Entrar" title, fixing the "card without identity" feel.
- Wordmark in login demoted from heading to caption (11px uppercase)
  to let the icon carry the visual weight.
```

## Risks / open issues

- **Risco médio:** ícone 20×20 com Conceito C pode ficar visualmente ilegível (linha e check muito pequenos). Mitigação: testar e, se necessário, criar SVG simplificado pra esse tamanho específico (só o check, sem a linha) e usar inline no header.
- **Risco baixo:** `.app-brand` mudando de `<span>` pra `<a>` pode quebrar algum seletor CSS específico. Verificar `style.css` por seletor `.app-brand` que tenha que ser ajustado.
- **Risco baixo:** o `#brand-link` com `href="#"` pode causar scroll pro topo se o handler não chamar `preventDefault()`. Garantir `e.preventDefault()` no listener.
- **Risco baixo:** `app.js` pode não ter uma função reutilizável de "ir pro mês atual" — pode ser inline no boot. Refatorar pra função nomeada antes de chamar.
