const pool = require('../config/db');

exports.uploadDocument = async (req, res) => {
  const { request_id } = req.body;
  const file = req.file;
  try {
    await pool.query(
      'INSERT INTO documents (request_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
      [request_id, file.originalname, file.path, file.mimetype, file.size]
    );
    res.json({ message: 'Document uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
