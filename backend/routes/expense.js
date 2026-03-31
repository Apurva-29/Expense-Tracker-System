const express   = require('express');
const router    = express.Router();
const db        = require('../db');
const authenticate = require('../middleware/auth');

// ── GET /api/expense ───────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.expense_id, e.amount, e.description, e.date,
              c.name AS category
       FROM Expense e
       LEFT JOIN Category c ON e.category_id = c.category_id
       WHERE e.user_id = ?
       ORDER BY e.date DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/expense ──────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, description, date, category_id } = req.body;
    if (!amount || !date)
      return res.status(400).json({ message: 'Amount and date are required.' });

    await db.query(
      'INSERT INTO Expense (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, category_id || null, amount, description || null, date]
    );
    res.status(201).json({ message: 'Expense added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/expense/:id ────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM Expense WHERE expense_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Expense deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
