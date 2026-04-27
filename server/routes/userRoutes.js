const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateProfile, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/profile', protect, updateProfile);
router.get('/:id', protect, getUserById);
router.put('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
