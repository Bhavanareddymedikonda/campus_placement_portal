import { useEffect, useState, useCallback } from 'react';
import { jobAPI, applicationAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, formatSalary, JOB_TYPES } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiSearch, HiFilter, HiBriefcase, HiLocationMarker,
  HiClock, HiCurrencyRupee, HiAcademicCap, HiX, HiCheck
} from 'react-icons/hi';

const JobCard = ({ job, onApply, appliedIds }) => {
  const alreadyApplied = appliedIds.includes(job._id);
  const isExpired = new Date(job.deadline) < new Date();

  return (
    <div className="glass-card p-6 hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="font-black text-primary-600 text-xl">{job.company.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-surface-900 text-base leading-tight">{job.title}</h3>
          <p className="text-surface-500 text-sm mt-0.5 font-medium">{job.company}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`badge ${job.type === 'internship' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              {job.type}
            </span>
            <span className="badge bg-surface-100 text-surface-600 border-surface-200">
              <HiLocationMarker className="w-3 h-3 mr-1" />{job.location}
            </span>
          </div>
        </div>
      </div>

      <p className="text-surface-500 text-sm leading-relaxed line-clamp-2">{job.description}</p>

      {/* Skills */}
      {job.requirements?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.requirements.skills.slice(0, 4).map(s => (
            <span key={s} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg border border-primary-100">{s}</span>
          ))}
          {job.requirements.skills.length > 4 && (
            <span className="px-2.5 py-1 bg-surface-100 text-surface-500 text-xs rounded-lg">+{job.requirements.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-surface-100">
        <div className="space-y-1">
          <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
            <HiCurrencyRupee className="w-4 h-4" />{formatSalary(job.salary)}
          </p>
          <div className="flex items-center gap-3 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <HiAcademicCap className="w-3.5 h-3.5" />Min GPA: {job.requirements?.minGPA || 'Any'}
            </span>
            <span className="flex items-center gap-1">
              <HiClock className="w-3.5 h-3.5" />Due: {formatDate(job.deadline)}
            </span>
          </div>
        </div>
        <button
          onClick={() => onApply(job)}
          disabled={alreadyApplied || isExpired}
          className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
            alreadyApplied
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
              : isExpired
              ? 'bg-surface-100 text-surface-400 cursor-not-allowed'
              : 'btn-primary py-2'
          }`}
        >
          {alreadyApplied ? (<><HiCheck className="w-4 h-4" />Applied</>) : isExpired ? 'Closed' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', type: '', minGPA: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9, status: 'approved' };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.type) params.type = filters.type;
      if (filters.minGPA) params.minGPA = filters.minGPA;
      const { data } = await jobAPI.getAll(params);
      setJobs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.type, filters.minGPA]);

  useEffect(() => { fetchJobs(1); }, [fetchJobs]);

  useEffect(() => {
    applicationAPI.getMyApplications({ limit: 100 }).then(res => {
      setAppliedIds(res.data.data.map(a => a.job?._id));
    }).catch(() => {});
  }, []);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationAPI.apply({ jobId: selectedJob._id, coverLetter });
      setAppliedIds(prev => [...prev, selectedJob._id]);
      toast.success('Application submitted successfully!');
      setSelectedJob(null);
      setCoverLetter('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const clearFilters = () => setFilters({ search: '', type: '', minGPA: '' });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Browse Jobs</h1>
          <p className="text-surface-500 text-sm">{pagination.total} opportunities available</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5">
            <HiSearch className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <input
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              placeholder="Search jobs, companies..."
              className="bg-transparent outline-none text-sm flex-1 text-surface-900 placeholder-surface-400"
            />
            {filters.search && <button onClick={() => setFilters(p => ({ ...p, search: '' }))}><HiX className="w-4 h-4 text-surface-400" /></button>}
          </div>

          <select
            value={filters.type}
            onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
            className="input-field py-2.5 w-auto min-w-[140px]"
          >
            <option value="">All Types</option>
            {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <select
            value={filters.minGPA}
            onChange={e => setFilters(p => ({ ...p, minGPA: e.target.value }))}
            className="input-field py-2.5 w-auto min-w-[120px]"
          >
            <option value="">Any GPA</option>
            {[6, 7, 7.5, 8, 8.5, 9].map(g => <option key={g} value={g}>≥ {g}</option>)}
          </select>

          {(filters.search || filters.type || filters.minGPA) && (
            <button onClick={clearFilters} className="btn-secondary py-2.5 text-sm flex items-center gap-2">
              <HiX className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(9).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <JobCard key={job._id} job={job} onApply={setSelectedJob} appliedIds={appliedIds} />
              ))}
            </div>
            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={fetchJobs} />
          </>
        ) : (
          <div className="glass-card p-16 text-center">
            <HiBriefcase className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <h3 className="font-bold text-surface-700 mb-1">No jobs found</h3>
            <p className="text-surface-400 text-sm">Try adjusting your filters or check back later.</p>
          </div>
        )}

        {/* Apply Modal */}
        <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={`Apply: ${selectedJob?.title}`}>
          <div className="space-y-4">
            <div className="p-4 bg-surface-50 rounded-xl">
              <p className="font-bold text-surface-900">{selectedJob?.company}</p>
              <p className="text-surface-500 text-sm">{selectedJob?.location} • {selectedJob?.type}</p>
            </div>
            <div>
              <label className="input-label">Cover Letter (Optional)</label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Tell the recruiter why you're a great fit..."
                className="input-field resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-surface-400 text-right mt-1">{coverLetter.length}/2000</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setSelectedJob(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {applying ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : 'Submit Application'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default BrowseJobs;
