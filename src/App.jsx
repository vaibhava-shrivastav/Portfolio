/**
 * ==========================================================================
 * App — Root Component with Layout, Portfolio Rows, and Modals
 * ==========================================================================
 */
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Preloader } from './components/Preloader';
import { ProfileSelect } from './components/ProfileSelect';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { About } from './components/About';
import { AwsServicesRow } from './components/AwsServicesRow';
import { ProjectModal } from './components/ProjectModal';
import { SkillsSheet } from './components/SkillsSheet';
import { Achievements } from './components/Achievements';
import { ContactSection } from './components/ContactSection';
import { Terminal } from './components/Terminal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';

function App() {
  // Initialize theme from localStorage on startup
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('netflix-portfolio-theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Preloader */}
      <Preloader />

      {/* Welcome Gateway */}
      <ProfileSelect />

      {/* Navbar */}
      <Navbar />

      {/* Main Content (order matches navbar navigation) */}
      <main id="main-content" role="main">
        <Hero />
        <About />
        <SkillsSheet />
        <div className="projects-wrapper">
          <AwsServicesRow />
          <Projects />
        </div>
        <Achievements />
        <ContactSection />
      </main>

      {/* Project Detail Modal */}
      <ProjectModal />

      {/* Footer */}
      <Footer />

      {/* Terminal Overlay & Launcher */}
      <Terminal />

      {/* Toast Notifications */}
      <ToastContainer />
    </>
  );
}

export default App;
