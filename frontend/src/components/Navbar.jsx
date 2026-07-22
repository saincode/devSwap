import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="DevSwap Logo" className="h-16 md:h-20 w-auto object-contain" />
        </Link>

        <ul className="flex items-center gap-6 text-gray-600 font-medium">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/" className="hover:text-indigo-600 transition">About</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-indigo-600 transition">Matches</Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-indigo-600 transition">💬 Chat</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-600 transition">Profile</Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold py-2 px-5 rounded-full transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition">Login</Link>
              </li>
              <li>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold py-2 px-6 rounded-full shadow-md transition">
                  Join Free
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
