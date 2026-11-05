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
import { useUI, useGame, useGameActions, useSession } from '../context/GameContext';
import { useKonami } from '../hooks/useKonami';
import { Icon } from './Icon';

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
  const { profileSelected } = useSession();
  const { actions } = useGame();
  const { toggleTerminal } = useGameActions();

  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const launcherRef = useRef(null);
  const openerRef = useRef(null);

  // Track input focus across the document to hide floating launcher
  useEffect(() => {
    const handleFocusIn = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        setInputFocused(true);
      }
    };
    const handleFocusOut = () => {
      setInputFocused(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Track mobile visualViewport to detect open on-screen keyboard
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const handleResize = () => {
      const isKb = window.visualViewport.height < window.innerHeight * 0.75;
      setKeyboardOpen(isKb);
    };
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

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
        message: 'Terminal secret activated (+100 XP)',
        icon: 'gamepad'
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
      {/* Floating Bottom-Right Launcher Widget (Mobile / Small Screen only) */}
      {!terminalOpen && !modalOpen && !inputFocused && !keyboardOpen && profileSelected && (
        <aside className="terminal-launcher-container" aria-label="Terminal discovery launcher">
          {/* One-Time Hint Banner */}
          {showHintBanner && (
            <div className="terminal-hint-banner font-mono" role="status">
              <span className="terminal-hint-banner__text">
                <Icon name="lightbulb" size={14} className="mr-1 inline-block" /> Tip: Press <kbd className="terminal-kbd">`</kbd> for interactive CLI
              </span>
              <button
                type="button"
                onClick={dismissHintBanner}
                className="terminal-hint-banner__close"
                aria-label="Dismiss terminal hint"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          )}

          {/* Launcher Button */}
          <button
            ref={launcherRef}
            type="button"
            onClick={handleLauncherClick}
            className="terminal-launcher-btn font-mono"
            aria-expanded="false"
            aria-haspopup="dialog"
            title="Press ` to open terminal"
          >
            <span className="terminal-launcher-btn__pulse" aria-hidden="true" />
            <span className="terminal-launcher-btn__prompt font-bold">&gt;_</span>
            <span className="terminal-launcher-btn__label">Terminal</span>
          </button>
        </aside>
      )}

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
