const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/resume', protect, authorize('student'), upload.single('resume'), uploadResume);

module.exports = router;
