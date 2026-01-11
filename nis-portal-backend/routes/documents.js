const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// support multiple files under field name 'files' (authenticated)
router.post('/upload', authenticate, upload.array('files'), uploadDocument);

// list documents for a request (authenticated)
router.get('/request/:id', authenticate, async (req, res) => {
	const pool = require('../config/db');
	try {
		const [rows] = await pool.query('SELECT document_id, request_id, file_name, file_path, file_type, file_size, uploaded_by, uploaded_at FROM documents WHERE request_id = ? ORDER BY uploaded_at DESC', [req.params.id]);
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
