const express   = require('express');
const router    = express.Router();
const db        = require('../db');
const authenticate = require('../middleware/auth');

// ── GET /api/income ── list all income for the logged-in user ──
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.income_id, i.amount, i.description, i.date,
              c.name AS category
       FROM Income i
       LEFT JOIN Category c ON i.category_id = c.category_id
       WHERE i.user_id = ?
       ORDER BY i.date DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/income ── add new income ─────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, description, date, category_id } = req.body;
    if (!amount || !date)
      return res.status(400).json({ message: 'Amount and date are required.' });

    await db.query(
      'INSERT INTO Income (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, category_id || null, amount, description || null, date]
    );
    res.status(201).json({ message: 'Income added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/income/:id ─────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM Income WHERE income_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Income deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
