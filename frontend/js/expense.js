/* ── expense.js ─────────────────────────────────────────────── */

const API = '/api';

const token = localStorage.getItem('et_token');
const user  = JSON.parse(localStorage.getItem('et_user') || '{}');
if (!token) location.href = 'index.html';

document.getElementById('navName').textContent   = user.name || 'User';
document.getElementById('navAvatar').textContent = (user.name || 'U')[0].toUpperCase();

function logout() { localStorage.clear(); location.href = 'index.html'; }

const fmt = (n) => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const authH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

function showAlert(msg, type = 'error') {
  const el = document.getElementById('expenseAlert');
  el.className = `alert alert-${type}`;
  el.innerHTML = (type === 'error' ? '⚠️ ' : '✅ ') + msg;
  el.style.display = 'flex';
  setTimeout(() => el.style.display = 'none', 3500);
}

// ── Load categories ────────────────────────────────────────────
async function loadCategories() {
  const res  = await fetch(`${API}/category`, { headers: authH() });
  if (res.status === 401) return logout();
  const all  = await res.json();

  const expenseCats = all.filter(c => c.type === 'expense');

  const select = document.getElementById('expenseCategory');
  select.innerHTML = '<option value="">Select category…</option>' +
    expenseCats.map(c => `<option value="${c.category_id}">${c.name}</option>`).join('');

  const tagsEl = document.getElementById('expenseCategoryTags');
  if (!expenseCats.length) {
    tagsEl.innerHTML = '<span style="color:var(--text-light);font-size:.85rem;">No expense categories yet.</span>';
    return;
  }
  tagsEl.innerHTML = expenseCats.map(c => `
    <span class="category-tag expense">
      ${c.name}
      <button onclick="deleteCategory(${c.category_id})" title="Delete">✕</button>
    </span>
  `).join('');
}

async function addCategory(type) {
  const inputId = type === 'expense' ? 'newExpenseCategory' : 'newIncomeCategory';
  const name = document.getElementById(inputId).value.trim();
  if (!name) return;

  const res = await fetch(`${API}/category`, {
    method: 'POST',
    headers: authH(),
    body: JSON.stringify({ name, type })
  });
  const data = await res.json();
  if (!res.ok) { showAlert(data.message); return; }
  document.getElementById(inputId).value = '';
  showAlert('Category added!', 'success');
  loadCategories();
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await fetch(`${API}/category/${id}`, { method: 'DELETE', headers: authH() });
  loadCategories();
}

// ── Load expense list ──────────────────────────────────────────
async function loadExpenses() {
  const res  = await fetch(`${API}/expense`, { headers: authH() });
  const list = await res.json();
  const tbody = document.getElementById('expenseTableBody');

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4">
      <div class="empty-state"><div class="empty-icon">💸</div><p>No expense entries yet</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(exp => `
    <tr>
      <td>${new Date(exp.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
      <td>${exp.category ? `<span class="badge badge-cat">${exp.category}</span>` : '—'}</td>
      <td class="amount-expense">-${fmt(exp.amount)}</td>
      <td>
        <button class="btn-delete" onclick="deleteExpense(${exp.expense_id})" title="Delete">🗑</button>
      </td>
    </tr>
  `).join('');
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense entry?')) return;
  await fetch(`${API}/expense/${id}`, { method: 'DELETE', headers: authH() });
  loadExpenses();
}

// ── Add Expense Form ───────────────────────────────────────────
document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const category_id = document.getElementById('expenseCategory').value;
  const amount      = document.getElementById('expenseAmount').value;
  const date        = document.getElementById('expenseDate').value;
  const description = document.getElementById('expenseDesc').value.trim();

  if (!amount || !date) return showAlert('Amount and date are required.');

  const btn = document.getElementById('expenseBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Adding…';

  const res  = await fetch(`${API}/expense`, {
    method: 'POST',
    headers: authH(),
    body: JSON.stringify({ category_id: category_id || null, amount, date, description })
  });
  const data = await res.json();

  btn.disabled = false; btn.innerHTML = '💸 Add Expense';

  if (!res.ok) { showAlert(data.message); return; }
  showAlert('Expense added successfully!', 'success');
  e.target.reset();
  document.getElementById('expenseDate').valueAsDate = new Date();
  loadExpenses();
});

document.getElementById('expenseDate').valueAsDate = new Date();

loadCategories();
loadExpenses();
