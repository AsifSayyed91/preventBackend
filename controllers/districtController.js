const pool = require('../config/db');

const getDistricts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM districts');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDistrictById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM districts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createDistrict = async (req, res) => {
  const { name, state_id, district_code } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO districts (name, state_id, district_code) VALUES ($1, $2, $3) RETURNING *',
      [name, state_id, district_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDistrict = async (req, res) => {
  const { id } = req.params;
  const { name, state_id, district_code } = req.body;
  try {
    const result = await pool.query(
      'UPDATE districts SET name = $1, state_id = $2, district_code = $3 WHERE id = $4 RETURNING *',
      [name, state_id, district_code, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDistrict = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM districts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDistricts, getDistrictById, createDistrict, updateDistrict, deleteDistrict };
