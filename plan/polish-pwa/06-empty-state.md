# Fase 6 — Empty state humanizado + filter empties

## Goal

Trocar "Nenhuma conta cadastrada neste mês." por um empty state com hierarquia tipográfica e cópia que sinaliza agência ("você está no controle"), não erro ("algo está faltando"). Adicionar mensagens curtas pros filtros vazios (Pendentes, Pagas).

## Dependencies

Nenhuma forte. Pode rodar paralelo a Fase 4 e 5. Não depende do ícone (decidimos não usar ícone aqui — Q16 opção D).

## Decisões referenciadas

- **Q16 opção D** — sem ícone, hierarquia tipográfica + cópia humana
- Filter empty: linha única positiva ("Nada pendente. ✓" / "Nada pago ainda.")

## Files to change

- `src/public/index.html` — markup do `#empty-state` e adicionar `#filter-empty-message`
- `src/public/style.css` — `.empty-title`, ajustes em `.empty-message`, `.filter-empty-message`
- `src/public/app.js` — lógica de exibir mensagem contextual quando o filter retorna `[]` mas o mês tem contas

## Detailed steps

### 1. Markup — `src/public/index.html`

Localizar o bloco `#empty-state`:

```html
<!-- Empty state with duplicate action -->
<div id="empty-state" class="empty-state" hidden>
  <p class="empty-message">Nenhuma conta cadastrada neste mês.</p>
  <button id="btn-duplicate" class="btn-ghost">Criar a partir do mês anterior</button>
</div>
```

Substituir por:

```html
<!-- Empty state — month has no bills at all -->
<div id="empty-state" class="empty-state" hidden>
  <h2 class="empty-title">Mês em branco</h2>
  <p class="empty-message">Adicione contas no campo acima ou copie de um mês anterior.</p>
  <button id="btn-duplicate" class="btn-ghost">Copiar do mês anterior</button>
</div>
```

E adicionar dentro da `<section class="bills-section">`, depois do `<ul id="bills-list">`:

```html
<!-- Filter empty — month has bills, but the active filter matches none -->
<p id="filter-empty-message" class="filter-empty-message" hidden></p>
```

Mudanças no texto:
- `Nenhuma conta cadastrada neste mês.` → `Mês em branco` (título) + cópia separada explicando próximos passos
- `Criar a partir do mês anterior` → `Copiar do mês anterior` (mais curto, verbo direto)

### 2. CSS — `src/public/style.css`

Localizar a seção `Empty state`. Adicionar `.empty-title`, ajustar `.empty-message`, e adicionar `.filter-empty-message`:

```css
/* Empty state — month has no bills */
.empty-state {
  padding: calc(var(--unit) * 8) 0;
  text-align: center;
  border-top: 1px solid var(--outline-variant);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: calc(var(--unit) * 2);
}

.empty-message {
  color: var(--outline);
  font-size: 14px;
  margin-bottom: calc(var(--unit) * 4);
}

/* Filter empty — month has bills, but active filter matches none */
.filter-empty-message {
  padding: calc(var(--unit) * 4) 0;
  text-align: center;
  color: var(--outline);
  font-size: 14px;
}
```

A única mudança real em `.empty-message` é manter `margin-bottom: 4` (já existia) — agora ela é o middle child entre `.empty-title` (h2) e o botão.

### 3. JS — `src/public/app.js`

Lógica atual (assumida): quando carrega o mês e o backend retorna `[]`, mostra `#empty-state`.

**Nova lógica:** distinguir dois casos.

```js
// Pseudo-código da função que renderiza a lista filtrada
function renderBills(bills, activeFilter) {
  const list = document.getElementById('bills-list');
  const emptyState = document.getElementById('empty-state');
  const filterEmpty = document.getElementById('filter-empty-message');

  list.innerHTML = '';
  emptyState.hidden = true;
  filterEmpty.hidden = true;

  if (bills.length > 0) {
    bills.forEach(bill => list.appendChild(createBillElement(bill)));
    return;
  }

  // Bills vazias — qual contexto?
  if (activeFilter === 'pending' || activeFilter === 'paid') {
    // Mês tem contas mas o filtro não pegou nenhuma
    // Precisamos saber: o mês tem QUALQUER conta?
    const monthHasAnyBills = /* veio do summary OU de chamada à parte */;

    if (monthHasAnyBills) {
      filterEmpty.textContent =
        activeFilter === 'pending'
          ? 'Nada pendente. ✓'
          : 'Nada pago ainda.';
      filterEmpty.hidden = false;
      return;
    }
  }

  // Caso geral: mês inteiramente vazio
  emptyState.hidden = false;
}
```

**Detalhe técnico importante:** precisamos saber se o mês tem **qualquer** conta pra decidir entre `#empty-state` (mês todo vazio) e `#filter-empty-message` (filtro vazio mas o mês tem coisas).

Duas formas:
- (A) Pedir o `summary` do mês a parte (`GET /api/months/:yearMonth/summary`) e olhar `total > 0`
- (B) Fazer a chamada `GET /api/months/:yearMonth/bills` sem filtro **e** com filtro, comparar

Opção A é mais limpa — a UI já chama summary pra mostrar os números, dá pra reutilizar. Se o `summary.total` for 0 OR a soma de pendentes + pagos for 0, mês está vazio; senão filtro vazio.

Implementação prática:

```js
// Após GET /api/months/:yearMonth/bills?status=pending (ou paid), também já tenho o summary
// pendingCount no summary == 0 mas total > 0 significa: mês tem contas, mas só pagas
// Análogo pra paid

function renderBillsForFilter(filteredBills, activeFilter, summary) {
  const list = document.getElementById('bills-list');
  const emptyState = document.getElementById('empty-state');
  const filterEmpty = document.getElementById('filter-empty-message');

  list.innerHTML = '';
  emptyState.hidden = true;
  filterEmpty.hidden = true;

  if (filteredBills.length > 0) {
    filteredBills.forEach(bill => list.appendChild(createBillElement(bill)));
    return;
  }

  const monthIsCompletelyEmpty = summary.total === 0;

  if (!monthIsCompletelyEmpty && (activeFilter === 'pending' || activeFilter === 'paid')) {
    filterEmpty.textContent =
      activeFilter === 'pending' ? 'Nada pendente. ✓' : 'Nada pago ainda.';
    filterEmpty.hidden = false;
    return;
  }

  emptyState.hidden = false;
}
```

Adaptar nomes pra como está no `app.js` real.

### 4. Não tocar no botão `#btn-duplicate`

A lógica de "Copiar do mês anterior" segue igual (`POST /api/months/:yearMonth/duplicate-from/:sourceYearMonth`). Só o label mudou.

## Definition of done

- [ ] Abrir mês futuro vazio (ex: 2026-12): aparecer **Mês em branco** (h2) + subtítulo + botão **Copiar do mês anterior**
- [ ] Mês com contas, filtro **Pendentes** quando todas tão pagas: aparecer **Nada pendente. ✓** (uma linha)
- [ ] Mês com contas, filtro **Pagas** quando nada foi pago: aparecer **Nada pago ainda.**
- [ ] Mês com contas, filtro **Todas**: lista normal, nenhum empty state visível
- [ ] Hierarquia visual: h2 maior, subtítulo menor cinza, botão abaixo — espaçamento correto
- [ ] Clicar **Copiar do mês anterior** continua funcionando (duplicate-from API)
- [ ] `npm test` passa

## Commit

```
feat(ui): humanized empty state + contextual filter messages

- Empty month: shifts from "Nenhuma conta cadastrada neste mês" to
  "Mês em branco" (h2) + subtitle pointing at next steps + button
  "Copiar do mês anterior". Tone shifts from deficit to agency.
- Empty filter: when the month has bills but the active filter
  matches none, show a single positive line — "Nada pendente. ✓"
  or "Nada pago ainda." — instead of falling back to the full
  empty state (which would be misleading).
```

## Risks / open issues

- **Risco médio:** depende de como `app.js` está organizado hoje. Se a função que renderiza a lista não recebe `summary`, vai precisar de pequeno refactor pra encaminhar a info. Ler `app.js` antes pra mapear.
- **Risco baixo:** "Mês em branco" pode soar ambíguo. Alternativa de cópia se você quiser: substituir por `Maio 2026 ainda sem contas.` (usa nome do mês). Decisão deferred até ver renderizado.
- **Risco baixo:** Filter empty conta com `summary.total === 0` como proxy de "mês vazio". Se houver alguma fronteira (ex: bills com `amount: 0`), `total` ainda pode ser 0 mas a lista tem itens — mostraria o empty state errado. Mitigação: usar `summary.pendingCount + summary.paidCount` (não temos `paidCount` no summary atual — pode adicionar ou usar `total > 0` como proxy suficiente).
