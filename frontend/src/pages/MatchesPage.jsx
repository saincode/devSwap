import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  Handshake,
  SearchX,
  MessageCircle,
  Target,
  Flame,
  Sparkles,
  GraduationCap,
  ArrowLeftRight,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import './MatchesPage.css';

function useStartChat() {
  const navigate = useNavigate();
  return (partner) => navigate('/chat', { state: { partner } });
}

// ── Helper: initials from name ────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Veggie avatar helpers ─────────────────────────────────────────────────────
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

export function MatchesPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const startChat = useStartChat();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedMatch, setExpandedMatch] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches/find');
        setMatches(response.data.matches);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load matches');
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [token]);

  const getCommonSkills    = (m) => (user?.skillsOffered || []).filter(s => (m.skillsWanted  || []).includes(s));
  const getSkillsTheyOffer = (m) => (m.skillsOffered || []).filter(s => (user?.skillsWanted || []).includes(s));

  const calculateMatchPercentage = (match) => {
    const total = (user?.skillsOffered || []).length + (user?.skillsWanted || []).length;
    if (total === 0) return 0;
    return Math.round(((getCommonSkills(match).length + getSkillsTheyOffer(match).length) / total) * 100);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="matches-page">
        <div className="matches-loading">
          <div className="matches-spinner" />
          <p style={{ color: '#f97316', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
            Finding your matches…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="matches-hero">
        <div className="matches-hero-inner">
          <div className="matches-hero-text">
            <h1>Skill Matches</h1>
            <p>
              Found <strong>{matches.length}</strong> person{matches.length !== 1 ? 's' : ''}{' '}
              with complementary skills
            </p>
          </div>
          <span className="matches-count-badge">
            <Handshake size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
            {matches.length} Match{matches.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="matches-body">

        {error && <div className="matches-error">{error}</div>}

        {matches.length === 0 ? (
          <div className="matches-empty">
            <span className="matches-empty-icon">
              <SearchX size={48} strokeWidth={1.4} color="#f97316" />
            </span>
            <h2>No Matches Yet</h2>
            <p>
              Complete your profile with more skills to find better matches
              and connect with the right people.
            </p>
            <button className="matches-empty-btn" onClick={() => navigate('/profile')}>
              Complete Profile
            </button>
          </div>
        ) : (
          <div className="matches-list">
            {matches.map((match) => {
              const commonSkills    = getCommonSkills(match);
              const skillsTheyOffer = getSkillsTheyOffer(match);
              const pct             = calculateMatchPercentage(match);
              const isExpanded      = expandedMatch === match._id;
              const circumference   = 2 * Math.PI * 45; // r=45
              const avatarUrl       = getAvatarUrl(match.avatar);

              return (
                <div key={match._id} className="match-card">

                  {/* ── Card header ─────────────────────────────────────── */}
                  <div className="match-card-header">

                    {/* Avatar */}
                    <div className={`match-avatar${avatarUrl ? ' match-avatar--img' : ''}`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={match.name} className="match-avatar-img" />
                      ) : (
                        initials(match.name)
                      )}
                    </div>

                    {/* Info */}
                    <div className="match-info">

                      {/* Name + beginner badge */}
                      <div className="match-name-row">
                        <h3 className="match-name">{match.name}</h3>
                        {match.isBeginnerMode && (
                          <span className="match-beginner-badge">Beginner Friendly</span>
                        )}
                      </div>

                      {/* Match quality ring */}
                      <div className="match-quality-row">
                        <div className="match-ring-wrap">
                          <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f0ece5" strokeWidth="8" />
                            <circle
                              cx="50" cy="50" r="45"
                              fill="none"
                              stroke="url(#mp-grad)"
                              strokeWidth="8"
                              strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dasharray 0.7s ease' }}
                            />
                            <defs>
                              <linearGradient id="mp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%"   stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ea6c0a" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="match-ring-label">{pct}%</div>
                        </div>
                        <div className="match-quality-text">
                          <span className="match-quality-title">Match Quality</span>
                          <span className="match-quality-desc match-quality-desc--icon">
                            {pct >= 80 ? (
                              <><Target size={12} style={{ display:'inline', verticalAlign:'middle', marginRight:3 }} />Excellent fit</>
                            ) : pct >= 50 ? (
                              <><Flame size={12} style={{ display:'inline', verticalAlign:'middle', marginRight:3 }} />Strong match</>
                            ) : (
                              <><Sparkles size={12} style={{ display:'inline', verticalAlign:'middle', marginRight:3 }} />Good potential</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Bio snippet */}
                      {match.bio && <p className="match-bio">{match.bio}</p>}

                      {/* Skill pills preview */}
                      <div className="match-skills-preview">
                        {skillsTheyOffer.slice(0, 3).map(skill => (
                          <span key={skill} className="skill-pill teach">{skill}</span>
                        ))}
                        {commonSkills.slice(0, 2).map(skill => (
                          <span key={skill} className="skill-pill mutual">{skill}</span>
                        ))}
                        {(skillsTheyOffer.length + commonSkills.length) > 5 && (
                          <span className="skill-pill more">
                            +{(skillsTheyOffer.length + commonSkills.length) - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="match-actions">
                      <button
                        className="btn-chat"
                        onClick={() => startChat({ _id: match._id, name: match.name, avatar: match.avatar })}
                      >
                        <MessageCircle size={15} style={{ flexShrink: 0 }} />
                        Chat
                      </button>
                      <button
                        className="btn-details"
                        onClick={() => setExpandedMatch(isExpanded ? null : match._id)}
                      >
                        {isExpanded
                          ? <><ChevronUp size={14} style={{ flexShrink: 0 }} /> Hide</>
                          : <><ChevronDown size={14} style={{ flexShrink: 0 }} /> Details</>}
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded details ────────────────────────────────── */}
                  {isExpanded && (
                    <div className="match-details">
                      <div className="match-details-grid">

                        {/* They can teach you */}
                        <div className="match-details-section">
                          <h4><GraduationCap size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5, color:'#f97316' }} />They Can Teach You</h4>
                          <div className="match-details-pills">
                            {skillsTheyOffer.length > 0 ? (
                              skillsTheyOffer.map(skill => (
                                <span key={skill} className="skill-pill-detail teach">{skill}</span>
                              ))
                            ) : (
                              <p className="match-details-none">No skills to teach you</p>
                            )}
                          </div>
                        </div>

                        {/* Mutual learning */}
                        <div className="match-details-section">
                          <h4><ArrowLeftRight size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5, color:'#f97316' }} />Mutual Learning</h4>
                          <div className="match-details-pills">
                            {commonSkills.length > 0 ? (
                              commonSkills.map(skill => (
                                <span key={skill} className="skill-pill-detail mutual">{skill}</span>
                              ))
                            ) : (
                              <p className="match-details-none">No mutual skills</p>
                            )}
                          </div>
                        </div>

                        {/* They want to learn */}
                        <div className="match-details-section">
                          <h4><BookOpen size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5, color:'#f97316' }} />They Want to Learn</h4>
                          <div className="match-details-pills">
                            {match.skillsWanted?.length > 0 ? (
                              match.skillsWanted.map(skill => (
                                <span key={skill} className="skill-pill-detail wanted">{skill}</span>
                              ))
                            ) : (
                              <p className="match-details-none">No learning goals</p>
                            )}
                          </div>
                        </div>

                        {/* All their skills */}
                        <div className="match-details-section">
                          <h4><Zap size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:5, color:'#f97316' }} />All Their Skills</h4>
                          <div className="match-details-pills">
                            {match.skillsOffered?.length > 0 ? (
                              match.skillsOffered.map(skill => (
                                <span key={skill} className="skill-pill-detail all">{skill}</span>
                              ))
                            ) : (
                              <p className="match-details-none">No skills listed</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Full bio */}
                      {match.bio && (
                        <div className="match-details-bio">
                          <h4>About {match.name}</h4>
                          <p>{match.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
