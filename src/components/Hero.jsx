/**
 * ==========================================================================
 * Hero — Cinematic Netflix Billboard Section
 * ==========================================================================
 * Features:
 * - Massive Bebas Neue name (clamp-based size, mobile-first, no overflow at 320px)
 * - Terminal-style greeting "> VAIBHAVA.K.SHRIVASTAV" typing in (instant with prefers-reduced-motion)
 * - CSS-only radial flare and fanning light streaks (no canvas/WebGL, zero layout shift)
 * - Headline & persona-tailored tagline from usePersona() with profile.tagline fallback
 * - Featured project spotlight (GLA Exchange) with factual status badge: "Live at glaexchange.online"
 * - "Play" (opens ProjectModal) and "More Info" (scrolls to Projects row)
 * - Live real stats row (XP, Level, Projects count, Unlocked Achievements) from GameContext & profile.js
 * - Resume button linking to /resume.pdf awarding +15 XP link-click action once
 * ==========================================================================
 */
import { useState, useEffect } from 'react';
import { profile as profileData, projects } from '../data/profile';
import { useGame, usePersona, useUI } from '../context/GameContext';

const FULL_GREETING = '> VAIBHAVA.K.SHRIVASTAV';

export function Hero() {
  const { state, actions } = useGame();
  const { tagline } = usePersona();
  const { openProjectModal, reducedMotion } = useUI();
  const [typedText, setTypedText] = useState(reducedMotion ? FULL_GREETING : '');

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

  const handleMoreInfo = () => {
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  const handleResumeClick = () => {
    if (actions.awardAction) {
      actions.awardAction('link_click:resume', 15);
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
        {/* Terminal Monospace Greeting */}
        <div className="hero-billboard__greeting font-mono" aria-label={FULL_GREETING}>
          <span className="hero-billboard__greeting-text">{typedText}</span>
          <span className="hero-billboard__cursor" aria-hidden="true">_</span>
        </div>

        {/* Massive Bebas Neue Title */}
        <h1 id="hero-title" className="hero-billboard__title font-display">
          {profileData.name}
        </h1>

        {/* Headline & Persona Tagline */}
        <p className="hero-billboard__headline">
          {profileData.headline}
        </p>
        <p className="hero-billboard__tagline">
          {tagline}
        </p>

        {/* Featured Project Spotlight Card */}
        {featuredProject && (
          <div className="hero-billboard__featured-card">
            {/* Live Status Badge */}
            <div className="hero-billboard__badge-row font-mono">
              <span className="hero-billboard__release-tag">
                FEATURED RELEASE · SEASON 2026
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

            {/* Verified Tech Chips */}
            <div className="hero-billboard__tech-chips" aria-label="Featured technologies">
              {featuredProject.tech.slice(0, 6).map((tech) => (
                <span key={tech} className="hero-billboard__tech-chip font-mono">
                  {tech}
                </span>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="hero-billboard__actions">
              <button
                type="button"
                onClick={handlePlayFeatured}
                className="btn btn--primary hero-billboard__btn-play"
                aria-label={`Play demo and view details for ${featuredProject.title}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Play</span>
              </button>

              <button
                type="button"
                onClick={handleMoreInfo}
                className="btn btn--secondary"
                aria-label="More info and scroll to project catalog"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>More Info</span>
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
                  width="18"
                  height="18"
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
            </div>
          </div>
        )}

        {/* Real Live Telemetry Stats Ribbon */}
        <div className="hero-billboard__stats font-mono" role="list" aria-label="Live developer stats">
          <div className="hero-billboard__stat-card" role="listitem">
            <span className="hero-billboard__stat-label">LEVEL</span>
            <span className="hero-billboard__stat-value text-terminal">LVL {currentLevel}</span>
          </div>

          <div className="hero-billboard__stat-card" role="listitem">
            <span className="hero-billboard__stat-label">EXPERIENCE</span>
            <span className="hero-billboard__stat-value">{currentXp} XP</span>
          </div>

          <div className="hero-billboard__stat-card" role="listitem">
            <span className="hero-billboard__stat-label">REAL PROJECTS</span>
            <span className="hero-billboard__stat-value">{projectCount} Shipped</span>
          </div>

          <div className="hero-billboard__stat-card" role="listitem">
            <span className="hero-billboard__stat-label">ACHIEVEMENTS</span>
            <span className="hero-billboard__stat-value">{unlockedCount} / {totalAchievements} Unlocked</span>
          </div>
        </div>
      </div>
    </section>
  );
}
