/* ── income.js ──────────────────────────────────────────────── */

const API = 'http://localhost:5001/api';

const token = localStorage.getItem('et_token');
const user  = JSON.parse(localStorage.getItem('et_user') || '{}');
if (!token) location.href = 'index.html';

document.getElementById('navName').textContent   = user.name || 'User';
document.getElementById('navAvatar').textContent = (user.name || 'U')[0].toUpperCase();

function logout() { localStorage.clear(); location.href = 'index.html'; }

const fmt = (n) => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const authH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

function showAlert(msg, type = 'error') {
  const el = document.getElementById('incomeAlert');
  el.className = `alert alert-${type}`;
  el.innerHTML = (type === 'error' ? '⚠️ ' : '✅ ') + msg;
  el.style.display = 'flex';
  setTimeout(() => el.style.display = 'none', 3500);
}

// ── Load categories ────────────────────────────────────────────
let allCategories = [];

async function loadCategories() {
  const res  = await fetch(`${API}/category`, { headers: authH() });
  if (res.status === 401) return logout();
  allCategories = await res.json();

  const select = document.getElementById('incomeCategory');
  const incomeCats = allCategories.filter(c => c.type === 'income');
  select.innerHTML = '<option value="">Select category…</option>' +
    incomeCats.map(c => `<option value="${c.category_id}">${c.name}</option>`).join('');

  // Category tags
  const tagsEl = document.getElementById('incomeCategoryTags');
  if (!incomeCats.length) {
    tagsEl.innerHTML = '<span style="color:var(--text-light);font-size:.85rem;">No income categories yet.</span>';
    return;
  }
  tagsEl.innerHTML = incomeCats.map(c => `
    <span class="category-tag income">
      ${c.name}
      <button onclick="deleteCategory(${c.category_id})" title="Delete">✕</button>
    </span>
  `).join('');
}

// ── Add category ───────────────────────────────────────────────
async function addCategory(type) {
  const inputId = type === 'income' ? 'newIncomeCategory' : 'newExpenseCategory';
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

// ── Delete category ────────────────────────────────────────────
async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await fetch(`${API}/category/${id}`, { method: 'DELETE', headers: authH() });
  loadCategories();
}

// ── Load income list ───────────────────────────────────────────
async function loadIncome() {
  const res  = await fetch(`${API}/income`, { headers: authH() });
  const list = await res.json();
  const tbody = document.getElementById('incomeTableBody');

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4">
      <div class="empty-state"><div class="empty-icon">💵</div><p>No income entries yet</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(i => `
    <tr>
      <td>${new Date(i.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
      <td>${i.category ? `<span class="badge badge-cat">${i.category}</span>` : '—'}</td>
      <td class="amount-income">+${fmt(i.amount)}</td>
      <td>
        <button class="btn-delete" onclick="deleteIncome(${i.income_id})" title="Delete">🗑</button>
      </td>
    </tr>
  `).join('');
}

// ── Delete income ──────────────────────────────────────────────
async function deleteIncome(id) {
  if (!confirm('Delete this income entry?')) return;
  await fetch(`${API}/income/${id}`, { method: 'DELETE', headers: authH() });
  loadIncome();
}

// ── Add Income Form ────────────────────────────────────────────
document.getElementById('addIncomeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const category_id = document.getElementById('incomeCategory').value;
  const amount      = document.getElementById('incomeAmount').value;
  const date        = document.getElementById('incomeDate').value;
  const description = document.getElementById('incomeDesc').value.trim();

  if (!amount || !date) return showAlert('Amount and date are required.');

  const btn = document.getElementById('incomeBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Adding…';

  const res  = await fetch(`${API}/income`, {
    method: 'POST',
    headers: authH(),
    body: JSON.stringify({ category_id: category_id || null, amount, date, description })
  });
  const data = await res.json();

  btn.disabled = false; btn.innerHTML = '💵 Add Income';

  if (!res.ok) { showAlert(data.message); return; }
  showAlert('Income added successfully!', 'success');
  e.target.reset();
  loadIncome();
});

// ── Set default date ───────────────────────────────────────────
document.getElementById('incomeDate').valueAsDate = new Date();

loadCategories();
loadIncome();
