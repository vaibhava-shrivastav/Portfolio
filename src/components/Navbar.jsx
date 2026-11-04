/**
 * ==========================================================================
 * Navbar — Netflix-Style Fixed Navigation with Stitch Parity
 * ==========================================================================
 * Features:
 * - Red "V" brand mark with drop-shadow glow
 * - Link underline animation with red accent
 * - XP bar displaying "Level N · X XP" from GameContext
 * - Avatar menu with "Switch Profile" & "Reset Progress"
 * - Mobile hamburger drawer with full accessible keyboard navigation (Esc to close)
 * - Solid on scroll with backdrop blur
 * - Scroll-spy tracking active section
 * - 44px+ tap targets & WCAG AA contrast
 * ==========================================================================
 */
import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { profile } from '../data/profile';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' }
];

// XP threshold helper
function calculateLevelProgress(xp, level) {
  const thresholds = [
    { level: 1, min: 0, max: 100 },
    { level: 2, min: 100, max: 200 },
    { level: 3, min: 200, max: 350 },
    { level: 4, min: 350, max: 500 },
    { level: 5, min: 500, max: 500 }
  ];
  const current = thresholds.find(t => t.level === level) || thresholds[0];
  if (level >= 5) return 100;
  const range = current.max - current.min;
  const progressInLevel = Math.max(0, Math.min(xp - current.min, range));
  return Math.round((progressInLevel / range) * 100);
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  
  const { state, actions } = useGame();
  const avatarMenuRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  const currentLevel = state.level || 1;
  const currentXp = state.xp || 0;
  const levelProgress = calculateLevelProgress(currentXp, currentLevel);
  const selectedPersona = state.session?.selectedProfile;

  // Solid background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-spy via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            if (actions.addVisitedSection) {
              actions.addVisitedSection(entry.target.id);
            }
          }
        });
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0.1 }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [actions]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (avatarOpen) setAvatarOpen(false);
        if (mobileOpen) setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [avatarOpen, mobileOpen]);

  // Close avatar menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    if (avatarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarOpen]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setMobileOpen(false);
    }
  };

  const handleSwitchProfile = () => {
    if (actions.setProfileSelected) {
      actions.setProfileSelected(false);
    }
    setAvatarOpen(false);
    setMobileOpen(false);
    // Scroll to top where profile select or hero lives
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all progress, XP, and profile choices?')) {
      if (actions.resetGame) {
        actions.resetGame();
      }
      try {
        sessionStorage.clear();
      } catch (err) {
        /* ignore */
      }
      setAvatarOpen(false);
      setMobileOpen(false);
      window.location.reload();
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <div className="navbar__inner container">
        {/* Brand Logo with Red V Glow */}
        <div className="navbar__left">
          <a
            href="#about"
            className="navbar__brand"
            aria-label="Vaibhava Kumar Shrivastav — Home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="navbar__brand-v" aria-hidden="true">
              V
            </span>
            <span className="navbar__brand-name">VAIBHAVA</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="navbar__nav" role="navigation" aria-label="Main navigation">
            <ul className="navbar__nav-list" role="menubar">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <li key={section.id} role="none" className="navbar__nav-item">
                    <a
                      href={`#${section.id}`}
                      className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(section.id);
                      }}
                    >
                      {section.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Right Section: XP Bar, Avatar Menu & Mobile Toggle */}
        <div className="navbar__right">
          {/* XP Bar (Desktop / Tablet) */}
          <div
            className="navbar__xp"
            role="status"
            aria-label={`Visitor Level ${currentLevel}, ${currentXp} Experience Points`}
          >
            <div className="navbar__xp-header">
              <span className="navbar__xp-level">LEVEL {currentLevel}</span>
              <span className="navbar__xp-text">{currentXp} XP</span>
            </div>
            <div
              className="navbar__xp-track"
              role="progressbar"
              aria-valuenow={levelProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="navbar__xp-fill"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Terminal Quick Button */}
          {actions.toggleTerminal && (
            <button
              type="button"
              className="navbar__terminal-btn"
              onClick={() => actions.toggleTerminal()}
              aria-label="Toggle developer terminal (` key)"
              title="Toggle terminal (`)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span className="navbar__terminal-text">Terminal</span>
            </button>
          )}

          {/* Avatar Menu with Dropdown */}
          <div className="navbar__avatar-container" ref={avatarMenuRef}>
            <button
              type="button"
              className="navbar__avatar-btn"
              onClick={() => setAvatarOpen(!avatarOpen)}
              aria-expanded={avatarOpen}
              aria-haspopup="true"
              aria-label="Visitor Profile and Settings"
            >
              <div className="navbar__avatar-badge" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </button>

            {avatarOpen && (
              <div
                className="navbar__avatar-dropdown"
                role="menu"
                aria-label="Profile actions"
              >
                <div className="navbar__avatar-dropdown-header">
                  <span className="navbar__avatar-dropdown-label">CURRENT VISITOR</span>
                  <p className="navbar__avatar-dropdown-persona">
                    {selectedPersona ? (typeof selectedPersona === 'object' ? selectedPersona.title || selectedPersona.id : selectedPersona) : 'Guest Visitor'}
                  </p>
                  <p className="navbar__avatar-dropdown-stats">
                    Level {currentLevel} · {currentXp} XP
                  </p>
                </div>
                <div className="navbar__avatar-dropdown-divider" />
                <button
                  type="button"
                  className="navbar__avatar-dropdown-item"
                  role="menuitem"
                  onClick={handleSwitchProfile}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                  Switch Profile
                </button>
                <button
                  type="button"
                  className="navbar__avatar-dropdown-item navbar__avatar-dropdown-item--danger"
                  role="menuitem"
                  onClick={handleResetProgress}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reset Progress
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Toggle (Mobile) */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        id="navbar-mobile-drawer"
        ref={mobileDrawerRef}
        className={`navbar__mobile-drawer ${mobileOpen ? 'navbar__mobile-drawer--open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="navbar__mobile-drawer-inner container">
          {/* Mobile XP Summary */}
          <div className="navbar__mobile-xp">
            <div className="navbar__xp-header">
              <span className="navbar__xp-level">LEVEL {currentLevel}</span>
              <span className="navbar__xp-text">{currentXp} / 500 XP</span>
            </div>
            <div className="navbar__xp-track">
              <div
                className="navbar__xp-fill"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Mobile Navigation List */}
          <ul className="navbar__mobile-nav-list" role="menu">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <li key={section.id} role="none" className="navbar__mobile-nav-item">
                  <a
                    href={`#${section.id}`}
                    className={`navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.id);
                    }}
                  >
                    <span>{section.label}</span>
                    <span className="navbar__mobile-link-arrow" aria-hidden="true">→</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile Action Controls */}
          <div className="navbar__mobile-actions">
            <button
              type="button"
              className="btn btn--secondary btn--full"
              onClick={handleSwitchProfile}
            >
              Switch Profile Persona
            </button>
            <button
              type="button"
              className="navbar__mobile-reset-btn"
              onClick={handleResetProgress}
            >
              Reset All Progress
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
