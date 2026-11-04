/**
 * ==========================================================================
 * App — Root Component with Layout, Persona-Tailored Rows, and Modals
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
import { usePersona } from './context/GameContext';

function App() {
  const { personaId } = usePersona();

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

  // Determine row order based on persona:
  // - Hackathon Judge: AWS services first (EduCloud real stack: EC2, S3, IAM, VPC, Terraform)
  // - Recruiter: Skills sheet first
  // - Hiring Manager / Fellow Dev / Default: Projects first
  const renderRows = () => {
    if (personaId === 'judge') {
      return (
        <>
          <AwsServicesRow />
          <Projects />
          <About />
        </>
      );
    }

    if (personaId === 'recruiter') {
      return (
        <>
          <SkillsSheet />
          <Projects />
          <About />
        </>
      );
    }

    // Default order: Projects -> About
    return (
      <>
        <Projects />
        <About />
      </>
    );
  };

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Preloader */}
      <Preloader />

      {/* Profile Select Gate */}
      <ProfileSelect />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main id="main-content" role="main">
        <Hero />

        {/* Persona-Ordered Shelves */}
        {renderRows()}

        {/* SkillsSheet rendered here if not already rendered above for recruiter */}
        {personaId !== 'recruiter' && <SkillsSheet />}
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
