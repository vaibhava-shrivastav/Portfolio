/**
 * ==========================================================================
 * SkillsSheet — Cyberpunk / RPG Operator Character Attributes Sheet
 * ==========================================================================
 * Features:
 * - Matching Stitch screenshot (02-skills-character-sheet.png)
 * - 6 real categories only from profile.js (Languages, Frameworks & Libraries,
 *   Cloud & DevOps, Databases, CS Fundamentals, Developer Tools)
 * - Left Panel: inline SVG avatar, visitor's "Level N · Title", real GameContext XP,
 *   Level progression and XP bar
 * - Right Panel: accessible accordion modules with button headers, aria-expanded,
 *   aria-controls, keyboard support (click/Enter/Space), no hover expand
 * - Animated level bars with role="progressbar" and numeric text
 * - Self-assessed note in UI + // SELF-ASSESSED: confirm comment
 * - Awards "skills_view" (+30 XP once) when viewed
 * - Awards "skill_cat:<categoryName>" on category expand to trigger "Skill Collector" badge
 * ==========================================================================
 */
import { useState, useEffect, useRef } from 'react';
import { skills as skillsData, profile as profileData } from '../data/profile';
import { useGame, useXP } from '../context/GameContext';
import { useInView } from '../hooks/useInView';
import { Icon } from './Icon';

export function SkillsSheet() {
  const { actions } = useGame();
  const { xp, level, progress, totalXp } = useXP();
  const [sectionRef, inView] = useInView({ threshold: 0.1, triggerOnce: false });
  const awardedRef = useRef(false);

  // Expanded categories state (default first 2 open)
  const [expandedIndices, setExpandedIndices] = useState(() => new Set([0, 1]));

  // Award skills_view (+30 XP once) when section enters viewport
  useEffect(() => {
    if (inView && !awardedRef.current) {
      awardedRef.current = true;
      if (actions.awardAction) {
        actions.awardAction('skills_view', 30, 'Character Sheet Inspected');
      }
      // Also register initial open categories for badge progress
      const categories = skillsData?.categories || [];
      [0, 1].forEach((idx) => {
        if (categories[idx]) {
          actions.awardAction(`skill_cat:${categories[idx].name}`, 0);
        }
      });
    }
  }, [inView, actions]);

  const toggleCategory = (index, categoryName) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        // Track category expansion for Skill Collector badge
        if (actions.awardAction && categoryName) {
          actions.awardAction(`skill_cat:${categoryName}`, 0);
        }
      }
      return next;
    });
  };

  const categories = skillsData?.categories || [];

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="section skills-sheet-section"
      aria-labelledby="skills-sheet-heading"
    >
      <div className="container skills-sheet-container">
        {/* Top Header Bar */}
        <header className="skills-sheet-header">
          <div className="skills-sheet-header__left">
            <div className="skills-sheet-system-tag font-mono">
              <span className="skills-sheet-pulse-dot" />
              <span>SYS_PROG // OPERATOR_SHEET_V5.4</span>
            </div>
            <h2 id="skills-sheet-heading" className="skills-sheet-title font-display">
              CHARACTER <span className="text-primary">ATTRIBUTES</span>
            </h2>
          </div>

          <div className="skills-sheet-header__right font-mono">
            <div className="skills-sheet-xp-badge">
              <span className="skills-sheet-xp-label">TOTAL XP POOL</span>
              <span className="skills-sheet-xp-val text-terminal">{(totalXp ?? xp ?? 0).toLocaleString()} PTS</span>
            </div>
            <div className="skills-sheet-rank-badge">
              <span className="skills-sheet-xp-label">OPERATOR RANK</span>
              <span className="skills-sheet-xp-val text-cyan">LVL {level} // ACTIVE</span>
            </div>
          </div>
        </header>

        {/* Two-Column RPG Sheet Grid */}
        <div className="skills-sheet-grid">
          {/* LEFT COLUMN: Character Card & Vitals */}
          <aside className="skills-sheet-character-card" aria-label="Developer identity and vitals">
            {/* Ambient Background Glows Wrapper */}
            <div className="skills-sheet-card__ambient" aria-hidden="true">
              <div className="skills-sheet-card__flare skills-sheet-card__flare--top" />
              <div className="skills-sheet-card__flare skills-sheet-card__flare--bottom" />
            </div>

            {/* Avatar Frame with Inline SVG */}
            <div className="skills-sheet-avatar-frame">
              <div className="skills-sheet-avatar-inner">
                <svg
                  className="skills-sheet-avatar-svg"
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Developer Avatar Hologram"
                >
                  <defs>
                    <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="avatarStroke" x1="0" y1="0" x2="160" y2="160">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="50%" stopColor="var(--color-cyan)" />
                      <stop offset="100%" stopColor="var(--color-terminal)" />
                    </linearGradient>
                  </defs>
                  <rect width="160" height="160" rx="16" fill="#141414" />
                  <circle cx="80" cy="80" r="70" fill="url(#avatarGlow)" />
                  <circle cx="80" cy="80" r="70" stroke="url(#avatarStroke)" strokeWidth="2" strokeDasharray="6 4" />
                  {/* Cybernetic Visage */}
                  <circle cx="80" cy="62" r="28" fill="#201f1f" stroke="var(--color-cyan)" strokeWidth="2" />
                  <path d="M68 62 Q80 72 92 62" stroke="var(--color-terminal)" strokeWidth="2" fill="none" />
                  <circle cx="72" cy="58" r="3" fill="var(--color-cyan)" />
                  <circle cx="88" cy="58" r="3" fill="var(--color-cyan)" />
                  <path d="M42 128 C42 102 60 96 80 96 C100 96 118 102 118 128" fill="#201f1f" stroke="var(--color-primary)" strokeWidth="2" />
                  {/* Monogram Overlay */}
                  <text x="80" y="148" textAnchor="middle" fill="var(--color-terminal)" fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold">
                    [SYS.BUILDER]
                  </text>
                </svg>
                <div className="skills-sheet-avatar-status font-mono">ONLINE</div>
                
              </div>
            </div>

            {/* Candidate Designation */}
            <div className="skills-sheet-identity text-center">
              <span className="skills-sheet-identity__label font-mono">DESIGNATION</span>
              <h3 className="skills-sheet-identity__name font-display">{profileData.name}</h3>
              <div className="skills-sheet-identity__pill font-mono">
                <span>Level {level} · {profileData.headline}</span>
              </div>
            </div>

            {/* XP Progression Bar */}
            <div className="skills-sheet-vitals font-mono" role="region" aria-label="Visitor XP rank progression">
              <div className="skills-sheet-vital-item">
                <div className="skills-sheet-vital-header">
                  <span className="text-terminal font-bold">★ XP PROGRESSION</span>
                  <span className="text-terminal">{progress}%</span>
                </div>
                <div
                  className="skills-sheet-bar-track"
                  role="progressbar"
                  aria-label="XP to next rank"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="skills-sheet-bar-fill skills-sheet-bar-fill--xp"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: 6 Skill Modules (Accordion) */}
          <div className="skills-sheet-modules" role="region" aria-label="Technical skill categories">
            {categories.map((category, catIdx) => {
              const isExpanded = expandedIndices.has(catIdx);
              const modCode = `MOD: 0${catIdx + 1}`;
              const panelId = `skill-panel-${catIdx}`;
              const headerId = `skill-header-${catIdx}`;

              return (
                <article
                  key={category.name}
                  className={`skills-sheet-module ${isExpanded ? 'skills-sheet-module--open' : ''}`}
                >
                  {/* Accordion Header Button */}
                  <button
                    type="button"
                    id={headerId}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => toggleCategory(catIdx, category.name)}
                    className="skills-sheet-module__header"
                  >
                    <div className="skills-sheet-module__title-group">
                      <span className="skills-sheet-module__icon font-mono" aria-hidden="true">
                        <Icon name={category.icon || 'code'} size={20} />
                      </span>
                      <h3 className="skills-sheet-module__title font-display">
                        {category.name}
                      </h3>
                    </div>

                    <div className="skills-sheet-module__meta font-mono">
                      <span className="skills-sheet-module__code">{modCode}</span>
                      <svg
                        className={`skills-sheet-module__chevron ${isExpanded ? 'skills-sheet-module__chevron--open' : ''}`}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Accordion Content Panel */}
                  {isExpanded && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      className="skills-sheet-module__content"
                    >
                      <div className="skills-sheet-items-grid">
                        {category.items.map((item) => (
                          // SELF-ASSESSED: confirm
                          <div key={item.name} className="skills-sheet-item">
                            <div className="skills-sheet-item__top font-mono">
                              <span className="skills-sheet-item__name text-white">
                                {item.name}
                              </span>
                              <span className="skills-sheet-item__lvl text-terminal font-bold">
                                [LVL {item.level}]
                              </span>
                            </div>

                            {/* Accessible Level Progressbar */}
                            <div
                              className="skills-sheet-item__track"
                              role="progressbar"
                              aria-label={`${item.name} self-assessed proficiency`}
                              aria-valuenow={item.level}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              <div
                                className="skills-sheet-item__fill"
                                style={{
                                  width: inView ? `${item.level}%` : '0%',
                                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {/* Self-Assessed Rating Disclaimer Note */}
            <p className="skills-sheet-note font-mono text-center">
              // NOTE: Skill proficiency ratings are self-assessed estimates based on university academics (GLA University), production deployments (GLA Exchange), and hands-on cloud labs (EduCloud).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default SkillsSheet;
