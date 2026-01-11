const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

exports.login = async (req, res) => {

  const { email, password } = req.body;
  try {


    const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
    console.log(rows)
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.user_id, role: user.role_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.user_id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    // find External Officer role_id if present, otherwise fall back to any role
    let defaultRole = null;
    try {
      const [roleRows] = await pool.query('SELECT role_id FROM roles WHERE role_name = ?', ['External Officer']);
      if (roleRows.length) defaultRole = roleRows[0].role_id;
      else {
        const [anyRole] = await pool.query('SELECT role_id FROM roles LIMIT 1');
        if (anyRole.length) defaultRole = anyRole[0].role_id;
      }
    } catch (e) {
      // roles table might not exist or DB not seeded
      defaultRole = null;
    }

    if (!defaultRole) return res.status(500).json({ error: 'No roles defined in DB. Please seed roles or contact an administrator.' });

    await pool.query('INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)', 
      [first_name, last_name, email, hash, defaultRole]);
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
