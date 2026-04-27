import { useEffect, useState, useCallback } from 'react';
import { jobAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { STATUS_COLORS, STATUS_LABELS, formatDate, formatSalary } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiBriefcase, HiCheck, HiX, HiEye, HiFilter } from 'react-icons/hi';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await jobAPI.getAll(params);
      setJobs(data.data);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleApprove = async (job, status) => {
    try {
      await jobAPI.approve(job._id, status);
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status } : j));
      toast.success(`Job ${status}!`);
      setActionModal(null);
      setSelectedJob(null);
    } catch { toast.error(`Failed to ${status} job`); }
  };

  const statusTabs = ['', 'pending', 'approved', 'rejected'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Manage Job Postings</h1>
          <p className="text-surface-500 text-sm">Review and approve job postings from recruiters</p>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === s ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-300'
              }`}>
              {s === '' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? <TableSkeleton rows={6} cols={5} /> : jobs.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="table-header">Job</th>
                  <th className="table-header hidden md:table-cell">Company / Recruiter</th>
                  <th className="table-header hidden lg:table-cell">Salary</th>
                  <th className="table-header hidden lg:table-cell">Deadline</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="table-cell">
                      <p className="font-bold text-surface-900 text-sm">{job.title}</p>
                      <p className="text-surface-400 text-xs">{job.type} • {job.location}</p>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <p className="text-sm font-medium text-surface-700">{job.company}</p>
                      <p className="text-xs text-surface-400">{job.recruiter?.name}</p>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-sm text-emerald-600 font-semibold">{formatSalary(job.salary)}</td>
                    <td className="table-cell hidden lg:table-cell text-surface-400">{formatDate(job.deadline)}</td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_COLORS[job.status]}`}>{STATUS_LABELS[job.status]}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedJob(job)} title="View Details"
                          className="p-1.5 hover:bg-blue-50 text-surface-500 hover:text-blue-600 rounded-lg transition-colors">
                          <HiEye className="w-4 h-4" />
                        </button>
                        {job.status === 'pending' && (
                          <>
                            <button onClick={() => setActionModal({ job, action: 'approved' })} title="Approve"
                              className="p-1.5 hover:bg-emerald-50 text-surface-500 hover:text-emerald-600 rounded-lg transition-colors">
                              <HiCheck className="w-4 h-4" />
                            </button>
                            <button onClick={() => setActionModal({ job, action: 'rejected' })} title="Reject"
                              className="p-1.5 hover:bg-red-50 text-surface-500 hover:text-danger-600 rounded-lg transition-colors">
                              <HiX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {job.status === 'approved' && (
                          <button onClick={() => setActionModal({ job, action: 'rejected' })} title="Reject"
                            className="p-1.5 hover:bg-red-50 text-surface-500 hover:text-danger-600 rounded-lg transition-colors">
                            <HiX className="w-4 h-4" />
                          </button>
                        )}
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
            <p className="font-bold text-surface-700">No {statusFilter || ''} jobs found</p>
          </div>
        )}

        {/* Job Detail Modal */}
        <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.title} maxWidth="max-w-2xl">
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-surface-400">Company:</span> <span className="font-semibold">{selectedJob.company}</span></div>
                <div><span className="text-surface-400">Type:</span> <span className="font-semibold capitalize">{selectedJob.type}</span></div>
                <div><span className="text-surface-400">Location:</span> <span className="font-semibold">{selectedJob.location}</span></div>
                <div><span className="text-surface-400">Salary:</span> <span className="font-semibold text-emerald-600">{formatSalary(selectedJob.salary)}</span></div>
                <div><span className="text-surface-400">Min GPA:</span> <span className="font-semibold">{selectedJob.requirements?.minGPA || 'Any'}</span></div>
                <div><span className="text-surface-400">Openings:</span> <span className="font-semibold">{selectedJob.openings}</span></div>
                <div><span className="text-surface-400">Deadline:</span> <span className="font-semibold">{formatDate(selectedJob.deadline)}</span></div>
              </div>
              <div>
                <p className="text-surface-400 text-xs font-bold uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-surface-700 leading-relaxed">{selectedJob.description}</p>
              </div>
              {selectedJob.requirements?.skills?.length > 0 && (
                <div>
                  <p className="text-surface-400 text-xs font-bold uppercase tracking-wider mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requirements.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg border border-primary-100">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedJob.status === 'pending' && (
                <div className="flex gap-3 pt-2 border-t border-surface-100">
                  <button onClick={() => handleApprove(selectedJob, 'rejected')} className="btn-danger flex-1 flex items-center justify-center gap-2">
                    <HiX className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => handleApprove(selectedJob, 'approved')} className="btn-success flex-1 flex items-center justify-center gap-2">
                    <HiCheck className="w-4 h-4" /> Approve
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Confirm Action Modal */}
        <Modal isOpen={!!actionModal} onClose={() => setActionModal(null)} title={`${actionModal?.action === 'approved' ? 'Approve' : 'Reject'} Job`}>
          <p className="text-surface-600 mb-6">
            Are you sure you want to <strong>{actionModal?.action === 'approved' ? 'approve' : 'reject'}</strong> the job posting "{actionModal?.job?.title}"?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setActionModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={() => handleApprove(actionModal.job, actionModal.action)}
              className={`flex-1 ${actionModal?.action === 'approved' ? 'btn-success' : 'btn-danger'}`}
            >
              {actionModal?.action === 'approved' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;
