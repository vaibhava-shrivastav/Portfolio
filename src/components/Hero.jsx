/**
 * ==========================================================================
 * Hero — Cinematic Netflix Billboard Section (2-Column Above-The-Fold)
 * ==========================================================================
 * Features:
 * - Desktop 2-column layout: Intro & Actions on Left, Compact Featured GLA Exchange Card on Right
 * - Height budget: Fits cleanly inside 700px viewport without scrolling
 * - Terminal-style greeting "> VAIBHAVA.K.SHRIVASTAV" typing in (instant with prefers-reduced-motion)
 * - Factual copy only: "B.Tech Computer Science Student · Full-Stack & Cloud Builder"
 * - Action buttons: Play (opens ProjectModal), Resume (awards +15 XP), Contact (scrolls to #contact)
 * - Dismissible onboarding hint: "Explore the site to earn XP and unlock 10 badges. Press ` for the terminal."
 * - Compact telemetry stats row: XP, Level, Projects, Badges (renamed from EXPERIENCE to XP)
 * - Live external links with target="_blank" rel="noopener noreferrer"
 * ==========================================================================
 */
import { useState, useEffect } from 'react';
import { profile as profileData, projects } from '../data/profile';
import { useGame, useUI } from '../context/GameContext';

const FULL_GREETING = '> VAIBHAVA.K.SHRIVASTAV';
const HINT_STORAGE_KEY = 'netflix-portfolio-onboarding-dismissed';

export function Hero() {
  const { state, actions } = useGame();
  const { openProjectModal, reducedMotion } = useUI();
  const [typedText, setTypedText] = useState(reducedMotion ? FULL_GREETING : '');
  const [hintDismissed, setHintDismissed] = useState(() => {
    try {
      return localStorage.getItem(HINT_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const featuredProject = projects[0] || null; // GLA Exchange

  // Terminal greeting type-in effect
  useEffect(() => {
    if (reducedMotion) {
      setTypedText(FULL_GREETING);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 1;
      setTypedText(FULL_GREETING.slice(0, currentIndex));
      if (currentIndex >= FULL_GREETING.length) {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  const handlePlayFeatured = () => {
    if (featuredProject) {
      openProjectModal(featuredProject);
    }
  };

  const handleResumeClick = () => {
    if (actions.awardAction) {
      actions.awardAction('link_click:resume', 15);
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  const handleDismissHint = () => {
    setHintDismissed(true);
    try {
      localStorage.setItem(HINT_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  // Telemetry stats from GameContext & profile.js
  const currentLevel = state.level || 1;
  const currentXp = state.xp || 0;
  const projectCount = projects.length;
  const unlockedCount = actions.getUnlockedAchievements ? actions.getUnlockedAchievements().length : 0;
  const totalAchievements = state.achievements ? state.achievements.length : 10;

  return (
    <section id="hero" className="hero-billboard" aria-labelledby="hero-title">
      {/* CSS-Only Ambient Flare & Background Streaks */}
      <div className="hero-billboard__ambient" aria-hidden="true">
        <div className="hero-billboard__flare" />
        <div className="hero-billboard__streaks">
          <div className="hero-billboard__streak hero-billboard__streak--spine" />
          <div className="hero-billboard__streak hero-billboard__streak--left-1" />
          <div className="hero-billboard__streak hero-billboard__streak--left-2" />
          <div className="hero-billboard__streak hero-billboard__streak--right-1" />
          <div className="hero-billboard__streak hero-billboard__streak--right-2" />
          <div className="hero-billboard__streak-horizon" />
        </div>
        <div className="hero-billboard__scrim" />
      </div>

      <div className="container hero-billboard__container">
        <div className="hero-billboard__grid">
          {/* Left Column: Intro, Headline, Tagline, Actions, Hint, Stats */}
          <div className="hero-billboard__col-intro">
            {/* Terminal Monospace Greeting */}
            <div className="hero-billboard__greeting font-mono" aria-label={FULL_GREETING}>
              <span className="hero-billboard__greeting-text">{typedText}</span>
              <span className="hero-billboard__cursor" aria-hidden="true">_</span>
            </div>

            {/* Title */}
            <h1 id="hero-title" className="hero-billboard__title font-display">
              {profileData.name}
            </h1>

            {/* Factual Headline & Tagline */}
            <p className="hero-billboard__headline">
              B.Tech Computer Science Student · Full-Stack &amp; Cloud Builder
            </p>
            <p className="hero-billboard__tagline">
              {profileData.tagline}
            </p>

            {/* Primary Action Buttons: Play, Resume, Contact */}
            <div className="hero-billboard__actions">
              <button
                type="button"
                onClick={handlePlayFeatured}
                className="btn btn--primary hero-billboard__btn-play"
                aria-label={`Play demo and view details for ${featuredProject ? featuredProject.title : 'featured project'}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Play</span>
              </button>

              <a
                href={profileData.resumeUrl || '/resume.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleResumeClick}
                className="btn btn--ghost hero-billboard__btn-resume"
                aria-label="Download resume PDF"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Resume [PDF]</span>
              </a>

              <a
                href="#contact"
                onClick={handleContactClick}
                className="btn btn--secondary hero-billboard__btn-contact"
                aria-label="Scroll to contact form"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Contact</span>
              </a>
            </div>

            {/* Dismissible Onboarding Hint */}
            {!hintDismissed && (
              <div className="hero-billboard__hint font-mono" role="status">
                <span className="hero-billboard__hint-icon" aria-hidden="true">💡</span>
                <span className="hero-billboard__hint-text">
                  Explore the site to earn XP and unlock 10 badges.{' '}
                  <span className="hero-hint-desktop">Press <kbd>`</kbd> for the terminal.</span>
                  <span className="hero-hint-touch">Tap the terminal button.</span>
                </span>
                <button
                  type="button"
                  onClick={handleDismissHint}
                  className="hero-billboard__hint-close"
                  aria-label="Dismiss hint"
                >
                  ×
                </button>
              </div>
            )}

            {/* Compact Telemetry Stats Row */}
            <div className="hero-billboard__stats font-mono" role="list" aria-label="Live developer stats">
              <div className="hero-billboard__stat-card" role="listitem">
                <span className="hero-billboard__stat-label">XP</span>
                <span className="hero-billboard__stat-value text-terminal">{currentXp} XP</span>
              </div>

              <div className="hero-billboard__stat-card" role="listitem">
                <span className="hero-billboard__stat-label">LEVEL</span>
                <span className="hero-billboard__stat-value">LVL {currentLevel}</span>
              </div>

              <div className="hero-billboard__stat-card" role="listitem">
                <span className="hero-billboard__stat-label">PROJECTS</span>
                <span className="hero-billboard__stat-value">{projectCount}</span>
              </div>

              <div className="hero-billboard__stat-card" role="listitem">
                <span className="hero-billboard__stat-label">BADGES</span>
                <span className="hero-billboard__stat-value">{unlockedCount} / {totalAchievements}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Project Spotlight Card */}
          {featuredProject && (
            <div className="hero-billboard__col-featured">
              <div className="hero-billboard__featured-card">
                {/* Live Status Badge */}
                <div className="hero-billboard__badge-row font-mono">
                  <span className="hero-billboard__release-tag">
                    FEATURED PROJECT
                  </span>
                  <a
                    href="https://glaexchange.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => actions.awardAction('project:live:proj-1', 15)}
                    className="hero-billboard__status-pill"
                    title="Open live production platform at glaexchange.online"
                  >
                    <span className="hero-billboard__status-dot" />
                    <span>Live at glaexchange.online</span>
                    <span className="hero-billboard__external-arrow">↗</span>
                  </a>
                </div>

                {/* Featured Project Title & Synopsis */}
                <h2 className="hero-billboard__project-title">
                  {featuredProject.title}
                </h2>
                <p className="hero-billboard__project-desc">
                  {featuredProject.tagline || featuredProject.description}
                </p>

                {/* Tech Chips */}
                <div className="hero-billboard__tech-chips" aria-label="Featured technologies">
                  {featuredProject.tech.slice(0, 6).map((tech) => (
                    <span key={tech} className="hero-billboard__tech-chip font-mono">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Card Action Buttons */}
                <div className="hero-billboard__featured-actions">
                  <button
                    type="button"
                    onClick={handlePlayFeatured}
                    className="btn btn--sm btn--primary"
                    aria-label={`View details and architecture for ${featuredProject.title}`}
                  >
                    Play Demo
                  </button>
                  <a
                    href="https://glaexchange.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => actions.awardAction('project:live:proj-1', 15)}
                    className="btn btn--sm btn--ghost"
                    aria-label="Open GLA Exchange live site in new tab"
                  >
                    Live Platform ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
