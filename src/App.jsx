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
import { useGame, usePersona } from './context/GameContext';

function App() {
  const { actions } = useGame();
  const { personaId, firstRowOrder } = usePersona();

  // Keyboard shortcut to toggle terminal (Ctrl/Cmd + `)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        actions.toggleTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  // Konami code listener
  useEffect(() => {
    const sequence = [];
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

    const handleKeyDown = (e) => {
      sequence.push(e.key.toLowerCase());
      if (sequence.length > konamiCode.length) sequence.shift();

      if (sequence.join(',') === konamiCode.join(',')) {
        actions.addEasterEgg('konami');
        actions.addToast({
          type: 'achievement',
          title: 'Konami Code Master!',
          message: '🎮 Terminal secret unlocked!'
        });
        sequence.length = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  // Determine row order based on persona
  // - Hackathon Judge: AWS services first (EduCloud real stack: EC2, S3, IAM, VPC, Terraform)
  // - Hiring Manager: Projects first
  // - Recruiter: TODO Stage D skills row; projects first for now
  // - Fellow Dev: TODO Stage E terminal row; projects first for now
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

    // Default order: Top Projects -> About Me: Season 1
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

        {/* Placeholder sections with IDs preserved for Navbar scroll-spy */}
        {personaId !== 'recruiter' && <SkillsSheet />}
        <Achievements />
        <ContactSection />
      </main>

      {/* Project Detail Modal */}
      <ProjectModal />

      {/* Footer */}
      <Footer />

      {/* Terminal Overlay */}
      <Terminal />

      {/* Toast Notifications */}
      <ToastContainer />
    </>
  );
}

export default App;
