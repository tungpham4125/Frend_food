const express = require('express');
const { register, login, getAllUsers, deleteUser } = require('../controllers/authController');
const { protect, adminOrStaff } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', protect, adminOrStaff, getAllUsers);
router.delete('/:id', protect, adminOrStaff, deleteUser);

module.exports = router;
