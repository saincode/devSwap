import React, { useState, useEffect, useRef, useCallback } from 'react';
import skillsData from '../data/skills.json';
import './SkillSelector.css';

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const PROFICIENCY_META = {
  Beginner:     { color: '#c2410c', bg: '#fff7ed', label: '🌱 Beginner' },
  Intermediate: { color: '#b45309', bg: '#fef3c7', label: '⚡ Intermediate' },
  Advanced:     { color: '#ea580c', bg: '#ffedd5', label: '🔥 Advanced' },
  Expert:       { color: '#9a3412', bg: '#fee2e2', label: '💎 Expert' },
};

// Flatten all skills for quick global search
const ALL_SKILLS = skillsData.flatMap((cat) =>
  cat.skills.map((skill) => ({ skill, category: cat.category }))
);

// ─── ProficiencyPicker ─────────────────────────────────────────────────────
function ProficiencyPicker({ skill, onConfirm, onCancel }) {
  const [selected, setSelected] = useState('Intermediate');

  return (
    <div className="proficiency-picker">
      <div className="proficiency-picker-header">
        <span className="proficiency-skill-name">📌 {skill}</span>
        <span className="proficiency-label">Select your level</span>
      </div>
      <div className="proficiency-options">
        {PROFICIENCY_LEVELS.map((level) => {
          const meta = PROFICIENCY_META[level];
          return (
            <button
              key={level}
              type="button"
              className={`proficiency-option ${selected === level ? 'selected' : ''}`}
              style={selected === level ? { borderColor: meta.color, background: meta.bg, color: meta.color } : {}}
              onClick={() => setSelected(level)}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
      <div className="proficiency-picker-actions">
        <button type="button" className="proficiency-cancel" onClick={onCancel}>Cancel</button>
        <button type="button" className="proficiency-confirm" onClick={() => onConfirm(skill, selected)}>
          Add Skill ✓
        </button>
      </div>
    </div>
  );
}

// ─── SkillSelector ─────────────────────────────────────────────────────────
export function SkillSelector({
  selectedSkills,    // string[]
  proficiency,       // { [skill]: level }
  onAdd,             // (skill, proficiencyLevel) => void
  onRemove,          // (skill) => void
  placeholder,
  tagVariant,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingSkill, setPendingSkill] = useState(null); // skill awaiting proficiency pick
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // ── Filtered results ──────────────────────────────────────────────────────
  const filtered = query.trim()
    ? ALL_SKILLS.filter(
        ({ skill }) =>
          skill.toLowerCase().includes(query.toLowerCase()) &&
          !selectedSkills.includes(skill)
      )
    : null;

  const categorisedFiltered = !filtered
    ? skillsData
        .map((cat) => ({
          ...cat,
          skills: cat.skills.filter((s) => !selectedSkills.includes(s)),
        }))
        .filter((cat) => cat.skills.length > 0)
    : null;

  const flatFiltered = filtered || [];

  // ── Click outside to close ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
        setPendingSkill(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  // ── When a skill is chosen from dropdown → open proficiency picker ─────────
  const handleSkillChosen = useCallback((skill) => {
    setPendingSkill(skill);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  // ── Confirm proficiency → actually add the skill ──────────────────────────
  const handleProficiencyConfirm = useCallback((skill, level) => {
    onAdd(skill, level);
    setPendingSkill(null);
    inputRef.current?.focus();
  }, [onAdd]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setIsOpen(false); setPendingSkill(null); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && flatFiltered[activeIndex]) {
        handleSkillChosen(flatFiltered[activeIndex].skill);
      } else if (query.trim() && !selectedSkills.includes(query.trim())) {
        handleSkillChosen(query.trim());
      }
      return;
    }
    if (!filtered) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)); }
  };

  return (
    <div className="skill-selector" ref={containerRef}>

      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      {!isOpen && !pendingSkill && (
        <div
          className="skill-selector-trigger"
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
          aria-label="Open skill selector"
        >
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="trigger-text">{placeholder}</span>
          <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}

      {/* ── Proficiency picker (after skill chosen) ──────────────────────── */}
      {pendingSkill && (
        <ProficiencyPicker
          skill={pendingSkill}
          onConfirm={handleProficiencyConfirm}
          onCancel={() => { setPendingSkill(null); setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 10); }}
        />
      )}

      {/* ── Search input (open state) ─────────────────────────────────────── */}
      {isOpen && !pendingSkill && (
        <div className="skill-selector-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="skill-selector-input"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            onKeyDown={handleKeyDown}
            placeholder="Search or type a custom skill…"
            autoComplete="off"
          />
          {query && (
            <button className="skill-selector-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} type="button">✕</button>
          )}
          {query.trim() && !selectedSkills.includes(query.trim()) && (
            <button className="skill-selector-add-btn" onClick={() => handleSkillChosen(query.trim())} type="button">
              + Add "{query.trim()}"
            </button>
          )}
        </div>
      )}

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      {isOpen && !pendingSkill && (
        <div
          className="skill-dropdown"
          onMouseDown={(e) => e.preventDefault()} /* ← prevents input blur on click */
        >
          {filtered ? (
            filtered.length === 0 ? (
              <div className="skill-dropdown-empty">
                No match. Press <kbd>Enter</kbd> to add "<strong>{query}</strong>" as a custom skill.
              </div>
            ) : (
              <ul className="skill-dropdown-list">
                {filtered.map(({ skill, category }, idx) => (
                  <li key={skill}>
                    <button
                      type="button"
                      className={`skill-dropdown-item ${activeIndex === idx ? 'active' : ''}`}
                      onClick={() => handleSkillChosen(skill)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <span className="dropdown-skill-name">{highlight(skill, query)}</span>
                      <span className="dropdown-skill-cat">{category}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="skill-dropdown-categories">
              {categorisedFiltered.map((cat) => (
                <div key={cat.category} className="skill-cat-group">
                  <div className="skill-cat-label">{cat.category}</div>
                  <div className="skill-cat-pills">
                    {cat.skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        className="skill-cat-pill"
                        onClick={() => handleSkillChosen(skill)}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Selected tags ─────────────────────────────────────────────────── */}
      {selectedSkills.length > 0 && (
        <div className="skill-tags-row">
          {selectedSkills.map((skill) => {
            const level = proficiency?.[skill];
            const meta = level ? PROFICIENCY_META[level] : null;
            return (
              <span key={skill} className={`skill-tag-pill ${tagVariant || ''}`}>
                {skill}
                {meta && (
                  <span
                    className="proficiency-badge"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {level}
                  </span>
                )}
                <button type="button" className="skill-tag-remove" onClick={() => onRemove(skill)} aria-label={`Remove ${skill}`}>×</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// highlight matched portion
function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
