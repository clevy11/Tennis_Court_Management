import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHome, FaCalendar, FaTableTennis, FaUsers, FaEnvelope, FaCreditCard, FaSignOutAlt } from 'react-icons/fa';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      // await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Overview' },
    { path: '/dashboard/bookings', icon: <FaCalendar />, label: 'Bookings' },
    { path: '/dashboard/courts', icon: <FaTableTennis />, label: 'Courts' },
    { path: '/dashboard/memberships', icon: <FaUsers />, label: 'Memberships' },
    { path: '/dashboard/messages', icon: <FaEnvelope />, label: 'Messages' },
    { path: '/dashboard/payments', icon: <FaCreditCard />, label: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-tennis-green text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="font-bold text-2xl">
                Tennis Court Management
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg">Welcome, {user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-tennis-yellow text-tennis-navy px-4 py-2 rounded-md hover:bg-yellow-500 transition duration-200"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-tennis-navy text-white">
          <nav className="mt-5 px-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition duration-200 ${
                    isActive(item.path)
                      ? 'bg-tennis-green text-white'
                      : 'hover:bg-tennis-green/10'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <main className="max-w-7xl mx-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
