const express = require('express');
const { getDistricts, getDistrictById, createDistrict, updateDistrict, deleteDistrict } = require('../controllers/districtController');

const router = express.Router();

router.get('/', getDistricts);
router.get('/:id', getDistrictById);
router.post('/', createDistrict);
router.put('/:id', updateDistrict);
router.delete('/:id', deleteDistrict);

module.exports = router;
