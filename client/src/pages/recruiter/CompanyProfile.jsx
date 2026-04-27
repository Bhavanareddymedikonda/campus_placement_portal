import { useEffect, useState } from 'react';
import { userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { HiOfficeBuilding, HiSave } from 'react-icons/hi';

const CompanyProfile = () => {
  const { user, loadUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '', company: '', designation: '', companyWebsite: '',
    companyDescription: '', industry: '', companySize: '', location: '', phone: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        company: user.recruiterProfile?.company || '',
        designation: user.recruiterProfile?.designation || '',
        companyWebsite: user.recruiterProfile?.companyWebsite || '',
        companyDescription: user.recruiterProfile?.companyDescription || '',
        industry: user.recruiterProfile?.industry || '',
        companySize: user.recruiterProfile?.companySize || '',
        location: user.recruiterProfile?.location || '',
        phone: user.recruiterProfile?.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { name, ...rest } = formData;
      await userAPI.updateProfile({ name, recruiterProfile: rest });
      await loadUser();
      toast.success('Company profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const sizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000-5000', '5000+', '10000+'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Consulting', 'IT Services', 'E-commerce', 'Other'];

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Company Profile</h1>
            <p className="text-surface-500 text-sm">Update your company information visible to students</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><HiSave className="w-4 h-4" />Save</>}
          </button>
        </div>

        {/* Avatar */}
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-3xl">{(formData.company || 'C').charAt(0)}</span>
          </div>
          <div>
            <p className="font-bold text-surface-900 text-xl">{formData.company || 'Company Name'}</p>
            <p className="text-surface-500 text-sm">{formData.industry || 'Industry'} • {formData.location || 'Location'}</p>
            <p className="text-surface-400 text-xs mt-1">{formData.companySize} employees</p>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-surface-900 flex items-center gap-2 pb-3 border-b border-surface-100">
            <HiOfficeBuilding className="w-5 h-5 text-emerald-500" /> Company Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Your Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="input-label">Your Designation</label>
              <input name="designation" value={formData.designation} onChange={handleChange} className="input-field" placeholder="e.g. HR Manager" />
            </div>
            <div>
              <label className="input-label">Company Name</label>
              <input name="company" value={formData.company} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="input-label">Company Website</label>
              <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="input-label">Industry</label>
              <select name="industry" value={formData.industry} onChange={handleChange} className="input-field">
                <option value="">Select industry</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Company Size</label>
              <select name="companySize" value={formData.companySize} onChange={handleChange} className="input-field">
                <option value="">Select size</option>
                {sizeOptions.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Office Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="City, State" />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="input-label">Company Description</label>
            <textarea name="companyDescription" value={formData.companyDescription} onChange={handleChange}
              rows={4} className="input-field resize-none"
              placeholder="Describe your company, culture, and mission..." />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfile;
