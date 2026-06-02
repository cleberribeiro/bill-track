# Polish + PWA — Plano de execução

Round de polish visual + instalação como PWA Android. Decisões consolidadas via sessão grill-me; cada decisão está rastreada por número (Pergunta N) abaixo.

## Objetivo do round

1. **Fix login** quebrado por bloqueio de CSP no `<style>` inline (não é estético — é bug)
2. **Polish identidade** — ícone próprio + uso consistente em header, login, favicon, PWA
3. **Polish mobile** — hit-targets Material-compliant, tipografia mobile, polidas táteis sempre ligadas
4. **Micro-animações discretas** — feedback de "vivo", respeitando `prefers-reduced-motion`
5. **Empty state humanizado** — hierarquia tipográfica + cópia que sinaliza agência, não erro
6. **PWA instalável no Android** — degrau 1: só instalável, sem offline

**Fora de escopo deste round:**
- Dark mode (decisão consciente — Pergunta 12, ficou pra outro round)
- Offline real / service worker com cache (Pergunta 8, evita footgun de finance app)
- iOS (Pergunta 7, foco Android)
- Refactor pra React/PrimeReact (Pergunta 3, descartado — vanilla atende)

## Status

- [ ] **Fase 1** — Login fix (CSP / inline `<style>` → `style.css`) — [01-login-fix.md](./01-login-fix.md)
- [ ] **Fase 2** — Ícone SVG (Conceito C: linha + check) + PNGs — [02-icon-svg.md](./02-icon-svg.md)
- [ ] **Fase 3** — Ícone aplicado em header + login — [03-icon-ui.md](./03-icon-ui.md)
- [ ] **Fase 4** — Mobile sizing + polidas táteis — [04-mobile-tactile.md](./04-mobile-tactile.md)
- [ ] **Fase 5** — Micro-animações discretas — [05-animations.md](./05-animations.md)
- [ ] **Fase 6** — Empty state (h2 + cópia humana + filter empties) — [06-empty-state.md](./06-empty-state.md)
- [ ] **Fase 7** — PWA: manifest, service worker, meta tags — [07-pwa-setup.md](./07-pwa-setup.md)
- [ ] **Fase 8** — Testes + verificação no Android via Render — [08-tests-verify.md](./08-tests-verify.md)

## Como usar

Cada fase é um arquivo auto-contido. Sequência:

1. Abra o arquivo da fase
2. Execute os "Detailed steps" na ordem
3. Confirme cada item do "Definition of done"
4. Commit usando o "Commit message" sugerido
5. Marque a fase como `[x]` aqui no README
6. Vá pra próxima

Fases têm dependências declaradas (`Dependencies` no topo). Não pule.

## Estratégia de commits

**8 commits, um por fase.** Cada commit é reviewable e revertível isoladamente. Não amende nem squash entre fases — o histórico organiza o progresso.

## Deploy / verificação

Deploy via `render.yaml` (Render). Após Fase 7 (PWA pronto), `git push` no `main` aciona deploy. Fase 8 valida tudo no Android via URL HTTPS do Render (`localhost` não é considerado PWA instalável pelo Chrome em outros devices).

## Decisões consolidadas

Recap das 16 perguntas resolvidas no grill-me. Cada fase referencia estas decisões por número.

### Stack & escopo

| # | Decisão | Por quê |
|---|---|---|
| Q3 | Vanilla JS + Fastify, sem React/PrimeReact | DESIGN.md "spreadsheet-simple" briga frontalmente com estética PrimeReact; reescrita não compra o que dói |
| Q12 | Sem dark mode neste round | DESIGN.md é explicitamente light-only; dark mal feito piora; dobra trabalho de todas as outras decisões |

### Bug

| # | Decisão | Por quê |
|---|---|---|
| Q6 | Login fix = mover `<style>` inline pro `style.css`, sem mexer no CSP | Mantém CSP estrito; resolve o bug visual real (card/spacing/alinhamento não aplicavam) |

### PWA

| # | Decisão | Por quê |
|---|---|---|
| Q7 | Android only | Foco do usuário; iOS exige tag-set diferente, pode entrar em round futuro |
| Q8 | Degrau 1 — só instalável, sem offline | Finance app + offline-write mal feito = sumir lançamento; degrau 1 entrega 80% do "parece app" com 5% do esforço |
| Q10 | `theme_color: #006c49` + `background_color: #f7f9fb` | Status bar verde dá identidade; splash branca deixa ícone (verde escuro) protagonista |
| Q11 | Service worker pass-through (sem cache) | Elimina categoria inteira de bug "PWA travado em versão antiga"; degrau 1 não precisa de cache |
| —  | `display: standalone`, `orientation: portrait`, `name: "BillTrack"` | Defaults Android padrão pra PWA standalone |

### Identidade

| # | Decisão | Por quê |
|---|---|---|
| Q9  | Ícone Conceito C: linha curta + check, fundo verde `#006c49`, marca branca | Lê como checklist financeira; honra DESIGN.md; sobrevive ao Android adaptive crop; escala em 16×16 |
| Q13 | Opção A — ícone + texto em todos os lugares | Header: 20×20 + "BILLTRACK" inline. Login: 56×56 hero + caption. Padrão Notion/Linear/Things — funciona |
| —   | Brand do header vira `<a>` clicável → mês atual | Atalho de navegação útil; sem decoração visual extra |

### Mobile

| # | Decisão | Por quê |
|---|---|---|
| Q14 | Ajustes cirúrgicos via `@media (max-width: 600px)` | Preserva "ledger density" do desktop (DESIGN.md explícito); fixa mobile onde Material guideline pede |
| —   | body 14→16 mobile; `--row-height-sm` 40→48 mobile; `.btn-delete` 32→44 mobile | Material guideline pra touch + reading comfort |
| —   | Polidas táteis SEMPRE (não só mobile) | `touch-action`, `tap-highlight-color`, `:active`, `user-select` — custo zero, melhora em todo touch device |
| —   | Checkbox tap area 48×48 via `::before` pseudo-elemento | Mantém visual 18×18 (DESIGN.md), fixa o dedão errar |

### Animações

| # | Decisão | Por quê |
|---|---|---|
| Q15 | Opção 2 — discretas, ≤220ms, `prefers-reduced-motion` desativa tudo | App parecer "morto" é parte do "feio"; fades + slide-down + pulse no checkbox = 80% do ganho com risco zero |
| —   | Resumo (R$) sem animação | Números de dinheiro animando = slot machine. Swap instantâneo |

### Empty state

| # | Decisão | Por quê |
|---|---|---|
| Q16 | Opção D — sem ícone, hierarquia tipográfica + cópia humana | Ícone começa a ficar superexposto se entrar aqui também; cópia atual é o problema real ("nenhuma conta cadastrada" tem tom de form bancário) |
| —   | Filter empty: linha única positiva | "Nada pendente. ✓" / "Nada pago ainda." — sucesso ou fase, não erro |

## Aside opcional (não bloqueia)

`npm audit` foi mencionado no grilling mas não respondido. Pode rodar a qualquer momento como commit isolado, fora da sequência. Sem urgência.

## Como esta pasta surgiu

Sessão grill-me iniciada com pedido genérico "refatorar pra React + PrimeReact + instalar no celular". 16 perguntas depois, o plano divergiu radicalmente do pedido original — descobrimos que (a) React não resolve a dor real, (b) a dor é "design feio" + "quero instalar no celular", (c) ambos têm caminhos muito mais baratos que reescrita.

Esta pasta é o output materializado dessa sessão. Cada fase é uma decisão executável.
