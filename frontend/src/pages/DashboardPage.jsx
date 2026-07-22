import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HelpCircle,
  GraduationCap, BookOpen, Flag,
  Lightbulb, ArrowRight, ChevronRight,
  User, Award, Link2,
  Code2, Briefcase, Globe, Pencil,
  Zap, Users, Edit3,
  TrendingUp, MessageCircle,
} from 'lucide-react';
import api from '../services/api';
import './DashboardPage.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const BADGE_META = {
  'Skill Expert':        { Icon: Zap      },
  'Portfolio Pro':       { Icon: Award    },
  'Complete Profile':    { Icon: User     },
  'Fast Learner':        { Icon: Zap      },
  'Top Mentor':          { Icon: Users    },
  'Active Collaborator': { Icon: Users    },
};

const SOCIAL_META = {
  github:    { Icon: Code2,    label: 'GitHub'    },
  linkedin:  { Icon: Briefcase, label: 'LinkedIn'  },
  portfolio: { Icon: Globe,    label: 'Portfolio' },
  behance:   { Icon: Pencil,   label: 'Behance'   },
};

const GOAL_DESCRIPTIONS = {
  'Job Preparation':    'Transitioning into a full-time tech career.',
  'Freelancing':        'Transitioning into full-time freelance digital product design.',
  'Startup Building':   'Building my own product from scratch.',
  'Personal Interest':  'Learning for the love of it.',
  'College / Academic': 'Supporting coursework & academic projects.',
};


const VEGGIE_AVATARS = [
  { id: '1', url: '/avatars/avatar_carrot.png',   name: 'Carrot'    },
  { id: '2', url: '/avatars/avatar_broccoli.png', name: 'Broccoli'  },
  { id: '3', url: '/avatars/avatar_tomato.png',   name: 'Tomato'    },
  { id: '4', url: '/avatars/avatar_eggplant.png', name: 'Eggplant'  },
  { id: '5', url: '/avatars/avatar_corn.png',     name: 'Corn'      },
  { id: '6', url: '/avatars/avatar_pea.png',      name: 'Pea'       },
];

const getAvatarUrl = (id) =>
  VEGGIE_AVATARS.find(a => a.id === String(id))?.url || VEGGIE_AVATARS[0].url;

// ─── Component ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [pct, setPct]         = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        setProfile(res.data.user);
        setPct(res.data.profileCompletion || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="db-loading">
        <div className="db-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const firstName  = profile?.name?.split(' ')[0] ?? 'there';
  const badges     = profile?.badges || [];
  const socials    = Object.entries(profile?.socialLinks || {}).filter(([, v]) => v);
  const hasSkills  = profile?.skillsOffered?.length > 0 && profile?.skillsWanted?.length > 0;
  const goalDesc   = GOAL_DESCRIPTIONS[profile?.learningGoal] || '';

  return (
    <div className="db">

      {/* ══ TOP BAR ══════════════════════════════════════════ */}
      <div className="db-topbar">
        <div className="db-topbar-right">
          <button className="db-topbar-icon-btn" title="FAQ">
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════ */}
      <div className="db-body">

        {/* ── LEFT COLUMN ──────────────────────────────────── */}
        <div className="db-left">

          {/* Page heading */}
          <div>
            <h1 className="db-page-title">Welcome back, {firstName}!</h1>
            <p className="db-page-sub">Ready to discover your next great skill partnership?</p>
          </div>

          {/* Completion bar */}
          <div className="db-completion-bar-wrap">
            <span className="db-completion-bar-label">Profile Completion</span>
            <div className="db-completion-track">
              <div className="db-completion-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="db-completion-pct">{pct}%</span>
          </div>

          {/* Stats */}
          <div className="db-stats-row">
            {[
              { Icon: GraduationCap, category: 'Teaching', value: profile?.skillsOffered?.length || 0, lbl: 'Skills'  },
              { Icon: BookOpen,      category: 'Learning', value: profile?.skillsWanted?.length  || 0, lbl: 'Skills'  },
              { Icon: Award,         category: 'Badges',   value: badges.length,                        lbl: 'Earned'  },
              { Icon: Link2,         category: 'Links',    value: socials.length,                       lbl: 'Added'   },
            ].map(s => (
              <div key={s.category} className="db-stat-card">
                <div className="db-stat-category">{s.category}</div>
                <div className="db-stat-num">{s.value}</div>
                <div className="db-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Skills 2-col */}
          <div className="db-skills-grid">

            <div className="db-card">
              <div className="db-card-head">
                <div className="db-card-head-left">
                  <div className="db-card-icon"><GraduationCap size={15} /></div>
                  <span className="db-card-title">Skills I Teach</span>
                </div>
                <Link to="/profile-setup" className="db-card-action">+ Add</Link>
              </div>
              <div className="db-card-body">
                {profile?.skillsOffered?.length > 0 ? (
                  <div className="db-pill-wrap">
                    {profile.skillsOffered.map(s => (
                      <span key={s} className="db-pill">{s}</span>
                    ))}
                  </div>
                ) : (
                  <div className="db-empty">
                    <GraduationCap size={28} className="db-empty-svg" />
                    <span className="db-empty-text">Nothing added yet</span>
                    <Link to="/profile-setup" className="db-empty-link">Add skills →</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-head">
                <div className="db-card-head-left">
                  <div className="db-card-icon"><BookOpen size={15} /></div>
                  <span className="db-card-title">Skills I'm Learning</span>
                </div>
                <Link to="/profile-setup" className="db-card-action">+ Add</Link>
              </div>
              <div className="db-card-body">
                {profile?.skillsWanted?.length > 0 ? (
                  <div className="db-pill-wrap">
                    {profile.skillsWanted.map(s => (
                      <span key={s} className="db-pill">{s}</span>
                    ))}
                  </div>
                ) : (
                  <div className="db-empty">
                    <BookOpen size={28} className="db-empty-svg" />
                    <span className="db-empty-text">Nothing added yet</span>
                    <Link to="/profile-setup" className="db-empty-link">Add skills →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="db-cta">
            <div className="db-cta-text">
              <div className="db-cta-title">
                {hasSkills ? 'Ready to Find Your Skill Partner?' : 'Complete Your Profile to Get Matched'}
              </div>
              <div className="db-cta-desc">
                {hasSkills
                  ? "We'll match you with developers who teach what you want to learn — and want to learn what you teach."
                  : 'Add at least one skill you can teach and one you want to learn to start matching.'}
              </div>
            </div>
            <button
              className="db-cta-btn"
              onClick={() => navigate(hasSkills ? '/matches' : '/profile-setup')}
            >
              {hasSkills ? 'Find Matches' : 'Complete Profile'}
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Current Learning Goal */}
          {profile?.learningGoal && (
            <div className="db-card">
              <div className="db-card-head">
                <div className="db-card-head-left">
                  <div className="db-card-icon"><Flag size={15} /></div>
                  <span className="db-card-title">Current Learning Goal</span>
                </div>
                <Link to="/profile-setup" className="db-card-action">Change</Link>
              </div>
              <div className="db-card-body">
                <div className="db-goal-row">
                  <div className="db-goal-icon-box"><Briefcase size={16} /></div>
                  <div>
                    <div className="db-goal-name">{profile.learningGoal}</div>
                    {goalDesc && <p className="db-goal-desc">{goalDesc}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="db-quick-actions">
            {[
              { Icon: Users,         label: 'Browse Matches', desc: 'Find your skill partner', path: '/matches' },
              { Icon: MessageCircle, label: 'Messages',        desc: 'Chat with connections',   path: '/chat'    },
            ].map(a => (
              <Link key={a.path} to={a.path} className="db-qa-card">
                <div className="db-qa-icon"><a.Icon size={16} /></div>
                <div className="db-qa-label">{a.label}</div>
                <div className="db-qa-desc">{a.desc}</div>
                <ChevronRight size={14} className="db-qa-arrow" />
              </Link>
            ))}
          </div>

          {/* How it works */}
          <div className="db-card">
            <div className="db-card-head">
              <div className="db-card-head-left">
                <div className="db-card-icon"><Lightbulb size={15} /></div>
                <span className="db-card-title">How DevSwap Works</span>
              </div>
            </div>
            <div className="db-card-body" style={{ padding: '0.5rem 1.1rem 0.875rem' }}>
              {[
                { step: '1', text: 'Add skills you can teach and skills you want to learn.' },
                { step: '2', text: 'Get matched with people who complement your skills.' },
                { step: '3', text: 'Start chatting and schedule a skill swap session.' },
              ].map(t => (
                <div key={t.step} className="db-tip-row">
                  <div className="db-tip-step">{t.step}</div>
                  <p className="db-tip-text">{t.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────── */}
        <div className="db-right">

          {/* Profile Card */}
          <div className="db-profile-card">
            <div className="db-profile-card-head">
              <span className="db-profile-card-title">Profile</span>
              <Link to="/profile-setup" className="db-profile-edit-link">
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <div className="db-profile-body">
              <div className="db-avatar-lg db-avatar-lg--img">
                <img
                  src={getAvatarUrl(profile?.avatar)}
                  alt={profile?.name || 'Avatar'}
                  className="db-avatar-img"
                />
                <span className="db-online-dot" />
              </div>
              <div className="db-profile-name">{profile?.name}</div>
              <div className="db-profile-email">{profile?.email}</div>

              {profile?.bio && (
                <>
                  <div className="db-profile-about-label">About</div>
                  <p className="db-profile-bio">{profile.bio}</p>
                </>
              )}

              {profile?.isBeginnerMode && (
                <div className="db-beginner-chip">
                  <TrendingUp size={11} /> Beginner Mode
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="db-badges-card">
              <div className="db-badges-head">
                <Award size={15} className="db-badges-head-icon" />
                <span className="db-badges-head-title">Badges</span>
              </div>
              <div className="db-badges-list">
                {badges.map(badge => {
                  const m = BADGE_META[badge] || { Icon: Award };
                  return (
                    <div key={badge} className="db-badge-row">
                      <div className="db-badge-icon-circle">
                        <m.Icon size={13} />
                      </div>
                      <span className="db-badge-name">{badge}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connect */}
          {socials.length > 0 && (
            <div className="db-connect-card">
              <div className="db-connect-head">
                <Link2 size={15} className="db-connect-head-icon" />
                <span className="db-connect-head-title">Connect</span>
              </div>
              <div className="db-connect-list">
                {socials.map(([key, url]) => {
                  const meta = SOCIAL_META[key] || { Icon: Globe, label: key };
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="db-social-link"
                    >
                      <div className="db-social-icon-circle">
                        <meta.Icon size={13} />
                      </div>
                      <span>{meta.label}</span>
                      <ChevronRight size={13} className="db-social-arrow" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
