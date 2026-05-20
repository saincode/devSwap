import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BADGE_META = {
  'Skill Expert':        { icon: '🧠', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  'Portfolio Pro':       { icon: '🌟', color: 'text-amber-700', bg: 'bg-amber-50' },
  'Complete Profile':    { icon: '✅', color: 'text-green-700', bg: 'bg-green-50' },
  'Fast Learner':        { icon: '⚡', color: 'text-blue-700', bg: 'bg-blue-50' },
  'Top Mentor':          { icon: '🏆', color: 'text-red-700', bg: 'bg-red-50' },
  'Active Collaborator': { icon: '🤝', color: 'text-orange-700', bg: 'bg-orange-50' },
};

const SOCIAL_ICONS = {
  github:    { icon: '🐙', label: 'GitHub' },
  linkedin:  { icon: '🔗', label: 'LinkedIn' },
  portfolio: { icon: '🌐', label: 'Portfolio' },
  behance:   { icon: '✏️', label: 'Behance' },
};

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon, value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SkillPill({ skill, variant }) {
  const baseClasses = 'inline-flex px-3 py-1.5 rounded-full text-xs font-semibold transition';
  const classes = variant === 'wanted' 
    ? `${baseClasses} bg-pink-100 text-pink-900 hover:bg-pink-200`
    : `${baseClasses} bg-indigo-100 text-indigo-900 hover:bg-indigo-200`;
  return <span className={classes}>{skill}</span>;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        setProfile(res.data.user);
        setProfileCompletion(res.data.profileCompletion || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const hasSkills = profile?.skillsOffered?.length > 0 && profile?.skillsWanted?.length > 0;
  const socialLinks = profile?.socialLinks || {};
  const activeSocials = Object.entries(socialLinks).filter(([, v]) => v);
  const badges = profile?.badges || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* ── Loading State ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-indigo-600">Loading your dashboard…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ── Hero Banner ────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Hero Content */}
              <div className="flex items-center justify-between gap-6 mb-6 flex-col md:flex-row">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                    {getInitials(profile?.name)}
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold leading-tight mb-1">Welcome back, {profile?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-blue-100 text-sm mb-2">{profile?.email}</p>
                    {profile?.learningGoal && (
                      <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm">
                        🎯 {profile.learningGoal}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Link to="/profile-setup" className="px-6 py-2 bg-white/20 text-white border border-white/35 rounded-lg font-semibold hover:bg-white/30 transition">
                    ✏️ Edit Profile
                  </Link>
                  <button onClick={() => navigate('/matches')} className="px-6 py-2 bg-white text-indigo-700 rounded-lg font-bold hover:bg-gray-100 shadow-lg transition">
                    🔍 Find Matches
                  </button>
                </div>
              </div>

              {/* Completion Bar */}
              <div className="bg-black/15 border-t border-white/10 pt-4 pb-4 -mx-6 px-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider whitespace-nowrap">Profile Completion</span>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${profileCompletion}%`,
                        background: profileCompletion >= 80 ? '#10b981' : profileCompletion >= 50 ? '#f59e0b' : 'white'
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white whitespace-nowrap">{profileCompletion}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat Strip ────────────────────────────────────────────────── */}
          <div className="max-w-7xl mx-auto px-6 py-8 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard icon="🎓" value={profile?.skillsOffered?.length || 0} label="Skills Teaching" />
              <StatCard icon="🎯" value={profile?.skillsWanted?.length || 0} label="Skills Learning" />
              <StatCard icon="🏅" value={badges.length} label="Badges Earned" />
              <StatCard icon="🔗" value={activeSocials.length} label="Links Added" />
            </div>
          </div>

          {/* ── Main Grid ──────────────────────────────────────────────────── */}
          <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-6">

            {/* ── Left Column (Sidebar) ─────────────────────────────────────── */}
            <aside className="md:col-span-1 space-y-6">
              {/* Profile Info Card */}
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Profile</h2>
                  <Link to="/profile-setup" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">Edit →</Link>
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl font-bold mb-3">
                  {getInitials(profile?.name)}
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">{profile?.name}</p>
                <p className="text-sm text-gray-500 mb-4 break-all">{profile?.email}</p>

                {profile?.bio && (
                  <div className="border-t border-gray-200 pt-3 mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About</p>
                    <p className="text-sm text-gray-600 line-clamp-5">{profile.bio}</p>
                  </div>
                )}

                {profile?.isBeginnerMode && (
                  <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-2 text-xs font-semibold text-amber-900">
                    👶 Beginner Mode
                  </div>
                )}
              </div>

              {/* Social Links Card */}
              {activeSocials.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Links</h2>
                  </div>
                  <div className="space-y-2">
                    {activeSocials.map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 text-sm font-medium transition"
                      >
                        <span className="text-lg">{SOCIAL_ICONS[key]?.icon}</span>
                        <span className="flex-1">{SOCIAL_ICONS[key]?.label}</span>
                        <span className="text-gray-400">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges Card */}
              {badges.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Badges</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {badges.map(badge => {
                      const meta = BADGE_META[badge] || { icon: '🏅', color: 'text-indigo-700', bg: 'bg-indigo-50' };
                      return (
                        <div key={badge} className={`${meta.bg} ${meta.color} px-3 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                          <span>{meta.icon}</span> {badge}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>

            {/* ── Right Columns ──────────────────────────────────────────── */}
            <div className="md:col-span-3 space-y-6">

              {/* Skills Cards Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Can Teach */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-base">🎓</div>
                      <h3 className="text-lg font-bold text-gray-900">Can Teach</h3>
                    </div>
                    <Link to="/profile-setup" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">Add →</Link>
                  </div>
                  {profile?.skillsOffered?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsOffered.map(s => <SkillPill key={s} skill={s} />)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-500">
                      <span className="text-3xl">📭</span>
                      <p className="text-sm">No skills added yet.</p>
                      <Link to="/profile-setup" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">Add Skills</Link>
                    </div>
                  )}
                </div>

                {/* Want to Learn */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-base">🎯</div>
                      <h3 className="text-lg font-bold text-gray-900">Want to Learn</h3>
                    </div>
                    <Link to="/profile-setup" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">Add →</Link>
                  </div>
                  {profile?.skillsWanted?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsWanted.map(s => <SkillPill key={s} skill={s} variant="wanted" />)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-500">
                      <p className="text-sm">No skills added yet.</p>
                      <Link to="/profile-setup" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">Add Skills</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Banner */}
              {hasSkills ? (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md p-8 flex items-center justify-between gap-6 flex-col md:flex-row">
                  <div className="flex items-center gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Ready to Find Matches?</h3>
                      <p className="text-blue-100">Connect with people who want to learn what you teach — and vice versa!</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/matches')} className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-lg hover:bg-gray-100 shadow-lg transition flex-shrink-0">
                    Find Matches
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-amber-900 rounded-2xl shadow-md p-8 flex items-center justify-between gap-6 flex-col md:flex-row">
                  <div className="flex items-center gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Complete Your Profile</h3>
                      <p className="text-amber-800">Add skills you can teach and want to learn to start getting matched with the right people.</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/profile-setup')} className="px-8 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 shadow-lg transition flex-shrink-0">
                    Complete Profile
                  </button>
                </div>
              )}

              {/* Learning Goal */}
              {profile?.learningGoal && (
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Learning Goal</h2>
                  </div>
                  <p className="text-lg font-semibold text-indigo-900">{profile.learningGoal}</p>
                </div>
              )}

              {/* Quick Navigation Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/matches" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200 flex items-center gap-4 group">
                  <div>
                    <p className="font-bold text-gray-900">Browse Matches</p>
                    <p className="text-xs text-gray-500">Find skill swap partners</p>
                  </div>
                  <span className="ml-auto text-gray-400 group-hover:text-indigo-600 transition">→</span>
                </Link>
                <Link to="/chat" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200 flex items-center gap-4 group">
                  <div>
                    <p className="font-bold text-gray-900">Messages</p>
                    <p className="text-xs text-gray-500">Chat with your matches</p>
                  </div>
                  <span className="ml-auto text-gray-400 group-hover:text-indigo-600 transition">→</span>
                </Link>
                <Link to="/profile-setup" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-200 flex items-center gap-4 group">
                  <div>
                    <p className="font-bold text-gray-900">Edit Profile</p>
                    <p className="text-xs text-gray-500">Update skills & info</p>
                  </div>
                  <span className="ml-auto text-gray-400 group-hover:text-indigo-600 transition">→</span>
                </Link>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
