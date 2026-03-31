/* ── dashboard.js ───────────────────────────────────────────── */

const API = 'http://localhost:5001/api';

// ── Auth guard ─────────────────────────────────────────────────
const token = localStorage.getItem('et_token');
const user  = JSON.parse(localStorage.getItem('et_user') || '{}');

if (!token) location.href = 'index.html';

// ── Populate Navbar ────────────────────────────────────────────
document.getElementById('navName').textContent   = user.name || 'User';
document.getElementById('navAvatar').textContent = (user.name || 'U')[0].toUpperCase();
document.getElementById('dashGreeting').textContent =
  `Welcome back, ${user.name || 'there'}! Here's your financial overview.`;

// ── Logout ─────────────────────────────────────────────────────
function logout() {
  localStorage.clear();
  location.href = 'index.html';
}

// ── Helpers ────────────────────────────────────────────────────
const fmt = (n) => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// ── Load Dashboard Data ────────────────────────────────────────
async function loadDashboard() {
  try {
    const res  = await fetch(`${API}/dashboard`, { headers: authHeaders() });
    if (res.status === 401) return logout();
    const data = await res.json();

    document.getElementById('totalIncome').textContent  = fmt(data.totalIncome);
    document.getElementById('totalExpense').textContent = fmt(data.totalExpense);
    document.getElementById('balance').textContent      = fmt(data.balance);

    renderTransactions(data.recentTransactions || []);
  } catch (err) {
    console.error(err);
  }
}

function renderTransactions(list) {
  const tbody = document.getElementById('recentBody');

  if (!list.length) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No transactions yet. <a href="add-income.html" style="color:var(--navbar);">Add your first one</a>.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(tx => `
    <tr>
      <td>${new Date(tx.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
      <td><span class="badge badge-${tx.type}">${tx.type === 'income' ? '↑ Income' : '↓ Expense'}</span></td>
      <td>${tx.category ? `<span class="badge badge-cat">${tx.category}</span>` : '—'}</td>
      <td style="color:var(--text-light);">${tx.description || '—'}</td>
      <td class="amount-${tx.type}">${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}</td>
    </tr>
  `).join('');
}

loadDashboard();
