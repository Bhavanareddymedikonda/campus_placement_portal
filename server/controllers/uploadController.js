const User = require('../models/User');

// @desc    Upload resume (student)
// @route   POST /api/upload/resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const resumePath = `/uploads/resumes/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user.id, {
      'studentProfile.resume': resumePath,
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { resumePath },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
