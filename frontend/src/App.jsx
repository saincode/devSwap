import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
const NO_SIDEBAR_PATHS = ['/', '/login', '/register'];

// Inner component that can access SocketContext
function AppRoutes() {
  const { socket } = useSocket();
  const location = useLocation();
  const showSidebar = !NO_SIDEBAR_PATHS.includes(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {showSidebar && <Sidebar />}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
