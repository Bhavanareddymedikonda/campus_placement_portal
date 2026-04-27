import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/helpers';
import { HiDocumentReport, HiDownload, HiUsers, HiBriefcase, HiCheckCircle, HiTrendingUp } from 'react-icons/hi';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    if (!stats) return;
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: 'All Time',
      summary: stats,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryItems = stats ? [
    { label: 'Total Students Registered', value: stats.totalStudents, icon: HiUsers, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Recruiters', value: stats.totalRecruiters, icon: HiBriefcase, color: 'text-violet-600 bg-violet-50' },
    { label: 'Total Job Postings', value: stats.totalJobs, icon: HiBriefcase, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Applications', value: stats.totalApplications, icon: HiDocumentReport, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Students Placed', value: stats.totalPlacements, icon: HiCheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Overall Success Rate', value: `${stats.successRate}%`, icon: HiTrendingUp, color: 'text-rose-600 bg-rose-50' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Placement Reports</h1>
            <p className="text-surface-500 text-sm">Comprehensive placement statistics and summaries</p>
          </div>
          <button onClick={handleDownload} disabled={loading || !stats} className="btn-primary flex items-center gap-2">
            <HiDownload className="w-4 h-4" /> Export Report
          </button>
        </div>

        {/* Report Card */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
            <div>
              <h2 className="text-lg font-bold text-surface-900">Placement Summary Report</h2>
              <p className="text-surface-400 text-sm">Generated: {formatDate(new Date())}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
              <HiDocumentReport className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array(6).fill(0).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              summaryItems.map(({ label, value, icon, color }) => {
                const IconComponent = icon;
                return (
                  <div key={label} className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl border border-surface-100">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900">{value}</p>
                      <p className="text-xs text-surface-500 font-medium leading-tight">{label}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Performance Insights */}
        {stats && (
          <div className="glass-card p-6">
            <h3 className="font-bold text-surface-900 mb-4 pb-3 border-b border-surface-100">Key Insights</h3>
            <div className="space-y-3">
              {[
                {
                  text: `${stats.totalPlacements} out of ${stats.totalStudents} registered students have been placed.`,
                  color: 'border-emerald-400',
                },
                {
                  text: `Overall campus placement success rate is ${stats.successRate}%.`,
                  color: stats.successRate >= 70 ? 'border-emerald-400' : stats.successRate >= 40 ? 'border-amber-400' : 'border-danger-400',
                },
                {
                  text: `${stats.pendingJobs} job posting(s) are awaiting admin approval.`,
                  color: stats.pendingJobs > 0 ? 'border-amber-400' : 'border-surface-300',
                },
                {
                  text: `${stats.totalRecruiters} companies are actively participating in placement drives.`,
                  color: 'border-blue-400',
                },
              ].map(({ text, color }, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 bg-surface-50 rounded-xl border-l-4 ${color}`}>
                  <p className="text-surface-700 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
