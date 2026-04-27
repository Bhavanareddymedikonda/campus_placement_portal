import { useEffect, useState, useCallback } from 'react';
import { jobAPI, applicationAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { STATUS_COLORS, STATUS_LABELS, formatDate, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiBriefcase, HiUsers, HiEye, HiTrash, HiCheck,
  HiX, HiChat, HiCalendar
} from 'react-icons/hi';

// Applicant Modal
const ApplicantsModal = ({ job, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLoc, setInterviewLoc] = useState('');

  useEffect(() => {
    applicationAPI.getJobApplicants(job._id, { limit: 50 })
      .then(res => setApplicants(res.data.data))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [job._id]);

  const updateStatus = async () => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'interview-scheduled') {
        payload.interviewDate = interviewDate;
        payload.interviewLocation = interviewLoc;
      }
      await applicationAPI.updateStatus(statusModal._id, payload);
      setApplicants(prev => prev.map(a => a._id === statusModal._id ? { ...a, status: newStatus } : a));
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      setStatusModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const viewResume = useCallback(async (app) => {
    try {
      const response = await applicationAPI.getResume(app._id);
      const resumeURL = response.data.data.resume;
      if (!resumeURL) {
        return toast.error('No resume available for this applicant');
      }
      window.open(resumeURL, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const fallback = app.resume || app.student?.studentProfile?.resume;
      if (fallback) {
        const url = fallback.startsWith('/') ? `${window.location.origin}${fallback}` : fallback;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(err.response?.data?.message || 'Failed to load resume');
      }
    }
  }, []);

  const submitFeedback = async () => {
    if (!feedback.trim()) return toast.error('Feedback cannot be empty');
    try {
      await applicationAPI.addFeedback(feedbackModal._id, { message: feedback });
      toast.success('Feedback sent!');
      setFeedbackModal(null);
      setFeedback('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send feedback');
    }
  };

  const statusOptions = ['under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected'];

  return (
    <Modal isOpen={true} onClose={onClose} title={`Applicants — ${job.title}`} maxWidth="max-w-4xl">
      {loading ? <TableSkeleton rows={4} cols={3} /> : applicants.length === 0 ? (
        <div className="text-center py-8 text-surface-400">No applicants yet for this job.</div>
      ) : (
        <div className="space-y-3">
          {applicants.map(app => (
            <div key={app._id} className="border border-surface-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{app.student?.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-surface-900 text-sm">{app.student?.name}</p>
                  <p className="text-surface-400 text-xs">{app.student?.email} • GPA: {app.student?.studentProfile?.gpa}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {app.student?.studentProfile?.skills?.slice(0, 4).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-surface-100 text-surface-600 text-xs rounded">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${STATUS_COLORS[app.status]}`}>{STATUS_LABELS[app.status]}</span>
                  <button onClick={() => { setStatusModal(app); setNewStatus(app.status); }} title="Update Status"
                    className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors text-surface-500 hover:text-primary-600">
                    <HiCheck className="w-4 h-4" />
                  </button>
                  <button onClick={() => setFeedbackModal(app)} title="Send Feedback"
                    className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors text-surface-500 hover:text-primary-600">
                    <HiChat className="w-4 h-4" />
                  </button>
                  <button onClick={() => viewResume(app)} title="View Resume"
                    className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors text-surface-500 hover:text-primary-600">
                    <HiEye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {app.coverLetter && (
                <p className="mt-2 text-xs text-surface-500 italic bg-surface-50 p-2 rounded-lg line-clamp-2">"{app.coverLetter}"</p>
              )}
              <p className="text-xs text-surface-400 mt-1">Applied {timeAgo(app.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setStatusModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-glass-lg animate-scale-in">
            <h4 className="font-bold text-surface-900 mb-4">Update Status — {statusModal.student?.name}</h4>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field mb-3">
              {statusOptions.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            {newStatus === 'interview-scheduled' && (
              <div className="space-y-3">
                <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="input-field" />
                <input value={interviewLoc} onChange={e => setInterviewLoc(e.target.value)} placeholder="Interview location / Meet link" className="input-field" />
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStatusModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={updateStatus} className="btn-primary flex-1">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setFeedbackModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-glass-lg animate-scale-in">
            <h4 className="font-bold text-surface-900 mb-4">Send Feedback — {feedbackModal.student?.name}</h4>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} placeholder="Write your feedback..." className="input-field resize-none mb-3" />
            <div className="flex gap-3">
              <button onClick={() => setFeedbackModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitFeedback} className="btn-primary flex-1">Send</button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    jobAPI.getMyJobs()
      .then(res => setJobs(res.data.data))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await jobAPI.delete(deleteId);
      setJobs(prev => prev.filter(j => j._id !== deleteId));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete job'); }
    setDeleteId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-1">My Job Postings</h1>
            <p className="text-surface-500 text-sm">{jobs.length} postings total</p>
          </div>
        </div>

        {loading ? <TableSkeleton rows={4} cols={4} /> : jobs.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="table-header">Job</th>
                  <th className="table-header hidden md:table-cell">Type</th>
                  <th className="table-header hidden lg:table-cell">Deadline</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Applicants</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="table-cell">
                      <p className="font-bold text-surface-900 text-sm">{job.title}</p>
                      <p className="text-surface-400 text-xs">{job.location}</p>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="badge bg-surface-100 text-surface-600 border-surface-200">{job.type}</span>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-surface-500">{formatDate(job.deadline)}</td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_COLORS[job.status]}`}>{STATUS_LABELS[job.status]}</span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => setSelectedJob(job)}
                        className="flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:underline">
                        <HiUsers className="w-4 h-4" /> {job.applicantCount || 0}
                      </button>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedJob(job)}
                          className="p-1.5 hover:bg-primary-50 text-surface-500 hover:text-primary-600 rounded-lg transition-colors">
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(job._id)}
                          className="p-1.5 hover:bg-red-50 text-surface-500 hover:text-danger-600 rounded-lg transition-colors">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <HiBriefcase className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <h3 className="font-bold text-surface-700 mb-1">No jobs posted yet</h3>
            <p className="text-surface-400 text-sm">Start by posting your first job opening.</p>
          </div>
        )}

        {selectedJob && <ApplicantsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

        <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
          <p className="text-surface-600 mb-6">Are you sure you want to delete this job? All associated applications will also be removed.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete Job</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MyJobs;
