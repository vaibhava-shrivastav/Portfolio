/**
 * ==========================================================================
 * Navbar — Fixed navigation with section links
 * ==========================================================================
 */
import { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { useGame } from '../context/GameContext';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const { actions } = useGame();

  // Track scroll for navbar style
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            // Award XP for visiting new section
            actions.addVisitedSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    );

    SECTIONS.forEach(section => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [actions]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar__inner container">
        <a href="#about" className="navbar__brand" aria-label="Vaibhava Kumar Shrivastav - Home">
          <span aria-hidden="true">VKS</span>
        </a>

        <ul className={`navbar__nav ${mobileOpen ? 'navbar__nav--open' : ''}`} role="menubar">
          {SECTIONS.map(section => (
            <li key={section.id} role="none">
              <a
                href={`#${section.id}`}
                className={`navbar__link ${activeSection === section.id ? 'navbar__link--active' : ''}`}
                role="menuitem"
                onClick={(e) => { e.preventDefault(); scrollToSection(section.id); }}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          <button
            className="btn btn--terminal btn--sm"
            onClick={() => actions.toggleTerminal()}
            aria-label="Toggle terminal"
          >
            Terminal
          </button>
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="navbar-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}