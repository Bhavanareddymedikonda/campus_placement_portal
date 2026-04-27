import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatSkeleton } from '../../components/common/Skeleton';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  HiUsers, HiBriefcase, HiClipboardList, HiCheckCircle,
  HiTrendingUp, HiChartBar, HiClock
} from 'react-icons/hi';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#a855f7', '#3b82f6', '#10b981', '#ef4444'];
const STATUS_DISPLAY = {
  'applied': 'Applied', 'under-review': 'Under Review', 'shortlisted': 'Shortlisted',
  'interview-scheduled': 'Interview Sched.', 'selected': 'Selected', 'rejected': 'Rejected',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-surface-100 rounded-xl p-3 shadow-glass text-sm">
        <p className="font-bold text-surface-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [statusDist, setStatusDist] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      analyticsAPI.getByStatus(),
      analyticsAPI.getCompanyStats(),
      analyticsAPI.getTrends(),
    ]).then(([s, st, cs, tr]) => {
      setStats(s.data.data);
      setStatusDist(st.data.data.map(d => ({ name: STATUS_DISPLAY[d.status] || d.status, value: d.count })));
      setCompanyStats(cs.data.data);
      setTrends(tr.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Students', value: stats.totalStudents, icon: HiUsers, color: 'bg-gradient-to-br from-blue-500 to-indigo-600', sub: 'Registered users' },
    { label: 'Recruiters', value: stats.totalRecruiters, icon: HiBriefcase, color: 'bg-gradient-to-br from-violet-500 to-purple-600', sub: 'Active companies' },
    { label: 'Total Applications', value: stats.totalApplications, icon: HiClipboardList, color: 'bg-gradient-to-br from-amber-500 to-orange-600', sub: 'All time' },
    { label: 'Placements', value: stats.totalPlacements, icon: HiCheckCircle, color: 'bg-gradient-to-br from-emerald-500 to-teal-600', sub: `${stats.successRate}% success rate` },
    { label: 'Total Jobs', value: stats.totalJobs, icon: HiChartBar, color: 'bg-gradient-to-br from-rose-500 to-pink-600', sub: 'Posted' },
    { label: 'Pending Approvals', value: stats.pendingJobs, icon: HiClock, color: 'bg-gradient-to-br from-cyan-500 to-blue-600', sub: 'Need review' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Analytics Dashboard</h1>
          <p className="text-surface-500 text-sm">Real-time placement insights and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            statCards.map(({ label, value, icon, color, sub }) => {
              const IconComponent = icon;
              return (
                <div key={label} className="stat-card">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-surface-900 mb-1">{value}</p>
                  <p className="text-sm font-semibold text-surface-500">{label}</p>
                  {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
                </div>
              );
            })
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trends Line Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-bold text-surface-900 mb-1 flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-primary-500" /> Placement Trends
            </h3>
            <p className="text-surface-400 text-xs mb-5">Applications vs Placements over last 6 months</p>
            {loading ? <div className="skeleton h-48 rounded-xl" /> : trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="applications" name="Applications" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
                  <Line type="monotone" dataKey="placements" name="Placements" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-surface-400 text-sm">No trend data yet</div>
            )}
          </div>

          {/* Status Pie Chart */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-surface-900 mb-1">Application Status</h3>
            <p className="text-surface-400 text-xs mb-5">Distribution of all applications</p>
            {loading ? <div className="skeleton h-48 rounded-xl" /> : statusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value">
                    {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-surface-400 text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Company Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-surface-900 mb-1 flex items-center gap-2">
            <HiChartBar className="w-5 h-5 text-accent-500" /> Company-wise Placements
          </h3>
          <p className="text-surface-400 text-xs mb-5">Top companies by number of students placed</p>
          {loading ? <div className="skeleton h-48 rounded-xl" /> : companyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={companyStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="company" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="placements" name="Placements" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-surface-400 text-sm">
              No placement data yet. Placements will appear here once students are selected.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
