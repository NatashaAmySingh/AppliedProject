const pool = require('../config/db');

exports.listUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.user_id, u.first_name, u.last_name, u.email, u.role_id, n.office_name AS organization FROM users u LEFT JOIN nis_office n ON u.office_id = n.office_id');

    // normalize to frontend shape — DB has no organization/status columns in your dump
    const users = rows.map((u) => ({
      id: u.user_id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role_id,
      organization: u.organization || null,
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

    // determine role id: if provided, validate it exists; otherwise try External Officer, then any role
    let roleId = null;
    try {
      if (role !== undefined && role !== '') {
        const [r] = await pool.query('SELECT role_id FROM roles WHERE role_id = ?', [role]);
        if (r.length === 0) return res.status(400).json({ error: 'Provided role does not exist' });
        roleId = role;
      } else {
        const [roleRows] = await pool.query('SELECT role_id FROM roles WHERE role_name = ?', ['External Officer']);
        if (roleRows.length) roleId = roleRows[0].role_id;
        else {
          const [anyRole] = await pool.query('SELECT role_id FROM roles LIMIT 1');
          if (anyRole.length) roleId = anyRole[0].role_id;
        }
      }
    } catch (e) {
      roleId = null;
    }

    if (!roleId) return res.status(500).json({ error: 'No roles defined in DB. Please seed roles or contact an administrator.' });

    // ensure default office exists (users.office_id is NOT NULL)
    let defaultOffice = null;
    try {
      const [officeRows] = await pool.query('SELECT office_id FROM nis_office LIMIT 1');
      if (officeRows.length) defaultOffice = officeRows[0].office_id;
      else {
        let countryId = null;
        const [countryRows] = await pool.query('SELECT country_id FROM countries LIMIT 1');
        if (countryRows.length) countryId = countryRows[0].country_id;
        else {
          const [insCountry] = await pool.query("INSERT INTO countries (country_name, country_code) VALUES (?, ?)", ['Default Country', 'DF']);
          countryId = insCountry.insertId;
        }
        const [insOffice] = await pool.query('INSERT INTO nis_office (office_name, country_id, email) VALUES (?, ?, ?)', ['Default Office', countryId, 'noreply@example.com']);
        defaultOffice = insOffice.insertId;
      }
    } catch (e) {
      console.error('ensure default office error (createUser):', e);
      defaultOffice = null;
    }

    if (!defaultOffice) return res.status(500).json({ error: 'No office available. Please seed `nis_office` or contact an administrator.' });

    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, role_id, office_id) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, hash, roleId, defaultOffice]
    );

    res.status(201).json({ id: result.insertId, first_name, last_name, email, role: roleId });
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
