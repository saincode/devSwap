import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ProfilePage.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="loading-container" style={{ color: '#ef4444' }}>{error}</div>;
  }

  if (!profile) {
    return <div className="loading-container">Profile not found.</div>;
  }

  return (
    <div className="profile-page">
      {/* Hero Header */}
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-intro">
            <h1>{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>
            {profile.isBeginnerMode && (
              <div className="beginner-status">
                Beginner Mode Enabled – Seeking Patient Mentors
              </div>
            )}
          </div>
          <button className="btn-edit-profile" onClick={() => navigate('/profile-setup')}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="max-width-container">
          {/* About Section */}
          <section className="content-section">
            <h2 className="section-title">About Me</h2>
            {profile.bio ? (
              <p className="section-text">{profile.bio}</p>
            ) : (
              <p className="empty-state">No bio added yet. Click "Edit Profile" to add your story.</p>
            )}
          </section>

          {/* Skills Grid */}
          <div className="skills-grid">
            <section className="skills-section">
              <div className="skills-header">
                <h2 className="section-title">Offered Skills</h2>
              </div>
              {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
                <div className="skills-tags">
                  {profile.skillsOffered.map(skill => (
                    <span key={skill} className="skill-tag-item offered">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No skills offered yet.</p>
              )}
            </section>

            <section className="skills-section">
              <div className="skills-header">
                <h2 className="section-title">Learning Goals</h2>
              </div>
              {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
                <div className="skills-tags">
                  {profile.skillsWanted.map(skill => (
                    <span key={skill} className="skill-tag-item wanted">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No skills wanted yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
