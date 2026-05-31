document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.hidden = true;
  const password = document.getElementById('input-password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ password }),
  });

  if (res.ok) {
    window.location.href = '/';
    return;
  }

  const data = await res.json().catch(() => ({}));
  errorEl.textContent = data.error || 'Não foi possível entrar.';
  errorEl.hidden = false;
});
