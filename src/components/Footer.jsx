/**
 * ==========================================================================
 * Footer — Site footer with links and social
 * ==========================================================================
 */
import { profile as profileData, contact, site } from '../data/profile';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navColumns = [
    {
      title: 'Navigate',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Skills', href: '#skills' },
        { label: 'Projects', href: '#projects' },
        { label: 'Achievements', href: '#achievements' },
        { label: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Projects',
      links: [
        { label: 'GLA Exchange', href: 'https://glaexchange.online', external: true },
        { label: 'EduCloud', href: 'https://github.com/vaibhava-shrivastav/educloud', external: true }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' }
      ]
    }
  ];

  const socialLinks = [
    { label: 'GitHub', href: contact.github, icon: '⌘' },
    { label: 'LinkedIn', href: contact.linkedin, icon: '💼' },
    { label: 'Email', href: `mailto:${contact.email}`, icon: '✉' }
  ];

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <p className="footer__logo">
              <span className="gradient-text">VKS</span>
            </p>
            <p className="footer__tagline">
              {profileData.tagline}
            </p>
            <div className="footer__social" role="list" aria-label="Social links">
              {socialLinks.map((social, i) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="footer__social-link"
                  target={social.external ? '_blank' : '_self'}
                  rel={social.external ? 'noopener noreferrer' : ''}
                  aria-label={social.label}
                  role="listitem"
                >
                  <span aria-hidden="true">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {navColumns.map((column, i) => (
            <nav key={column.title} aria-label={column.title}>
              <h4 className="footer__column-title">{column.title}</h4>
              <ul className="footer__links">
                {column.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer__link"
                      target={link.external ? '_blank' : '_self'}
                      rel={link.external ? 'noopener noreferrer' : ''}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} {profileData.name}. Built with React, Vite, and ☕.
          </p>
          <nav className="footer__legal" aria-label="Legal links">
            <a href="/privacy" className="footer__legal-link">Privacy</a>
            <a href="/terms" className="footer__legal-link">Terms</a>
            <a href="/cookies" className="footer__legal-link">Cookies</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}