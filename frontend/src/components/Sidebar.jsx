import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import {
  Home,
  LayoutDashboard,
  Users,
  MessageSquare,
  LogOut,
  LogIn,
  UserPlus,
  UserCog,
  Menu,
} from 'lucide-react';

// ── Veggie avatar helper ─────────────────────────────────────────────────────
const VEGGIE_AVATARS = [
  { id: '1', url: '/avatars/avatar_carrot.png' },
  { id: '2', url: '/avatars/avatar_broccoli.png' },
  { id: '3', url: '/avatars/avatar_tomato.png' },
  { id: '4', url: '/avatars/avatar_eggplant.png' },
  { id: '5', url: '/avatars/avatar_corn.png' },
  { id: '6', url: '/avatars/avatar_pea.png' },
];
const getAvatarUrl = (id) =>
  VEGGIE_AVATARS.find((a) => a.id === String(id))?.url || null;

/* ── Inline styles ──────────────────────────────────────────────────────────── */
const S = {
  sidebar: (collapsed) => ({
    height: '100vh',
    width: collapsed ? '72px' : '240px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    borderRight: '1.5px solid #f0ece5',
    transition: 'width 0.25s ease',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    zIndex: 50,
    overflow: 'hidden',
  }),

  logoRow: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    borderBottom: '1.5px solid #f5f2ee',
    flexShrink: 0,
  },

  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },

  brandIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #f97316, #fb923c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  brandText: {
    fontSize: '1.1rem',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    color: '#1a1a1a',
  },

  brandSpan: { color: '#f97316' },

  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.45rem',
    borderRadius: '8px',
    color: '#aaa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s, color 0.2s',
    flexShrink: 0,
  },

  navSection: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  sectionLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#ccc',
    padding: '0 0.5rem',
    marginBottom: '0.4rem',
    marginTop: '0.25rem',
    whiteSpace: 'nowrap',
  },

  navItem: (active, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: '0.75rem',
    padding: collapsed ? '0.7rem' : '0.65rem 0.875rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: active ? 700 : 500,
    color: active ? '#f97316' : '#666',
    background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
    border: active ? '1px solid rgba(249,115,22,0.18)' : '1px solid transparent',
    transition: 'all 0.18s',
    position: 'relative',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }),

  badge: {
    marginLeft: 'auto',
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    flexShrink: 0,
  },

  badgeOnIcon: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.6rem',
    fontWeight: 700,
    minWidth: '15px',
    height: '15px',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
  },

  // ── Profile footer ────────────────────────────────────────────────────────
  profileFooter: (collapsed) => ({
    borderTop: '1.5px solid #f5f2ee',
    padding: collapsed ? '0.75rem 0' : '0.875rem 0.875rem 0.75rem',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  }),

  profileRow: (collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : '0.7rem',
    justifyContent: collapsed ? 'center' : 'flex-start',
    marginBottom: collapsed ? 0 : '0.65rem',
  }),

  avatarCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.9rem',
    flexShrink: 0,
    overflow: 'hidden',
    border: '2px solid rgba(249,115,22,0.2)',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    display: 'block',
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },

  profileName: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#1a1a1a',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  profileEmail: {
    fontSize: '0.7rem',
    color: '#aaa',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  logoutRow: (collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: collapsed ? '0.6rem' : '0.5rem 0.6rem',
    borderRadius: '8px',
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    transition: 'background 0.18s, color 0.18s',
    justifyContent: collapsed ? 'center' : 'flex-start',
  }),
};

export function Sidebar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { notificationCount, resetNotificationCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);

  // Fetch full profile (name, email, avatar)
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/users/profile')
      .then((res) => setProfile(res.data.user))
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = isAuthenticated
    ? [
        { name: 'Dashboard',    path: '/dashboard',    icon: <LayoutDashboard size={18} /> },
        { name: 'Matches',      path: '/matches',      icon: <Users size={18} /> },
        {
          name: 'Chat',
          path: '/chat',
          icon: <MessageSquare size={18} />,
          badge: notificationCount > 0 ? notificationCount : null,
          onClick: resetNotificationCount,
        },
        { name: 'Edit Profile', path: '/profile-setup', icon: <UserCog size={18} /> },
      ]
    : [
        { name: 'About',    path: '/',         icon: <Home size={18} /> },
        { name: 'Login',    path: '/login',    icon: <LogIn size={18} /> },
        { name: 'Register', path: '/register', icon: <UserPlus size={18} /> },
      ];

  // Profile display data
  const displayName = profile?.name || user?.name || '';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = getAvatarUrl(profile?.avatar);
  const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={S.sidebar(isCollapsed)}>

      {/* ── Logo Row ── */}
      <div style={S.logoRow}>
        {!isCollapsed && (
          <Link to="/" style={S.brandLink}>
            <div style={S.brandIcon}>
              <Users size={16} color="#fff" />
            </div>
            <span style={S.brandText}>
              Dev<span style={S.brandSpan}>Swap</span>
            </span>
          </Link>
        )}
        <button
          style={{
            ...S.toggleBtn,
            ...(isCollapsed ? { margin: '0 auto' } : {}),
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f2ee'; e.currentTarget.style.color = '#555'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#aaa'; }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Nav Items ── */}
      <div style={S.navSection}>
        {!isCollapsed && (
          <div style={S.sectionLabel}>Menu</div>
        )}

        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={item.onClick}
            style={S.navItem(isActive(item.path), isCollapsed)}
            title={isCollapsed ? item.name : ''}
            onMouseEnter={e => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = '#faf8f5';
                e.currentTarget.style.color = '#333';
              }
            }}
            onMouseLeave={e => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0, color: isActive(item.path) ? '#f97316' : '#aaa', display: 'flex' }}>
              {item.icon}
              {isCollapsed && item.badge && (
                <span style={S.badgeOnIcon}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            {!isCollapsed && <span>{item.name}</span>}

            {!isCollapsed && item.badge && (
              <span style={S.badge}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ── Profile Footer (authenticated only) ── */}
      {isAuthenticated && (
        <div style={S.profileFooter(isCollapsed)}>

          {/* Avatar + name + email */}
          <div style={S.profileRow(isCollapsed)}>
            <Link
              to="/profile-setup"
              title={isCollapsed ? displayName : 'Edit profile'}
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <div style={S.avatarCircle}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} style={S.avatarImg} />
                ) : (
                  initials
                )}
              </div>
            </Link>

            {!isCollapsed && (
              <div style={S.profileInfo}>
                <span style={S.profileName} title={displayName}>{displayName}</span>
                <span style={S.profileEmail} title={displayEmail}>{displayEmail}</span>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            style={S.logoutRow(isCollapsed)}
            onClick={handleLogout}
            title="Log out"
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fff1f2';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Log out</span>}
          </button>

        </div>
      )}
    </div>
  );
}
