const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, getUserById, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { getJobs, approveJob, deleteJob } = require('../controllers/jobController');
const { createAnnouncement } = require('../controllers/announcementController');
const { getDashboardStats } = require('../controllers/analyticsController');

// Admin-only endpoints
router.use(protect, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Jobs management
router.get('/jobs', getJobs);
router.put('/jobs/:id/approve', approveJob);
router.delete('/jobs/:id', deleteJob);

// Announcements
router.post('/announcements', createAnnouncement);

// Analytics
router.get('/analytics', getDashboardStats);

module.exports = router;
