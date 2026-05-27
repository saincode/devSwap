import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export function Sidebar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = isAuthenticated ? [
    { name: 'About', path: '/', icon: <Home size={20} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Matches', path: '/matches', icon: <Users size={20} /> },
    { name: 'Chat', path: '/chat', icon: <MessageSquare size={20} /> },
  ] : [
    { name: 'About', path: '/', icon: <Home size={20} /> },
    { name: 'Login', path: '/login', icon: <LogIn size={20} /> },
    { name: 'Register', path: '/register', icon: <UserPlus size={20} /> },
  ];

  return (
    <div className={`h-screen bg-gradient-to-b from-indigo-950 via-indigo-950 to-indigo-900 text-white transition-all duration-300 flex flex-col ${isCollapsed ? 'w-[80px]' : 'w-[280px]'} flex-shrink-0 font-sans border-r border-indigo-900/40 z-50`}>
      <div className="h-20 flex items-center justify-between px-6 shrink-0">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-xl">
                <Users size={20} className="text-white" />
             </div>
            <span className="text-xl font-bold text-white tracking-wide">DevSwap</span>
          </Link>
        )}
        <button 
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            if (!isCollapsed) setSettingsOpen(false);
          }}
          className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          <Menu size={22} className="text-indigo-200 hover:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4 scrollbar-hide">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-indigo-300/50 uppercase tracking-wider mb-2 px-2">Menu</div>
        )}
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.path) 
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20' 
                : 'text-indigo-200/70 hover:bg-white/10 hover:text-white'
            }`}
            title={isCollapsed ? item.name : ""}
          >
            <div className={`${isActive(item.path) ? 'text-white' : 'text-indigo-300'}`}>
               {item.icon}
            </div>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
        
        {isAuthenticated && (
          <div className="mt-6 pt-4 flex flex-col gap-2 border-t border-indigo-900/60">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-indigo-300/50 uppercase tracking-wider mb-2 px-2">System</div>
            )}
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setSettingsOpen(!settingsOpen);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                settingsOpen 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-indigo-200/70 hover:bg-white/10 hover:text-white'
              }`}
              title={isCollapsed ? "Settings" : ""}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-start'} gap-4`}>
                <Settings size={20} className={`${settingsOpen ? 'text-white' : 'text-indigo-300'}`} />
                {!isCollapsed && <span>Settings</span>}
              </div>
              {!isCollapsed && (
                 settingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </button>

            {/* Nested Menu Items */}
            {!isCollapsed && settingsOpen && (
              <div className="flex flex-col gap-1 pl-12 pr-4 mt-1 mb-2 relative">
                {/* Vertical line indicator */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-indigo-500/20"></div>
                
                <Link
                  to="/profile"
                  className={`py-2 text-sm transition-colors ${isActive('/profile') ? 'text-white font-semibold' : 'text-indigo-200/70 hover:text-white'}`}
                >
                  Edit Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="py-2 text-sm text-left text-indigo-200/70 hover:text-rose-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* For collapsed logout icon */}
      {isAuthenticated && isCollapsed && (
         <div className="p-4 mb-4 border-t border-indigo-900/60">
           <button
             onClick={handleLogout}
             className="w-full flex items-center justify-center p-3 rounded-xl text-indigo-200/70 hover:bg-white/10 hover:text-rose-400 transition-all duration-200"
             title="Logout"
           >
             <LogOut size={20} />
           </button>
         </div>
      )}
    </div>
  );
}
