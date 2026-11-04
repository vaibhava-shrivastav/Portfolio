/**
 * ==========================================================================
 * Terminal — Lazy-Loaded Shell Component with Fixed Launcher & Global Discovery
 * ==========================================================================
 * Features:
 * - Lazy-loaded TerminalDrawer via React.lazy for clean bundle splitting
 * - Fixed ">_ Terminal" launcher at bottom-right with pulsing indicator
 * - One-time dismissible discovery banner on session entry (sessionStorage, auto-dismisses after 8s)
 * - Global ` (Backquote) shortcut listener (ignored when input focused or modal open)
 * - Global Konami code listener (matrix rain + secret + 100 XP)
 * - Awards terminal_first_open (+50 XP) and unlocks badge
 * - Focus restoration to launcher or opener element on close
 * - Safe positioning: does not overlap navbar or toast notifications
 * ==========================================================================
 */
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useUI, useGame, useGameActions } from '../context/GameContext';
import { useKonami } from '../hooks/useKonami';

const LazyTerminalDrawer = lazy(() => import('./TerminalDrawer'));

function isInputFocused() {
  const active = document.activeElement;
  if (!active || !(active instanceof HTMLElement)) return false;
  const tag = active.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    active.isContentEditable
  );
}

export function Terminal() {
  const { terminalOpen, modalOpen } = useUI();
  const { actions } = useGame();
  const { toggleTerminal } = useGameActions();

  const launcherRef = useRef(null);
  const openerRef = useRef(null);

  // Discovery Hint Banner (shown once per session after delay, auto-dismisses after 8s)
  const [showHintBanner, setShowHintBanner] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('terminal-hint-dismissed');
      if (!dismissed) {
        const showTimer = setTimeout(() => {
          setShowHintBanner(true);
        }, 3000);

        const autoDismissTimer = setTimeout(() => {
          setShowHintBanner(false);
          try {
            sessionStorage.setItem('terminal-hint-dismissed', 'true');
          } catch (e) {
            // ignore
          }
        }, 11000); // 3s delay + 8s display = 11s

        return () => {
          clearTimeout(showTimer);
          clearTimeout(autoDismissTimer);
        };
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const dismissHintBanner = () => {
    setShowHintBanner(false);
    try {
      sessionStorage.setItem('terminal-hint-dismissed', 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  // Award terminal_first_open (+50 XP) on first open
  useEffect(() => {
    if (terminalOpen && actions.awardAction) {
      actions.awardAction('terminal_first_open', 50, 'Interactive Terminal Initialized');
    }
  }, [terminalOpen, actions]);

  // Focus restoration on terminal close
  useEffect(() => {
    if (terminalOpen) {
      openerRef.current = document.activeElement;
    } else if (openerRef.current) {
      try {
        openerRef.current.focus();
      } catch (e) {
        if (launcherRef.current) {
          launcherRef.current.focus();
        }
      }
      openerRef.current = null;
    }
  }, [terminalOpen]);

  // Global Backquote (`) shortcut listener
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === '`' || e.code === 'Backquote') {
        if (modalOpen || isInputFocused()) {
          return;
        }
        e.preventDefault();
        dismissHintBanner();
        toggleTerminal();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [modalOpen, toggleTerminal]);

  // Global Konami Code Listener
  useKonami(() => {
    if (actions.awardAction) {
      actions.awardAction('secret_or_konami', 100, 'Secret Konami Code Activated');
    }
    if (actions.addToast) {
      actions.addToast({
        type: 'achievement',
        title: 'Konami Master Unlocked!',
        message: '🎮 Terminal secret activated (+100 XP)',
        icon: '🎮'
      });
    }
    // If terminal is closed, open it
    if (!terminalOpen) {
      toggleTerminal();
    }
  });

  const handleLauncherClick = () => {
    dismissHintBanner();
    toggleTerminal();
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Widget */}
      <aside className="terminal-launcher-container" aria-label="Terminal discovery launcher">
        {/* One-Time Hint Banner */}
        {showHintBanner && !terminalOpen && (
          <div className="terminal-hint-banner font-mono" role="status">
            <span className="terminal-hint-banner__text">
              💡 Tip: Press <kbd className="terminal-kbd">`</kbd> for interactive CLI
            </span>
            <button
              type="button"
              onClick={dismissHintBanner}
              className="terminal-hint-banner__close"
              aria-label="Dismiss terminal hint"
            >
              ×
            </button>
          </div>
        )}

        {/* Launcher Button */}
        <button
          ref={launcherRef}
          type="button"
          onClick={handleLauncherClick}
          className={`terminal-launcher-btn font-mono ${terminalOpen ? 'terminal-launcher-btn--active' : ''}`}
          aria-expanded={terminalOpen}
          aria-haspopup="dialog"
          title="Press ` to open terminal"
        >
          <span className="terminal-launcher-btn__pulse" aria-hidden="true" />
          <span className="terminal-launcher-btn__prompt font-bold">&gt;_</span>
          <span className="terminal-launcher-btn__label">Terminal</span>
          <kbd className="terminal-launcher-btn__kbd hidden sm:inline" aria-hidden="true">`</kbd>
        </button>
      </aside>

      {/* Lazy Loaded Terminal Drawer */}
      {terminalOpen && (
        <Suspense fallback={<div className="terminal-drawer-fallback" />}>
          <LazyTerminalDrawer onClose={toggleTerminal} />
        </Suspense>
      )}
    </>
  );
}

export default Terminal;
