import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import dashboard and other related screens
import UserDashboard from './dashboard';
// import CourtBooking from './courtBooking';
// import CoachingSession from './coachingSession';
// import Membership from './membership';
// import Messages from './messages';
// import Payments from './payments';

// Import the sidebar
import UserSidebar from '../../components/userSidebar';

// Layout component with static sidebar
const UserAppLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <UserSidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <Outlet /> {/* This is where child routes will be rendered */}
      </main>
    </div>
  );
};

const UserApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserAppLayout />}>
          {/* Dashboard as the default route */}
          <Route index element={<UserDashboard />} />
          
          {/* Other dashboard routes */}
          <Route path="dashboard" element={<UserDashboard />} />
          {/* <Route path="dashboard/court-booking" element={<CourtBooking />} />
          <Route path="dashboard/coaching-session" element={<CoachingSession />} />
          <Route path="dashboard/membership" element={<Membership />} />
          <Route path="dashboard/messages" element={<Messages />} />
          <Route path="dashboard/payments" element={<Payments />} /> */}
          
          {/* Redirect any unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default UserApp;