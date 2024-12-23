// const pool = require("../config/db");

// // Register Patient (Updated)
// exports.registerPatient = async (req, res) => {
//     const {
//       name, aadharNumber, mobile, abhaId, address, pinCode, dob, gender,
//       occupation, height, weight, nomineeName, nomineeDob, nomineeGender, nomineeRelationship,
//       createdBy,
//     } = req.body;
  
//     const role = req.user.role; // Assuming the role is now part of the authenticated user
  
//     try {
//       const query = `
//         INSERT INTO patients 
//         (name, aadhar_number, mobile, abha_id, address, pin_code, dob, gender, occupation, 
//         height, weight, nominee_name, nominee_dob, nominee_gender, nominee_relationship, created_by, role)
//         VALUES 
//         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
//         RETURNING *;
//       `;
//       const values = [
//         name, aadharNumber, mobile, abhaId, address, pinCode, dob, gender,
//         occupation, height, weight, nomineeName, nomineeDob, nomineeGender,
//         nomineeRelationship, createdBy, role
//       ];
//       const result = await pool.query(query, values);
  
//       res.status(201).json({ message: "Patient registered successfully", patient: result.rows[0] });
//     } catch (error) {
//       console.error("Error registering patient:", error.message);
//       res.status(500).json({ error: error.message });
//     }
//   };

const pool = require("../config/db");

exports.registerPatient = async (req, res) => {
  const {
    name, aadharNumber, mobile, abhaId, address, pinCode, dob, age, gender,
    occupation, height, weight, nomineeName, nomineeAadharNumber, nomineeDob,
    nomineeAge, nomineeGender, nomineeRelationship,
  } = req.body;

  const { id: createdBy, role } = req.user; // Extract ID and role from authenticated user

  try {
    const query = `
      INSERT INTO patients 
      (name, aadhar_number, mobile, abha_id, address, pin_code, dob, age, gender, occupation, 
      height, weight, nominee_name, nominee_aadhar_number, nominee_dob, nominee_age, 
      nominee_gender, nominee_relationship, created_by, role)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *;
    `;
    const values = [
      name, aadharNumber, mobile, abhaId, address, pinCode, dob, age, gender,
      occupation, height, weight, nomineeName, nomineeAadharNumber, nomineeDob,
      nomineeAge, nomineeGender, nomineeRelationship, createdBy, role
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Patient registered successfully",
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Error registering patient:", error.message);
    res.status(500).json({ error: error.message });
  }
};



  

// Get Patients (Updated)
// exports.getPatients = async (req, res) => {
//     const userId = req.user.id; // Assuming auth middleware adds user info
//     const role = req.user.role; // Use role from user
  
//     try {
//       let query;
//       let values;
  
//       // Fetch patients created by the logged-in user
//       if (role === "SP" || role === "SSP") {
//         query = `SELECT * FROM patients WHERE created_by = $1 AND role = $2`;
//         values = [userId, role];
//       } else {
//         return res.status(403).json({ error: "Unauthorized user role" });
//       }
  
//       const result = await pool.query(query, values);
//       console.log('Query Result:', result.rows);
  
//       res.status(200).json({ patients: result.rows });
//     } catch (error) {
//       console.error("Error fetching patients:", error.message);
//       res.status(500).json({ error: error.message });
//     }
//   };

// Get Patients
exports.getPatients = async (req, res) => {
    const { id: userId, role } = req.user; // Extract user ID and role
  
    try {
      if (role === "SP" || role === "SSP") {
        // Fetch patients linked to the logged-in user
        const query = `
          SELECT * FROM patients WHERE created_by = $1 AND role = $2
        `;
        const values = [userId, role];
  
        const result = await pool.query(query, values);
        console.log("Query Result:", result.rows);
  
        res.status(200).json({ patients: result.rows });
      } else {
        res.status(403).json({ error: "Unauthorized user role" });
      }
    } catch (error) {
      console.error("Error fetching patients:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update the patient status (isReportGenerated)
exports.updatePatientStatus = async (req, res) => {
  const { patientId } = req.body;

  try {
    const query = `
      UPDATE patients 
      SET is_report_generated = true
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [patientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json({
      message: "Patient status updated successfully",
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating patient status:", error.message);
    res.status(500).json({ error: error.message });
  }
};

