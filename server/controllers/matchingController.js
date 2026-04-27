const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get smart job recommendations for student
// @route   GET /api/matching/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const student = req.user;
    const studentSkills = student.studentProfile?.skills || [];
    const studentGPA = student.studentProfile?.gpa || 0;
    const studentBatch = student.studentProfile?.batch || '';

    // Get jobs the student hasn't applied for yet
    const appliedJobs = await Application.find({ student: student.id }).select('job');
    const appliedJobIds = appliedJobs.map(a => a.job);

    // Find eligible approved jobs
    const jobs = await Job.find({
      status: 'approved',
      _id: { $nin: appliedJobIds },
      deadline: { $gte: new Date() },
      'requirements.minGPA': { $lte: studentGPA || 10 },
    }).populate('recruiter', 'name recruiterProfile');

    // Score each job based on skill match
    const scoredJobs = jobs.map(job => {
      const requiredSkills = job.requirements?.skills || [];
      let score = 0;

      // Skill matching score (0-60 points)
      if (requiredSkills.length > 0 && studentSkills.length > 0) {
        const matchedSkills = studentSkills.filter(skill =>
          requiredSkills.some(req =>
            req.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(req.toLowerCase())
          )
        );
        score += (matchedSkills.length / requiredSkills.length) * 60;
      } else {
        score += 30; // Neutral score if no skills specified
      }

      // GPA bonus (0-20 points)
      if (job.requirements?.minGPA) {
        const gpaMargin = studentGPA - job.requirements.minGPA;
        score += Math.min(gpaMargin * 10, 20);
      } else {
        score += 10;
      }

      // Batch match bonus (0-20 points)
      const requiredBatches = job.requirements?.batch || [];
      if (requiredBatches.length === 0 || requiredBatches.includes(studentBatch)) {
        score += 20;
      }

      // Recency bonus
      const daysSincePosted = (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSincePosted < 7) score += 5;

      return {
        ...job.toObject(),
        matchScore: Math.round(Math.min(score, 100)),
      };
    });

    // Sort by match score descending
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: scoredJobs.slice(0, 20), // Top 20 recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
