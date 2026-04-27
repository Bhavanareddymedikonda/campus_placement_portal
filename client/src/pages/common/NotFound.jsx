import { Link } from 'react-router-dom';
import { HiHome, HiExclamationCircle } from 'react-icons/hi';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 to-primary-50 p-6">
    <div className="text-center animate-slide-up">
      <div className="relative mb-8">
        <p className="text-[10rem] font-black text-primary-100 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl flex items-center justify-center shadow-glow-lg">
            <HiExclamationCircle className="w-14 h-14 text-white" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-surface-900 mb-3">Page Not Found</h1>
      <p className="text-surface-500 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <HiHome className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;
