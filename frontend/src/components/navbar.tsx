import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [navBackground, setNavBackground] = useState('bg-transparent');

  useEffect(() => {
    // Set background color based on current route
    switch(location.pathname) {
      case '/':
        setNavBackground('bg-white bg-opacity-90');
        break;
      case '/aboutus':
        setNavBackground('bg-tennis-green bg-opacity-90 text-white');
        break;
      default:
        setNavBackground('bg-tennis-green');
    }
  }, [location.pathname]);

  return (
    <nav className={`fixed top-0 left-0 w-full flex justify-between items-center px-10 py-5 z-50 transition-colors duration-300 ${navBackground}`}>
      <Link to="/" className="text-2xl font-bold hover:text-tennis-yellow transition duration-200">
        TennisCourt
      </Link>
      
      <div className="flex items-center space-x-10">
        <ul className="flex space-x-10">
          <li className="hover:text-yellow-400 cursor-pointer font-semibold">
            <Link to="/">Home</Link>
          </li>
          <li className="hover:text-yellow-400 cursor-pointer font-semibold">
            <Link to="/aboutus">About us</Link>
          </li>
          <li className="hover:text-yellow-400 cursor-pointer font-semibold">
            <Link to="/courts">Courts</Link>
          </li>
          <li className="hover:text-yellow-400 cursor-pointer font-semibold">
            <Link to={isAuthenticated ? "/bookings" : "/login"}>Book Now</Link>
          </li>
          <li className="hover:text-yellow-400 cursor-pointer font-semibold">
            <Link to={isAuthenticated ? "/membership" : "/login"}>Membership</Link>
          </li>
        </ul>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link 
                to={user?.role === 'admin' ? "/admin" : "/user"} 
                className="hover:text-yellow-400 cursor-pointer font-semibold"
              >
                Dashboard
              </Link>
             
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="hover:text-yellow-400 cursor-pointer font-semibold"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-white text-tennis-green px-4 py-2 rounded-md hover:bg-gray-100 transition duration-200 font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;