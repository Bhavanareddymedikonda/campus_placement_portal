import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, matchingAPI, announcementAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import { STATUS_COLORS, STATUS_LABELS, formatDate, timeAgo, formatSalary } from '../../utils/helpers';
import {
  HiBriefcase, HiClipboardList, HiCheckCircle, HiCalendar,
  HiTrendingUp, HiSpeakerphone, HiArrowRight, HiLightningBolt,
  HiClock, HiExclamationCircle
} from 'react-icons/hi';

const StatCard = ({ label, value, icon, color, sub }) => {
  const IconComponent = icon;
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-surface-900 mb-1">{value}</p>
    <p className="text-sm font-semibold text-surface-500">{label}</p>
    {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
  </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, recRes, annRes] = await Promise.all([
          analyticsAPI.getStudentStats(),
          matchingAPI.getRecommendations(),
          announcementAPI.getAll({ limit: 3 }),
        ]);
        setStats(statsRes.data.data);
        setRecommendations(recRes.data.data.slice(0, 3));
        setAnnouncements(annRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = stats ? [
    { label: 'Total Applied', value: stats.total, icon: HiBriefcase, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: HiTrendingUp, color: 'bg-gradient-to-br from-purple-500 to-violet-600' },
    { label: 'Interviews', value: stats.interviewScheduled, icon: HiCalendar, color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Selected', value: stats.selected, icon: HiCheckCircle, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            <p className="text-primary-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-primary-200 text-sm">
              {user?.studentProfile?.department && `${user.studentProfile.department} • `}
              {user?.studentProfile?.batch && `Batch ${user.studentProfile.batch} • `}
              {user?.studentProfile?.gpa && `GPA: ${user.studentProfile.gpa}`}
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/student/jobs" className="px-5 py-2.5 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors">
                Browse Jobs
              </Link>
              <Link to="/student/applications" className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30">
                My Applications
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-lg font-bold text-surface-900 mb-4">Application Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              statCards.map(s => <StatCard key={s.label} {...s} />)
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recommended Jobs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <HiLightningBolt className="w-5 h-5 text-amber-500" /> Recommended for You
              </h2>
              <Link to="/student/jobs" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
                View all <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
              ) : recommendations.length > 0 ? (
                recommendations.map(job => (
                  <Link key={job._id} to={`/student/jobs`} className="glass-card p-5 flex items-start gap-4 hover:shadow-glass-lg hover:-translate-y-0.5 transition-all duration-200 block">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary-600 text-lg">{job.company.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-surface-900 text-sm">{job.title}</h3>
                          <p className="text-surface-500 text-xs mt-0.5">{job.company} • {job.location}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="badge bg-primary-50 text-primary-700 border border-primary-200">
                            {job.matchScore}% match
                          </span>
                          <span className={`badge ${job.type === 'internship' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <HiClock className="w-3.5 h-3.5" /> Due {formatDate(job.deadline)}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600">{formatSalary(job.salary)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="glass-card p-8 text-center">
                  <HiExclamationCircle className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-surface-500 text-sm">Complete your profile to get job recommendations!</p>
                  <Link to="/student/profile" className="btn-primary mt-4 inline-block py-2 text-sm">Update Profile</Link>
                </div>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <HiSpeakerphone className="w-5 h-5 text-primary-500" /> Announcements
              </h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
              ) : announcements.map(ann => (
                <div key={ann._id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-surface-900 text-sm leading-tight">{ann.title}</h3>
                    <span className={`badge flex-shrink-0 ${
                      ann.priority === 'high' || ann.priority === 'urgent'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>{ann.priority}</span>
                  </div>
                  <p className="text-surface-500 text-xs leading-relaxed line-clamp-2">{ann.content}</p>
                  <p className="text-surface-400 text-xs mt-2 flex items-center gap-1">
                    <HiClock className="w-3 h-3" /> {timeAgo(ann.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {(!user?.studentProfile?.resume || !user?.studentProfile?.gpa) && (
          <div className="glass-card p-5 border-l-4 border-amber-500 bg-amber-50/50">
            <div className="flex items-center gap-3">
              <HiExclamationCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-surface-900 text-sm">Complete your profile for better matches</p>
                <p className="text-surface-500 text-xs mt-0.5">Add your GPA, skills, and upload a resume to improve job recommendations.</p>
              </div>
              <Link to="/student/profile" className="btn-primary py-2 text-sm flex-shrink-0">Update</Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
