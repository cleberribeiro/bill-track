/* -----------------------------------------------
   State
----------------------------------------------- */
let currentYearMonth = getTodayYearMonth();
let currentFilter = '';

/* -----------------------------------------------
   Utilities
----------------------------------------------- */
function getTodayYearMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatMonthTitle(yearMonth) {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());
}

function prevMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* -----------------------------------------------
   API helpers
----------------------------------------------- */
async function api(method, path, body) {
  const opts = {
    method,
    credentials: 'same-origin',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(method !== 'GET' ? { 'X-Requested-With': 'XMLHttpRequest' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(path, opts);
  if (res.status === 401) {
    window.location.href = '/login.html';
    throw new Error('Não autenticado');
  }
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

/* -----------------------------------------------
   Summary
----------------------------------------------- */
async function loadSummary() {
  const s = await api('GET', `/api/months/${currentYearMonth}/summary`);
  document.getElementById('summary-total').textContent = formatBRL(s.total);
  document.getElementById('summary-paid').textContent = formatBRL(s.paid);
  document.getElementById('summary-pending').textContent = formatBRL(s.pending);
  document.getElementById('summary-pending-count').textContent = s.pendingCount;
}

/* -----------------------------------------------
   Bills list
----------------------------------------------- */
async function loadBills() {
  const url = `/api/months/${currentYearMonth}/bills${currentFilter ? `?status=${currentFilter}` : ''}`;
  const bills = await api('GET', url);
  renderBills(bills);
  await loadSummary();
}

function renderBills(bills) {
  const list = document.getElementById('bills-list');
  const emptyState = document.getElementById('empty-state');

  list.innerHTML = '';

  if (bills.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    bills.forEach(bill => list.appendChild(createBillRow(bill)));
  }
}

function createBillRow(bill) {
  const li = document.createElement('li');
  li.className = `bill-row${bill.status === 'paid' ? ' is-paid' : ''}`;
  li.dataset.id = bill.id;

  // Checkbox
  const checkWrap = document.createElement('label');
  checkWrap.className = 'bill-checkbox-wrap';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'bill-checkbox';
  checkbox.checked = bill.status === 'paid';
  checkbox.addEventListener('change', () => toggleStatus(bill.id, checkbox.checked, li));
  checkWrap.appendChild(checkbox);

  // Name
  const nameSpan = document.createElement('span');
  nameSpan.className = 'bill-name';
  nameSpan.textContent = bill.name;
  nameSpan.title = 'Clique para editar';
  nameSpan.addEventListener('click', () => startEditName(bill, nameSpan, li));

  // Amount
  const amountSpan = document.createElement('span');
  amountSpan.className = 'bill-amount';
  amountSpan.textContent = formatBRL(bill.amount);
  amountSpan.title = 'Clique para editar';
  amountSpan.addEventListener('click', () => startEditAmount(bill, amountSpan, li));

  // Delete
  const delBtn = document.createElement('button');
  delBtn.className = 'btn-delete';
  delBtn.title = 'Excluir';
  delBtn.innerHTML = '&times;';
  delBtn.addEventListener('click', () => deleteBill(bill.id, li));

  li.append(checkWrap, nameSpan, amountSpan, delBtn);
  return li;
}

/* -----------------------------------------------
   Toggle paid / pending
----------------------------------------------- */
async function toggleStatus(id, checked, rowEl) {
  const newStatus = checked ? 'paid' : 'pending';
  await api('PATCH', `/api/bills/${id}`, { status: newStatus });
  if (checked) {
    rowEl.classList.add('is-paid');
  } else {
    rowEl.classList.remove('is-paid');
  }
  await loadSummary();
}

/* -----------------------------------------------
   Inline name edit
----------------------------------------------- */
function startEditName(bill, nameSpan, rowEl) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'bill-name-input';
  input.value = bill.name;
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  async function commit() {
    const newName = input.value.trim();
    if (!newName) {
      input.replaceWith(nameSpan);
      return;
    }
    try {
      const updated = await api('PATCH', `/api/bills/${bill.id}`, { name: newName });
      bill.name = updated.name;
      nameSpan.textContent = updated.name;
    } catch {
      /* restore on error */
    }
    input.replaceWith(nameSpan);
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.removeEventListener('blur', commit); input.replaceWith(nameSpan); }
  });
}

/* -----------------------------------------------
   Inline amount edit
----------------------------------------------- */
function startEditAmount(bill, amountSpan, rowEl) {
  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'bill-amount-input';
  input.value = bill.amount;
  input.min = '0';
  input.step = '0.01';
  amountSpan.replaceWith(input);
  input.focus();
  input.select();

  async function commit() {
    const val = parseFloat(input.value);
    if (isNaN(val) || val < 0) {
      input.replaceWith(amountSpan);
      return;
    }
    try {
      const updated = await api('PATCH', `/api/bills/${bill.id}`, { amount: val });
      bill.amount = updated.amount;
      amountSpan.textContent = formatBRL(updated.amount);
      await loadSummary();
    } catch {
      /* restore on error */
    }
    input.replaceWith(amountSpan);
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.removeEventListener('blur', commit); input.replaceWith(amountSpan); }
  });
}

/* -----------------------------------------------
   Delete bill
----------------------------------------------- */
async function deleteBill(id, rowEl) {
  if (!confirm('Excluir esta conta?')) return;
  await api('DELETE', `/api/bills/${id}`);
  rowEl.remove();
  const list = document.getElementById('bills-list');
  if (list.children.length === 0) {
    document.getElementById('empty-state').hidden = false;
  }
  await loadSummary();
}

/* -----------------------------------------------
   Add bill form
----------------------------------------------- */
document.getElementById('add-bill-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errorEl = document.getElementById('add-error');
  errorEl.hidden = true;

  const name = document.getElementById('input-name').value.trim();
  const amountRaw = document.getElementById('input-amount').value;
  const amount = parseFloat(amountRaw);

  if (!name) { errorEl.textContent = 'O nome é obrigatório.'; errorEl.hidden = false; return; }
  if (isNaN(amount) || amount < 0) { errorEl.textContent = 'Informe um valor positivo.'; errorEl.hidden = false; return; }

  const bill = await api('POST', `/api/months/${currentYearMonth}/bills`, { name, amount });
  document.getElementById('empty-state').hidden = true;
  document.getElementById('bills-list').appendChild(createBillRow(bill));
  document.getElementById('add-bill-form').reset();
  document.getElementById('input-name').focus();
  await loadSummary();
});

/* -----------------------------------------------
   Filters
----------------------------------------------- */
document.querySelectorAll('.btn-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    loadBills();
  });
});

/* -----------------------------------------------
   Month navigation
----------------------------------------------- */
function setMonth(yearMonth) {
  currentYearMonth = yearMonth;
  document.getElementById('month-title').textContent = formatMonthTitle(yearMonth);
  loadBills();
}

document.getElementById('btn-prev-month').addEventListener('click', () => {
  setMonth(prevMonth(currentYearMonth));
});

document.getElementById('btn-next-month').addEventListener('click', () => {
  setMonth(nextMonth(currentYearMonth));
});

document.getElementById('brand-link').addEventListener('click', (e) => {
  e.preventDefault();
  setMonth(getTodayYearMonth());
});

/* -----------------------------------------------
   Duplicate month
----------------------------------------------- */
document.getElementById('btn-duplicate').addEventListener('click', async () => {
  const source = prevMonth(currentYearMonth);
  const list = document.getElementById('bills-list');
  const hasExisting = list.children.length > 0;

  if (hasExisting) {
    if (!confirm('Este mês já tem contas. Deseja adicionar as do mês anterior mesmo assim?')) return;
  }

  try {
    await api('POST', `/api/months/${currentYearMonth}/duplicate-from/${source}`);
    await loadBills();
  } catch (err) {
    alert(err.message);
  }
});

/* -----------------------------------------------
   Logout
----------------------------------------------- */
document.getElementById('btn-logout').addEventListener('click', async () => {
  await fetch('/api/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  window.location.href = '/login.html';
});

/* -----------------------------------------------
   Init
----------------------------------------------- */
setMonth(currentYearMonth);
