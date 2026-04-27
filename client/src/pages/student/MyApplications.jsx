import { useEffect, useState, useCallback } from 'react';
import { applicationAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Pagination from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/Skeleton';
import { STATUS_COLORS, STATUS_LABELS, formatDate, formatSalary, timeAgo } from '../../utils/helpers';
import {
  HiClipboardList, HiChevronDown, HiChevronUp, HiChat,
  HiCalendar, HiLocationMarker, HiFilter
} from 'react-icons/hi';

const statusOptions = ['all', 'applied', 'under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected'];

const AppCard = ({ app }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card hover:shadow-glass-lg transition-all duration-200">
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="font-black text-primary-600 text-lg">{app.job?.company?.charAt(0) || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-surface-900">{app.job?.title}</h3>
                <p className="text-surface-500 text-sm">{app.job?.company} • {app.job?.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_COLORS[app.status]}`}>
                  {STATUS_LABELS[app.status]}
                </span>
                {expanded ? <HiChevronUp className="w-4 h-4 text-surface-400" /> : <HiChevronDown className="w-4 h-4 text-surface-400" />}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-surface-400">
              <span>Applied {timeAgo(app.createdAt)}</span>
              <span>•</span>
              <span>{app.job?.type}</span>
              {app.job?.salary && <><span>•</span><span className="text-emerald-600 font-medium">{formatSalary(app.job.salary)}</span></>}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-surface-100 pt-4 space-y-4 animate-slide-down">
          {/* Status Timeline */}
          <div>
            <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Application Timeline</p>
            <div className="space-y-2">
              {app.statusHistory?.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_COLORS[h.status]}`}>
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{STATUS_LABELS[h.status]}</p>
                    <p className="text-xs text-surface-400">{formatDate(h.changedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview details */}
          {app.interviewDate && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-2">
                <HiCalendar className="w-4 h-4" /> Interview Scheduled
              </p>
              <p className="text-sm text-indigo-700">
                <strong>Date:</strong> {formatDate(app.interviewDate)}
              </p>
              {app.interviewLocation && (
                <p className="text-sm text-indigo-700 flex items-center gap-1 mt-1">
                  <HiLocationMarker className="w-3.5 h-3.5" />
                  {app.interviewLocation}
                </p>
              )}
            </div>
          )}

          {/* Feedback */}
          {app.feedback?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HiChat className="w-3.5 h-3.5" /> Recruiter Feedback
              </p>
              {app.feedback.map((fb, i) => (
                <div key={i} className="p-3 bg-surface-50 rounded-xl text-sm text-surface-700 italic border border-surface-100">
                  "{fb.message}"
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchApplications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await applicationAPI.getMyApplications(params);
      setApplications(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchApplications(1); }, [fetchApplications]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">My Applications</h1>
          <p className="text-surface-500 text-sm">{pagination.total} total applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                statusFilter === s
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-surface-600 border border-surface-200 hover:border-primary-300'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Applications */}
        {loading ? (
          <TableSkeleton rows={5} cols={1} />
        ) : applications.length > 0 ? (
          <>
            <div className="space-y-3">
              {applications.map(app => <AppCard key={app._id} app={app} />)}
            </div>
            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={fetchApplications} />
          </>
        ) : (
          <div className="glass-card p-16 text-center">
            <HiClipboardList className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <h3 className="font-bold text-surface-700 mb-1">No applications yet</h3>
            <p className="text-surface-400 text-sm">Start by browsing jobs and submitting applications.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
