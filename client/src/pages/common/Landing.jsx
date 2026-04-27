import { Link } from 'react-router-dom';
import { HiAcademicCap, HiBriefcase, HiChartBar, HiShieldCheck, HiLightningBolt, HiUsers } from 'react-icons/hi';

const stats = [
  { label: 'Students Placed', value: '2,500+' },
  { label: 'Partner Companies', value: '150+' },
  { label: 'Job Openings', value: '500+' },
  { label: 'Success Rate', value: '92%' },
];

const features = [
  { icon: HiBriefcase, title: 'Smart Job Matching', desc: 'AI-powered recommendations based on your skills, GPA, and preferences to surface the most relevant opportunities.', color: 'from-blue-500 to-indigo-600' },
  { icon: HiChartBar, title: 'Real-Time Analytics', desc: 'Track your application journey with live status updates, placement trends, and data-driven insights.', color: 'from-violet-500 to-purple-600' },
  { icon: HiShieldCheck, title: 'Secure & Verified', desc: 'JWT authentication, role-based access control, and verified company profiles for a safe experience.', color: 'from-emerald-500 to-teal-600' },
  { icon: HiLightningBolt, title: 'Instant Updates', desc: 'Real-time notifications for application status changes, interview schedules, and new announcements.', color: 'from-amber-500 to-orange-600' },
  { icon: HiUsers, title: 'Multi-Role Platform', desc: 'Seamless experience for students, recruiters, and placement cell admins on a single unified platform.', color: 'from-pink-500 to-rose-600' },
  { icon: HiAcademicCap, title: 'Campus Ready', desc: 'Built specifically for college placement cells with batch management, GPA filters, and department-wise tracking.', color: 'from-cyan-500 to-blue-600' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-surface-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
              <HiAcademicCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">PlacementHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary py-2">Sign In</Link>
            <Link to="/register" className="btn-primary py-2">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            Placement Season 2024 is Live!
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-surface-900 mb-6 leading-tight animate-slide-up">
            Your Dream Career
            <br />
            <span className="gradient-text">Starts Here</span>
          </h1>

          <p className="text-xl text-surface-500 mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed">
            The most comprehensive college placement platform connecting students with top recruiters.
            Apply smarter. Get placed faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 shadow-glow">
              Start Your Journey →
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-white border-y border-surface-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center group">
              <p className="text-4xl font-bold gradient-text group-hover:scale-110 transition-transform duration-300">{value}</p>
              <p className="text-surface-500 mt-2 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-surface-900 mb-4">
              Everything You Need to
              <span className="gradient-text"> Get Placed</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              A complete ecosystem built for modern campus placements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, title, desc, color }) => {
              const IconComponent = icon;
              return (
                <div key={title} className="glass-card p-6 hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">{title}</h3>
                  <p className="text-surface-500 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card p-12 text-center bg-gradient-to-br from-primary-600 to-accent-700 border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-white/70 text-lg mb-8">Join thousands of students who've already found their perfect placement.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=student" className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-surface-50 transition-colors shadow-lg">
                Join as Student
              </Link>
              <Link to="/register?role=recruiter" className="px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                Post Jobs as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-100 py-8 px-6 text-center">
        <p className="text-surface-400 text-sm">
          © 2024 PlacementHub. Built with ❤️ for campus placements.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
