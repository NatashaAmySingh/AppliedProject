const pool = require('../config/db');

exports.uploadDocument = async (req, res) => {
  // support either single file (req.file) or multiple (req.files)
  const files = req.files || (req.file ? [req.file] : []);
  const requestId = req.body.requestId || req.body.request_id || req.body.requestId;
  const userId = req.user ? req.user.user_id : null;

  if (!requestId) return res.status(400).json({ error: 'Missing request id' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const file of files) {
      await conn.query(
        'INSERT INTO documents (request_id, file_name, file_path, file_type, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
        [requestId, file.originalname, file.path, file.mimetype, file.size, userId]
      );
    }
    await conn.commit();
    res.json({ message: 'Document(s) uploaded successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};
