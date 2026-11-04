/**
 * ==========================================================================
 * ProjectModal — Netflix-Style Cinematic Project Detail Window
 * ==========================================================================
 * Features:
 * - Matching Stitch screenshot (04-project-detail-modal.png)
 * - 16:9 / 16:10 top banner with CSS gradient fallback and system status HUD
 * - Strictly resume facts only: description, highlights bullets, tech chips, role, timeline
 * - Real links only: Live Demo (GLA Exchange only) and GitHub Repo
 * - NO fake metrics, outcomes, team size, challenges, or case study sections
 * - Accessible: focus trap, Esc key close, outside click, focus restoration to opener
 * - Body scroll locking while open
 * - Awards project:live:<id> (+15 XP once) on Live Demo click
 * ==========================================================================
 */
import { useEffect, useRef } from 'react';
import { useUI, useGame } from '../context/GameContext';

export function ProjectModal() {
  const { modalOpen, selectedProject, closeProjectModal } = useUI();
  const { actions } = useGame();
  const modalRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Lock body scroll and restore on unmount/close
  useEffect(() => {
    if (modalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modalOpen]);

  // Focus trap and keyboard controls (Escape to close)
  useEffect(() => {
    if (modalOpen) {
      previouslyFocusedRef.current = document.activeElement;

      // Focus first interactive element inside modal
      const timer = setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeProjectModal();
        } else if (e.key === 'Tab') {
          const focusable = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
          previouslyFocusedRef.current.focus();
        }
      };
    }
  }, [modalOpen, closeProjectModal]);

  if (!modalOpen || !selectedProject) return null;

  const isGlaExchange = selectedProject.id === 'proj-1' || selectedProject.title.toLowerCase().includes('gla');
  const liveUrl = isGlaExchange ? 'https://glaexchange.online' : null;

  const handleLiveClick = () => {
    // Award +15 XP once for clicking Live Demo
    if (actions.awardAction) {
      actions.awardAction(`project:live:${selectedProject.id}`, 15);
    }
  };

  return (
    <div
      className="project-modal-backdrop"
      onClick={closeProjectModal}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="project-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={closeProjectModal}
          className="project-modal__close-btn"
          aria-label="Close project overview"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Top Hero Preview Banner */}
        <div className="project-modal__hero">
          {selectedProject.image ? (
            <img
              src={selectedProject.image}
              alt=""
              className="project-modal__image"
            />
          ) : (
            <div
              className="project-modal__gradient"
              style={{ background: selectedProject.gradient || 'var(--gradient-primary)' }}
            />
          )}

          {/* Vignette Scrim */}
          <div className="project-modal__scrim" />

          {/* System HUD Status Badge */}
          <div className="project-modal__hud-badge font-mono">
            <span className="project-modal__pulse-dot" />
            <span>
              {isGlaExchange ? 'SYS.STATUS // DEPLOYED LIVE' : 'SYS.STATUS // AWS TERRAFORM IAC'}
            </span>
          </div>

          {/* Hero Lower Anchor Info */}
          <div className="project-modal__hero-info">
            <span className="project-modal__category-tag font-mono">
              [{selectedProject.role.toUpperCase()}]
            </span>
            <h2 id="project-modal-title" className="project-modal__title">
              {selectedProject.title}
            </h2>

            {/* CTAs */}
            <div className="project-modal__ctas">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLiveClick}
                  className="btn btn--primary"
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
                  <span>Launch Live Demo</span>
                </a>
              )}

              {selectedProject.repoUrl && (
                <a
                  href={selectedProject.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
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
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  <span>GitHub Repo</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body: 2-Column Asymmetric Layout */}
        <div className="project-modal__body">
          {/* Main Column */}
          <div className="project-modal__main">
            {/* Metadata Ribbon */}
            <div className="project-modal__meta-ribbon font-mono">
              <span className="project-modal__period-chip">
                {selectedProject.period}
              </span>
              <span className="project-modal__badge-status">
                {selectedProject.status}
              </span>
              <span className="project-modal__badge-tech">
                {isGlaExchange ? 'MERN + WEBSOCKET' : 'AWS CLUSTER'}
              </span>
            </div>

            {/* Synopsis */}
            <div className="project-modal__synopsis">
              <p className="project-modal__lead-text">
                {selectedProject.description}
              </p>
            </div>

            {/* Resume Highlights */}
            {selectedProject.highlights && selectedProject.highlights.length > 0 && (
              <div className="project-modal__highlights">
                <h3 className="project-modal__section-heading font-mono">
                  KEY ARCHITECTURAL HIGHLIGHTS
                </h3>
                <ul className="project-modal__bullet-list">
                  {selectedProject.highlights.map((bullet, idx) => (
                    <li key={idx} className="project-modal__bullet-item">
                      <span className="project-modal__bullet-icon" aria-hidden="true">➔</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Technical Metadata Sidebar */}
          <aside className="project-modal__sidebar">
            <div className="project-modal__sidebar-group">
              <span className="project-modal__sidebar-label font-mono">PROJECT TYPE</span>
              <span className="project-modal__sidebar-value">{selectedProject.role}</span>
            </div>

            <div className="project-modal__sidebar-group">
              <span className="project-modal__sidebar-label font-mono">TIMELINE</span>
              <span className="project-modal__sidebar-value">{selectedProject.period}</span>
            </div>

            <div className="project-modal__sidebar-group">
              <span className="project-modal__sidebar-label font-mono">VERIFIED TECH STACK</span>
              <div className="project-modal__sidebar-tags">
                {selectedProject.tech.map((t) => (
                  <span key={t} className="project-modal__tech-chip font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {isGlaExchange && (
              <div className="project-modal__sidebar-group">
                <span className="project-modal__sidebar-label font-mono">PRODUCTION DOMAIN</span>
                <a
                  href="https://glaexchange.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-modal__domain-link font-mono"
                >
                  glaexchange.online ↗
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
