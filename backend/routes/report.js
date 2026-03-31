const express   = require('express');
const router    = express.Router();
const db        = require('../db');
const authenticate = require('../middleware/auth');

// ── GET /api/report/monthly?year=2024&month=3 ──────────────────
router.get('/monthly', authenticate, async (req, res) => {
  try {
    const { year, month } = req.query;

    const [incomeRows] = await db.query(
      `SELECT c.name AS category, SUM(i.amount) AS total
       FROM Income i
       LEFT JOIN Category c ON i.category_id = c.category_id
       WHERE i.user_id = ?
         AND YEAR(i.date)  = ?
         AND MONTH(i.date) = ?
       GROUP BY c.name
       ORDER BY total DESC`,
      [req.user.userId, year, month]
    );

    const [expenseRows] = await db.query(
      `SELECT c.name AS category, SUM(e.amount) AS total
       FROM Expense e
       LEFT JOIN Category c ON e.category_id = c.category_id
       WHERE e.user_id = ?
         AND YEAR(e.date)  = ?
         AND MONTH(e.date) = ?
       GROUP BY c.name
       ORDER BY total DESC`,
      [req.user.userId, year, month]
    );

    const [totalIncome]  = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM Income
       WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?`,
      [req.user.userId, year, month]
    );
    const [totalExpense] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM Expense
       WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?`,
      [req.user.userId, year, month]
    );

    const income  = parseFloat(totalIncome[0].total);
    const expense = parseFloat(totalExpense[0].total);

    res.json({
      year,
      month,
      totalIncome:  income,
      totalExpense: expense,
      balance:      income - expense,
      incomeByCategory:  incomeRows,
      expenseByCategory: expenseRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/report/all-months ─ distinct months with activity ─
router.get('/all-months', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT YEAR(date) AS year, MONTH(date) AS month FROM Income WHERE user_id = ?
       UNION
       SELECT YEAR(date) AS year, MONTH(date) AS month FROM Expense WHERE user_id = ?
       ORDER BY year DESC, month DESC`,
      [req.user.userId, req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
