/**
 * ==========================================================================
 * Achievements — Holographic Exploration Badges & Validated Credentials
 * ==========================================================================
 * Features:
 * - Panel A: 10 Game Exploration Badges (visual only, 0 XP)
 *   Unlocked in colour with unlock date; locked as dimmed silhouettes with hints or ??? for secret
 * - Panel B: Real Resume Accomplishments (LeetCode 150+, Codeforces 880+, SIH internal qualifier)
 *   and AWS Certifications (Cloud Practitioner, AI Practitioner, AWS Academy)
 * - Awards "achievements_view" (+20 XP once) on view
 * - Awards "certifications_view" (triggers "Certified" badge) on view
 * - Level 5 Banner ("You've seen it all · Level 5 Hired!") with .level-5-glow on contact link
 * - Footer "Reset Progress" with confirmation modal
 * ==========================================================================
 */
import { useEffect, useRef } from 'react';
import {
  gameAchievements as badgeDefinitions,
  accomplishments as resumeAccomplishments,
  certifications as resumeCertifications
} from '../data/profile';
import { useGame, useXP } from '../context/GameContext';
import { useInView } from '../hooks/useInView';
import { Icon } from './Icon';

export function Achievements() {
  const { state, actions } = useGame();
  const { xp, level, isMaxLevel } = useXP();
  const [sectionRef, inView] = useInView({ threshold: 0.1, triggerOnce: false });
  const [certsRef, certsInView] = useInView({ threshold: 0.1, triggerOnce: false });
  const awardedSectionRef = useRef(false);
  const awardedCertsRef = useRef(false);

  // Award achievements_view (+20 XP once)
  useEffect(() => {
    if (inView && !awardedSectionRef.current) {
      awardedSectionRef.current = true;
      if (actions.awardAction) {
        actions.awardAction('achievements_view', 20, 'Achievements Shelf Explored');
      }
    }
  }, [inView, actions]);

  // Award certifications_view (triggers Certified badge)
  useEffect(() => {
    if (certsInView && !awardedCertsRef.current) {
      awardedCertsRef.current = true;
      if (actions.awardAction) {
        actions.awardAction('certifications_view', 0, 'AWS Credentials Inspected');
      }
    }
  }, [certsInView, actions]);

  const handleResetProgress = () => {
    if (window.confirm('Reset all exploration progress, XP, and badges? This action cannot be undone.')) {
      if (actions.resetGame) {
        actions.resetGame();
      }
    }
  };

  // Merge state achievements with definitions
  const currentAchievements = badgeDefinitions.map((def) => {
    const fromState = (state.achievements || []).find((a) => a.key === def.key);
    return {
      ...def,
      unlocked: Boolean(fromState?.unlocked),
      unlockedAt: fromState?.unlockedAt || null
    };
  });

  const unlockedCount = currentAchievements.filter((a) => a.unlocked).length;

  return (
    <section
      id="achievements"
      ref={sectionRef}
      className="section achievements-section"
      aria-labelledby="achievements-heading"
    >
      <div className="container achievements-container">
        {/* Section Header */}
        <header className="achievements-header">
          <div className="achievements-header__left">
            <div className="achievements-tag font-mono">
              <span className="achievements-pulse-dot" />
              <span>HOLOGRAPHIC CREDENTIALS & SYSTEM BADGES</span>
            </div>
            <h2 id="achievements-heading" className="achievements-title font-display">
              ACHIEVEMENTS & <span className="text-primary">CERTIFICATIONS</span>
            </h2>
          </div>

          <div className="achievements-header__counter font-mono">
            <span className="text-terminal font-bold">{unlockedCount} / 10 BADGES UNLOCKED</span>
          </div>
        </header>

        {/* Level 5 Banner: "You've Seen It All" */}
        {isMaxLevel && (
          <div className="level-5-banner" role="region" aria-label="Level 5 Completion Trophy">
            <div className="level-5-banner__icon" aria-hidden="true">
              <Icon name="trophy" size={32} />
            </div>
            <div className="level-5-banner__content">
              <span className="level-5-banner__pill font-mono">MAXIMUM RANK ACHIEVED</span>
              <h3 className="level-5-banner__title font-display">YOU'VE SEEN IT ALL · LEVEL 5 HIRED!</h3>
              <p className="level-5-banner__desc">
                You've unlocked the full portfolio architecture, reviewed AWS cloud infrastructure, and inspected production telemetry. Let's build what's next together.
              </p>
            </div>
            <a href="#contact" className="btn btn--primary level-5-glow">
              Get In Touch
            </a>
          </div>
        )}

        {/* PANEL B FIRST: Validated Credentials & Real Resume Facts */}
        <div ref={certsRef} className="credentials-shelf" aria-labelledby="certs-subheading">
          <div className="credentials-shelf__header">
            <h3 id="certs-subheading" className="credentials-shelf__title font-display">
              CREDENTIALS & ACCOMPLISHMENTS // RESUME REALITY
            </h3>
            <span className="font-mono text-xs text-muted">AMAZON WEB SERVICES & COMPETITIVE PROGRAMMING</span>
          </div>

          {/* Holographic Cards Grid */}
          <div className="credentials-grid">
            {/* Cert 1: AWS SAA / Cloud Practitioner */}
            {resumeCertifications.map((cert) => (
              <article key={cert.id} className="credential-card credential-card--aws">
                <div className="credential-card__foil" aria-hidden="true" />
                <div className="credential-card__body">
                  <div className="credential-card__icon-box" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  </div>
                  <div className="credential-card__text">
                    <span className="credential-card__issuer font-mono">{cert.issuer.toUpperCase()}</span>
                    <h4 className="credential-card__title">{cert.name}</h4>
                    <p className="credential-card__date font-mono text-muted text-xs">
                      Issued: {cert.date}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            {/* Resume Accomplishments: LeetCode, Codeforces, SIH */}
            {resumeAccomplishments.map((acc) => (
              <article key={acc.id} className="credential-card credential-card--metric">
                <div className="credential-card__foil credential-card__foil--metric" aria-hidden="true" />
                <div className="credential-card__body">
                  <div className="credential-card__icon-box font-mono text-xl" aria-hidden="true">
                    <Icon name={acc.icon || 'terminal'} size={24} />
                  </div>
                  <div className="credential-card__text">
                    <span className="credential-card__issuer font-mono">PROBLEM SOLVING</span>
                    <h4 className="credential-card__title">{acc.title}</h4>
                    <p className="credential-card__date text-xs text-muted">
                      {acc.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* PANEL A: 10 Game Exploration Badges */}
        <div className="badges-shelf" aria-labelledby="badges-subheading">
          <div className="badges-shelf__header">
            <h3 id="badges-subheading" className="badges-shelf__title font-display">
              SYSTEM BADGES // EXPLORATION LOG
            </h3>
            <span className="font-mono text-xs text-muted">10 BADGES · 0 XP · PURE EXPLORATION</span>
          </div>

          <div className="badges-grid">
            {currentAchievements.map((badge) => {
              const isLocked = !badge.unlocked;

              return (
                <div
                  key={badge.id}
                  className={`badge-card ${isLocked ? 'badge-card--locked' : 'badge-card--unlocked'} badge-card--${badge.rarity}`}
                >
                  {/* Badge Icon Frame */}
                  <div className="badge-card__icon-frame">
                    <span className="badge-card__icon" aria-hidden="true">
                      {isLocked ? (
                        <Icon name={badge.secret ? 'lock' : 'shield'} size={24} />
                      ) : (
                        <Icon name={badge.icon || 'award'} size={24} />
                      )}
                    </span>
                    {!isLocked && (
                      <span className="badge-card__check font-mono" aria-hidden="true">
                        <Icon name="check" size={12} />
                      </span>
                    )}
                  </div>

                  {/* Badge Meta */}
                  <div className="badge-card__content">
                    <div className="badge-card__meta font-mono">
                      <span className={`badge-card__rarity badge-card__rarity--${badge.rarity}`}>
                        {badge.rarity.toUpperCase()}
                      </span>
                      <span className="badge-card__zero-xp">0 XP</span>
                    </div>

                    <h4 className="badge-card__title">
                      {isLocked && badge.secret ? '???' : badge.name}
                    </h4>

                    <p className="badge-card__hint text-xs">
                      {isLocked
                        ? (badge.secret ? 'Classified objective. Hidden in the terminal or code.' : badge.unlockHint)
                        : badge.description}
                    </p>

                    {badge.unlocked && badge.unlockedAt && (
                      <span className="badge-card__timestamp font-mono text-xs text-muted">
                        Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Reset Progress Option */}
        <footer className="achievements-footer">
          <button
            type="button"
            onClick={handleResetProgress}
            className="achievements-reset-btn font-mono"
            aria-label="Reset all exploration XP and badges"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset Progress</span>
          </button>
        </footer>
      </div>
    </section>
  );
}
export default Achievements;
