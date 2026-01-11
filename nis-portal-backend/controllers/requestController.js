const pool = require('../config/db');



/**
 * CREATE REQUEST
 */
exports.createRequest = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const {
      first_name,
      last_name,
      dob,
      national_id,
      target_country_id,
      benefit_type_id
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !dob ||
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
        INSERT INTO claimants (first_name, last_name, dob, national_id)
        VALUES (?, ?, ?, ?)
        `,
        [first_name, last_name, dob, national_id]
      );
      claimantId = claimant.insertId;
    }

    // Create request
    const [request] = await conn.query(
      `
      INSERT INTO requests (
        claimant_id,
        target_country_id,
        benefit_type_id,
        status
      )
      VALUES (?, ?, ?, 'Pending')
      `,
      [claimantId, target_country_id, benefit_type_id]
    );

    await conn.commit();

    res.status(201).json({
      message: "Request created successfully",
      request_id: request.insertId
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
    // Try to include assigned user's name if schema supports assigned_user_id
    try {
      const [rows] = await pool.query(`
        SELECT
          r.request_id,
          r.status,
          r.created_at,
          c.first_name,
          c.last_name,
          c.dob,
          c.national_id,
          r.target_country_id,
          r.benefit_type_id,
          CONCAT(u.first_name, ' ', u.last_name) AS assigned_to
        FROM requests r
        JOIN claimants c ON r.claimant_id = c.claimant_id
        LEFT JOIN users u ON r.assigned_user_id = u.id
        ORDER BY r.created_at DESC
      `);
      return res.json(rows);
    } catch (innerErr) {
      // If the schema doesn't have assigned_user_id or users table, fall back to simple list
      if (innerErr && innerErr.code && innerErr.code === 'ER_BAD_FIELD_ERROR') {
        const [rows] = await pool.query(`
          SELECT
            r.request_id,
            r.status,
            r.created_at,
            c.first_name,
            c.last_name,
            c.dob,
            c.national_id,
            r.target_country_id,
            r.benefit_type_id
          FROM requests r
          JOIN claimants c ON r.claimant_id = c.claimant_id
          ORDER BY r.created_at DESC
        `);
        return res.json(rows);
      }
      throw innerErr;
    }
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

    const allowed = ['Pending', 'Responded', 'Closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      'UPDATE requests SET status = ? WHERE request_id = ?',
      [status, id]
    );

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Status updated', request_id: id, status });
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
    // Try to include assigned user name if schema supports assigned_user_id
    let row;
    try {
      const [rows] = await pool.query(`
        SELECT
          r.request_id,
          r.status,
          r.created_at,
          c.first_name,
          c.last_name,
          c.dob,
          c.national_id,
          r.target_country_id,
          r.benefit_type_id,
          CONCAT(u.first_name, ' ', u.last_name) AS assigned_to
        FROM requests r
        JOIN claimants c ON r.claimant_id = c.claimant_id
        LEFT JOIN users u ON r.assigned_user_id = u.id
        WHERE r.request_id = ?
        LIMIT 1
      `, [id]);

      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Request not found' });
      row = rows[0];
    } catch (innerErr) {
      if (innerErr && innerErr.code && innerErr.code === 'ER_BAD_FIELD_ERROR') {
        const [rows] = await pool.query(`
          SELECT
            r.request_id,
            r.status,
            r.created_at,
            c.first_name,
            c.last_name,
            c.dob,
            c.national_id,
            r.target_country_id,
            r.benefit_type_id
          FROM requests r
          JOIN claimants c ON r.claimant_id = c.claimant_id
          WHERE r.request_id = ?
          LIMIT 1
        `, [id]);

        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Request not found' });
        row = rows[0];
      } else {
        throw innerErr;
      }
    }

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