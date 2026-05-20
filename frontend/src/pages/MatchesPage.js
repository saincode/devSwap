import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './MatchesPage.css';

// Navigate to chat with a specific partner
function useStartChat() {
  const navigate = useNavigate();
  return (partner) => {
    navigate('/chat', { state: { partner } });
  };
}

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

  const getCommonSkills = (match) => {
    const offered = user?.skillsOffered || [];
    const theyWant = match.skillsWanted || [];
    return offered.filter(skill => theyWant.includes(skill));
  };

  const getSkillsTheyOffer = (match) => {
    const userWants = user?.skillsWanted || [];
    const theyOffer = match.skillsOffered || [];
    return theyOffer.filter(skill => userWants.includes(skill));
  };

  const calculateMatchPercentage = (match) => {
    const commonOffered = getCommonSkills(match).length;
    const skillsTheyOffer = getSkillsTheyOffer(match).length;
    const totalPossible = (user?.skillsOffered || []).length + (user?.skillsWanted || []).length;
    
    if (totalPossible === 0) return 0;
    return Math.round(((commonOffered + skillsTheyOffer) / totalPossible) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-semibold text-indigo-600">Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-2">Skill Matches</h1>
          <p className="text-blue-100 text-lg">
            Found <span className="font-bold">{matches.length}</span> person{matches.length !== 1 ? 's' : ''} with complementary skills
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">

            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Matches Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Complete your profile with more skills to find better matches and connect with the right people.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => {
              const commonSkills = getCommonSkills(match);
              const skillsTheyOffer = getSkillsTheyOffer(match);
              const matchPercentage = calculateMatchPercentage(match);
              const isExpanded = expandedMatch === match._id;

              return (
                <div
                  key={match._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden"
                >
                  {/* Match Item Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      {/* Left: User Info & Match % */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-gray-900">{match.name}</h3>
                            {match.isBeginnerMode && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold text-amber-900">
                                Beginner
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match Percentage */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeDasharray={`${matchPercentage * 2.83} 283`}
                                strokeLinecap="round"
                                className="transition-all duration-700"
                              />
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#2563eb" />
                                  <stop offset="100%" stopColor="#4f46e5" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-900">{matchPercentage}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Match Quality</p>
                            <p className="text-sm text-gray-600">Perfect alignment score</p>
                          </div>
                        </div>

                        {/* Bio */}
                        {match.bio && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                            {match.bio}
                          </p>
                        )}

                        {/* Skills Preview */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {skillsTheyOffer.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {skillsTheyOffer.slice(0, 3).map(skill => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {skillsTheyOffer.length > 3 && (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  +{skillsTheyOffer.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          {commonSkills.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {commonSkills.slice(0, 3).map(skill => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {commonSkills.length > 3 && (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  +{commonSkills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex flex-col gap-3 flex-shrink-0">
                        <button
                          onClick={() => startChat({ _id: match._id, name: match.name })}
                          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md transition whitespace-nowrap"
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => setExpandedMatch(isExpanded ? null : match._id)}
                          className="px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition whitespace-nowrap"
                        >
                          {isExpanded ? '−' : '+'} Details
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200 animate-slideDown">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Skills They Offer */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">They Can Teach You</h4>
                            <div className="flex flex-wrap gap-2">
                              {skillsTheyOffer.length > 0 ? (
                                skillsTheyOffer.map(skill => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm italic">No skills to teach</p>
                              )}
                            </div>
                          </div>

                          {/* Common Skills */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Mutual Learning</h4>
                            <div className="flex flex-wrap gap-2">
                              {commonSkills.length > 0 ? (
                                commonSkills.map(skill => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-200"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm italic">No mutual skills</p>
                              )}
                            </div>
                          </div>

                          {/* All Skills They Want */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">They Want to Learn</h4>
                            <div className="flex flex-wrap gap-2">
                              {match.skillsWanted.length > 0 ? (
                                match.skillsWanted.map(skill => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-200"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm italic">No learning goals</p>
                              )}
                            </div>
                          </div>

                          {/* All Skills They Offer */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">All Their Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {match.skillsOffered.length > 0 ? (
                                match.skillsOffered.map(skill => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-200"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm italic">No skills listed</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Full Bio */}
                        {match.bio && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">About {match.name}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{match.bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
