const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/matchingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/recommendations', protect, authorize('student'), getRecommendations);

module.exports = router;
