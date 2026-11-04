/**
 * ==========================================================================
 * Projects — Netflix-Style "Top Projects" Shelf
 * ==========================================================================
 * Features:
 * - Uses the reusable Row component with finite scroll snap and arrows
 * - Renders projects (GLA Exchange & EduCloud)
 * - Opens ProjectModal on card selection
 * - Preserves id="projects" for Navbar scroll-spy and anchor navigation
 * ==========================================================================
 */
import { projects, profile } from '../data/profile';
import { Row } from './Row';
import { ProjectCard } from './ProjectCard';
import { useUI } from '../context/GameContext';

export function Projects() {
  const { openProjectModal } = useUI();

  return (
    <div id="projects" className="projects-section">
      <Row
        title="Top Projects"
        subtitle="Trending Production & Cloud Platforms"
        badgeText="TOP 2 TODAY"
        items={projects}
        renderItem={(project, index) => (
          <ProjectCard
            project={project}
            episodeIndex={index + 1}
            onOpen={openProjectModal}
          />
        )}
        action={
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="row-shelf__action-link font-mono"
            aria-label="Explore all repositories on GitHub"
          >
            <span>Explore All Repos</span>
            <span aria-hidden="true">➔</span>
          </a>
        }
      />
    </div>
  );
}
