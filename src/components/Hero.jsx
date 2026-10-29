/**
 * ==========================================================================
 * Hero — Main landing section with stats and CTAs
 * ==========================================================================
 */
import { profile as profileData } from '../data/profile';
import { skills } from '../data/profile';
import { useGame } from '../context/GameContext';

export function Hero() {
  const { actions } = useGame();

  const handleCtaClick = (section) => {
    actions.addXp(25, `hero_cta_${section}`);
  };

  return (
    <section id="hero" className="hero section--hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero__content">
          <p className="hero__greeting" aria-hidden="true">
            <span>{'>'} hello, i'm</span>
          </p>
          <h1 id="hero-title" className="hero__name gradient-text">
            {profileData.name}
          </h1>
          <p className="hero__headline">{profileData.headline}</p>
          <p className="hero__tagline">{profileData.tagline}</p>

          <div className="hero__actions">
            <button
              className="btn btn--primary btn--lg"
              onClick={() => { handleCtaClick('projects'); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              View Projects
            </button>
            <button
              className="btn btn--secondary btn--lg"
              onClick={() => { handleCtaClick('contact'); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Get In Touch
            </button>
            <button
              className="btn btn--terminal btn--lg"
              onClick={() => { handleCtaClick('skills'); document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              View Skills
            </button>
            <a
              href={profileData.resumeUrl}
              className="btn btn--ghost btn--lg"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCtaClick('resume')}
            >
              Resume
            </a>
          </div>

          <div className="hero__stats" role="list" aria-label="Profile statistics">
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-text--terminal">{profileData.stats.level}</span>
              <span className="hero__stat-label">Level</span>
            </div>
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-text">{profileData.stats.xp.toLocaleString()}</span>
              <span className="hero__stat-label">XP</span>
            </div>
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-text--cyan">{skills.top.length}</span>
              <span className="hero__stat-label">Core Skills</span>
            </div>
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-text--terminal">{profileData.stats.hp}</span>
              <span className="hero__stat-label">HP</span>
            </div>
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-text--cyan">{profileData.stats.intelligence}</span>
              <span className="hero__stat-label">INT</span>
            </div>
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-value gradient-text">{profileData.stats.agility}</span>
              <span className="hero__stat-label">AGI</span>
            </div>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="hero__scroll" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation: 'float 2s ease-in-out infinite'}}>
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </div>
    </section>
  );
}