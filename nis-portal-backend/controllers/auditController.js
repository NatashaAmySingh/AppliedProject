const pool = require('../config/db');

exports.logAction = async (req, res) => {
  const { user_id, action_type, entity_type, entity_id, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [user_id, action_type, entity_type, entity_id, description]
    );
    res.json({ message: 'Action logged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
