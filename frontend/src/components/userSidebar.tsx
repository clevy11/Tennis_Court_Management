import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faCalendarPlus, 
  faUserTie, 
  faIdCard, 
  faComments, 
  faCreditCard 
} from '@fortawesome/free-solid-svg-icons';

const UserSidebar: React.FC = () => {
  // You might want to get the username from context or props
  const username = "User"; // Replace with actual username retrieval

  return (
    <div className="w-64 bg-tennis-navy text-white h-full">
      <div className="p-4">
        <div className="mb-4 text-xl font-bold">
          Welcome, {username}
        </div>
        <nav className="space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-tennis-green transition duration-200"
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/dashboard/court-booking" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-tennis-green transition duration-200"
          >
            <FontAwesomeIcon icon={faCalendarPlus} />
            <span>Book a Court</span>
          </Link>
          
          <Link 
            to="/dashboard/coaching-sessions" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-tennis-green transition duration-200"
          >
            <FontAwesomeIcon icon={faUserTie} />
            <span>Coaching Sessions</span>
          </Link>
          
          <Link 
            to="/dashboard/membership" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-tennis-green transition duration-200"
          >
            <FontAwesomeIcon icon={faIdCard} />
            <span>Membership</span>
          </Link>
          
          <Link 
            to="/dashboard/messages" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-tennis-green transition duration-200"
          >
            <FontAwesomeIcon icon={faComments} />
            <span>Messages</span>
          </Link>
          
          <Link 
            to="/dashboard/payments" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-tennis-green transition duration-200"
          >
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Payments</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default UserSidebar;
