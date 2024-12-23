const express = require("express");
const { registerPatient, getPatients, updatePatientStatus } = require("../controllers/patientController");
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register patient
router.post("/patient-register", authMiddleware, registerPatient);

// Get patients
router.get("/patients", authMiddleware, getPatients);
router.post('/update-status', updatePatientStatus);

module.exports = router;
