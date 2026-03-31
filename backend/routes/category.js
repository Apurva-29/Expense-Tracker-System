const express   = require('express');
const router    = express.Router();
const db        = require('../db');
const authenticate = require('../middleware/auth');

// ── GET /api/category ─── list all categories for user ─────────
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Category WHERE user_id = ? ORDER BY type, name',
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/category ─── add a category ──────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type)
      return res.status(400).json({ message: 'Name and type are required.' });
    if (!['income', 'expense'].includes(type))
      return res.status(400).json({ message: 'Type must be income or expense.' });

    const [check] = await db.query(
      'SELECT category_id FROM Category WHERE user_id = ? AND name = ? AND type = ?',
      [req.user.userId, name, type]
    );
    if (check.length > 0)
      return res.status(409).json({ message: 'Category already exists.' });

    await db.query(
      'INSERT INTO Category (user_id, name, type) VALUES (?, ?, ?)',
      [req.user.userId, name, type]
    );
    res.status(201).json({ message: 'Category added.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/category/:id ───────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM Category WHERE category_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
