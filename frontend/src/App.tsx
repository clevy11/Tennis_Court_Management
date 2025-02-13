import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Login from './screen/login';
import Signup from './screen/signup';
import Dashboard from './screen/dashboard/Overview';
import CourtManagement from './screen/dashboard/CourtManagement';
import BookingManagement from './screen/dashboard/BookingManagement';
import UserDashboard from './screen/user-dashboard/UserDashboardLayout';
import UserBookings from './screen/user-dashboard/Bookings';
import PrivateRoute from './components/PrivateRoute';
import Courts from './screen/courts';
import Navbar from './components/navbar';
import WelcomeScreen from './screen/welcomescreen';
import AboutUs from './screen/aboutus';
import CourtsView from './screen/viewcourts';

// Separate component for routes that need access to Redux state
const AppRoutes = () => {
  // Get token from localStorage to determine authentication status
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!token;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/viewcourts" element={<CourtsView />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} />} />
      <Route path="/about" element={<AboutUs />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute
            isAuthenticated={isAuthenticated}
            role={user?.role}
            requiredRole="admin"
            redirectPath="/login"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courts" element={<CourtManagement />} />
              <Route path="/bookings" element={<BookingManagement />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/*"
        element={
          <PrivateRoute
            isAuthenticated={isAuthenticated}
            role={user?.role}
            requiredRole="user"
            redirectPath="/login"
          >
            <Routes>
              <Route path="/" element={<UserDashboard />} />
              <Route path="/bookings" element={<UserBookings />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Courts Route - Accessible by both admin and authenticated users */}
      <Route
        path="/courts"
        element={
          <PrivateRoute
            isAuthenticated={isAuthenticated}
            redirectPath="/login"
          >
            <Courts />
          </PrivateRoute>
        }
      />

      {/* Default Route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/user') : '/'} />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <AppRoutes />
        </div>
      </Router>
    </Provider>
  );
};

export default App;