/**
 * ==========================================================================
 * Projects Section with Modal
 * ==========================================================================
 */
import { projects } from '../data/profile';
import { Card, CardMedia, CardBody, CardFooter, Badge, Row } from './Row';
import { useState } from 'react';
import { useInView } from '../hooks/useInView';

export function ProjectModal({ isOpen, project, onClose }) {
  if (!isOpen || !project) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal modal--full" onClick={e => e.stopPropagation()}>
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">{project.title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">✕</button>
        </header>
        <div className="modal__body">
          {/* Project Hero */}
          <div className="project-card__media" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', margin: 'calc(-1 * var(--space-6)) calc(-1 * var(--space-6)) var(--space-6)' }}>
            {project.image ? (
              <img src={project.image} alt="" className="project-card__image" />
            ) : (
              <div className="project-card__gradient" style={{ background: project.gradient, opacity: 1 }}></div>
            )}
          </div>

          <div className="project-card__tags" role="list" aria-label="Project tags">
            <Badge variant="primary" className="text-transform-capitalize">{project.status}</Badge>
            <Badge variant="terminal">{project.period}</Badge>
            <Badge variant="cyan">{project.role}</Badge>
            <Badge variant="neutral">Team: {project.teamSize}</Badge>
          </div>

          <h3 className="font-display text-3xl text-primary mb-4">{project.tagline}</h3>
          <p className="text-secondary leading-relaxed mb-8">{project.longDescription}</p>

          {/* Highlights */}
          <div className="mb-8">
            <h4 className="font-display text-xl text-terminal mb-4">Key Highlights</h4>
            <ul className="list-disc list-inside space-y-3 text-secondary leading-relaxed">
              {project.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="mb-8">
            <h4 className="font-display text-xl text-terminal mb-4">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {project.tech.map(t => <Badge key={t} variant="neutral">{t}</Badge>)}
            </div>
          </div>

          {/* Metrics */}
          {Object.keys(project.metrics).length > 0 && (
            <div className="mb-8">
              <h4 className="font-display text-xl text-terminal mb-4">Metrics</h4>
              <Row className="gap-6">
                {Object.entries(project.metrics).map(([key, value]) => (
                  <Card key={key} variant="glass" className="flex-1 min-w-[150px] text-center py-4">
                    <CardBody>
                      <p className="font-display text-2xl text-primary">{value}</p>
                      <p className="font-mono text-xs text-tertiary text-transform-uppercase">{key}</p>
                    </CardBody>
                  </Card>
                ))}
              </Row>
            </div>
          )}

          {/* Links */}
          <div className="modal__footer">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                Live Demo
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
                View Code
              </a>
            )}
            {project.docsUrl && (
              <a href={project.docsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--terminal">
                Documentation
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [ref, inView] = useInView({ triggerOnce: true });
  const featuredProjects = projects.filter(p => p.featured);

  return (
    <section id="projects" className="section" ref={ref} aria-labelledby="projects-title">
      <div className="container">
        <header className="section__header">
          <h2 id="projects-title" className="section__title">Projects</h2>
          <p className="section__subtitle">Production applications and collaborative work.</p>
        </header>

        <Row className="projects-grid" align="stretch">
          {projects.map((project, index) => (
            <Card
              key={project.id}
              variant="glass"
              className={`project-card ${inView ? 'animate-slide-up' : ''}`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
              onClick={() => setSelectedProject(project)}
            >
              <CardMedia>
                {project.image ? (
                  <img src={project.image} alt="" className="project-card__image" />
                ) : (
                  <div className="project-card__gradient" style={{ background: project.gradient }}></div>
                )}
                <div className="project-card__overlay">
                  <div className="project-card__tags" role="list">
                    <Badge variant="primary" className="text-transform-capitalize">{project.status}</Badge>
                    <Badge variant="terminal">{project.period}</Badge>
                  </div>
                </div>
              </CardMedia>
              <CardBody>
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__tagline">{project.tagline}</p>
                <p className="project-card__description">{project.description}</p>
                <div className="project-card__tech" role="list" aria-label="Technologies">
                  {project.tech.slice(0, 6).map(t => <Badge key={t} variant="neutral" className="project-card__tech-tag">{t}</Badge>)}
                  {project.tech.length > 6 && <Badge variant="neutral" className="project-card__tech-tag">+{project.tech.length - 6} more</Badge>}
                </div>
              </CardBody>
              <CardFooter className="project-card__footer">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn--terminal btn--sm flex-1 text-center" onClick={e => e.stopPropagation()}>
                    Live
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm flex-1 text-center" onClick={e => e.stopPropagation()}>
                    Code
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </Row>

        <ProjectModal
          isOpen={!!selectedProject}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
}