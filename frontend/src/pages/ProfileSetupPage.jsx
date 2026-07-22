import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SkillSelector } from '../components/SkillSelector';
import api from '../services/api';
import './ProfileSetupPage.css';

// ─── SVG Icon Components ───────────────────────────────────────────────────────
const IconPen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const IconAcademic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const IconFlag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const IconLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const IconLightbulb = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconGithub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const IconLinkedin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

const IconBehance = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.726zm-7.726-3h3.957c-.005-1.837-1.351-2.327-1.986-2.327-.828 0-1.864.525-1.971 2.327zM9.646 9.015c.806.396 1.354 1.1 1.354 2.204 0 2.826-2.196 3.781-5.014 3.781H0V5h5.773c2.356 0 4.273.987 4.273 3.203 0 .815-.2 1.524-.4 1.812zm-6.32.739H4.59c.728 0 1.41-.288 1.41-1.114 0-.861-.682-1.15-1.41-1.15H3.326v2.264zm0 4.261h1.712c.886 0 1.712-.352 1.712-1.302 0-.99-.826-1.341-1.712-1.341H3.326v2.643z"/>
  </svg>
);

const SOCIAL_ICONS = {
  github:    <IconGithub />,
  linkedin:  <IconLinkedin />,
  portfolio: <IconGlobe />,
  behance:   <IconBehance />,
};

// ─── Constants ────────────────────────────────────────────────────────────────
const LEARNING_GOALS = [
  { id: 'job',      label: 'Job Preparation',   desc: 'Land a tech job or switch careers' },
  { id: 'free',     label: 'Freelancing',        desc: 'Build client projects & earn' },
  { id: 'startup',  label: 'Startup Building',   desc: 'Launch your own product' },
  { id: 'interest', label: 'Personal Interest',  desc: 'Learn for the love of it' },
  { id: 'college',  label: 'College / Academic', desc: 'Support coursework & projects' },
];

const SOCIAL_FIELDS = [
  { key: 'github',    label: 'GitHub',    placeholder: 'https://github.com/username' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username' },
  { key: 'portfolio', label: 'Portfolio', placeholder: 'https://yourportfolio.com' },
  { key: 'behance',   label: 'Behance',   placeholder: 'https://behance.net/username' },
];

const BADGE_META = {
  'Skill Expert':        { color: '#ea580c', bg: '#fff7ed' },
  'Portfolio Pro':       { color: '#b45309', bg: '#fef3c7' },
  'Complete Profile':    { color: '#c2410c', bg: '#ffedd5' },
  'Fast Learner':        { color: '#9a3412', bg: '#fee2e2' },
  'Top Mentor':          { color: '#92400e', bg: '#fef9c3' },
  'Active Collaborator': { color: '#d97706', bg: '#fffbeb' },
};

const COMPLETION_STEPS = [
  { key: 'hasBio',         label: 'Bio' },
  { key: 'hasOffered',     label: 'Skills to teach' },
  { key: 'hasWanted',      label: 'Skills to learn' },
  { key: 'hasProficiency', label: 'Proficiency' },
  { key: 'hasGoal',        label: 'Goal' },
  { key: 'hasGithub',      label: 'GitHub' },
  { key: 'hasLinkedin',    label: 'LinkedIn' },
  { key: 'hasPortfolio',   label: 'Portfolio' },
];

// ─── Vegetable Avatars ────────────────────────────────────────────────────────
const VEGGIE_AVATARS = [
  { id: '1', url: '/avatars/avatar_carrot.png',   name: 'Carrot' },
  { id: '2', url: '/avatars/avatar_broccoli.png', name: 'Broccoli' },
  { id: '3', url: '/avatars/avatar_tomato.png',   name: 'Tomato' },
  { id: '4', url: '/avatars/avatar_eggplant.png', name: 'Eggplant' },
  { id: '5', url: '/avatars/avatar_corn.png',     name: 'Corn' },
  { id: '6', url: '/avatars/avatar_pea.png',      name: 'Pea' },
];

const getAvatarUrl = (id) =>
  VEGGIE_AVATARS.find((a) => a.id === String(id))?.url || VEGGIE_AVATARS[0].url;

// ─── Avatar Picker Widget ─────────────────────────────────────────────────────
function AvatarPicker({ selectedId, onChange }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="avatar-picker-widget">
      <div className="sidebar-widget-header">Profile Picture</div>
      <div className="sidebar-widget-body avatar-picker-body">

        {/* Current avatar display */}
        <button
          type="button"
          className={`avatar-current-btn ${open ? 'active' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Change avatar"
        >
          <img
            src={getAvatarUrl(selectedId)}
            alt="Your avatar"
            className="avatar-current-img"
          />
          <span className="avatar-camera-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </span>
        </button>

        <p className="avatar-hint">{open ? 'Pick a veggie avatar below' : 'Tap to choose your avatar'}</p>

        {/* Inline avatar grid — expands below */}
        {open && (
          <div className="avatar-grid-panel">
            <p className="avatar-grid-title">Choose your avatar</p>
            <div className="avatar-grid">
              {VEGGIE_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`avatar-option ${selectedId === av.id ? 'selected' : ''}`}
                  onClick={() => { onChange(av.id); setOpen(false); }}
                  title={av.name}
                >
                  <img src={av.url} alt={av.name} />
                  {selectedId === av.id && (
                    <span className="avatar-option-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="avatar-privacy-note">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:4}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Avatars protect your real identity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar Completion Widget ────────────────────────────────────────────────
function SidebarCompletion({ percent, checks }) {
  const barColor =
    percent >= 80
      ? 'linear-gradient(90deg,#38a169,#48bb78)'
      : percent >= 50
      ? 'linear-gradient(90deg,#f97316,#fb923c)'
      : 'linear-gradient(90deg,#f97316,#ea6c0a)';

  return (
    <div className="sidebar-widget">
      <div className="sidebar-widget-header">Profile Completion</div>
      <div className="sidebar-widget-body">
        <div className="sidebar-completion-percent">{percent}%</div>
        <div className="sidebar-bar-track">
          <div
            className="sidebar-bar-fill"
            style={{ width: `${percent}%`, background: barColor }}
          />
        </div>
        <div className="sidebar-steps">
          {COMPLETION_STEPS.map((s) => (
            <div key={s.key} className={`sidebar-step ${checks?.[s.key] ? 'done' : ''}`}>
              <div className="sidebar-step-dot">
                {checks?.[s.key] ? <IconCheck /> : ''}
              </div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Badges Sidebar Widget ────────────────────────────────────────────────────
function SidebarBadges({ badges }) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="sidebar-widget">
      <div className="sidebar-widget-header">Your Badges</div>
      <div className="sidebar-widget-body">
        <div className="badges-row">
          {badges.map((badge) => {
            const meta = BADGE_META[badge] || { color: '#7c3aed', bg: '#f5f3ff' };
            return (
              <div
                key={badge}
                className="badge-chip"
                style={{ color: meta.color, background: meta.bg, borderColor: meta.color + '40' }}
              >
                <span className="badge-name">{badge}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Completion Strip (inside hero) ──────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function CompletionStrip({ percent, checks }) {
  const barWidth = `${percent}%`;
  return (
    <div className="profile-completion-strip">
      <span className="completion-strip-label">Profile</span>
      <span className="completion-strip-percent">{percent}%</span>
      <div className="completion-strip-bar-track">
        <div className="completion-strip-bar-fill" style={{ width: barWidth }} />
      </div>
      <div className="completion-strip-steps">
        {COMPLETION_STEPS.map((s) => (
          <span key={s.key} className={`completion-strip-step ${checks?.[s.key] ? 'done' : ''}`}>
            {checks?.[s.key] ? <IconCheck /> : <span className="strip-circle" />} {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ProfileSetupPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: '',
    skillsOffered: [],
    skillsWanted: [],
    skillProficiency: {},
    isBeginnerMode: false,
    learningGoal: '',
    socialLinks: { github: '', linkedin: '', portfolio: '', behance: '' },
    avatar: '1',
  });

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [completionChecks, setCompletionChecks] = useState({});
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        const u = res.data.user;
        const proficiency = u.skillProficiency
          ? (u.skillProficiency instanceof Map
              ? Object.fromEntries(u.skillProficiency)
              : u.skillProficiency)
          : {};
        setFormData({
          bio: u.bio || '',
          skillsOffered: u.skillsOffered || [],
          skillsWanted: u.skillsWanted || [],
          skillProficiency: proficiency,
          isBeginnerMode: u.isBeginnerMode || false,
          learningGoal: u.learningGoal || '',
          socialLinks: u.socialLinks || { github: '', linkedin: '', portfolio: '', behance: '' },
          avatar: u.avatar || '1',
        });
        setProfileCompletion(res.data.profileCompletion || 0);
        setCompletionChecks(res.data.completionChecks || {});
        setBadges(u.badges || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  // ── Skill handlers ─────────────────────────────────────────────────────────
  const handleAddOffered = (skill, level) =>
    setFormData((prev) => ({
      ...prev,
      skillsOffered: prev.skillsOffered.includes(skill) ? prev.skillsOffered : [...prev.skillsOffered, skill],
      skillProficiency: { ...prev.skillProficiency, [skill]: level },
    }));

  const handleRemoveOffered = (skill) =>
    setFormData((prev) => {
      const p = { ...prev.skillProficiency };
      delete p[skill];
      return { ...prev, skillsOffered: prev.skillsOffered.filter((s) => s !== skill), skillProficiency: p };
    });

  const handleAddWanted = (skill, level) =>
    setFormData((prev) => ({
      ...prev,
      skillsWanted: prev.skillsWanted.includes(skill) ? prev.skillsWanted : [...prev.skillsWanted, skill],
      skillProficiency: { ...prev.skillProficiency, [skill]: level },
    }));

  const handleRemoveWanted = (skill) =>
    setFormData((prev) => {
      const p = { ...prev.skillProficiency };
      delete p[skill];
      return { ...prev, skillsWanted: prev.skillsWanted.filter((s) => s !== skill), skillProficiency: p };
    });

  // ── Field helpers ──────────────────────────────────────────────────────────
  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));
  const setSocial = (key, val) =>
    setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: val } }));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/users/profile', formData);
      setProfileCompletion(res.data.profileCompletion || 0);
      setCompletionChecks(res.data.completionChecks || {});
      setBadges(res.data.user?.badges || []);
      setMessage('Profile updated successfully');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="profile-setup-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p style={{ color: '#f97316', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-setup-page">

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="profile-page-hero">
        <div className="profile-page-hero-inner">
          <div className="profile-page-title-row">
            <h1>Complete Your Profile</h1>
            <span className="subtitle">Tell us what you can teach, what you want to learn, and where you're headed.</span>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="profile-setup-body">

        {/* ── Main form ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>

          {message && (
            <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}
              style={{ marginBottom: 16 }}>
              {message}
            </div>
          )}

          <div className="profile-setup-main">

            {/* 1. About ──────────────────────────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <p className="ps-section-title"><span className="ps-icon"><IconPen /></span> About</p>
                <p className="ps-section-desc">Tell others about yourself, your experience, and what excites you.</p>
              </div>
              <div className="ps-section-body">
                <textarea
                  className="bio-textarea"
                  value={formData.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  placeholder="e.g. Full-stack developer with 3 years of React experience. Passionate about design systems and mentoring beginners…"
                  rows="4"
                  maxLength={500}
                />
                <small className="form-help">{formData.bio.length} / 500 characters</small>
              </div>
            </div>

            {/* 2. Skills You Can Teach ───────────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <p className="ps-section-title"><span className="ps-icon"><IconAcademic /></span> Skills I Can Teach</p>
                <p className="ps-section-desc">Select a skill then pick your proficiency level.</p>
              </div>
              <div className="ps-section-body">
                <SkillSelector
                  selectedSkills={formData.skillsOffered}
                  proficiency={formData.skillProficiency}
                  onAdd={handleAddOffered}
                  onRemove={handleRemoveOffered}
                  placeholder="Browse or search skills you can teach…"
                  tagVariant=""
                />
              </div>
            </div>

            {/* 3. Skills You Want to Learn ───────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <p className="ps-section-title"><span className="ps-icon"><IconTarget /></span> Skills I Want to Learn</p>
                <p className="ps-section-desc">Select a skill then pick your current level.</p>
              </div>
              <div className="ps-section-body">
                <SkillSelector
                  selectedSkills={formData.skillsWanted}
                  proficiency={formData.skillProficiency}
                  onAdd={handleAddWanted}
                  onRemove={handleRemoveWanted}
                  placeholder="Browse or search skills you want to learn…"
                  tagVariant="wanted"
                />
              </div>
            </div>

            {/* 4. Learning Goal ──────────────────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <p className="ps-section-title"><span className="ps-icon"><IconFlag /></span> Learning Goal</p>
                <p className="ps-section-desc">Helps us pair you with the right people.</p>
              </div>
              <div className="ps-section-body">
                <div className="goal-list">
                  {LEARNING_GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`goal-item ${formData.learningGoal === g.label ? 'selected' : ''}`}
                      onClick={() => set('learningGoal', formData.learningGoal === g.label ? '' : g.label)}
                    >
                      <div className="goal-item-dot" />
                      <div className="goal-item-text">
                        <span className="goal-item-label">{g.label}</span>
                        <span className="goal-item-desc">{g.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Social & Portfolio Links ───────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <p className="ps-section-title"><span className="ps-icon"><IconLink /></span> Social & Portfolio Links</p>
                <p className="ps-section-desc">Showcase your work to potential skill partners.</p>
              </div>
              <div className="ps-section-body">
                <div className="social-links-grid">
                  {SOCIAL_FIELDS.map((f) => (
                    <div key={f.key} className="social-input-row">
                      <span className="social-icon">{SOCIAL_ICONS[f.key]}</span>
                      <div className="social-input-wrap">
                        <label className="social-label">{f.label}</label>
                        <input
                          type="url"
                          className="social-input"
                          placeholder={f.placeholder}
                          value={formData.socialLinks[f.key] || ''}
                          onChange={(e) => setSocial(f.key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Beginner Mode ──────────────────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <p className="ps-section-title"><span className="ps-icon"><IconSettings /></span> Preferences</p>
              </div>
              <div className="ps-section-body">
                <div className="checkbox-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isBeginnerMode}
                      onChange={(e) => set('isBeginnerMode', e.target.checked)}
                    />
                    <span>I'm a beginner — match me with patient teachers</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit ────────────────────────────────────────────────────── */}
            <div className="ps-submit-row">
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? (
                  <><span className="btn-spinner" /> Saving…</>
                ) : (
                  <><IconCheck /> Save Profile</>
                )}
              </button>
              {profileCompletion >= 80 && (
                <span className="profile-great-badge">
                  <IconStar /> Profile looks great!
                </span>
              )}
            </div>

          </div>
        </form>

        {/* ── Right Sidebar ─────────────────────────────────────────────── */}
        <aside className="profile-setup-sidebar">

          {/* Avatar Picker — top of sidebar (self-contained widget) */}
          <div className="sidebar-widget avatar-picker-outer">
            <AvatarPicker
              selectedId={formData.avatar}
              onChange={(id) => set('avatar', id)}
            />
          </div>

          <SidebarCompletion percent={profileCompletion} checks={completionChecks} />
          <SidebarBadges badges={badges} />

          {/* Tips widget */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header tip-header"><IconLightbulb /> Tips</div>
            <div className="sidebar-widget-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <IconAcademic />, text: 'Add at least 3 skills you can teach for better matches.' },
                { icon: <IconGithub />,   text: 'Linking GitHub boosts your credibility significantly.' },
                { icon: <IconTarget />,   text: 'Setting a learning goal helps us find the right partners.' },
              ].map((tip, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-icon">{tip.icon}</span>
                  <span className="tip-text">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
