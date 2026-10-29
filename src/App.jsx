/**
 * ==========================================================================
 * App — Root component with layout and routing
 * ==========================================================================
 */
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Preloader } from './components/Preloader';
import { ProfileSelect } from './components/ProfileSelect';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { SkillsSheet } from './components/SkillsSheet';
import { Projects } from './components/Projects';
import { Achievements } from './components/Achievements';
import { ContactSection } from './components/ContactSection';
import { Terminal } from './components/Terminal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';
import { useGame } from './context/GameContext';
import { useInView } from './hooks/useInView';

function App() {
  const { state, actions } = useGame();

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
          title: 'Konami Code!',
          message: '🎮 You\'ve unlocked the Terminal Master achievement!',
          persist: true
        });
        sequence.length = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

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
        <About />
        <SkillsSheet />
        <Projects />
        <Achievements />
        <ContactSection />
      </main>

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