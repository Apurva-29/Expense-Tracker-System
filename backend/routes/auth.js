const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const db        = require('../db');
const { JWT_SECRET } = require('../constants');

// ── POST /api/auth/register ────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const [existing] = await db.query('SELECT user_id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );

    // Seed default categories for the new user
    const userId = result.insertId;
    const defaults = [
      [userId, 'Salary',        'income'],
      [userId, 'Freelance',     'income'],
      [userId, 'Investment',    'income'],
      [userId, 'Food',          'expense'],
      [userId, 'Transport',     'expense'],
      [userId, 'Entertainment', 'expense'],
      [userId, 'Utilities',     'expense'],
      [userId, 'Health',        'expense'],
    ];
    for (const row of defaults) {
      await db.query('INSERT INTO Category (user_id, name, type) VALUES (?, ?, ?)', row);
    }

    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user.user_id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.user_id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
