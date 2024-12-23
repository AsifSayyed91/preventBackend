const pool = require('../config/db');

// Get states and districts
exports.getStatesAndDistricts = async (req, res) => {
  try {
    const statesQuery = `
      SELECT s.id AS state_id, s.name AS state_name, d.id AS district_id, d.name AS district_name
      FROM states s
      LEFT JOIN districts d ON s.id = d.state_id
      ORDER BY s.id, d.id;
    `;
    const result = await pool.query(statesQuery);

    const data = result.rows.reduce((acc, row) => {
      const state = acc.find((s) => s.id === row.state_id);
      if (state) {
        state.districts.push({ id: row.district_id, name: row.district_name });
      } else {
        acc.push({
          id: row.state_id,
          name: row.state_name,
          districts: row.district_id ? [{ id: row.district_id, name: row.district_name }] : [],
        });
      }
      return acc;
    }, []);

    res.status(200).json({ states: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
