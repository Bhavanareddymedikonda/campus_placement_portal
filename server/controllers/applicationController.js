const Application = require('../models/Application');
const Job = require('../models/Job');
const Feedback = require('../models/Feedback');
const emailService = require('../utils/emailService');

// @desc    Apply for a job (student)
// @route   POST /api/applications
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Job is not accepting applications' });
    }

    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Check eligibility
    const student = req.user;
    if (job.requirements.minGPA && student.studentProfile.gpa < job.requirements.minGPA) {
      return res.status(400).json({
        success: false,
        message: `Minimum GPA requirement is ${job.requirements.minGPA}`,
      });
    }

    // Check duplicate
    const existing = await Application.findOne({ student: req.user.id, job: jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied for this job' });
    }

    const application = await Application.create({
      student: req.user.id,
      job: jobId,
      resume: req.user.studentProfile?.resume || '',
      coverLetter,
      statusHistory: [{ status: 'applied', changedBy: req.user.id }],
    });

    // Update applicant count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already applied for this job' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/my-applications
exports.getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { student: req.user.id };
    if (status) query.status = status;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: 'job',
        populate: { path: 'recruiter', select: 'name recruiterProfile' },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get application details by ID
// @route   GET /api/applications/:id
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email studentProfile')
      .populate({ path: 'job', populate: { path: 'recruiter', select: 'name recruiterProfile' } });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin' && application.student._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get applicant resume URL
// @route   GET /api/applications/:id/resume
exports.getApplicationResume = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email studentProfile')
      .populate('job', 'recruiter');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const isOwner = application.student._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = application.job.recruiter.toString() === req.user.id;

    if (!isOwner && !isAdmin && !isRecruiter) {
      return res.status(403).json({ success: false, message: 'Not authorized to view resume' });
    }

    let resumeUrl = application.resume || application.student.studentProfile?.resume || '';
    if (!resumeUrl) {
      return res.status(404).json({ success: false, message: 'Resume not available' });
    }

    if (resumeUrl.startsWith('/')) {
      resumeUrl = `${req.protocol}://${req.get('host')}${resumeUrl}`;
    }

    res.json({ success: true, data: { resume: resumeUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get applicants for a job (recruiter)
// @route   GET /api/applications/job/:jobId
exports.getJobApplicants = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const query = { job: req.params.jobId };
    if (status) query.status = status;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('student', 'name email studentProfile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, interviewDate, interviewLocation } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title recruiter');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id,
    });

    if (status === 'interview-scheduled' && interviewDate) {
      application.interviewDate = interviewDate;
      application.interviewLocation = interviewLocation || '';
      emailService.sendInterviewScheduled(
        application.student.email,
        application.job.title,
        interviewDate,
        interviewLocation
      );
    }

    emailService.sendApplicationUpdate(
      application.student.email,
      application.job.title,
      status
    );

    await application.save();

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status by recruiter with body id
// @route   PUT /api/recruiter/application/status
exports.updateApplicationStatusByBody = async (req, res) => {
  req.params.id = req.body.id;
  return exports.updateApplicationStatus(req, res);
};

// @desc    Add feedback to application (recruiter)
// @route   POST /api/applications/:id/feedback
exports.addFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title recruiter');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.feedback.push({
      from: req.user.id,
      message,
      createdAt: new Date(),
    });

    await application.save();

    // Also save to Feedback collection
    await Feedback.create({
      from: req.user.id,
      to: application.student._id,
      application: application._id,
      message,
      rating,
    });

    res.json({
      success: true,
      message: 'Feedback added',
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all applications (admin)
// @route   GET /api/applications
exports.getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('student', 'name email studentProfile')
      .populate({
        path: 'job',
        populate: { path: 'recruiter', select: 'name recruiterProfile' },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
