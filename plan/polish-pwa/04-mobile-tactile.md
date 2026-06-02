# Fase 4 — Mobile sizing cirúrgico + polidas táteis sempre

## Goal

Fixar dois problemas reais:

1. **Mobile**: hit-targets abaixo do Material guideline (40px button vs 48dp; checkbox 18px sem expansão de tap; body 14px sem upscale). Tudo via `@media (max-width: 600px)`.
2. **Polidas táteis**: app não tem nenhum sinal tátil moderno — sem `:active` consistente, sem remover tap-highlight nativo, sem `touch-action: manipulation`. Tudo sempre ligado, não só mobile.

Mantém DESIGN.md "ledger density" no desktop intacto.

## Dependencies

- **Fase 1** (não obrigatório, mas se rodar antes, o login mobile já fica testável)
- Independente de Fase 2 e 3 (não toca em ícone)

## Decisões referenciadas

- **Q14 opção 1** — ajustes cirúrgicos via media query mobile, preservando desktop
- Polidas táteis SEMPRE — `touch-action`, `tap-highlight-color`, `:active`, `user-select`

## Files to change

- `src/public/style.css` — adicionar bloco "Tactile polish" global; ajustar `@media (max-width: 600px)` no fim do arquivo

## Detailed steps

### 1. Bloco "Tactile polish" — sempre ligado

Adicionar perto do início do `style.css`, logo após o reset base (depois do `*, *::before, *::after`):

```css
/* -----------------------------------------------
   Tactile polish (always-on)
----------------------------------------------- */
button,
a,
input[type="checkbox"],
.bill-row,
.bill-name,
.bill-amount {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

button {
  user-select: none;
}

.btn-primary:active {
  background-color: var(--on-primary-container);
  transform: scale(0.98);
}

.btn-ghost:active,
.btn-filter:active {
  background-color: var(--surface-container);
}

.bill-row:active {
  background-color: var(--surface-container);
}
```

**Justificativa por linha:**

- `touch-action: manipulation` — elimina o tap delay de 300ms em browsers antigos; Chrome moderno já ignora mas a tag é uma garantia barata
- `-webkit-tap-highlight-color: transparent` — remove o flash azul claro padrão do Android Chrome em toques; "denuncia" que é browser, queremos parecer app
- `user-select: none` em buttons — evita seleção acidental de texto no long-press
- `:active { transform: scale(0.98) }` no `.btn-primary` — feedback tátil sutil ("apertei mesmo")
- `:active` background changes nos demais — feedback consistente

### 2. Expansão de tap area do checkbox

Localizar `.bill-checkbox` no `style.css` (já existe). Adicionar:

```css
.bill-checkbox-wrap {
  position: relative;
}

/* Expande tap area do checkbox pra 48x48 mantendo visual 18x18 */
.bill-checkbox::before {
  content: '';
  position: absolute;
  inset: -15px;
  z-index: 1;
}
```

A regra `.bill-checkbox-wrap { position: relative }` substitui (ou adiciona, se não existir) a regra atual. Verificar se o `.bill-checkbox-wrap` já tem `position` definido — se sim, harmonizar.

**Validar:** o `::before` não pode interceptar clique no `.bill-name` adjacente. Como ele cobre `-15px` em todos os lados, e o `.bill-name` tem `flex: 1` (cresce horizontal), pode haver overlap. Se houver, restringir o `inset`:

```css
.bill-checkbox::before {
  content: '';
  position: absolute;
  top: -15px;
  bottom: -15px;
  left: -15px;
  right: -8px;  /* menor folga à direita pra não invadir nome */
  z-index: 1;
}
```

### 3. Ajustes mobile no `@media (max-width: 600px)`

Localizar o `@media` no fim do `style.css` e adicionar/ajustar:

```css
@media (max-width: 600px) {
  :root {
    --container-padding: 16px;
    --row-height-sm: 48px;       /* NOVO: era 40, sobe pra Material */
  }

  html, body {
    font-size: 16px;             /* NOVO: era 14, sobe pra leitura confortável */
    line-height: 22px;
  }

  /* (mantém as regras de header, summary-grid, etc. que já existiam) */
  .header-inner {
    flex-direction: column;
    height: auto;
    padding-top: calc(var(--unit) * 3);
    padding-bottom: calc(var(--unit) * 3);
    gap: calc(var(--unit) * 2);
  }

  .month-nav {
    justify-content: space-between;
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .add-bill-form {
    flex-wrap: wrap;
  }

  .input-amount {
    flex: 0 0 90px;
  }

  /* MUDANÇA: delete maior e sempre visível em mobile (já era visível, agora 44px) */
  .btn-delete {
    width: 44px;
    height: 44px;
    opacity: 1;
  }
}
```

### 4. Conferir input vs zoom-in iOS / Android

Mesmo no Android (foco do round), font-size 16px no `<input>` é boa prática — alguns Androids/browsers desencadeiam zoom em inputs com fonte menor. O `html, body { font-size: 16px }` no mobile **propaga via `font: inherit`** se os inputs herdarem, mas o `.input-field` tem `font-size: 14px` explícito. Adicionar override no mobile:

Dentro do `@media (max-width: 600px)`:

```css
  .input-field,
  .bill-name-input,
  .bill-amount-input {
    font-size: 16px;             /* evita zoom-in automático em alguns browsers */
  }
```

## Definition of done

- [ ] Bloco "Tactile polish" presente, com `touch-action`, `tap-highlight-color`, `user-select`, `:active` states
- [ ] `.bill-checkbox::before` cobre 48×48 e dedo acerta sem precisar mirar no quadradinho 18×18
- [ ] `@media (max-width: 600px)` no `style.css` tem: `--row-height-sm: 48`, body 16px, btn-delete 44×44, inputs 16px
- [ ] DevTools toggle device toolbar → simular Pixel 5 → conferir:
  - Hit-targets parecem do tamanho de outros apps Android
  - Toques nos botões dão feedback visível (background change, scale pequenino)
  - Toque longo em botão **não** seleciona texto
  - Toque no checkbox: dedão acerta em volta da caixinha, não precisa mirar
- [ ] Desktop continua igual visualmente (abrir em browser desktop e conferir que nada mudou)
- [ ] `npm test` passa

## Commit

```
feat(ui): mobile tap targets + tactile polish

- Adds an always-on tactile block: `touch-action: manipulation`,
  transparent tap highlight, `user-select: none` on buttons,
  consistent `:active` feedback states.
- Expands checkbox tap area to 48x48 via a ::before pseudo-element,
  keeping the 18x18 visual.
- Mobile-only (@media max-width: 600px): bumps `--row-height-sm`
  to 48px, body font to 16px, .btn-delete to 44x44, and inputs to
  16px (avoids browser auto-zoom on focus).
- Desktop "ledger density" preserved per DESIGN.md.
```

## Risks / open issues

- **Risco médio:** `transform: scale(0.98)` no `:active` do `.btn-primary` pode causar repaint visível em telas antigas. Mitigação: testar; se for o caso, trocar por `filter: brightness(0.95)`.
- **Risco baixo:** `inset: -15px` no checkbox pode interceptar clique no `.bill-name` se eles estiverem muito próximos. Validar manualmente; ajustar `right` se necessário (template no passo 2 já mostra alternativa).
- **Risco baixo:** alterar `html { font-size: 16px }` no mobile pode mexer em qualquer `rem` no CSS — mas o `style.css` atual usa **px e var(--unit)** sempre, sem rem. Verificar com `grep -n 'rem' src/public/style.css`. Se aparecer rem, avaliar caso a caso.
- **Risco baixo:** `padding` calculado em `var(--unit) * X` continua igual no mobile porque `--unit` não muda. Bom — manteve consistência.
