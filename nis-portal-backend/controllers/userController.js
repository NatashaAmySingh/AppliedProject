const pool = require('../config/db');

exports.listUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, first_name, last_name, email, role_id FROM users');

    // normalize to frontend shape — DB has no organization/status columns in your dump
    const users = rows.map((u) => ({
      id: u.user_id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role_id,
      organization: null,
      status: 'Active',
    }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, hash, role || null]
    );

    res.status(201).json({ id: result.insertId, first_name, last_name, email, role: role || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role } = req.body;

    const fields = [];
    const values = [];
    if (first_name !== undefined) { fields.push('first_name = ?'); values.push(first_name); }
    if (last_name !== undefined) { fields.push('last_name = ?'); values.push(last_name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (role !== undefined) { fields.push('role_id = ?'); values.push(role); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
