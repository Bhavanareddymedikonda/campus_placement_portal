const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Get analytics dashboard data (admin)
// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications,
      selectedCount,
      rejectedCount,
      pendingJobs,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'selected' }),
      Application.countDocuments({ status: 'rejected' }),
      Job.countDocuments({ status: 'pending' }),
    ]);

    const successRate = totalApplications > 0
      ? ((selectedCount / totalApplications) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        totalApplications,
        totalPlacements: selectedCount,
        rejectedCount,
        pendingJobs,
        successRate: parseFloat(successRate),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get application status distribution
// @route   GET /api/analytics/applications-by-status
exports.getApplicationsByStatus = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const formatted = stats.map(s => ({
      status: s._id,
      count: s.count,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get company-wise placement stats
// @route   GET /api/analytics/company-stats
exports.getCompanyStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      { $unwind: '$jobDetails' },
      {
        $group: {
          _id: '$jobDetails.company',
          placements: { $sum: 1 },
        },
      },
      { $sort: { placements: -1 } },
      { $limit: 10 },
    ]);

    const formatted = stats.map(s => ({
      company: s._id,
      placements: s.placements,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly placement trends
// @route   GET /api/analytics/trends
exports.getPlacementTrends = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          applications: { $sum: 1 },
          selected: {
            $sum: { $cond: [{ $eq: ['$status', 'selected'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = trends.map(t => ({
      month: `${months[t._id.month - 1]} ${t._id.year}`,
      applications: t.applications,
      placements: t.selected,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/analytics/student-stats
exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [total, applied, underReview, shortlisted, interviewScheduled, selected, rejected] = await Promise.all([
      Application.countDocuments({ student: studentId }),
      Application.countDocuments({ student: studentId, status: 'applied' }),
      Application.countDocuments({ student: studentId, status: 'under-review' }),
      Application.countDocuments({ student: studentId, status: 'shortlisted' }),
      Application.countDocuments({ student: studentId, status: 'interview-scheduled' }),
      Application.countDocuments({ student: studentId, status: 'selected' }),
      Application.countDocuments({ student: studentId, status: 'rejected' }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        applied,
        underReview,
        shortlisted,
        interviewScheduled,
        selected,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter dashboard stats
// @route   GET /api/analytics/recruiter-stats
exports.getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ recruiter: recruiterId });
    const jobIds = jobs.map(j => j._id);

    const [totalApplications, selectedCount, pendingCount] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'selected' }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'applied' }),
    ]);

    res.json({
      success: true,
      data: {
        totalJobs: jobs.length,
        approvedJobs: jobs.filter(j => j.status === 'approved').length,
        pendingJobs: jobs.filter(j => j.status === 'pending').length,
        totalApplications,
        selectedCount,
        pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
