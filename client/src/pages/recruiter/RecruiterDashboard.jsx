import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, jobAPI, applicationAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import { STATUS_COLORS, STATUS_LABELS, timeAgo } from '../../utils/helpers';
import {
  HiBriefcase, HiUsers, HiCheckCircle, HiClock,
  HiArrowRight, HiPlus, HiEye
} from 'react-icons/hi';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          analyticsAPI.getRecruiterStats(),
          jobAPI.getMyJobs(),
        ]);
        setStats(statsRes.data.data);
        setMyJobs(jobsRes.data.data.slice(0, 5));

        if (jobsRes.data.data.length > 0) {
          const firstJobId = jobsRes.data.data[0]._id;
          const appRes = await applicationAPI.getJobApplicants(firstJobId, { limit: 5 });
          setRecentApps(appRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = stats ? [
    { label: 'Total Jobs Posted', value: stats.totalJobs, icon: HiBriefcase, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Total Applicants', value: stats.totalApplications, icon: HiUsers, color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { label: 'Candidates Hired', value: stats.selectedCount, icon: HiCheckCircle, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { label: 'Pending Review', value: stats.pendingCount, icon: HiClock, color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  ] : [];

  const viewResume = useCallback(async (app) => {
    try {
      const res = await applicationAPI.getResume(app._id);
      const resumeURL = res.data.data.resume || app.resume || app.student?.studentProfile?.resume;
      if (!resumeURL) {
        return toast.error('Resume not available');
      }
      const resolvedURL = resumeURL.startsWith('/') ? `${window.location.origin}${resumeURL}` : resumeURL;
      window.open(resolvedURL, '_blank', 'noopener,noreferrer');
    } catch (error) {
      const fallback = app.resume || app.student?.studentProfile?.resume;
      if (fallback) {
        const resolvedFallback = fallback.startsWith('/') ? `${window.location.origin}${fallback}` : fallback;
        window.open(resolvedFallback, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load resume');
      }
    }
  }, []);

  const loadApplicants = async (job) => {
    if (!job) return;
    setSelectedJob(job);
    setApplicantsError('');
    setApplicantsLoading(true);
    try {
      const res = await applicationAPI.getJobApplicants(job._id, { limit: 50 });
      setApplicants(res.data.data);
    } catch (error) {
      console.error(error);
      setApplicantsError(error.response?.data?.message || 'Unable to fetch applicants');
      setApplicants([]);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const updateApplicantStatus = async (applicationId, status) => {
    try {
      await applicationAPI.updateStatus(applicationId, { status });
      toast.success(`Application moved to ${status.replace('-', ' ')}`);
      if (selectedJob?._id) {
        await loadApplicants(selectedJob);
      }
      const appStats = await analyticsAPI.getRecruiterStats();
      setStats(appStats.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            <p className="text-emerald-200 text-sm font-medium mb-1">Recruiter Dashboard 👋</p>
            <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
            <p className="text-emerald-200 text-sm">{user?.recruiterProfile?.company} • {user?.recruiterProfile?.designation}</p>
            <div className="flex gap-3 mt-6">
              <Link to="/recruiter/post-job" className="px-5 py-2.5 bg-white text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2">
                <HiPlus className="w-4 h-4" /> Post New Job
              </Link>
              <Link to="/recruiter/my-jobs" className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30">
                View My Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-lg font-bold text-surface-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />) : statCards.map(({ label, value, icon, color }) => {
              const IconComponent = icon;
              return (
                <div key={label} className="stat-card">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-surface-900 mb-1">{value}</p>
                  <p className="text-sm font-semibold text-surface-500">{label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Recent Jobs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-surface-900">Recent Job Postings</h2>
              <Link to="/recruiter/my-jobs" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
                View all <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />) : myJobs.length > 0 ? (
                myJobs.map(job => (
                  <div key={job._id} className="glass-card p-4 flex items-center justify-between gap-3 hover:shadow-glass-lg transition-all">
                    <div className="min-w-0">
                      <p className="font-bold text-surface-900 text-sm truncate">{job.title}</p>
                      <p className="text-surface-400 text-xs mt-0.5">{job.applicantCount || 0} applicants • {timeAgo(job.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge ${STATUS_COLORS[job.status]}`}>{STATUS_LABELS[job.status]}</span>
                      <button
                        type="button"
                        onClick={() => loadApplicants(job)}
                        className="btn-secondary py-1 px-2 text-xs"
                      >
                        View Applicants
                      </button>
                      <Link to="/recruiter/my-jobs" className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
                        <HiEye className="w-4 h-4 text-surface-500" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-surface-500 text-sm">No jobs posted yet.</p>
                  <Link to="/recruiter/post-job" className="btn-primary mt-3 inline-block py-2 text-sm">Post Your First Job</Link>
                </div>
              )}
            </div>
          </div>

          {selectedJob && (
            <div className="glass-card p-4 border border-surface-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-surface-900">Applicants for: {selectedJob.title}</h3>
                <button type="button" onClick={() => setSelectedJob(null)} className="text-surface-500 hover:text-surface-700 text-sm">Close</button>
              </div>
              {applicantsLoading ? (
                <div className="space-y-2">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : applicantsError ? (
                <p className="text-danger-500">{applicantsError}</p>
              ) : applicants.length === 0 ? (
                <p className="text-surface-500">No applicants for this job yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs uppercase text-surface-500 border-b">
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Resume</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map(app => {
                        const resumeUrl = app.resume || app.student?.studentProfile?.resume;
                        return (
                          <tr key={app._id} className="border-b hover:bg-surface-50">
                            <td className="py-2 text-sm">{app.student?.name}</td>
                            <td className="py-2 text-sm">{app.student?.email}</td>
                            <td className="py-2 text-sm">
                              {resumeUrl ? (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => viewResume(app)} className="text-primary-600 hover:underline text-xs">View Resume</button>
                                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs">Open Direct</a>
                                </div>
                              ) : 'No resume'}
                            </td>
                            <td className="py-2">
                              <span className={`badge ${STATUS_COLORS[app.status]}`}>{STATUS_LABELS[app.status]}</span>
                            </td>
                            <td className="py-2 flex gap-1 flex-wrap">
                              <button className="btn-secondary py-1 px-2 text-xs" onClick={() => updateApplicantStatus(app._id, 'under-review')}>
                                Under Review
                              </button>
                              <button className="btn-secondary py-1 px-2 text-xs" onClick={() => updateApplicantStatus(app._id, 'shortlisted')}>
                                Shortlist
                              </button>
                              <button className="btn-secondary py-1 px-2 text-xs" onClick={() => updateApplicantStatus(app._id, 'interview-scheduled')}>
                                Interview
                              </button>
                              <button className="btn-secondary py-1 px-2 text-xs" onClick={() => updateApplicantStatus(app._id, 'selected')}>
                                Select
                              </button>
                              <button className="btn-secondary py-1 px-2 text-xs" onClick={() => updateApplicantStatus(app._id, 'rejected')}>
                                Reject
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Recent Applicants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-surface-900">Recent Applicants</h2>
            </div>
            <div className="space-y-3">
              {loading ? Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />) : recentApps.length > 0 ? (
                recentApps.map(app => (
                  <div key={app._id} className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{app.student?.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-surface-900 text-sm">{app.student?.name}</p>
                      <p className="text-surface-400 text-xs truncate">{app.student?.studentProfile?.education}</p>
                      <p className="text-surface-400 text-xs">GPA: {app.student?.studentProfile?.gpa}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${STATUS_COLORS[app.status]}`}>{STATUS_LABELS[app.status]}</span>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-surface-500 text-sm">No applicants yet. Post a job to begin!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
