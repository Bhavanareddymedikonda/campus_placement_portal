import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiEye, HiEyeOff, HiMail, HiLockClosed } from 'react-icons/hi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Student', email: 'ananya@student.edu', password: 'student123' },
    { role: 'Recruiter', email: 'rahul@google.com', password: 'recruiter123' },
    { role: 'Admin', email: 'admin@college.edu', password: 'admin123' },
  ];

  const fillDemo = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-300 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <HiAcademicCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-bold text-2xl">PlacementHub</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your Career Journey<br />Starts Here
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Connect with top companies, track your applications, and land your dream job — all in one place.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-6">
          {[{ n: '500+', l: 'Students Placed' }, { n: '50+', l: 'Companies' }, { n: '95%', l: 'Success Rate' }].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-bold text-white">{s.n}</p>
              <p className="text-white/60 text-sm mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-surface-900">PlacementHub</span>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Sign in</h2>
            <p className="text-surface-500 text-sm mb-8">Welcome back! Please enter your credentials.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="input-field pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input-field pl-11 pr-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-surface-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">Sign up</Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-surface-100">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 text-center">Quick Demo Access</p>
              <div className="grid grid-cols-3 gap-2">
                {demoCredentials.map(({ role, email, password }) => (
                  <button
                    key={role}
                    onClick={() => fillDemo(email, password)}
                    className="text-xs py-2 px-3 bg-surface-100 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium transition-colors"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
