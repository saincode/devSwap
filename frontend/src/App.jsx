import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { ProfilePage } from './pages/ProfilePage';
import { MatchesPage } from './pages/MatchesPage';
import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';
import { useSocket } from './context/SocketContext';
import './App.css';

// Pages that should NOT show the sidebar
const NO_SIDEBAR_PATHS = ['/login', '/register'];

// Smart home: redirect authenticated users to dashboard, otherwise show landing page
function SmartHome() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

// Inner component that can access SocketContext
function AppRoutes() {
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  // Hide sidebar on auth pages and on the landing page when not logged in
  const showSidebar = !NO_SIDEBAR_PATHS.includes(location.pathname)
    && !(location.pathname === '/' && !isAuthenticated);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {showSidebar && <Sidebar />}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<SmartHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage socket={socket} />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}



function App() {
  return (
    <AuthProvider>
      <Router>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
