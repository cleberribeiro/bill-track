# Fase 5 — Micro-animações discretas (mark paid / add / delete / checkbox pulse)

## Goal

Dar vida ao app sem virar "twee". 4 animações curtas (≤220ms), todas via CSS transitions/keyframes. Tudo respeita `prefers-reduced-motion`.

## Dependencies

- **Fase 4** — algumas transitions vão ser adicionadas a regras já modificadas na 4 (.bill-row). Ordem importa pra evitar conflict.

## Decisões referenciadas

- **Q15 opção 2** — discreto, ≤220ms, sem slot machine no resumo
- `prefers-reduced-motion: reduce` desativa tudo (custo zero, guideline)

## Animações neste round

| Ação | Mecanismo | Duração | Onde |
|---|---|---|---|
| Marcar pago | `opacity` no `transition` da `.bill-row` (já tem a classe `.is-paid`) | 200ms | CSS only |
| Checkbox click | Keyframe `checkbox-pulse` aplicado via classe `.just-checked` que JS adiciona/remove | 120ms | CSS + JS |
| Adicionar conta | Classe `.is-entering` (`max-height: 0; opacity: 0`) → remove a classe → transição | 200ms | CSS + JS |
| Deletar conta | Classe `.is-leaving` aplicada antes do remove DOM; timeout 200ms | 200ms | CSS + JS |
| Resumo (R$) | **Nenhuma animação** (decisão Q15) | — | — |
| Filtros / nav de mês | **Nenhuma animação** (swap de conteúdo) | — | — |

## Files to change

- `src/public/style.css` — adicionar transitions + keyframes + classes de animação + bloco `prefers-reduced-motion`
- `src/public/app.js` — orquestração de classes em 3 momentos: marcar pago, add, delete, e aplicar `.just-checked` no checkbox

## Detailed steps

### 1. CSS — adicionar opacity ao transition da `.bill-row`

Localizar a regra `.bill-row` no `style.css`. Hoje:

```css
.bill-row {
  ...
  transition: background-color 0.1s;
}
```

Trocar pra:

```css
.bill-row {
  ...
  transition: background-color 0.1s, opacity 200ms;
}
```

Isso faz o `.is-paid` (já existe — `opacity: 0.5`) animar suavemente em vez de saltar.

### 2. CSS — keyframe + classe do pulse no checkbox

Adicionar antes do bloco `Responsive — mobile`:

```css
/* -----------------------------------------------
   Micro-animations
----------------------------------------------- */
@keyframes checkbox-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}

.bill-checkbox.just-checked {
  animation: checkbox-pulse 120ms ease-out;
}
```

### 3. CSS — classes `.is-entering` e `.is-leaving` pra add/delete

Continuando no bloco de animações:

```css
/* Add bill — slide-down + fade in */
.bill-row.is-entering {
  max-height: 0 !important;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}

.bill-row {
  max-height: 80px;             /* > altura natural (56px) — não afeta layout */
  transition: background-color 0.1s, opacity 200ms,
              max-height 200ms ease-out;
}

/* Delete bill — slide-up + fade out */
.bill-row.is-leaving {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
  pointer-events: none;
}
```

**Importante:**
- O `max-height: 80px` na regra base do `.bill-row` é um truque pra permitir animação de `max-height` (não dá pra animar `height: auto`).
- O `!important` no `.is-entering` é pra garantir override do `max-height: 80px` base.
- `pointer-events: none` no `.is-leaving` evita clique fantasma durante a saída.

### 4. CSS — `prefers-reduced-motion`

No fim do `style.css`, depois do `@media (max-width: 600px)`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Isso zera tudo pra quem ativou o setting do sistema. Inclui as animações desta fase e as transições existentes no `style.css` (hover de botão, etc.).

### 5. JS — orquestração

Editar `src/public/app.js`. As funções específicas dependem da estrutura atual — abrir o arquivo e localizar:

- **Função que renderiza um `<li>` novo após `POST /api/months/.../bills`** — geralmente algo como `addBillToList(bill)` ou `renderBill(bill)`.

  Mudança:

  ```js
  // Antes de inserir no DOM:
  li.classList.add('is-entering');
  list.appendChild(li);

  // Force reflow pra o browser registrar o estado inicial:
  void li.offsetHeight;

  // Próximo frame, remove a classe — transição corre
  requestAnimationFrame(() => {
    li.classList.remove('is-entering');
  });
  ```

- **Função que deleta um `<li>` após `DELETE /api/bills/:id`** — geralmente `removeBill(id)` ou listener em `.btn-delete`.

  Mudança:

  ```js
  li.classList.add('is-leaving');
  setTimeout(() => li.remove(), 200);
  ```

- **Função que marca um bill como paid/pending após `PATCH /api/bills/:id`** — geralmente listener no `.bill-checkbox`.

  Pulso curto sempre que o checkbox é tocado:

  ```js
  checkbox.classList.add('just-checked');
  setTimeout(() => checkbox.classList.remove('just-checked'), 120);
  ```

  O `.is-paid` no `<li>` continua sendo alternado normalmente; o transition do passo 1 cuida da animação do row.

### 6. Cuidados no JS

- Não acumular setTimeout em deletes rápidos. Mitigação: `li.classList.add('is-leaving')` antes de qualquer outra coisa; chamadas duplicadas são idempotentes.
- Se o usuário marcar/desmarcar rápido, evitar piscar — o pulso de 120ms é curto o suficiente pra não atrapalhar.
- `requestAnimationFrame` no add é importante: sem ele, browser pode otimizar e pular o frame `is-entering`, animação some.

## Definition of done

- [ ] Marcar conta como paga: row fade pra opacity 0.5 em ~200ms (não salta)
- [ ] Clicar no checkbox: caixinha dá um pulso sutil (não exagerado)
- [ ] Adicionar conta: `<li>` aparece deslizando de cima pra baixo + fade in
- [ ] Deletar conta: `<li>` desliza pra cima + fade out, depois some
- [ ] Resumo (R$): swap instantâneo (sem animação)
- [ ] Filtros / nav de mês: sem animação
- [ ] DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce → todas as animações ficam instantâneas
- [ ] Deletar 3 contas rápidas em sequência: cada uma anima sem bagunçar layout
- [ ] `npm test` passa

## Commit

```
feat(ui): discreet micro-animations on bill actions

- Mark paid: opacity transition (200ms) on .bill-row.
- Checkbox click: brief scale pulse (120ms) via .just-checked class.
- Add bill: slide-down + fade-in via .is-entering class (200ms).
- Delete bill: slide-up + fade-out via .is-leaving class (200ms),
  then DOM removal.
- prefers-reduced-motion: reduce zeros all transitions/animations.

Summary numbers and filter/month-nav swaps stay instant
(no slot-machine effect on money values).
```

## Risks / open issues

- **Risco médio:** `max-height: 80px` na regra base do `.bill-row` pode quebrar layout se algum row tiver conteúdo que naturalmente seja mais alto (ex: nome com 2 linhas). Mitigação: subir pra `max-height: 120px` se isso aparecer; o ponto é só ser "maior que o natural" pra permitir transition.
- **Risco baixo:** animação concomitante de `opacity` (do `.is-paid`) e `max-height` (do `.is-entering`) pode ficar visualmente confuso se você marcar paid bem na hora que adiciona. Improvável — adicionar conta nasce sempre pending.
- **Risco baixo:** se o checkbox-pulse pesar (mais raro do que parece), trocar `transform` por `box-shadow` momentâneo é mais leve. Não fazer preemptivo.
- **Risco baixo:** alguns Android antigos podem cair em frame skip no slide. 200ms é curto o bastante pra ser perdoável.
