import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiEye, HiEyeOff, HiOfficeBuilding } from 'react-icons/hi';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
      toast.success('Account created successfully!');
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50 to-accent-50 p-6">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <HiAcademicCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">PlacementHub</h1>
          <p className="text-surface-500 mt-2">Create your account to get started</p>
        </div>

        <div className="glass-card p-8">
          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: 'student', label: 'Student', icon: HiAcademicCap, desc: 'Looking for jobs' },
              { value: 'recruiter', label: 'Recruiter', icon: HiOfficeBuilding, desc: 'Hiring talent' },
              { value: 'admin', label: 'Admin', icon: HiAcademicCap, desc: 'Manage placements' },
            ].map(({ value, label, icon, desc }) => {
              const IconComponent = icon;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, role: value }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.role === value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 mb-1 ${formData.role === value ? 'text-primary-600' : 'text-surface-400'}`} />
                <p className={`font-semibold text-sm ${formData.role === value ? 'text-primary-700' : 'text-surface-700'}`}>{label}</p>
                <p className="text-xs text-surface-400">{desc}</p>
              </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Enter your full name" className="input-field" autoComplete="name" />
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="Enter your email" className="input-field" autoComplete="email" />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="input-field pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="input-label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="Re-enter your password" className="input-field" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
