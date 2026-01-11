const pool = require('../config/db');

// Status mapping between DB enum values (UPPERCASE) and frontend-friendly labels
const STATUS_MAP = {
  'PENDING': 'Pending',
  'IN_PROGRESS': 'In Progress',
  'AWAITING_RESPONSE': 'Awaiting Response',
  'RESPONDED': 'Responded',
  'CLOSED': 'Closed',
  'CANCELLED': 'Cancelled'
};

function humanizeStatus(s) {
  if (!s && s !== '') return s;
  const up = String(s).toUpperCase();
  return STATUS_MAP[up] || (up.charAt(0) + up.slice(1).toLowerCase());
}

function normalizeStatus(input) {
  if (!input && input !== '') return input;
  const up = String(input).toUpperCase();
  if (Object.prototype.hasOwnProperty.call(STATUS_MAP, up)) return up;
  return up;
}

async function columnExists(columnName) {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requests' AND COLUMN_NAME = ?",
      [columnName]
    );
    return rows && rows[0] && Number(rows[0].c) > 0;
  } catch (e) {
    return false;
  }
}



/**
 * CREATE REQUEST
 */
exports.createRequest = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      national_id,
      target_country_id,
      benefit_type_id,
      employment_period
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !date_of_birth ||
      !national_id ||
      !target_country_id ||
      !benefit_type_id
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await conn.beginTransaction();

    // Check if claimant already exists
    let claimantId;
    const [existing] = await conn.query(
      "SELECT claimant_id FROM claimants WHERE national_id = ?",
      [national_id]
    );

    if (existing.length > 0) {
      claimantId = existing[0].claimant_id;
    } else {
      const [claimant] = await conn.query(
        `
        INSERT INTO claimants (first_name, last_name, date_of_birth, national_id)
        VALUES (?, ?, ?, ?)
        `,
        [first_name, last_name, date_of_birth, national_id]
      );
      claimantId = claimant.insertId;
    }

    // Determine requester and requesting country
    const requesterId = req.user ? req.user.user_id : null;
    let requestingCountryId = null;
    if (requesterId) {
      try {
        const [urows] = await conn.query('SELECT office_id FROM users WHERE user_id = ? LIMIT 1', [requesterId]);
        if (urows && urows.length > 0 && urows[0].office_id) {
          const [orows] = await conn.query('SELECT country_id FROM nis_office WHERE office_id = ? LIMIT 1', [urows[0].office_id]);
          if (orows && orows.length > 0) requestingCountryId = orows[0].country_id;
        }
      } catch (e) {
        requestingCountryId = null;
      }
    }
    if (!requestingCountryId) requestingCountryId = 1;

    // Build a unique request_number: {CC}-{YEAR}-{seq}
    let countryCode = 'GY';
    try {
      const [crow] = await conn.query('SELECT country_code FROM countries WHERE country_id = ? LIMIT 1', [target_country_id]);
      if (crow && crow.length > 0 && crow[0].country_code) countryCode = crow[0].country_code;
    } catch (e) {
      countryCode = 'GY';
    }
    const year = new Date().getFullYear();
    const likePattern = `${countryCode}-${year}-%`;
    const [countRows] = await conn.query('SELECT COUNT(*) as c FROM requests WHERE request_number LIKE ?', [likePattern]);
    const seq = (countRows && countRows[0] && countRows[0].c ? Number(countRows[0].c) : 0) + 1;
    const pad = (n, w=5) => String(n).padStart(w, '0');
    const requestNumber = `${countryCode}-${year}-${pad(seq)}`;

    // Create request (include description only if column exists)
    const hasDesc = await columnExists('description');
    if (hasDesc) {
      const [request] = await conn.query(
        `
        INSERT INTO requests (
          request_number,
          claimant_id,
          requester_id,
          requesting_country_id,
          target_country_id,
          benefit_type_id,
          employment_period,
          description,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `,
        [requestNumber, claimantId, requesterId, requestingCountryId, target_country_id, benefit_type_id, employment_period || null, req.body.additional_notes || null]
      );
      // attach request id for response
      req._newRequestInsertId = request.insertId;
    } else {
      const [request] = await conn.query(
        `
        INSERT INTO requests (
          request_number,
          claimant_id,
          requester_id,
          requesting_country_id,
          target_country_id,
          benefit_type_id,
          employment_period,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `,
        [requestNumber, claimantId, requesterId, requestingCountryId, target_country_id, benefit_type_id, employment_period || null]
      );
      req._newRequestInsertId = request.insertId;
    }

    await conn.commit();

    res.status(201).json({
      message: "Request created successfully",
      request_id: req._newRequestInsertId
    });

  } catch (err) {
    console.error('createRequest error:', err);
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * LIST REQUESTS
 */
exports.listRequests = async (req, res) => {
  try {
    // Build query dynamically to include description only if the column exists
    const hasDesc = await columnExists('description');
    const descSelect = hasDesc ? 'r.description AS description,' : 'NULL AS description,';
    const q = `
      SELECT
        r.request_id,
        r.status,
        r.created_at,
        c.first_name,
        c.last_name,
        c.date_of_birth,
        c.national_id,
        ${descSelect}
        r.target_country_id,
        r.benefit_type_id,
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_to
      FROM requests r
      JOIN claimants c ON r.claimant_id = c.claimant_id
      LEFT JOIN users u ON r.assigned_user_id = u.user_id
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.query(q);
    rows.forEach(row => { row.status = humanizeStatus(row.status); });
    return res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE REQUEST (status)
 */
exports.updateRequest = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing id or status' });
    }

    const allowed = ['PENDING', 'RESPONDED', 'CLOSED'];
    const norm = normalizeStatus(status);
    if (!allowed.includes(norm)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      'UPDATE requests SET status = ? WHERE request_id = ?',
      [norm, id]
    );

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Status updated', request_id: id, status: humanizeStatus(norm) });
  } catch (err) {
    console.error('updateRequest error:', err);
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * GET single request
 */
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    // Build query dynamically to include description only if the column exists
    const hasDesc = await columnExists('description');
    const descSelect = hasDesc ? 'r.description AS description,' : 'NULL AS description,';
    const q = `
      SELECT
        r.request_id,
        r.status,
        r.created_at,
        c.first_name,
        c.last_name,
        c.date_of_birth,
        c.national_id,
        ${descSelect}
        r.target_country_id,
        r.benefit_type_id,
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_to
      FROM requests r
      JOIN claimants c ON r.claimant_id = c.claimant_id
      LEFT JOIN users u ON r.assigned_user_id = u.user_id
      WHERE r.request_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(q, [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    const row = rows[0];
    row.status = humanizeStatus(row.status);

    // Attach benefit type metadata (fallback to simple mapping)
    const benefitTypes = [
      { id: 1, name: 'Old Age Pension', description: 'Pension paid to qualifying elderly contributors.' },
      { id: 2, name: 'Survivors Benefit', description: 'Benefits paid to survivors of a deceased contributor.' },
      { id: 3, name: 'Invalidity Benefit', description: 'Support for contributors with permanent disability.' },
      { id: 4, name: 'Other', description: 'Other benefit categories.' },
    ];

    const bt = benefitTypes.find((b) => String(b.id) === String(row.benefit_type_id));
    row.benefit_type = bt || { id: row.benefit_type_id, name: String(row.benefit_type_id), description: '' };

    res.json(row);
  } catch (err) {
    console.error('getRequest error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * ASSIGN REQUEST TO USER
 */
exports.assignRequest = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!id || typeof user_id === 'undefined') {
      return res.status(400).json({ error: 'Missing id or user_id' });
    }

    await conn.beginTransaction();

    // ensure the user exists
    const [urows] = await conn.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
    if (!urows || urows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'User to assign not found' });
    }

    const [result] = await conn.query(
      'UPDATE requests SET assigned_user_id = ?, assigned_to = ? WHERE request_id = ?',
      [user_id, user_id, id]
    );

    // Optional: create an audit log entry
    try {
      await conn.query(
        'INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
        [req.user ? req.user.user_id : null, 'ASSIGNMENT', 'REQUEST', id, 'Assigned to user_id=' + String(user_id)]
      );
    } catch (e) {
      // ignore audit failures
    }

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Request assigned', request_id: id, assigned_user_id: user_id });
  } catch (err) {
    console.error('assignRequest error:', err);
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};