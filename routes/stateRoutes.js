const express = require('express');
const { getStates, getStateById, createState, updateState, deleteState } = require('../controllers/stateController');

const router = express.Router();

router.get('/', getStates);
router.get('/:id', getStateById);
router.post('/', createState);
router.put('/:id', updateState);
router.delete('/:id', deleteState);

module.exports = router;
