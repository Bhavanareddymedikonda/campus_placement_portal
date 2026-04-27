import { useEffect, useState } from 'react';
import { announcementAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiSpeakerphone, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const priorityColors = {
  low: 'bg-surface-100 text-surface-600 border-surface-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
};

const emptyForm = { title: '', content: '', priority: 'medium' };

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await announcementAPI.getAll({ limit: 50 });
      setAnnouncements(data.data);
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openCreate = () => { setFormData(emptyForm); setEditItem(null); setModalOpen(true); };
  const openEdit = (ann) => { setFormData({ title: ann.title, content: ann.content, priority: ann.priority }); setEditItem(ann); setModalOpen(true); };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return toast.error('Please fill in all fields');
    setSaving(true);
    try {
      if (editItem) {
        await announcementAPI.update(editItem._id, formData);
        toast.success('Announcement updated');
      } else {
        await announcementAPI.create(formData);
        toast.success('Announcement posted');
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch { toast.error('Failed to save announcement'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await announcementAPI.delete(deleteId);
      setAnnouncements(prev => prev.filter(a => a._id !== deleteId));
      toast.success('Announcement deleted');
    } catch { toast.error('Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Announcements</h1>
            <p className="text-surface-500 text-sm">Post updates visible to all students and recruiters</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <HiPlus className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {loading ? <TableSkeleton rows={4} cols={1} /> : announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann._id} className="glass-card p-5 hover:shadow-glass-lg transition-all duration-200">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-surface-900">{ann.title}</h3>
                      <span className={`badge ${priorityColors[ann.priority]}`}>{ann.priority}</span>
                    </div>
                    <p className="text-surface-500 text-sm leading-relaxed line-clamp-2">{ann.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                      <span>By {ann.author?.name}</span>
                      <span>•</span>
                      <span>{timeAgo(ann.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(ann)}
                      className="p-2 hover:bg-primary-50 text-surface-500 hover:text-primary-600 rounded-xl transition-colors">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(ann._id)}
                      className="p-2 hover:bg-red-50 text-surface-500 hover:text-danger-600 rounded-xl transition-colors">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <HiSpeakerphone className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="font-bold text-surface-700">No announcements yet</p>
            <button onClick={openCreate} className="btn-primary mt-4">Create First Announcement</button>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Announcement' : 'New Announcement'}>
          <div className="space-y-4">
            <div>
              <label className="input-label">Title <span className="text-danger-500">*</span></label>
              <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Announcement title" className="input-field" />
            </div>
            <div>
              <label className="input-label">Priority</label>
              <select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))} className="input-field">
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Content <span className="text-danger-500">*</span></label>
              <textarea value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                rows={5} placeholder="Write your announcement content..." className="input-field resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : editItem ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Announcement">
          <p className="text-surface-600 mb-6">Are you sure you want to delete this announcement?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Announcements;
