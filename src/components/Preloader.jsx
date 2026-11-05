/**
 * ==========================================================================
 * Preloader — Cinematic Netflix-Inspired Intro Sequence
 * ==========================================================================
 * Features:
 * - Fullscreen pure cinema black (#000000) canvas
 * - Ribbon "V" SVG drawing in (stroke-dashoffset), glowing, zooming & fading
 * - CSS radial lens flare and fanning vertical anamorphic light streaks
 * - Terminal-style loading telemetry ticks and wide-tracked monogram typography
 * - Fixed duration < 3s, visible Skip button, any key / tap skips
 * - Once per session via sessionStorage ('preloader_completed')
 * - prefers-reduced-motion: static V for 800ms
 * - Accessible dialog role, Skip button receives focus
 * - Unlocks "Pilot Episode" achievement badge on finish
 * ==========================================================================
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

const SESSION_KEY = 'preloader_completed';

export function Preloader() {
  const { actions } = useGame();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState('genesis'); // 'genesis' (0-1s) | 'hero' (1-2s) | 'warp' (2-2.6s)
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const completedRef = useRef(false);
  const skipBtnRef = useRef(null);

  // Check if preloader already ran in this session
  const [shouldShow, setShouldShow] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(SESSION_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {
      console.warn('sessionStorage unavailable', e);
    }

    // Award Pilot Episode badge (no XP)
    if (actions.unlockAchievement) {
      actions.unlockAchievement('pilot_episode');
    }

    setIsFading(true);
    setTimeout(() => {
      setShouldShow(false);
    }, 350);
  }, [actions]);

  useEffect(() => {
    if (!shouldShow) return;
    setMounted(true);

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      const reducedTimer = setTimeout(() => {
        handleComplete();
      }, 800);
      return () => clearTimeout(reducedTimer);
    }

    // Skip button auto-focus for accessible immediate interaction
    skipBtnRef.current?.focus();

    // Any key or pointer down skips the preloader
    const handleKeyDown = (e) => {
      // Don't trigger on Tab alone to allow keyboard exploration, but any other key skips
      if (e.key === 'Tab') return;
      handleComplete();
    };

    const handlePointerDown = (e) => {
      // Skip on any tap or click
      handleComplete();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);

    // Cinematic fixed sequence (< 2.8s total)
    // 0s - 0.9s: Genesis & stroke draw-in
    // 0.9s - 1.9s: Hero state & chromatic glow
    // 1.9s - 2.5s: Hyperspace zoom & dissolve
    // 2.5s: Finish & unmount
    const tProgress1 = setTimeout(() => { setProgress(32); }, 300);
    const tPhaseHero = setTimeout(() => {
      setPhase('hero');
      setProgress(72);
    }, 1000);
    const tPhaseWarp = setTimeout(() => {
      setPhase('warp');
      setProgress(100);
    }, 1900);
    const tComplete = setTimeout(() => {
      handleComplete();
    }, 2600);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
      clearTimeout(tProgress1);
      clearTimeout(tPhaseHero);
      clearTimeout(tPhaseWarp);
      clearTimeout(tComplete);
    };
  }, [shouldShow, handleComplete]);

  if (!shouldShow) return null;

  // Telemetry tick text based on current phase
  let tickerText = '[ 32% SYNTHESIZING ASSETS ]';
  if (phase === 'hero') tickerText = '[ INITIALIZING SYSTEM STREAM ]';
  if (phase === 'warp') tickerText = '[ 100% ACCESS GRANTED ➔ ENTERING INTERFACE ]';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cinematic Portfolio Intro"
      className={`preloader ${isFading ? 'preloader--fading' : ''} ${phase === 'warp' ? 'preloader--warping' : ''}`}
    >
      {/* Background lens flare & ambient glow wrapper */}
      <div className="preloader__ambient" aria-hidden="true">
        <div className="preloader__flare" />

        {/* Symmetrical CSS fanning light streaks */}
        <div className="preloader__streaks">
          <div className="preloader__streak-spine" />
          <div className="preloader__streak preloader__streak--left-1" />
          <div className="preloader__streak preloader__streak--left-2" />
          <div className="preloader__streak preloader__streak--left-3" />
          <div className="preloader__streak preloader__streak--left-4" />
          <div className="preloader__streak preloader__streak--right-1" />
          <div className="preloader__streak preloader__streak--right-2" />
          <div className="preloader__streak preloader__streak--right-3" />
          <div className="preloader__streak preloader__streak--right-4" />
          <div className="preloader__streak-horizontal" />
        </div>
      </div>

      {/* Skip button — visible, keyboard accessible */}
      <div className="preloader__controls">
        <button
          ref={skipBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
          className="preloader__skip-btn"
          aria-label="Skip introduction animation"
        >
          <span>SKIP INTRO</span>
          <span className="preloader__skip-key">[ESC]</span>
        </button>
      </div>

      {/* Central Monogram & Typography */}
      <div className={`preloader__content ${phase === 'warp' ? 'preloader__content--warp' : ''}`}>
        <div className="preloader__v-container">
          <svg
            width="240"
            height="280"
            viewBox="0 0 280 330"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="preloader__v-svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="preloader_left" x1="30" y1="20" x2="140" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF242D" />
                <stop offset="25%" stopColor="#E50914" />
                <stop offset="65%" stopColor="#B20710" />
                <stop offset="100%" stopColor="#6B0005" />
              </linearGradient>

              <linearGradient id="preloader_right" x1="250" y1="20" x2="135" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF3841" />
                <stop offset="35%" stopColor="#E50914" />
                <stop offset="80%" stopColor="#90040C" />
                <stop offset="100%" stopColor="#420003" />
              </linearGradient>

              <linearGradient id="preloader_fold_shadow" x1="140" y1="230" x2="170" y2="295" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(0, 0, 0, 0.95)" />
                <stop offset="70%" stopColor="rgba(0, 0, 0, 0.5)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </linearGradient>

              <filter id="preloader_shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="-4" dy="6" stdDeviation="7" floodColor="#000000" floodOpacity="0.9"/>
              </filter>
            </defs>

            {/* Left Ribbon Stroke (Draws in) */}
            <path
              d="M45 40 L140 290 L163 290 L68 40 Z"
              fill="url(#preloader_left)"
              className="preloader__ribbon-left"
            />
            {/* Left Ribbon Bevel / Sheen */}
            <path
              d="M46 40 L140 288"
              stroke="#FFA4A8"
              strokeWidth="3"
              opacity="0.85"
              className="preloader__sheen-left"
            />
            <path d="M67 42 L161 290" stroke="#3D0002" strokeWidth="2.5" opacity="0.9" />

            {/* Right Ribbon Stroke (Folds across with drop-shadow) */}
            <path
              d="M235 40 L140 290 L117 290 L212 40 Z"
              fill="url(#preloader_right)"
              filter="url(#preloader_shadow)"
              className="preloader__ribbon-right"
            />
            {/* Right Ribbon Bevel / Sheen */}
            <path
              d="M234 40 L140 288"
              stroke="#FFBAC0"
              strokeWidth="3"
              opacity="0.9"
              className="preloader__sheen-right"
            />
            <path d="M213 42 L119 290" stroke="#350002" strokeWidth="2.5" opacity="0.85" />

            {/* 3D Ribbon Fold & Shadow Crease at Apex */}
            <polygon points="128,260 140,292 160,292 150,250" fill="url(#preloader_fold_shadow)" />
            <line x1="140" y1="250" x2="140" y2="292" stroke="#1F0001" strokeWidth="3" />

            {/* Vertex Specular Flare */}
            <circle cx="140" cy="290" r="3.5" fill="#FFFFFF" opacity="0.95" className="preloader__specular" />
          </svg>
        </div>

        {/* Cinematographic Typography */}
        <div className="preloader__typography">
          <h1 className="preloader__title">
            VAIBHAVA KUMAR SHRIVASTAV · PORTFOLIO
          </h1>
          <div className="preloader__ticker font-mono">
            <span className="preloader__ticker-dot" />
            <span>{tickerText}</span>
          </div>
        </div>
      </div>

      {/* Thin Bottom Loading Line */}
      <div
        className="preloader__bottom-progress"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Loading progress"
      >
        <div
          className="preloader__bottom-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
