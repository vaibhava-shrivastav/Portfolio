/**
 * ==========================================================================
 * ProjectCard — Netflix-Style Project Poster Card
 * ==========================================================================
 * Features:
 * - 16:10 media area with CSS gradient fallback
 * - Factual badges only (no fake match ratings)
 * - Tech tag chips from profile.js
 * - Fully keyboard accessible button opening the ProjectModal
 * - Hover scaling & red accent glow under @media (hover: hover)
 * ==========================================================================
 */
export function ProjectCard({ project, episodeIndex, onOpen }) {
  const isGlaExchange = project.id === 'proj-1' || project.title.toLowerCase().includes('gla');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(project);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={handleKeyDown}
      className="project-card group"
      aria-label={`View details for ${project.title}: ${project.role}, ${project.period}`}
    >
      {/* 16:10 Media Poster Area */}
      <div className="project-card__media">
        {project.image ? (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            className="project-card__image"
          />
        ) : (
          <div
            className="project-card__gradient"
            style={{ background: project.gradient || 'var(--gradient-primary)' }}
          />
        )}

        {/* Gradient Scrim */}
        <div className="project-card__scrim" />

        {/* Top-Left Episode Pill */}
        <div className="project-card__badge-top-left font-mono">
          EP. 0{episodeIndex || 1}
        </div>

        {/* Top-Right Factual Status */}
        <div className="project-card__badge-top-right font-mono">
          <span className="project-card__status-dot" />
          <span>{isGlaExchange ? 'LIVE RELEASE' : 'TERRAFORM IAC'}</span>
        </div>

        {/* Bottom Left Role Pill */}
        <div className="project-card__badge-bottom-left font-mono">
          {project.role}
        </div>
      </div>

      {/* Card Body */}
      <div className="project-card__body">
        <div className="project-card__header-line">
          <h3 className="project-card__title">
            {project.title}
          </h3>
          <span className="project-card__period font-mono">
            {project.period}
          </span>
        </div>

        <p className="project-card__desc">
          {project.tagline || project.description}
        </p>

        {/* Tech Chips */}
        <div className="project-card__tech-row" aria-label="Technologies used">
          {project.tech.slice(0, 4).map((tech) => (
            <span key={tech} className="project-card__tech-chip font-mono">
              {tech}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="project-card__tech-chip font-mono text-white/40">
              +{project.tech.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
