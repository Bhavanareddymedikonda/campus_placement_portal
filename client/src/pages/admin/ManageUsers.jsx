import { useEffect, useState, useCallback } from 'react';
import { userAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TableSkeleton } from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiUsers, HiSearch, HiTrash, HiBan, HiCheckCircle } from 'react-icons/hi';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (roleFilter) params.role = roleFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await userAPI.getAll(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, debouncedSearch]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await userAPI.toggleStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update user status'); }
  };

  const handleDelete = async () => {
    try {
      await userAPI.deleteUser(deleteId);
      setUsers(prev => prev.filter(u => u._id !== deleteId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
    setDeleteId(null);
  };

  const roleColors = {
    student: 'bg-blue-50 text-blue-700 border-blue-200',
    recruiter: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    admin: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Manage Users</h1>
          <p className="text-surface-500 text-sm">{pagination.total} total users</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5">
            <HiSearch className="w-4 h-4 text-surface-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..." className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <div className="flex gap-2">
            {['', 'student', 'recruiter', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  roleFilter === r ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-300'
                }`}>
                {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? <TableSkeleton rows={10} cols={5} /> : users.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header hidden md:table-cell">Details</th>
                  <th className="table-header hidden lg:table-cell">Joined</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">{user.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-surface-900 text-sm truncate">{user.name}</p>
                          <p className="text-surface-400 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${roleColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="table-cell hidden md:table-cell text-surface-500 text-xs">
                      {user.role === 'student' && `GPA: ${user.studentProfile?.gpa || '-'} • ${user.studentProfile?.batch || '-'}`}
                      {user.role === 'recruiter' && user.recruiterProfile?.company}
                    </td>
                    <td className="table-cell hidden lg:table-cell text-surface-400">{formatDate(user.createdAt)}</td>
                    <td className="table-cell">
                      <span className={`badge ${user.isActive ? 'badge-selected' : 'badge-rejected'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {user.role !== 'admin' && (
                          <>
                            <button onClick={() => toggleStatus(user._id, user.isActive)} title={user.isActive ? 'Deactivate' : 'Activate'}
                              className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'hover:bg-amber-50 text-surface-500 hover:text-amber-600' : 'hover:bg-emerald-50 text-surface-500 hover:text-emerald-600'}`}>
                              {user.isActive ? <HiBan className="w-4 h-4" /> : <HiCheckCircle className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setDeleteId(user._id)} title="Delete User"
                              className="p-1.5 hover:bg-red-50 text-surface-500 hover:text-danger-600 rounded-lg transition-colors">
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <HiUsers className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="font-bold text-surface-700">No users found</p>
          </div>
        )}

        <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User">
          <p className="text-surface-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
