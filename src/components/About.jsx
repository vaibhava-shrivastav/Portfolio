/**
 * ==========================================================================
 * About — "About Me: Season 1" Netflix-Style Episodic Shelf
 * ==========================================================================
 * Features:
 * - Episodic structure built strictly from resume.pdf facts:
 *   - Ep 1: Education at GLA University (2024-2028, CPI 8.8)
 *   - Ep 2: Experience at Astrea IT Services (Jun-Jul 2026)
 *   - Ep 3: GLA Exchange (Full-Stack Project, Jan-May 2026)
 *   - Ep 4: EduCloud (Collaborative Project, Feb-Apr 2026)
 * - Awards about_view (+30 XP once) via useInView
 * - Preserves id="about" for Navbar scroll-spy and anchor navigation
 * - Reusable Row component with scroll snap & desktop arrows
 * ==========================================================================
 */
import { useEffect, useRef } from 'react';
import { education, experience, projects } from '../data/profile';
import { Row } from './Row';
import { useInView } from '../hooks/useInView';
import { useGame, useUI } from '../context/GameContext';

export function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const { actions } = useGame();
  const { openProjectModal } = useUI();
  const awardedRef = useRef(false);

  // Award about_view (+30 XP once) when scrolled into view
  useEffect(() => {
    if (inView && !awardedRef.current) {
      awardedRef.current = true;
      if (actions.awardAction) {
        actions.awardAction('about_view', 30);
      }
    }
  }, [inView, actions]);

  // Episodes built strictly from resume.pdf facts
  const episodes = [
    {
      id: 'ep-1',
      episodeNumber: '01',
      tag: 'EDUCATION',
      title: 'GLA University · Computer Science',
      period: education[0]?.period || '2024 — 2028',
      summary: `B.Tech in Computer Science at GLA University (CPI 8.8/10). Academic coursework spanning Data Structures, Database Systems, Computer Networks, and Cloud Computing. Prior: Adani Public School (89.8%), OP Jindal (86.2%).`,
      tech: ['Data Structures', 'DBMS', 'OS', 'Networks', 'Cloud'],
      gradient: 'linear-gradient(135deg, #1C0A35 0%, #0F081E 100%)',
      actionLabel: 'View Education'
    },
    {
      id: 'ep-2',
      episodeNumber: '02',
      tag: 'INTERNSHIP',
      title: 'Astrea IT Services · Salesforce Intern',
      period: experience[0]?.period || 'Jun 2026 — Jul 2026',
      summary: `Hands-on training program on the Salesforce.com cloud computing development platform. Practical exposure to cloud-based application development and platform architecture with strong conceptual engagement.`,
      tech: ['Salesforce.com', 'Cloud Platform', 'Architecture'],
      gradient: 'linear-gradient(135deg, #2A0815 0%, #150208 100%)',
      actionLabel: 'View Experience'
    },
    {
      id: 'ep-3',
      episodeNumber: '03',
      tag: 'FULL-STACK PROJECT',
      title: 'GLA Exchange · Campus Marketplace',
      period: projects[0]?.period || 'Jan 2026 — May 2026',
      summary: `Production campus marketplace for GLA University students. Features real-time peer-to-peer Socket.io chat, Google OAuth, Cloudinary image hosting, and MongoDB Atlas, deployed at glaexchange.online.`,
      tech: ['ReactJS', 'Node.js', 'Socket.io', 'JWT', 'MongoDB'],
      gradient: 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)',
      projectRef: projects[0],
      actionLabel: 'Open Project'
    },
    {
      id: 'ep-4',
      episodeNumber: '04',
      tag: 'CLOUD ARCHITECTURE',
      title: 'EduCloud · Multi-Tenant AWS Infra',
      period: projects[1]?.period || 'Feb 2026 — Apr 2026',
      summary: `Collaborative cloud infrastructure on AWS orchestrated with Terraform IaC. Provisions isolated, fault-tolerant student workspaces utilizing VPC network segregation, IAM role policies, EC2, and S3.`,
      tech: ['AWS', 'Terraform', 'IAM', 'VPC', 'EC2', 'S3'],
      gradient: 'linear-gradient(135deg, #09203F 0%, #05101E 100%)',
      projectRef: projects[1],
      actionLabel: 'Open Project'
    }
  ];

  const handleEpisodeClick = (ep) => {
    if (ep.projectRef) {
      openProjectModal(ep.projectRef);
    }
  };

  return (
    <div id="about" ref={ref} className="about-section">
      <Row
        title="About Me: Season 1"
        subtitle="The Developer Journey · 4 Episodes"
        badgeText="ORIGINAL SERIES"
        items={episodes}
        renderItem={(ep) => (
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleEpisodeClick(ep)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleEpisodeClick(ep);
              }
            }}
            className="episode-card group"
            aria-label={`Episode ${ep.episodeNumber}: ${ep.title}, ${ep.period}`}
          >
            {/* Episode Media Banner */}
            <div className="episode-card__media">
              <div
                className="episode-card__gradient"
                style={{ background: ep.gradient }}
              />
              <div className="episode-card__scrim" />

              <div className="episode-card__badge-top-left font-mono">
                EP. {ep.episodeNumber}
              </div>

              <div className="episode-card__badge-bottom-left font-mono">
                {ep.tag}
              </div>
            </div>

            {/* Episode Details */}
            <div className="episode-card__body">
              <div className="episode-card__header-line">
                <h3 className="episode-card__title">
                  {ep.title}
                </h3>
                <span className="episode-card__period font-mono">
                  {ep.period}
                </span>
              </div>

              <p className="episode-card__desc">
                {ep.summary}
              </p>

              <div className="episode-card__tech-row" aria-label="Skills and tools">
                {ep.tech.map((t) => (
                  <span key={t} className="episode-card__tech-chip font-mono">
                    {t}
                  </span>
                ))}
              </div>

              {ep.projectRef && (
                <div className="episode-card__footer font-mono">
                  <span className="episode-card__cta-text">
                    {ep.actionLabel}
                  </span>
                  <span className="episode-card__cta-arrow" aria-hidden="true">➔</span>
                </div>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}
