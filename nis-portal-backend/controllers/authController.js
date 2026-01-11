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
    await pool.query('INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)', 
      [first_name, last_name, email, hash]);
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
