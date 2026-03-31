/* ── report.js ──────────────────────────────────────────────── */

const API = 'http://localhost:5001/api';

const token = localStorage.getItem('et_token');
const user  = JSON.parse(localStorage.getItem('et_user') || '{}');
if (!token) location.href = 'index.html';

document.getElementById('navName').textContent   = user.name || 'User';
document.getElementById('navAvatar').textContent = (user.name || 'U')[0].toUpperCase();

function logout() { localStorage.clear(); location.href = 'index.html'; }

const fmt  = (n) => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const authH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

// ── Populate year dropdown ─────────────────────────────────────
const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1; // 1-indexed
const yearSel   = document.getElementById('reportYear');
const monthSel  = document.getElementById('reportMonth');

for (let y = currentYear; y >= currentYear - 5; y--) {
  yearSel.innerHTML += `<option value="${y}">${y}</option>`;
}
yearSel.value  = currentYear;
monthSel.value = currentMonth;

// ── Load Report ────────────────────────────────────────────────
async function loadReport() {
  const year  = yearSel.value;
  const month = monthSel.value;

  try {
    const res  = await fetch(`${API}/report/monthly?year=${year}&month=${month}`, { headers: authH() });
    if (res.status === 401) return logout();
    const data = await res.json();

    document.getElementById('repIncome').textContent  = fmt(data.totalIncome);
    document.getElementById('repExpense').textContent = fmt(data.totalExpense);
    document.getElementById('repBalance').textContent = fmt(data.balance);

    renderCategoryTable('incomeCatBody',  data.incomeByCategory,  data.totalIncome,  'income');
    renderCategoryTable('expenseCatBody', data.expenseByCategory, data.totalExpense, 'expense');
  } catch (err) {
    console.error(err);
  }
}

function renderCategoryTable(tbodyId, rows, total, type) {
  const tbody = document.getElementById(tbodyId);
  if (!rows || !rows.length) {
    tbody.innerHTML = `<tr><td colspan="3">
      <div class="empty-state">
        <div class="empty-icon">${type === 'income' ? '💵' : '💸'}</div>
        <p>No data for this month</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const pct = total > 0 ? ((r.total / total) * 100).toFixed(1) : '0.0';
    const cls = type === 'income' ? 'amount-income' : 'amount-expense';
    return `
      <tr>
        <td>${r.category || 'Uncategorised'}</td>
        <td style="text-align:right;" class="${cls}">${fmt(r.total)}</td>
        <td style="text-align:right;">
          <span style="
            display:inline-block;
            background:${type === 'income' ? '#ebf5fb' : '#fdedec'};
            color:${type === 'income' ? 'var(--income)' : 'var(--expense)'};
            padding:.2rem .5rem; border-radius:8px; font-size:.8rem; font-weight:600;">
            ${pct}%
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Auto-load on page open ─────────────────────────────────────
loadReport();
