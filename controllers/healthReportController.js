const pool = require('../config/db'); // PostgreSQL connection

exports.saveHealthReport = async (req, res) => {
    const {
      patientId,
      bloodPressure,
      pulse,
      spO2,
      temperature,
      sugar,
      bmi,
      bmr,
      bodyFat,
      fatFreeBodyWeight,
      visceralFat,
      bodyWater,
      skeletalMuscle,
      subcutaneousFat,
      muscleMass,
      boneMass,
      protein,
      hemoglobin,
      reportPdf
    } = req.body;
  

  
    try {
      const result = await pool.query(
        `INSERT INTO health_reports (
          patient_id, blood_pressure, pulse, sp_o2, temperature, sugar, bmi, bmr,
          body_fat, fat_free_body_weight, visceral_fat, body_water, skeletal_muscle,
          subcutaneous_fat, muscle_mass, bone_mass, protein, hemoglobin, report_pdf
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        RETURNING *`,
        [
          patientId,        
          bloodPressure,    
          pulse,            
          spO2,             
          temperature,      
          sugar,            
          bmi,              
          bmr,              
          bodyFat,          
          fatFreeBodyWeight, 
          visceralFat,       
          bodyWater,         
          skeletalMuscle,    
          subcutaneousFat,   
          muscleMass,        
          boneMass,          
          protein,           
          hemoglobin,        
          reportPdf          
        ]
      );
  
      res.json({ success: true, message: "Health report saved", report: result.rows[0] });
    } catch (error) {
    
      res.status(500).json({ success: false, message: "Server error" });
    }
  };


  exports.getHealthReport = async (req, res) => {
    const { patientId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM health_reports 
             WHERE patient_id = $1 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [patientId]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, report: result.rows[0] });
        } else {
            res.json({ success: false, message: "No report found" });
        }

    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

  
  

