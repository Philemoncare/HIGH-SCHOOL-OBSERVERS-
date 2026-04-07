import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import RealIcon from './RealIcon'

const Sidebar = ({ admin = false, onNavigate }) => {
  const auth = useAuth?.();
  const adminAuth = useAdminAuth?.();
  const location = useLocation();
  const navigate = useNavigate();

  const user = admin ? adminAuth?.user : auth?.user;
  const isAdmin = admin ? adminAuth?.isAdmin : auth?.isAdmin;
  const isExecutive = admin ? adminAuth?.isExecutive : auth?.isExecutive;
  const logout = admin ? (() => { adminAuth?.logout(); navigate('/admin-login'); }) : (auth?.logout ?? (() => {}));

  if (!user || (!isAdmin && !isExecutive)) return null;

  const handleLinkClick = () => {
    onNavigate?.();
  };
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <aside className="bg-gradient-to-b from-red-800 to-red-600 w-64 min-h-screen lg:min-h-full p-6 text-white shadow-xl flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <img src="/images/logo.jpg" alt="HSO Logo" className="h-10 w-10 rounded-full border-2 border-white bg-white" />
        <span className="font-extrabold text-xl tracking-wide">HSO Admin</span>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-3">
          <li>
            <Link 
              to="/admin" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="🏠" className="w-5 h-5" colorClassName="text-white" />
              <span>Dashboard</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/news"
              onClick={handleLinkClick} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/news') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="📰" className="w-5 h-5" colorClassName="text-white" />
              <span>News Management</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/events" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/events') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="📅" className="w-5 h-5" colorClassName="text-white" />
              <span>Events & Donations</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/users" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/users') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="👥" className="w-5 h-5" colorClassName="text-white" />
              <span>User Management</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/profile" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/profile') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="👤" className="w-5 h-5" colorClassName="text-white" />
              <span>My Profile</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/shop" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/shop') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="🛍️" className="w-5 h-5" colorClassName="text-white" />
              <span>Shop Management</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/magazines" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/magazines') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="📖" className="w-5 h-5" colorClassName="text-white" />
              <span>Magazine Management</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/payments" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/payments') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="💳" className="w-5 h-5" colorClassName="text-white" />
              <span>Payment Management</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/admin/leadership" 
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                isActive('/admin/leadership') ? 'bg-red-700 shadow-lg' : 'hover:bg-red-700'
              }`}
            >
              <RealIcon symbol="👑" className="w-5 h-5" colorClassName="text-white" />
              <span>Leadership Team</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="pt-6 border-t border-red-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-red-800 font-bold text-sm">
              {user?.first_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{user?.first_name} {user?.last_name}</div>
            <div className="text-xs text-red-200 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold hover:bg-red-700 text-red-100 hover:text-white"
        >
          <RealIcon symbol="🚪" className="w-5 h-5" colorClassName="text-white" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 