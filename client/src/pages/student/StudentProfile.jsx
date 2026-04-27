import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { HiUser, HiAcademicCap, HiCode, HiDocumentText, HiUpload, HiSave, HiPlus, HiX, HiCheck, HiExternalLink } from 'react-icons/hi';
import { userAPI, uploadAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const Field = memo(({ label, required, children }) => (
  <div>
    <label className="input-label">
      {label} {required && <span className="text-danger-500">*</span>}
    </label>
    {children}
  </div>
));

const Section = memo(({ title, icon, children }) => {
  const IconComponent = icon;
  return (
    <div className="glass-card p-6">
      <h3 className="font-bold text-surface-900 flex items-center gap-2 mb-5 pb-3 border-b border-surface-100">
        <IconComponent className="w-5 h-5 text-primary-500" /> {title}
      </h3>
      {children}
    </div>
  );
});

const StudentProfile = () => {
  const { user, loadUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '', education: '', department: '', batch: '', gpa: '',
    skills: [], phone: '', bio: '', linkedin: '', github: '', address: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const initialLoaded = useRef(false);

  useEffect(() => {
    if (user && !initialLoaded.current) {
      setFormData({
        name: user.name || '',
        education: user.studentProfile?.education || '',
        department: user.studentProfile?.department || '',
        batch: user.studentProfile?.batch || '',
        gpa: user.studentProfile?.gpa || '',
        skills: user.studentProfile?.skills || [],
        phone: user.studentProfile?.phone || '',
        bio: user.studentProfile?.bio || '',
        linkedin: user.studentProfile?.linkedin || '',
        github: user.studentProfile?.github || '',
        address: user.studentProfile?.address || '',
      });
      initialLoaded.current = true;
    }
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const addSkill = useCallback(() => {
    const s = skillInput.trim();
    if (s) {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.includes(s) ? prev.skills : [...prev.skills, s],
      }));
    }
    setSkillInput('');
  }, [skillInput]);

  const removeSkill = useCallback((skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { name, ...rest } = formData;
      await userAPI.updateProfile({
        name,
        studentProfile: { ...rest, gpa: parseFloat(rest.gpa) || 0 },
      });
      await loadUser();
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [formData, loadUser]);

  const handleResumeUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      await uploadAPI.resume(fd);
      await loadUser();
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [loadUser]);

  const completionItems = [
    { label: 'Name', done: !!formData.name },
    { label: 'Education', done: !!formData.education },
    { label: 'GPA', done: !!formData.gpa },
    { label: 'Skills', done: formData.skills.length > 0 },
    { label: 'Resume', done: !!user?.studentProfile?.resume },
    { label: 'Bio', done: !!formData.bio },
  ];
  const completion = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>
            <p className="text-surface-500 text-sm">Keep your profile updated for better job matches</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><HiSave className="w-4 h-4" />Save Profile</>}
          </button>
        </div>

        {/* Profile Completion */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-surface-900 text-sm">Profile Completion</span>
            <span className={`font-bold text-sm ${completion >= 80 ? 'text-emerald-600' : completion >= 50 ? 'text-amber-600' : 'text-danger-600'}`}>{completion}%</span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2.5 mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${completion >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : completion >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-danger-500 to-rose-500'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {completionItems.map(({ label, done }) => (
              <span key={label} className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${done ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-surface-100 text-surface-500'}`}>
                {done ? <HiCheck className="w-3 h-3" /> : <HiX className="w-3 h-3" />}{label}
              </span>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information" icon={HiUser}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="input-field resize-none" placeholder="Tell recruiters about yourself..." />
            </div>
            <div>
              <label className="input-label">LinkedIn URL</label>
              <input name="linkedin" value={formData.linkedin} onChange={handleChange} className="input-field" placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="input-label">GitHub URL</label>
              <input name="github" value={formData.github} onChange={handleChange} className="input-field" placeholder="https://github.com/..." />
            </div>
          </div>
        </Section>

        {/* Academic Info */}
        <Section title="Academic Information" icon={HiAcademicCap}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Education</label>
              <input name="education" value={formData.education} onChange={handleChange} className="input-field" placeholder="e.g. B.Tech Computer Science" />
            </div>
            <div>
              <label className="input-label">Department</label>
              <input name="department" value={formData.department} onChange={handleChange} className="input-field" placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label className="input-label">Batch / Graduation Year</label>
              <input name="batch" value={formData.batch} onChange={handleChange} className="input-field" placeholder="e.g. 2025" />
            </div>
            <div>
              <label className="input-label">GPA / CGPA</label>
              <input name="gpa" type="number" min="0" max="10" step="0.1" value={formData.gpa} onChange={handleChange} className="input-field" placeholder="e.g. 8.5 (out of 10)" />
            </div>
          </div>
        </Section>

        {/* Skills */}
        <Section title="Skills" icon={HiCode}>
          <div className="flex gap-2 mb-4">
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Type a skill and press Enter or click Add"
              className="input-field flex-1"
            />
            <button onClick={addSkill} className="btn-primary flex items-center gap-2 px-4 flex-shrink-0">
              <HiPlus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-danger-500 transition-colors">
                  <HiX className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {formData.skills.length === 0 && (
              <p className="text-surface-400 text-sm">No skills added yet. Add skills to improve job matching.</p>
            )}
          </div>
        </Section>

        {/* Resume */}
        <Section title="Resume" icon={HiDocumentText}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {user?.studentProfile?.resume ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                  <HiDocumentText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900 text-sm">Resume uploaded</p>
                  <a href={user.studentProfile.resume} target="_blank" rel="noopener noreferrer"
                    className="text-primary-600 text-xs hover:underline flex items-center gap-1">
                    View PDF <HiExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-surface-500 text-sm flex-1">No resume uploaded yet. Upload a PDF to complete your profile.</p>
            )}
            <input type="file" ref={fileRef} accept=".pdf" onChange={handleResumeUpload} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-secondary flex items-center gap-2 flex-shrink-0"
            >
              {uploading ? <><div className="w-4 h-4 border-2 border-surface-400 border-t-primary-600 rounded-full animate-spin" />Uploading...</> : <><HiUpload className="w-4 h-4" />{user?.studentProfile?.resume ? 'Replace Resume' : 'Upload Resume'}</>}
            </button>
          </div>
          <p className="text-xs text-surface-400 mt-2">PDF only, max 5MB</p>
        </Section>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
