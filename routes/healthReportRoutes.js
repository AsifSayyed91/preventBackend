const express = require('express');
const router = express.Router();
const healthReportController = require('../controllers/healthReportController');

router.post('/save', healthReportController.saveHealthReport);
router.get('/:patientId', healthReportController.getHealthReport);

module.exports = router;
