# Fase 1 — Login fix (CSP / inline `<style>` → `style.css`)

## Goal

Tela de login está renderizando **sem nenhum estilo de layout** (sem card, sem espaçamento, alinhada à esquerda) porque o `<style>` inline em `login.html` é bloqueado pelo CSP do helmet (`styleSrc: ["'self'", 'fonts.googleapis.com']` — sem `'unsafe-inline'`). Mover os estilos pro `style.css` resolve sem enfraquecer o CSP.

## Dependencies

Nenhuma. Pode ser executada primeiro.

## Decisões referenciadas

- **Q6** — Solução é mover `<style>` inline pro arquivo externo (não adicionar `'unsafe-inline'` no CSP, não usar nonce)

## Files to change

- `src/public/login.html` — remover bloco `<style>...</style>` inteiro
- `src/public/style.css` — adicionar seção `Login screen` com os estilos movidos

## Detailed steps

### 1. Adicionar bloco `Login screen` no `src/public/style.css`

Antes da `@media (max-width: 600px)` no fim do arquivo, inserir:

```css
/* -----------------------------------------------
   Login screen
----------------------------------------------- */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--container-padding);
}

.login-card {
  width: 100%;
  max-width: 360px;
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  padding: calc(var(--unit) * 8) calc(var(--unit) * 6);
}

.login-brand {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: calc(var(--unit) * 1);
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: calc(var(--unit) * 6);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 3);
}

.login-form .btn-primary {
  width: 100%;
}
```

**Notas:**
- Removi o `justify-content: center` do `.login-form .btn-primary` original — era no-op (`.btn-primary` não é flex). Centralização do texto já ocorre por `text-align` natural do `<button>` com `width: 100%`.
- Tudo o mais é fielmente o que estava no `<style>` inline.

### 2. Remover bloco `<style>` em `src/public/login.html`

Substituir as linhas 12-51 (inteiras, do `<style>` até `</style>`) por nada. Header do `<head>` fica apenas com meta tags, fontes e o `<link rel="stylesheet" href="/style.css" />`.

### 3. Não tocar no CSP

Manter `src/app.js` como está. `styleSrc: ["'self'", 'fonts.googleapis.com']` continua válido — o `style.css` é same-origin (`'self'`).

## Definition of done

- [ ] `src/public/login.html` não tem mais nenhum `<style>` (verificar com `grep -n '<style' src/public/login.html`)
- [ ] `src/public/style.css` tem a seção `Login screen` com todas as 5 classes
- [ ] `npm test` passa (não deve quebrar — testes não tocam HTML)
- [ ] Verificação manual em `localhost`:
  - Abrir `/login.html` direto no browser
  - Conferir: card centralizado vertical+horizontal, com borda e padding
  - Conferir: "BILLTRACK" uppercase em cima, "Entrar" abaixo, input de senha, botão verde
  - Conferir: gap de 12px entre input e botão
  - Conferir DevTools Console: sem mensagem de CSP violation sobre `style-src`

## Commit

```
fix(login): move inline <style> to style.css to satisfy CSP

The login screen's inline <style> block was being blocked by the
helmet CSP directive `styleSrc: 'self'`, causing the card/spacing/
centering rules to not apply. Moving them to the same-origin
style.css fixes the layout without weakening the CSP.

Also drops a no-op `justify-content: center` on `.btn-primary`
(it isn't a flex container).
```

## Risks / open issues

- Nenhum risco material. Mudança puramente mecânica.
- Verificar que o `<button class="btn-primary">` no login fica `width: 100%` mas mantém boa aparência. O `.btn-primary` global tem `flex-shrink: 0` e `padding: 0 20px` — combinado com `width: 100%`, o texto "Entrar" centraliza naturalmente. Se não centralizar bonito, adicionar `text-align: center` no `.login-form .btn-primary`.
