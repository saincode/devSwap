import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SkillSelector } from '../components/SkillSelector';
import api from '../services/api';
import './ProfileSetupPage.css';

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
  'Skill Expert':        { color: '#7c3aed', bg: '#f5f3ff' },
  'Portfolio Pro':       { color: '#0891b2', bg: '#ecfdf5' },
  'Complete Profile':    { color: '#059669', bg: '#f0fdf4' },
  'Fast Learner':        { color: '#2563eb', bg: '#eff6ff' },
  'Top Mentor':          { color: '#dc2626', bg: '#fef2f2' },
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

// ─── Sidebar Completion Widget ────────────────────────────────────────────────
function SidebarCompletion({ percent, checks }) {
  const barColor =
    percent >= 80
      ? 'linear-gradient(90deg,#38a169,#48bb78)'
      : percent >= 50
      ? 'linear-gradient(90deg,#d69e2e,#ecc94b)'
      : 'linear-gradient(90deg,#667eea,#764ba2)';

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
                {checks?.[s.key] ? '✓' : ''}
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
            {checks?.[s.key] ? '✓' : '○'} {s.label}
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
          <p style={{ color: '#2563eb', fontWeight: 600 }}>Loading your profile…</p>
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
          <CompletionStrip percent={profileCompletion} checks={completionChecks} />
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
                <div>
                  <p className="ps-section-title">About</p>
                  <p className="ps-section-desc">Tell others about yourself, your experience, and what excites you.</p>
                </div>
              </div>
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

            {/* 2. Skills You Can Teach ───────────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <div>
                  <p className="ps-section-title">Skills You Can Teach 🎓</p>
                  <p className="ps-section-desc">Select a skill then pick your proficiency level.</p>
                </div>
              </div>
              <SkillSelector
                selectedSkills={formData.skillsOffered}
                proficiency={formData.skillProficiency}
                onAdd={handleAddOffered}
                onRemove={handleRemoveOffered}
                placeholder="Browse or search skills you can teach…"
                tagVariant=""
              />
            </div>

            {/* 3. Skills You Want to Learn ───────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <div>
                  <p className="ps-section-title">Skills You Want to Learn 🎯</p>
                  <p className="ps-section-desc">Select a skill then pick your current level.</p>
                </div>
              </div>
              <SkillSelector
                selectedSkills={formData.skillsWanted}
                proficiency={formData.skillProficiency}
                onAdd={handleAddWanted}
                onRemove={handleRemoveWanted}
                placeholder="Browse or search skills you want to learn…"
                tagVariant="wanted"
              />
            </div>

            {/* 4. Learning Goal ──────────────────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <div>
                  <p className="ps-section-title">Learning Goals</p>
                  <p className="ps-section-desc">Helps us pair you with the right people.</p>
                </div>
              </div>
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

            {/* 5. Social & Portfolio Links ───────────────────────────────── */}
            <div className="ps-section">
              <div className="ps-section-header">
                <div>
                  <p className="ps-section-title">Social & Portfolio Links</p>
                  <p className="ps-section-desc">Showcase your work to potential skill partners.</p>
                </div>
              </div>
              <div className="social-links-grid">
                {SOCIAL_FIELDS.map((f) => (
                  <div key={f.key} className="social-input-row">
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

            {/* 6. Beginner Mode ──────────────────────────────────────────── */}
            <div className="ps-section">
              <p className="ps-section-title" style={{ marginBottom: 12 }}>Preferences</p>
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

            {/* Submit ────────────────────────────────────────────────────── */}
            <div className="ps-submit-row">
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {profileCompletion >= 80 && (
                <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
                  Profile looks great!
                </span>
              )}
            </div>

          </div>
        </form>

        {/* ── Right Sidebar ─────────────────────────────────────────────── */}
        <aside className="profile-setup-sidebar">
          <SidebarCompletion percent={profileCompletion} checks={completionChecks} />
          <SidebarBadges badges={badges} />

          {/* Tips widget */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">💡 Tips</div>
            <div className="sidebar-widget-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🎓', text: 'Add at least 3 skills you can teach for better matches.' },
                { icon: '🔗', text: 'Linking GitHub boosts your credibility significantly.' },
                { icon: '🎯', text: 'Setting a learning goal helps us find the right partners.' },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{tip.icon}</span>
                  <span style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
