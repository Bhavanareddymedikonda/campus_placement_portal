const express = require('express');
const router = express.Router();
const {
  applyForJob, getMyApplications, getJobApplicants,
  updateApplicationStatus, addFeedback, getAllApplications,
  getApplicationById, getApplicationResume, updateApplicationStatusByBody,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), applyForJob);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.get('/recruiter/applicants/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.get('/:id/resume', protect, authorize('student', 'recruiter', 'admin'), getApplicationResume);
router.get('/:id', protect, authorize('student', 'recruiter', 'admin'), getApplicationById);
router.get('/recruiter/application/:id', protect, authorize('recruiter', 'admin'), getApplicationById);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.put('/recruiter/application/status', protect, authorize('recruiter', 'admin'), updateApplicationStatusByBody);
router.post('/:id/feedback', protect, authorize('recruiter', 'admin'), addFeedback);
router.get('/', protect, authorize('admin'), getAllApplications);

module.exports = router;
