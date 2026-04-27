const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getApplicationsByStatus,
  getCompanyStats, getPlacementTrends,
  getStudentStats, getRecruiterStats,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/applications-by-status', protect, authorize('admin'), getApplicationsByStatus);
router.get('/company-stats', protect, authorize('admin'), getCompanyStats);
router.get('/trends', protect, authorize('admin'), getPlacementTrends);
router.get('/student-stats', protect, authorize('student'), getStudentStats);
router.get('/recruiter-stats', protect, authorize('recruiter'), getRecruiterStats);

module.exports = router;
