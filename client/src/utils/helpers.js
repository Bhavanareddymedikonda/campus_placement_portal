export const STATUS_COLORS = {
  'applied': 'badge-applied',
  'under-review': 'badge-under-review',
  'shortlisted': 'badge-shortlisted',
  'interview-scheduled': 'badge-interview-scheduled',
  'selected': 'badge-selected',
  'rejected': 'badge-rejected',
  'pending': 'badge-pending',
  'approved': 'badge-approved',
  'closed': 'badge-rejected',
};

export const STATUS_LABELS = {
  'applied': 'Applied',
  'under-review': 'Under Review',
  'shortlisted': 'Shortlisted',
  'interview-scheduled': 'Interview Scheduled',
  'selected': 'Selected',
  'rejected': 'Rejected',
  'pending': 'Pending',
  'approved': 'Approved',
  'closed': 'Closed',
};

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
];

export const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
  const format = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  if (salary.min && salary.max) return `${format(salary.min)} - ${format(salary.max)}`;
  if (salary.min) return `From ${format(salary.min)}`;
  return `Up to ${format(salary.max)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};
