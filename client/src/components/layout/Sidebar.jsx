import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiBriefcase, HiClipboardList, HiUser, HiSpeakerphone,
  HiUserGroup, HiChartBar, HiLogout, HiX, HiAcademicCap,
  HiOfficeBuilding, HiDocumentText, HiBell
} from 'react-icons/hi';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/student/jobs', label: 'Browse Jobs', icon: HiBriefcase },
  { to: '/student/applications', label: 'My Applications', icon: HiClipboardList },
  { to: '/student/profile', label: 'My Profile', icon: HiUser },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: HiBriefcase },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: HiDocumentText },
  { to: '/recruiter/profile', label: 'Company Profile', icon: HiOfficeBuilding },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HiChartBar },
  { to: '/admin/users', label: 'Manage Users', icon: HiUserGroup },
  { to: '/admin/jobs', label: 'Manage Jobs', icon: HiBriefcase },
  { to: '/admin/announcements', label: 'Announcements', icon: HiSpeakerphone },
  { to: '/admin/reports', label: 'Reports', icon: HiClipboardList },
];

const roleLinks = { student: studentLinks, recruiter: recruiterLinks, admin: adminLinks };

const roleColors = {
  student: 'from-primary-600 to-accent-600',
  recruiter: 'from-emerald-600 to-teal-600',
  admin: 'from-violet-700 to-purple-600',
};

const roleIcons = {
  student: HiAcademicCap,
  recruiter: HiOfficeBuilding,
  admin: HiChartBar,
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = roleLinks[user.role] || [];
  const gradient = roleColors[user.role];
  const RoleIcon = roleIcons[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-100 z-40
        flex flex-col shadow-glass-lg
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        {/* Logo/Brand */}
        <div className={`p-6 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <HiAcademicCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">PlacementHub</p>
                <p className="text-white/70 text-xs">Portal</p>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-white font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                <p className="text-white/70 text-xs capitalize flex items-center gap-1">
                  <RoleIcon className="w-3 h-3" />
                  {user.role}
                </p>
              </div>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg lg:hidden"
          >
            <HiX className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-4 mb-3">
            Navigation
          </p>
          {links.map(({ to, label, icon }) => {
            const IconComponent = icon;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-surface-100">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-danger-500 hover:bg-danger-50 hover:text-danger-600"
          >
            <HiLogout className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
