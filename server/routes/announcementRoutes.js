const express = require('express');
const router = express.Router();
const {
  createAnnouncement, getAnnouncements,
  updateAnnouncement, deleteAnnouncement, announcementValidation,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/', protect, getAnnouncements);
router.post('/', protect, authorize('admin'), announcementValidation, validate, createAnnouncement);
router.put('/:id', protect, authorize('admin'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

module.exports = router;
