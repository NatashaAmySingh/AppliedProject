// Simple metadata controller returning static lists for countries and benefit types.
exports.getCountries = async (req, res) => {
  // In a real app these would come from the database.
  const countries = [
    { id: 1, name: 'Barbados - National Insurance Board' },
    { id: 2, name: 'Jamaica - National Insurance Scheme' },
    { id: 3, name: 'Trinidad & Tobago - National Insurance Board' },
    { id: 4, name: 'St. Lucia - National Insurance Corporation' },
    { id: 5, name: 'Grenada - National Insurance Scheme' },
    { id: 6, name: 'Belize - Social Security Board' },
    { id: 7, name: 'Antigua & Barbuda - Social Security Board' },
  ];
  res.json(countries);
};

exports.getBenefitTypes = async (req, res) => {
  const benefits = [
    { id: 1, name: 'Old Age Pension' },
    { id: 2, name: 'Survivors Benefit' },
    { id: 3, name: 'Invalidity Benefit' },
    { id: 4, name: 'Other' },
  ];
  res.json(benefits);
};

exports.getRoles = async (req, res) => {
  // read roles from DB if available
  try {
    const pool = require('../config/db');
    const [rows] = await pool.query('SELECT role_id, role_name FROM roles ORDER BY role_id');
    const roles = (rows || []).map(r => ({ id: r.role_id, name: r.role_name }));
    res.json(roles);
  } catch (err) {
    // fallback to a static list if DB not available
    res.json([
      { id: 1, name: 'System Admin' },
      { id: 2, name: 'Caricom Supervisor' },
      { id: 3, name: 'Caricom Clerk' },
      { id: 4, name: 'External Officer' },
    ]);
  }
};
