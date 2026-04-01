/* ── auth.js — Login & Register logic ──────────────────────── */

const API = '/api';

// ── Helpers ────────────────────────────────────────────────────
function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.innerHTML = (type === 'error' ? '⚠️ ' : '✅ ') + message;
  el.style.display = 'flex';
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Please wait…';
  } else {
    btn.disabled = false;
  }
}

// ── Redirect if already logged in ─────────────────────────────
(function () {
  const token = localStorage.getItem('et_token');
  if (token && (location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname.endsWith('/') )) {
    location.href = 'dashboard.html';
  }
})();

// ── Login Form ─────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('loginAlert');

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      return showAlert('loginAlert', 'Please fill in all fields.');
    }

    setLoading('loginBtn', true);

    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert('loginAlert', data.message || 'Login failed.');
      } else {
        localStorage.setItem('et_token', data.token);
        localStorage.setItem('et_user',  JSON.stringify(data.user));
        location.href = 'dashboard.html';
      }
    } catch {
      showAlert('loginAlert', 'Unable to connect to server. Is it running?');
    } finally {
      setLoading('loginBtn', false);
      document.getElementById('loginBtn').textContent = 'Sign In';
    }
  });
}

// ── Register Form ──────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('registerAlert');

    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm  = document.getElementById('regConfirm').value;

    if (!name || !email || !password || !confirm) {
      return showAlert('registerAlert', 'Please fill in all fields.');
    }
    if (password.length < 6) {
      return showAlert('registerAlert', 'Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return showAlert('registerAlert', 'Passwords do not match.');
    }

    setLoading('registerBtn', true);

    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert('registerAlert', data.message || 'Registration failed.');
      } else {
        showAlert('registerAlert', 'Account created! Redirecting to login…', 'success');
        setTimeout(() => location.href = 'index.html', 1500);
      }
    } catch {
      showAlert('registerAlert', 'Unable to connect to server. Is it running?');
    } finally {
      setLoading('registerBtn', false);
      document.getElementById('registerBtn').textContent = 'Create Account';
    }
  });
}

// ── Logout ─────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('et_token');
  localStorage.removeItem('et_user');
  location.href = 'index.html';
}
