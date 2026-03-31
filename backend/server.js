const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes     = require('./routes/auth');
const incomeRoutes   = require('./routes/income');
const expenseRoutes  = require('./routes/expense');
const categoryRoutes = require('./routes/category');
const reportRoutes   = require('./routes/report');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 5001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/income',    incomeRoutes);
app.use('/api/expense',   expenseRoutes);
app.use('/api/category',  categoryRoutes);
app.use('/api/report',    reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Expense Tracker backend running at http://localhost:${PORT}`);
});
