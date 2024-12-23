const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = 'your_jwt_secret'; // Replace with your secure secret key

// Register a user
exports.registerUser = async (req, res) => {
  const { name, email, phone, password, state_id, district_id } = req.body;

  // Check for missing fields
  const missingFields = [];
  if (!name) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!phone) missingFields.push("phone number");
  if (!password) missingFields.push("password");
  if (!state_id) missingFields.push("state ID");
  if (!district_id) missingFields.push("district ID");

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  try {
    // Generate partner code
    const generatePartnerCode = async (stateId, districtId) => {
      const stateQuery = "SELECT state_code FROM states WHERE id = $1";
      const districtQuery = "SELECT district_code FROM districts WHERE id = $1";

      const stateResult = await pool.query(stateQuery, [stateId]);
      const districtResult = await pool.query(districtQuery, [districtId]);

      if (!stateResult.rows.length || !districtResult.rows.length) {
        throw new Error("Invalid state or district ID");
      }

      const stateCode = stateResult.rows[0].state_code;
      const districtCode = districtResult.rows[0].district_code;

      const countQuery = "SELECT COUNT(*) AS count FROM users WHERE state_id = $1 AND district_id = $2";
      const countResult = await pool.query(countQuery, [stateId, districtId]);

      const count = parseInt(countResult.rows[0].count, 10) + 1;
      const formattedCount = String(count).padStart(4, "0");

      return `SP${stateCode}${districtCode}${formattedCount}`;
    };

    const partnerCode = await generatePartnerCode(state_id, district_id);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const query = `
      INSERT INTO users (name, email, phone_no, password, state_id, district_id, partner_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [
      name,
      email,
      phone,
      hashedPassword,
      state_id,
      district_id,
      partnerCode,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

// Login a user
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const query = `SELECT * FROM users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`;
//     const result = await pool.query(query, [email]);

//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials or inactive account' });
//     }

//     const user = result.rows[0];
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Generate a token (JWT)
//     const token = jwt.sign(
//       { id: user.id, email: user.email, partnerCode: user.partner_code },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: {
//         name: user.name,
//         partner_code: user.partner_code,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let query, user;
    // Check if the user is an SP
    query = `SELECT * FROM users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`;
    const spResult = await pool.query(query, [email]);

    if (spResult.rows.length > 0) {
      user = spResult.rows[0];
    } else {
      // Check if the user is an SSP
      query = `SELECT * FROM ssp_users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`;
      const sspResult = await pool.query(query, [email]);

      if (sspResult.rows.length > 0) {
        user = sspResult.rows[0];
        user.role = "SSP"; // Mark as SSP
      } else {
        return res.status(401).json({ error: "Invalid credentials or inactive account" });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a token
    const token = jwt.sign(
      { id: user.id, email: user.email, partnerCode: user.partner_code || user.sp_partner_code, role: user.role || "SP" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        partnerCode: user.partner_code || user.sp_partner_code,
        role: user.role || "SP",
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.registerSSPUser = async (req, res) => {
  const { name, email, phone, password, spPartnerCode } = req.body;

  if (!name || !email || !phone || !password || !spPartnerCode) {
    return res.status(400).json({
      error: "All fields (name, email, phone, password, and SP Partner Code) are required.",
    });
  }

  try {
    // Verify if SP exists
    const spQuery = "SELECT * FROM users WHERE partner_code = $1 AND is_active = TRUE AND is_deleted = FALSE";
    const spResult = await pool.query(spQuery, [spPartnerCode]);

    if (spResult.rows.length === 0) {
      return res.status(404).json({ error: "Invalid SP Partner Code." });
    }

    // Extract SP's number from the SP Partner Code (assuming the SP number is the last 4 digits of the partner code)
    const spNumber = spPartnerCode.slice(-4);

    // Count the number of SSPs already registered under this SP
    const sspCountQuery = "SELECT COUNT(*) AS count FROM ssp_users WHERE sp_partner_code = $1";
    const sspCountResult = await pool.query(sspCountQuery, [spPartnerCode]);

    const sspCount = parseInt(sspCountResult.rows[0].count, 10) + 1; // Increment by 1 for the new SSP
    const sspNumber = String(sspCount).padStart(2, "0"); // Ensure 2 digits for SSP number

    // Generate SSP code
    const sspCode = `SSP${spNumber}${sspNumber}`;

    // Hash the SSP password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert SSP user into the database
    const query = `
      INSERT INTO ssp_users (name, email, phone, password, sp_partner_code, ssp_code)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [name, email, phone, hashedPassword, spPartnerCode, sspCode];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "SSP user registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getSSPUser = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the middleware

    // Ensure userId exists
    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    // Query to fetch SSP user details
    const query = `
      SELECT 
        id, name, email, phone, sp_partner_code, ssp_code 
      FROM 
        ssp_users 
      WHERE 
        id = $1 AND is_deleted = FALSE AND is_active = TRUE
    `;

    const result = await pool.query(query, [userId]);

    // Check if the SSP user was found
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "SSP user not found" });
    }

    // Return the SSP user details
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching SSP user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSSPsForSP = async (req, res) => {
  try {
    // Ensure `partnerCode` is extracted correctly from `req.user`
    const { partnerCode } = req.user;

    if (!partnerCode) {
      console.error("Partner code missing in user object");
      return res.status(400).json({ error: "Partner code is required." });
    }

    // Query the database for SSP users under the SP
    const query = `
      SELECT * FROM ssp_users
      WHERE sp_partner_code = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [partnerCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No SSP users found for this partner." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching SSP users:", error.message);
    res.status(500).json({ error: "Failed to fetch SSP users." });
  }
};





// Logout a user
exports.logoutUser = async (req, res) => {
  // Invalidate the token by clearing it from the client
  res.status(200).json({ message: 'Logout successful' });
};

// Fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM users WHERE is_deleted = FALSE`;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific user details
exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the middleware

    // Ensure userId exists
    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }

    const query = `SELECT id, name, email, partner_code FROM users WHERE id = $1 AND is_deleted = FALSE`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: error.message });
  }
};



// Update a user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_no, state_id, district_id } = req.body;
  try {
    const query = `
      UPDATE users
      SET name = $1, email = $2, phone_no = $3, state_id = $4, district_id = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND is_deleted = FALSE RETURNING *`;
    const values = [name, email, phone_no, state_id, district_id, id];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Soft delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `UPDATE users SET is_deleted = TRUE WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
