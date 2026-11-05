/**
 * ==========================================================================
 * ProfileSelect — "Who\'s Watching?" Netflix-Style Gateway
 * ==========================================================================
 * Features:
 * - 4 Persona Tiles: Recruiter, Hiring Manager, Fellow Dev, Hackathon Judge
 * - Custom inline SVG avatars in Stitch color palettes
 * - Live real XP & Level telemetry from GameContext (no fake numbers)
 * - Awards +20 XP once upon persona selection (StrictMode-safe)
 * - Sets persona in GameContext to tailor hero tagline and section order
 * - Fully accessible keyboard navigation: 1-4 shortcuts, Esc to close if profile active
 * - 44px+ tap targets, WCAG AA contrast, hover/focus scale & glow
 * ==========================================================================
 */
import { useEffect, useRef } from 'react';
import { useGame, useSession, usePersona, calculateLevelProgress } from '../context/GameContext';
import { visitorPersonas } from '../data/profile';

export function ProfileSelect() {
  const { state, actions } = useGame();
  const { profileSelected, selectedProfile } = useSession();
  const { selectPersona } = usePersona();
  const containerRef = useRef(null);

  // Real telemetry data
  const currentLevel = state.level || 1;
  const currentXp = state.xp || 0;
  const levelProgress = calculateLevelProgress(currentXp);

  // Handle keyboard shortcuts: 1, 2, 3, 4, Esc
  useEffect(() => {
    if (profileSelected) return;

    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === '1') {
        e.preventDefault();
        selectPersona('recruiter');
      } else if (e.key === '2') {
        e.preventDefault();
        selectPersona('hiring_manager');
      } else if (e.key === '3') {
        e.preventDefault();
        selectPersona('fellow_dev');
      } else if (e.key === '4') {
        e.preventDefault();
        selectPersona('judge');
      } else if (e.key === 'Escape' && selectedProfile) {
        // Allow closing without change if user already had a profile
        e.preventDefault();
        actions.setProfileSelected(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileSelected, selectPersona, selectedProfile, actions]);

  // If already selected and not toggled back open, do not render
  if (profileSelected) {
    return null;
  }

  const handleSelect = (personaId) => {
    selectPersona(personaId);
  };

  const handleDirectEnter = () => {
    // Enter directly: do not award +20 XP, do not leave persona undefined
    if (actions.enterDirectly) {
      actions.enterDirectly(selectedProfile || 'default');
    } else {
      actions.setSelectedProfile(selectedProfile || 'default');
      actions.setProfileSelected(true);
    }
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-select-title"
      className="profile-select"
    >
      {/* Background ambient radial glow and grid pattern */}
      <div className="profile-select__bg" aria-hidden="true">
        <div className="profile-select__radial-glow" />
        <div className="profile-select__grid-mesh" />
      </div>

      <div className="profile-select__container">
        {/* System telemetry header pill */}
        <div className="profile-select__header-telemetry">
          <div className="profile-select__status-pill">
            <span className="profile-select__pulse-dot" />
            <span className="profile-select__status-text font-mono">
              SYSTEM GATEWAY // V4.2.0
            </span>
          </div>

          {/* Real GameContext XP Bar */}
          <div
            className="profile-select__live-telemetry"
            title={`Current Progress: ${currentXp} XP`}
            aria-label={`Current visitor level ${currentLevel}, ${currentXp} XP`}
          >
            <div className="profile-select__live-xp-text font-mono">
              <span className="profile-select__level-tag">LEVEL {currentLevel}</span>
              <span className="profile-select__xp-tag">{currentXp} XP</span>
            </div>
            <div className="profile-select__progress-track" aria-hidden="true">
              <div
                className="profile-select__progress-fill"
                style={{ width: `${Math.max(8, levelProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="profile-select__headings">
          <h1 id="profile-select-title" className="profile-select__title">
            WHO&apos;S WATCHING?
          </h1>
          <p className="profile-select__subtitle font-mono">
            Select access privilege level to tailor interface telemetry &amp; skill logs.
          </p>
        </div>

        {/* 4 Persona Grid */}
        <div
          className="profile-select__grid"
          role="group"
          aria-label="Select visitor profile persona"
        >
          {visitorPersonas.map((p) => {
            const isCurrent = selectedProfile === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p.id)}
                className={`profile-select__tile group profile-select__tile--${p.id} ${
                  isCurrent ? 'profile-select__tile--active' : ''
                }`}
                aria-label={`Select ${p.title} persona: ${p.subtitle}. Keyboard shortcut ${p.shortcut}`}
              >
                {/* Tile Card Artwork */}
                <div className="profile-select__card-frame">
                  {/* Inline High-Fidelity SVG Persona Avatar */}
                  <div className="profile-select__avatar-wrapper" aria-hidden="true">
                    <PersonaAvatar personaId={p.id} />
                  </div>

                  {/* Gradient bottom scrim */}
                  <div className="profile-select__scrim" />

                  {/* Top-Right Badge (e.g. VIEW 01, DEV_CLI) */}
                  <div className="profile-select__badge font-mono">
                    {p.badge}
                  </div>

                  {/* Persona Glow Tint Overlay */}
                  <div className="profile-select__glow-overlay" />

                  {/* Bottom Tile Label Strip */}
                  <div className="profile-select__tile-label-bar">
                    <span className="profile-select__tile-tag font-mono">
                      {p.tag}
                    </span>
                    <span className="profile-select__key-badge font-mono">
                      [{p.shortcut}]
                    </span>
                  </div>
                </div>

                {/* Below-card Typography */}
                <div className="profile-select__tile-meta">
                  <span className="profile-select__tile-title">
                    {p.title}
                  </span>
                  <span className="profile-select__tile-sub font-mono">
                    {p.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Action Controls */}
        <div className="profile-select__actions">
          {selectedProfile && (
            <button
              type="button"
              onClick={() => actions.setProfileSelected(true)}
              className="btn btn--secondary btn--pill"
            >
              KEEP CURRENT [{selectedProfile.toUpperCase()}]
            </button>
          )}

          <button
            type="button"
            onClick={handleDirectEnter}
            className="btn btn--primary btn--pill"
          >
            <span>ENTER DIRECTLY</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Telemetry Status Footer */}
        <div className="profile-select__footer-info font-mono">
          <div className="profile-select__info-strip">
            <span className="profile-select__indicator-dot" />
            <span>SYSTEM READY</span>
            <span className="profile-select__separator">•</span>
            <span>SESSION: {selectedProfile ? selectedProfile.toUpperCase() : 'GUEST_EXPLORER'}</span>
            <span className="profile-select__separator">•</span>
            <span>REWARD: +20 XP ON SELECT</span>
          </div>
          <p className="profile-select__info-prompt">
            Pick a profile to calibrate the showcase or bypass to root.
          </p>
        </div>

        {/* CLI Shortcut Banner */}
        <div className="profile-select__shortcut-banner">
          <div className="profile-select__shortcut-left">
            <div className="profile-select__terminal-icon" aria-hidden="true">
              &gt;_
            </div>
            <div className="profile-select__shortcut-text">
              <span className="profile-select__shortcut-title font-mono">
                CLI Shortcut Mode Available
              </span>
              <span className="profile-select__shortcut-desc font-mono">
                Press 1-4 on your keyboard to instantly authenticate selected viewport profile
              </span>
            </div>
          </div>
          <div className="profile-select__shortcut-keys font-mono" aria-hidden="true">
            <span className="profile-select__pill-key">[1] RECRUITER</span>
            <span className="profile-select__pill-key">[2] MANAGER</span>
            <span className="profile-select__pill-key">[3] DEV</span>
            <span className="profile-select__pill-key">[4] JUDGE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================================================
 * PersonaAvatar — High-Fidelity Inline SVGs with Stitch Character Art
 * ==========================================================================
 */
function PersonaAvatar({ personaId }) {
  if (personaId === 'recruiter') {
    // Cyan Visor / Futuristic Cybernetic Recruiter
    return (
      <svg viewBox="0 0 160 160" fill="none" className="profile-select__avatar-svg" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="160" fill="#050C12" />
        <circle cx="80" cy="80" r="72" stroke="#00DAF3" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="6 4" />
        <circle cx="80" cy="80" r="54" fill="#0B1A24" stroke="#00DAF3" strokeWidth="2" strokeOpacity="0.6" />
        {/* Cyber Visor Glow */}
        <path d="M42 74 Q80 62 118 74 L114 90 Q80 82 46 90 Z" fill="url(#recruiter_visor)" />
        <line x1="38" y1="78" x2="122" y2="78" stroke="#00E5FF" strokeWidth="2" filter="drop-shadow(0 0 6px #00DAF3)" />
        {/* Futuristic Neck / Shoulder silhouette */}
        <path d="M50 135 C50 115 62 108 80 108 C98 108 110 115 110 135" stroke="#00DAF3" strokeWidth="2.5" strokeOpacity="0.7" fill="#06121C" />
        <circle cx="80" cy="50" r="14" fill="#00DAF3" fillOpacity="0.2" stroke="#00DAF3" strokeWidth="1.5" />
        <defs>
          <linearGradient id="recruiter_visor" x1="42" y1="74" x2="118" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00DAF3" />
            <stop offset="50%" stopColor="#0099B8" />
            <stop offset="100%" stopColor="#005A6E" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (personaId === 'hiring_manager') {
    // Architectural Blueprint & Crimson/Coral Dev Leadership Shield
    return (
      <svg viewBox="0 0 160 160" fill="none" className="profile-select__avatar-svg" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="160" fill="#120608" />
        {/* Blueprint isometric grid lines */}
        <line x1="20" y1="80" x2="140" y2="80" stroke="#FFB4AA" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="80" y1="20" x2="80" y2="140" stroke="#FFB4AA" strokeWidth="1" strokeOpacity="0.2" />
        <rect x="36" y="36" width="88" height="88" rx="8" stroke="#FFB4AA" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
        {/* Architectural Pillars / Leadership Crest */}
        <polygon points="80,34 116,68 116,116 80,132 44,116 44,68" fill="url(#manager_crest)" stroke="#FFB4AA" strokeWidth="2" />
        <circle cx="80" cy="78" r="16" fill="#3D0B12" stroke="#FFB4AA" strokeWidth="2" />
        <path d="M72 82 L80 72 L88 82" stroke="#FFB4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="manager_crest" x1="44" y1="34" x2="116" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFB4AA" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8E040B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#300003" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (personaId === 'fellow_dev') {
    // Cyberpunk Terminal Matrix Hacker & Phosphor Green Prompt
    return (
      <svg viewBox="0 0 160 160" fill="none" className="profile-select__avatar-svg" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="160" fill="#040D05" />
        {/* CRT Scanline effect */}
        <line x1="0" y1="40" x2="160" y2="40" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="0" y1="80" x2="160" y2="80" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="0" y1="120" x2="160" y2="120" stroke="#39FF14" strokeWidth="0.5" strokeOpacity="0.2" />
        {/* Phosphor Terminal Frame */}
        <rect x="28" y="32" width="104" height="96" rx="6" fill="#061A08" stroke="#39FF14" strokeWidth="2" strokeOpacity="0.7" />
        {/* Code Cascasde glyphs */}
        <text x="38" y="58" fill="#39FF14" fontFamily="monospace" fontSize="13" fontWeight="bold">&gt; sys.run()</text>
        <text x="38" y="78" fill="#39FF14" fillOpacity="0.7" fontFamily="monospace" fontSize="11">git push -u</text>
        <text x="38" y="96" fill="#39FF14" fillOpacity="0.5" fontFamily="monospace" fontSize="11">ws://connected</text>
        {/* Blinking prompt block */}
        <rect x="38" y="106" width="10" height="14" fill="#39FF14">
          <animate attributeName="opacity" values="1;0;1" dur="0.9s" repeatCount="indefinite" />
        </rect>
      </svg>
    );
  }

  // Hackathon Judge: Trophy & Red/Amber Embers
  return (
    <svg viewBox="0 0 160 160" fill="none" className="profile-select__avatar-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="160" fill="#140203" />
      {/* Radiant flame ambient ring */}
      <circle cx="80" cy="80" r="68" stroke="#E50914" strokeWidth="1.5" strokeOpacity="0.35" />
      {/* Trophy Outline */}
      <path d="M52 44 H108 V76 C108 92 95 104 80 104 C65 104 52 92 52 76 Z" fill="url(#judge_gold)" stroke="#FFB4AA" strokeWidth="2" />
      {/* Trophy Handles */}
      <path d="M52 52 H40 C34 52 34 72 52 72" stroke="#E50914" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M108 52 H120 C126 52 126 72 108 72" stroke="#E50914" strokeWidth="2.5" strokeLinecap="round" />
      {/* Pedestal */}
      <path d="M72 104 V120 H88 V104" stroke="#FFB4AA" strokeWidth="2" />
      <rect x="56" y="120" width="48" height="12" rx="2" fill="#E50914" stroke="#FFB4AA" strokeWidth="1.5" />
      {/* Star glyph */}
      <polygon points="80,56 83,64 92,64 85,69 88,77 80,72 72,77 75,69 68,64 77,64" fill="#FFFFFF" />
      <defs>
        <linearGradient id="judge_gold" x1="52" y1="44" x2="108" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E50914" />
          <stop offset="60%" stopColor="#990008" />
          <stop offset="100%" stopColor="#4A0004" />
        </linearGradient>
      </defs>
    </svg>
  );
}
