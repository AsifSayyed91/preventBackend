const pool = require('../config/db');

const getStates = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM states');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStateById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM states WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createState = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO states (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateState = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query('UPDATE states SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteState = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM states WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStates, getStateById, createState, updateState, deleteState };
