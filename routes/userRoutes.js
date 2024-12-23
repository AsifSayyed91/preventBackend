const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Routes
router.post('/register', userController.registerUser);
router.post('/ssp-register', userController.registerSSPUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser); // Logout endpoint
router.get('/', userController.getAllUsers);
router.get("/user", authMiddleware, userController.getUser);
router.get("/sspuser", authMiddleware, userController.getSSPUser);
router.get('/ssps', authMiddleware, userController.getSSPsForSP);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
