const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: 5000,
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['full-time', 'internship', 'part-time', 'contract'],
    default: 'full-time',
  },
  location: {
    type: String,
    default: 'Remote',
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },
  requirements: {
    minGPA: { type: Number, default: 0 },
    skills: [{ type: String }],
    batch: [{ type: String }],
    education: { type: String, default: '' },
  },
  responsibilities: [{ type: String }],
  perks: [{ type: String }],
  openings: {
    type: Number,
    default: 1,
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'closed'],
    default: 'pending',
  },
  applicantCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for search
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
