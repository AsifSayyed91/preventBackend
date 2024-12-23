const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationsController');

// Routes
router.get('/states-and-districts', locationController.getStatesAndDistricts);

module.exports = router;
