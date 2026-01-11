const express = require('express');
const app = express();
require('dotenv').config();
const PORT = 3000;
const cors = require('cors');
app.use(cors({
  origin: "http://127.0.0.1:8080",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/requests', require('./routes/requests'));
app.use('/documents', require('./routes/documents'));
app.use('/notifications', require('./routes/notifications'));
app.use('/audit', require('./routes/audit'));
app.use('/meta', require('./routes/meta'));


const pool = require('./config/db');
const fs = require('fs');

async function ensureUploadsDir() {
  const uploadsPath = path.join(__dirname, 'uploads');
  try {
    await fs.promises.access(uploadsPath);
  } catch (e) {
    await fs.promises.mkdir(uploadsPath, { recursive: true });
    console.log('Created uploads directory:', uploadsPath);
  }
}

async function ensureDescriptionColumn() {
  const conn = await pool.getConnection();
  try {
    const dbName = process.env.DB_NAME || conn.config.database || 'nis_portal';
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'requests' AND COLUMN_NAME = 'description'`,
      [dbName]
    );
    if (!cols || cols.length === 0) {
      console.log('Adding description column to requests table');
      await conn.query(`ALTER TABLE requests ADD COLUMN description TEXT NULL AFTER employment_period`);
    } else {
      // column exists
    }
  } catch (err) {
    console.error('ensureDescriptionColumn error:', err.message || err);
  } finally {
    conn.release();
  }
}

app.get('/', (req, res) => {
  res.json('Backend Is Operational');
});

(async () => {
  try {
    await ensureUploadsDir();
    await ensureDescriptionColumn();
  } catch (e) {
    console.error('Startup checks failed:', e);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
})();
