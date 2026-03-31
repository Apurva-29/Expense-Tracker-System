const express   = require('express');
const router    = express.Router();
const db        = require('../db');
const authenticate = require('../middleware/auth');

// ── GET /api/dashboard ─────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [[{ totalIncome }]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM Income WHERE user_id = ?',
      [userId]
    );
    const [[{ totalExpense }]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpense FROM Expense WHERE user_id = ?',
      [userId]
    );

    // Recent 10 transactions (income + expense combined)
    const [recent] = await db.query(
      `(SELECT 'income' AS type, amount, description, date, c.name AS category
        FROM Income i LEFT JOIN Category c ON i.category_id = c.category_id
        WHERE i.user_id = ?)
       UNION ALL
       (SELECT 'expense' AS type, amount, description, date, c.name AS category
        FROM Expense e LEFT JOIN Category c ON e.category_id = c.category_id
        WHERE e.user_id = ?)
       ORDER BY date DESC LIMIT 10`,
      [userId, userId]
    );

    res.json({
      totalIncome:  parseFloat(totalIncome),
      totalExpense: parseFloat(totalExpense),
      balance:      parseFloat(totalIncome) - parseFloat(totalExpense),
      recentTransactions: recent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
