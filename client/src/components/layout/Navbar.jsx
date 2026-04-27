import { HiMenuAlt2, HiBell, HiSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  const roleBadgeColor = {
    student: 'bg-primary-100 text-primary-700',
    recruiter: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-violet-100 text-violet-700',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-surface-100 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Menu toggle + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-surface-100 rounded-xl transition-colors lg:hidden"
          >
            <HiMenuAlt2 className="w-5 h-5 text-surface-600" />
          </button>

          <div className="hidden md:flex items-center gap-3 bg-surface-50 border border-surface-200 rounded-xl px-4 py-2 flex-1 max-w-md">
            <HiSearch className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <span className="text-surface-400 text-sm">Search anything...</span>
          </div>
        </div>

        {/* Right: User info */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-surface-100 rounded-xl transition-colors">
            <HiBell className="w-5 h-5 text-surface-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-surface-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-surface-500">{user?.email}</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleBadgeColor[user?.role]}`}>
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
