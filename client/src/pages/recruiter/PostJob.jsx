import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../api';

const Field = memo(({ label, required, children }) => (
  <div>
    <label className="input-label">{label} {required && <span className="text-danger-500">*</span>}</label>
    {children}
  </div>
));

const Section = memo(({ title, children }) => (
  <div className="glass-card p-6 space-y-4">
    <h3 className="font-bold text-surface-900 text-base pb-3 border-b border-surface-100">{title}</h3>
    {children}
  </div>
));
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { HiBriefcase, HiPlus, HiX } from 'react-icons/hi';
import { JOB_TYPES } from '../../utils/helpers';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [respInput, setRespInput] = useState('');
  const [perkInput, setPerkInput] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', company: user?.recruiterProfile?.company || '',
    type: 'full-time', location: '', salaryMin: '', salaryMax: '',
    minGPA: '', skills: [], batch: '', education: '',
    openings: 1, deadline: '', responsibilities: [], perks: [],
  });

  useEffect(() => {
    const companyName = user?.recruiterProfile?.company;
    if (companyName && !formData.company) {
      setFormData((prev) => ({ ...prev, company: companyName }));
    }
  }, [user?.recruiterProfile?.company, formData.company]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const addToArray = useCallback((field, input, setInput) => {
    const val = input.trim();
    if (!val) return;

    setFormData((prev) => {
      if (prev[field].includes(val)) return prev;
      return { ...prev, [field]: [...prev[field], val] };
    });

    setInput('');
  }, []);

  const removeFromArray = useCallback((field, item) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((i) => i !== item) }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await jobAPI.create({
        title: formData.title,
        description: formData.description,
        company: formData.company,
        type: formData.type,
        location: formData.location,
        salary: { min: parseInt(formData.salaryMin) || 0, max: parseInt(formData.salaryMax) || 0 },
        requirements: {
          minGPA: parseFloat(formData.minGPA) || 0,
          skills: formData.skills,
          batch: formData.batch.split(',').map(b => b.trim()).filter(Boolean),
          education: formData.education,
        },
        openings: parseInt(formData.openings) || 1,
        deadline: formData.deadline,
        responsibilities: formData.responsibilities,
        perks: formData.perks,
      });
      toast.success('Job posted! Awaiting admin approval.');
      navigate('/recruiter/my-jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Post a New Job</h1>
          <p className="text-surface-500 text-sm">Fill in the details below. Your posting will be reviewed by admin before going live.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="Basic Information">
            <Field label="Job Title" required>
              <input name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g. Software Development Engineer" />
            </Field>
            <Field label="Company Name" required>
              <input name="company" value={formData.company} onChange={handleChange} className="input-field" placeholder="Company name" />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Job Type">
                <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                  {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <input name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="e.g. Bangalore, Remote" />
              </Field>
            </div>
            <Field label="Job Description" required>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={6} className="input-field resize-none"
                placeholder="Describe the role, responsibilities, and what makes this opportunity unique..." />
            </Field>
          </Section>

          <Section title="Compensation & Openings">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Min Salary (INR/year)">
                <input name="salaryMin" type="number" value={formData.salaryMin} onChange={handleChange} className="input-field" placeholder="e.g. 500000" />
              </Field>
              <Field label="Max Salary (INR/year)">
                <input name="salaryMax" type="number" value={formData.salaryMax} onChange={handleChange} className="input-field" placeholder="e.g. 1000000" />
              </Field>
              <Field label="Number of Openings">
                <input name="openings" type="number" min="1" value={formData.openings} onChange={handleChange} className="input-field" />
              </Field>
            </div>
            <Field label="Application Deadline" required>
              <input name="deadline" type="date" value={formData.deadline} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} className="input-field" />
            </Field>
          </Section>

          <Section title="Eligibility Requirements">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Minimum GPA">
                <input name="minGPA" type="number" min="0" max="10" step="0.1" value={formData.minGPA} onChange={handleChange}
                  className="input-field" placeholder="e.g. 7.5" />
              </Field>
              <Field label="Target Batch(es)">
                <input name="batch" value={formData.batch} onChange={handleChange} className="input-field" placeholder="e.g. 2024, 2025" />
              </Field>
            </div>
            <Field label="Education">
              <input name="education" value={formData.education} onChange={handleChange} className="input-field" placeholder="e.g. B.Tech/M.Tech" />
            </Field>
            <Field label="Required Skills">
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('skills', skillInput, setSkillInput); } }}
                  placeholder="Add a required skill" className="input-field flex-1" />
                <button type="button" onClick={() => addToArray('skills', skillInput, setSkillInput)} className="btn-secondary px-4 flex-shrink-0">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-lg border border-primary-100">
                    {s} <button type="button" onClick={() => removeFromArray('skills', s)}><HiX className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Responsibilities & Perks">
            <Field label="Key Responsibilities">
              <div className="flex gap-2 mb-2">
                <input value={respInput} onChange={e => setRespInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('responsibilities', respInput, setRespInput); } }}
                  placeholder="Add a responsibility" className="input-field flex-1" />
                <button type="button" onClick={() => addToArray('responsibilities', respInput, setRespInput)} className="btn-secondary px-4 flex-shrink-0">Add</button>
              </div>
              <ul className="space-y-1">
                {formData.responsibilities.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-surface-700">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                    {r}
                    <button type="button" onClick={() => removeFromArray('responsibilities', r)} className="ml-auto text-surface-400 hover:text-danger-500">
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </Field>
            <Field label="Perks & Benefits">
              <div className="flex gap-2 mb-2">
                <input value={perkInput} onChange={e => setPerkInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('perks', perkInput, setPerkInput); } }}
                  placeholder="e.g. Health Insurance, Stock Options" className="input-field flex-1" />
                <button type="button" onClick={() => addToArray('perks', perkInput, setPerkInput)} className="btn-secondary px-4 flex-shrink-0">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.perks.map(p => (
                  <span key={p} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
                    {p} <button type="button" onClick={() => removeFromArray('perks', p)}><HiX className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </Field>
          </Section>

          <div className="flex gap-3 pb-6">
            <button type="button" onClick={() => navigate('/recruiter/my-jobs')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting...</> : <><HiBriefcase className="w-4 h-4" />Post Job</>}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostJob;
