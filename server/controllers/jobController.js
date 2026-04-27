const { body } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const emailService = require('../utils/emailService');

exports.jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('deadline').notEmpty().withMessage('Deadline is required'),
];

// @desc    Create job posting (recruiter)
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiter: req.user.id,
      company: req.body.company || req.user.recruiterProfile?.company,
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully. Awaiting admin approval.',
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all jobs (with filters & pagination)
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const {
      search, company, type, status = 'approved',
      minGPA, page = 1, limit = 12,
      sortBy = 'createdAt', order = 'desc',
    } = req.query;

    const query = {};

    // Students only see approved jobs, admin/recruiter can see all
    if (req.user?.role === 'admin') {
      if (status) query.status = status;
    } else if (req.user?.role === 'recruiter') {
      query.recruiter = req.user.id;
      if (status) query.status = status;
    } else {
      query.status = 'approved';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (company) query.company = { $regex: company, $options: 'i' };
    if (type) query.type = type;
    if (minGPA) query['requirements.minGPA'] = { $lte: parseFloat(minGPA) };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email recruiterProfile')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email recruiterProfile');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job (recruiter - own jobs)
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Job updated', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject job (admin)
// @route   PUT /api/jobs/:id/approve
exports.approveJob = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    const job = await Job.findById(req.params.id).populate('recruiter', 'email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.status = status;
    await job.save();

    // Send notification to recruiter
    emailService.sendJobApproval(job.recruiter.email, job.title, status === 'approved');

    res.json({
      success: true,
      message: `Job ${status} successfully`,
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter's jobs
// @route   GET /api/jobs/my-jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .sort({ createdAt: -1 });

    // Get applicant counts
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicantCount };
      })
    );

    res.json({ success: true, data: jobsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
