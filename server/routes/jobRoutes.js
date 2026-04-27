const express = require('express');
const router = express.Router();
const {
  createJob, getJobs, getJobById, updateJob, deleteJob,
  approveJob, getMyJobs, jobValidation,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/', protect, getJobs);
router.get('/:id', protect, getJobById);
router.post('/', protect, authorize('recruiter'), jobValidation, validate, createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.put('/:id/approve', protect, authorize('admin'), approveJob);

module.exports = router;
