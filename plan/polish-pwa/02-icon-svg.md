# Fase 2 — Ícone SVG (Conceito C) + PNGs para PWA/favicon

## Goal

Produzir uma marca visual única que serve 3 propósitos:

1. Brand mark dentro do app (header, login) — Fase 3
2. Favicon na aba do navegador — Fase 7
3. Ícone do PWA Android (192, 512, maskable) — Fase 7

Um SVG canônico + variante maskable + PNGs derivados.

## Dependencies

Nenhuma. Pode rodar em paralelo com Fase 1 se quiser.

## Decisões referenciadas

- **Q9** — Conceito C: linha curta horizontal + check ao lado, fundo verde `#006c49`, marca branca
- **Q10** — Fundo do ícone `#006c49`; combina com `theme_color` do manifest

## Arte / racional

Forma do ícone:

```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│       ───   ✓           │   ← linha curta + check, ambos brancos
│                         │
│                         │
│                         │
└─────────────────────────┘
   fundo verde #006c49
   cantos rx = ~12% (Android adaptive friendly)
```

Por que essa forma:
- Linha curta = "uma conta na lista"
- Check ao lado = "marcada como paga"
- Lê como "checklist financeira" sem ser genérico to-do
- Sobrevive ao Android adaptive crop (mark centrado)
- Lê em 16×16 (favicon)

## Files to create

- `src/public/icons/icon.svg` — canônico (any purpose)
- `src/public/icons/icon-maskable.svg` — variante com safe zone reduzida pra Android adaptive
- `src/public/icons/icon-192.png` — PWA
- `src/public/icons/icon-512.png` — PWA
- `src/public/icons/icon-maskable-192.png` — PWA maskable
- `src/public/icons/icon-maskable-512.png` — PWA maskable
- `src/public/icons/favicon-32.png` — browser tab
- `src/public/icons/favicon-16.png` — browser tab

## Detailed steps

### 1. Criar `src/public/icons/icon.svg`

ViewBox 512×512. Fundo verde com `rx=64` (12,5%). Marca centrada na parte de baixo do "miolo" pra não competir com o crop. Linha curta + check.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="64" fill="#006c49"/>
  <!-- Linha curta (uma conta na lista) -->
  <rect x="128" y="248" width="120" height="16" rx="8" fill="#ffffff"/>
  <!-- Check (marcada como paga) -->
  <path d="M 296 256 L 336 296 L 400 224"
        fill="none"
        stroke="#ffffff"
        stroke-width="32"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
```

Validar:
- Abrir o SVG num browser e conferir que renderiza
- Conferir que a linha e o check ficam **na mesma altura visual** (eixo Y)

### 2. Criar `src/public/icons/icon-maskable.svg`

Mesma arte, mas com a marca reduzida pra caber no safe zone do Android adaptive (~80% central). O fundo continua full 512×512, mas a linha+check é escalada/reposicionada pra ficar mais central.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="64" fill="#006c49"/>
  <!-- Marca reduzida e centrada — safe zone 80% -->
  <g transform="translate(38.4, 38.4) scale(0.85)">
    <rect x="128" y="248" width="120" height="16" rx="8" fill="#ffffff"/>
    <path d="M 296 256 L 336 296 L 400 224"
          fill="none"
          stroke="#ffffff"
          stroke-width="32"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  </g>
</svg>
```

A diferença é só o `<g transform="...">` que reduz a marca pra 85% e centraliza no canvas. Fundo verde sobra dos lados pra ser cropado pelo launcher Android (circle/squircle/etc.).

### 3. Gerar PNGs

Usar `npx @resvg/resvg-js-cli` (sem instalar nada permanente):

```bash
cd src/public/icons

npx --yes @resvg/resvg-js-cli icon.svg --width 192 -o icon-192.png
npx --yes @resvg/resvg-js-cli icon.svg --width 512 -o icon-512.png
npx --yes @resvg/resvg-js-cli icon-maskable.svg --width 192 -o icon-maskable-192.png
npx --yes @resvg/resvg-js-cli icon-maskable.svg --width 512 -o icon-maskable-512.png
npx --yes @resvg/resvg-js-cli icon.svg --width 32 -o favicon-32.png
npx --yes @resvg/resvg-js-cli icon.svg --width 16 -o favicon-16.png
```

Se `@resvg/resvg-js-cli` não funcionar (rede / instalação), alternativas:
- `sharp` via Node script de uma página
- `librsvg` (`rsvg-convert`) se instalado no sistema
- Online: rasterizar manualmente via DevTools (renderizar SVG num `<canvas>` no tamanho desejado e exportar PNG)

### 4. Conferir tamanhos

```bash
ls -la src/public/icons/
file src/public/icons/icon-192.png   # deve dizer "PNG image data, 192 x 192"
```

PNGs devem ficar pequenos (<10KB cada). Se passarem disso, comprimir com `pngquant` ou `optipng`.

### 5. Commit das arts

PNGs vão pro repo. Não é grande coisa (~50KB total). Justifica versionar como código-fonte da identidade visual.

## Definition of done

- [ ] `src/public/icons/icon.svg` renderiza no browser e mostra linha + check brancos sobre verde
- [ ] `src/public/icons/icon-maskable.svg` renderiza com a marca mais centrada
- [ ] 6 PNGs gerados com tamanhos corretos (validar com `file *.png`)
- [ ] PNGs commitados (não em `.gitignore`)
- [ ] Inspeção visual: ícone 192 fica nítido, 16 ainda lê
- [ ] **Não fazer registro no app ainda** — Fase 3 e 7 cuidam disso

## Commit

```
feat(icons): add Concept C brand mark (line + check) as SVG + PNGs

Single SVG source rendering as:
- icon.svg / *.png (any purpose, full bleed)
- icon-maskable.svg / *.png (Android adaptive safe zone)
- favicon-32.png, favicon-16.png

Mark uses green #006c49 background + white line + white check
to read as "checklist financeira" at all sizes (16 to 512).
```

## Risks / open issues

- **Risco médio:** ícone pode ficar ilegível em 16×16. Mitigação: se for o caso, criar variante `favicon.svg` simplificada (só o check, sem a linha) e usar nas declarações de favicon. Mas avaliar visualmente primeiro.
- **Risco baixo:** `@resvg/resvg-js-cli` pode ter problema de plataforma (darwin arm64 vs x64). Se quebrar, usar `sharp` via script Node simples.
- **Risco baixo:** safe zone Android pode estar errada (80% é heurística). Validar com Chrome DevTools → Application → Manifest preview na Fase 7.

## Verificação de qualidade

Comparar `icon-192.png` com o ícone do app Settings nativo do Android — deve dar a impressão de "isso é um ícone de app", não de "isso é um logo de site".
