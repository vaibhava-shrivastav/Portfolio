/**
 * ==========================================================================
 * ProfileSelect — Welcome Gateway (Single-User Flow)
 * ==========================================================================
 * Features:
 * - Single-user gateway matching the Stitch Welcome Gateway design
 * - Pure black (#000000) backdrop with 48px grid mesh and soft radial red flare
 * - Pill badge: "PORTFOLIO GATEWAY" with pulsing red indicator
 * - Bebas Neue heading: "WELCOME"
 * - Subtitle: "Ready to explore the portfolio? Press Enter or tap below to launch the experience."
 * - Centered portrait card with avatar, red-tinted glow, name & headline
 * - Primary action: "ENTER PORTFOLIO →" (awards +20 XP once)
 * - Secondary action: "CLI / TERMINAL MODE" (opens interactive terminal drawer)
 * - Real GameContext telemetry status: "SYSTEM READY · LEVEL N · X XP"
 * - Responsive quick-launch hint (desktop keyboard pills vs touch instructions)
 * - Accessible dialog with auto-focus, keyboard shortcuts (Enter, Space, `), focus release
 * ==========================================================================
 */
import { useEffect, useRef, useCallback } from 'react';
import { useGame, useSession } from '../context/GameContext';
import { profile as profileData } from '../data/profile';

export function ProfileSelect() {
  const { state, actions } = useGame();
  const { profileSelected } = useSession();
  const containerRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  // Real telemetry data
  const currentLevel = state.level || 1;
  const currentXp = state.xp || 0;

  const handleEnterPortfolio = useCallback(() => {
    if (actions.enterPortfolio) {
      actions.enterPortfolio();
    } else {
      actions.setProfileSelected(true);
    }
  }, [actions]);

  const handleCliMode = useCallback(() => {
    if (actions.enterCliMode) {
      actions.enterCliMode();
    } else {
      actions.setProfileSelected(true);
      if (actions.openTerminal) {
        actions.openTerminal();
      }
    }
  }, [actions]);

  // Focus management: preserve previous active element & move focus to primary action on open
  useEffect(() => {
    if (!profileSelected) {
      previousActiveElementRef.current = document.activeElement;
      const timer = setTimeout(() => {
        primaryBtnRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        if (
          previousActiveElementRef.current &&
          typeof previousActiveElementRef.current.focus === 'function'
        ) {
          try {
            previousActiveElementRef.current.focus();
          } catch {
            /* ignore focus error on cleanup */
          }
        }
      };
    }
  }, [profileSelected]);

  // Keyboard navigation: Enter / Space triggers enterPortfolio, ` / ~ triggers CLI mode
  useEffect(() => {
    if (profileSelected) return;

    const handleKeyDown = (e) => {
      // Ignore typing inside inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        handleCliMode();
      } else if (e.key === 'Enter' || e.key === ' ') {
        // If focus is specifically on the secondary CLI button, let native activation occur
        if (e.target?.id === 'welcome-cli-btn') {
          return;
        }
        e.preventDefault();
        handleEnterPortfolio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileSelected, handleEnterPortfolio, handleCliMode]);

  // Unconditional hook execution rule: early return strictly follows all hooks
  if (profileSelected) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="welcome-gateway"
    >
      {/* Background ambient radial glow and 48px grid mesh */}
      <div className="welcome-gateway__bg" aria-hidden="true">
        <div className="welcome-gateway__radial-flare" />
        <div className="welcome-gateway__grid-mesh" />
      </div>

      <div className="welcome-gateway__container">
        {/* Header badge with pulsing red dot */}
        <div className="welcome-gateway__badge font-mono">
          <span className="welcome-gateway__pulse-dot" aria-hidden="true" />
          <span className="welcome-gateway__badge-text">PORTFOLIO GATEWAY</span>
        </div>

        {/* Headings */}
        <div className="welcome-gateway__headings">
          <h1 id="welcome-title" className="welcome-gateway__title font-display">
            WELCOME
          </h1>
          <p className="welcome-gateway__subtitle font-mono">
            Ready to explore the portfolio? Press Enter or tap below to launch the experience.
          </p>
        </div>

        {/* Centered Portrait Card */}
        <div className="welcome-gateway__portrait-wrap">
          <div className="welcome-gateway__portrait-card">
            <img
              src={profileData.avatar || '/images/avatar.svg'}
              alt={profileData.name}
              className="welcome-gateway__avatar"
              width="140"
              height="140"
              loading="eager"
            />
          </div>
          <div className="welcome-gateway__identity">
            <h2 className="welcome-gateway__name">{profileData.name}</h2>
            <p className="welcome-gateway__headline">{profileData.headline}</p>
          </div>
        </div>

        {/* Action Buttons: Primary Enter & Secondary CLI */}
        <div className="welcome-gateway__actions">
          <button
            ref={primaryBtnRef}
            id="welcome-enter-btn"
            type="button"
            onClick={handleEnterPortfolio}
            className="btn btn--primary welcome-gateway__btn-primary"
            aria-label="Enter portfolio showcase"
          >
            <span>ENTER PORTFOLIO</span>
            <span className="welcome-gateway__btn-arrow" aria-hidden="true">→</span>
          </button>

          <button
            id="welcome-cli-btn"
            type="button"
            onClick={handleCliMode}
            className="btn btn--ghost welcome-gateway__btn-secondary font-mono"
            aria-label="Launch portfolio in interactive CLI terminal mode"
          >
            <span>CLI / TERMINAL MODE</span>
          </button>
        </div>

        {/* Real Status Strip */}
        <div className="welcome-gateway__status font-mono" aria-label="System status">
          SYSTEM READY · LEVEL {currentLevel} · {currentXp} XP
        </div>

        {/* Quick Launch Bottom Hint Card */}
        <div className="welcome-gateway__hint-card" aria-label="Quick launch shortcuts">
          <div className="welcome-gateway__hint-desktop font-mono">
            <span>Quick launch: Press </span>
            <kbd className="welcome-gateway__kbd">Enter</kbd>
            <span> or </span>
            <kbd className="welcome-gateway__kbd">Space</kbd>
            <span> to start · Press </span>
            <kbd className="welcome-gateway__kbd">`</kbd>
            <span> for the retro terminal</span>
          </div>
          <div className="welcome-gateway__hint-touch font-mono">
            Tap Enter Portfolio to start · Tap CLI / Terminal Mode for the terminal
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSelect;
