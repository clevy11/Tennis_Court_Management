import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaUser,
  FaCalendar,
  FaUsers,
  FaEnvelope,
  FaCreditCard,
  FaChalkboardTeacher,
} from 'react-icons/fa';
import { RootState } from '../../store/store';

const UserDashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/user-dashboard', icon: <FaUser />, label: 'Profile' },
    { path: '/user-dashboard/bookings', icon: <FaCalendar />, label: 'My Bookings' },
    { path: '/user-dashboard/membership', icon: <FaUsers />, label: 'Membership' },
    { path: '/user-dashboard/coaching', icon: <FaChalkboardTeacher />, label: 'Coaching' },
    { path: '/user-dashboard/messages', icon: <FaEnvelope />, label: 'Messages' },
    { path: '/user-dashboard/payments', icon: <FaCreditCard />, label: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-tennis-green font-bold text-xl">
                  TennisCourt
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">Welcome, {user?.firstName}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen fixed">
          <nav className="mt-5">
            <div className="px-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-tennis-green text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-tennis-green'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
