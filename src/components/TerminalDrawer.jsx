/**
 * ==========================================================================
 * TerminalDrawer — Interactive Sliding Retro Terminal (Lazy-Loaded Chunk)
 * ==========================================================================
 * Features:
 * - 50% screen height on desktop, 60% on mobile (no drag/resize/minimize)
 * - Pure command execution engine with Levenshtein fuzzy matching
 * - Tab autocomplete, Up/Down history, Ctrl+L clear, Enter to run
 * - Interactive mobile quick-op chips (44px tap targets, 16px iOS safe font)
 * - Matrix rain animation on secret/konami (canvas, 4s duration, stops under reduced motion)
 * - Auto-scrolls to newest output
 * - Accessible: role="dialog", aria-label, aria-live="polite", focus trap, Esc close
 * - Modal rule: closes immediately when project modal opens
 * ==========================================================================
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { parseCommand, VALID_COMMAND_NAMES } from '../terminal/commands';
import { getClosestCommand } from '../terminal/suggest';
import { useGame, useUI, useXP, usePersona } from '../context/GameContext';

export default function TerminalDrawer({ onClose }) {
  const { actions } = useGame();
  const { modalOpen, reducedMotion, openProjectModal } = useUI();
  const { xp, level } = useXP();
  const { persona } = usePersona();

  // Terminal I/O State
  const [history, setHistory] = useState([
    {
      id: 'welcome',
      type: 'kernel',
      lines: [
        { type: 'success', text: 'PORTFOLIO_OS v2.4 (x86_64-portfolio-darwin)' },
        {
          type: 'muted',
          text: 'Interactive developer shell initialized. Welcome, guest! Type "help" or tap quick chips below.'
        }
      ]
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [matrixActive, setMatrixActive] = useState(false);

  // DOM Refs
  const drawerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-focus input on open
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Modal rule: close terminal when a project modal opens
  useEffect(() => {
    if (modalOpen) {
      onClose();
    }
  }, [modalOpen, onClose]);

  // Auto-scroll to bottom of terminal output
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  // Matrix Rain Canvas Animation (4 seconds)
  useEffect(() => {
    if (!matrixActive || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    let animationFrameId;

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#39FF14';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const stopTimer = setTimeout(() => {
      setMatrixActive(false);
    }, 4000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(stopTimer);
    };
  }, [matrixActive, reducedMotion]);

  // Theme application helper
  const applyTheme = (themeName) => {
    try {
      localStorage.setItem('netflix-portfolio-theme', themeName);
      document.body.setAttribute('data-theme', themeName);
      document.documentElement.setAttribute('data-theme', themeName);

      const root = document.documentElement;
      if (themeName === 'neon') {
        root.style.setProperty('--color-terminal', '#00F0FF');
        root.style.setProperty('--color-primary', '#FF007F');
        root.style.setProperty('--color-cyan', '#39FF14');
      } else if (themeName === 'pastel') {
        root.style.setProperty('--color-terminal', '#77DD77');
        root.style.setProperty('--color-primary', '#FF8E9E');
        root.style.setProperty('--color-cyan', '#A7C7E7');
      } else {
        // Dark / Default
        root.style.removeProperty('--color-terminal');
        root.style.removeProperty('--color-primary');
        root.style.removeProperty('--color-cyan');
      }
    } catch (err) {
      console.warn('Failed to apply theme:', err);
    }
  };

  // Execute a command string
  const handleExecute = useCallback((cmdString) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    // Add to session command history for Up/Down recall
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const result = parseCommand(trimmed, {
      level,
      xp,
      persona: persona?.label || persona?.name || 'Curious Visitor',
      achievements: actions.getUnlockedAchievements?.() || []
    });

    const entryId = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (result.success) {
      // Award discrete XP once per valid unique command name (+10 XP)
      if (actions.awardAction && result.commandName) {
        const normalized = result.commandName.toLowerCase();
        if (normalized !== 'secret' && normalized !== 'konami') {
          actions.awardAction(`command:${normalized}`, 10, `Terminal Command: ${normalized}`);
        }
      }

      // Handle side-effects
      (result.sideEffects || []).forEach((effect) => {
        if (effect.type === 'CLEAR_OUTPUT') {
          setHistory([]);
        } else if (effect.type === 'OPEN_PROJECT_MODAL') {
          onClose();
          if (openProjectModal) {
            openProjectModal(effect.project);
          }
        } else if (effect.type === 'CLOSE_TERMINAL') {
          onClose();
        } else if (effect.type === 'SCROLL_TO') {
          onClose();
          setTimeout(() => {
            const el = document.getElementById(effect.targetId);
            if (el) {
              el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
            }
          }, 150);
        } else if (effect.type === 'OPEN_EXTERNAL_LINK') {
          if (actions.awardAction && effect.actionId) {
            actions.awardAction(effect.actionId, 15);
          }
          window.open(effect.url, '_blank', 'noopener,noreferrer');
        } else if (effect.type === 'SET_THEME') {
          applyTheme(effect.theme);
        } else if (effect.type === 'TRIGGER_MATRIX_RAIN') {
          setMatrixActive(true);
        } else if (effect.type === 'AWARD_SECRET') {
          if (actions.awardAction) {
            actions.awardAction('secret_or_konami', 100, 'Secret Protocol Unlocked');
          }
        }
      });

      if (!result.sideEffects?.some((e) => e.type === 'CLEAR_OUTPUT')) {
        setHistory((prev) => [
          ...prev,
          {
            id: entryId,
            input: trimmed,
            lines: result.output
          }
        ]);
      }
    } else {
      // Unknown command: calculate closest Levenshtein match (distance <= 2)
      const suggestion = getClosestCommand(trimmed, VALID_COMMAND_NAMES, 2);
      const errorLines = [
        { type: 'error', text: `command not found: "${trimmed}"` }
      ];

      if (suggestion) {
        errorLines.push({
          type: 'warning',
          text: `Did you mean: "${suggestion}"?`
        });
      } else {
        errorLines.push({
          type: 'muted',
          text: 'Type "help" to view the full command matrix.'
        });
      }

      setHistory((prev) => [
        ...prev,
        {
          id: entryId,
          input: trimmed,
          lines: errorLines
        }
      ]);
    }

    setInputVal('');
  }, [actions, level, xp, persona, onClose, openProjectModal, reducedMotion]);

  // Focus trap inside drawer
  const handleDrawerKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Keyboard navigation & Shortcuts (Up, Down, Tab, Ctrl+L, Esc)
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.trim().toLowerCase();
      if (!current) return;
      const match = VALID_COMMAND_NAMES.find((c) => c.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setHistory([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleExecute(inputVal);
  };

  return (
    <section
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Terminal"
      onKeyDown={handleDrawerKeyDown}
      className={`terminal-drawer ${reducedMotion ? 'terminal-drawer--reduced-motion' : ''}`}
    >
      {/* Top Hairline Glowing Accent Bar */}
      <div className="terminal-drawer__top-hairline" aria-hidden="true" />

      {/* Chrome Header Bar */}
      <header className="terminal-drawer__chrome">
        <div className="terminal-drawer__chrome-left">
          {/* Retro Window Control Dots */}
          <div className="terminal-drawer__dots" aria-hidden="true">
            <span className="terminal-drawer__dot terminal-drawer__dot--red" onClick={onClose} title="Close terminal" />
            <span className="terminal-drawer__dot terminal-drawer__dot--yellow" />
            <span className="terminal-drawer__dot terminal-drawer__dot--green" />
          </div>

          <div className="terminal-drawer__title font-mono">
            <span className="terminal-drawer__title-cmd text-terminal">guest@vaibhava-portfolio:~</span>
            <span className="terminal-drawer__shell-meta text-muted hidden sm:inline">
              (bash · 80x24 · UTF-8)
            </span>
          </div>
        </div>

        <div className="terminal-drawer__chrome-right font-mono">
          <div className="terminal-drawer__sys-status hidden sm:flex">
            <span className="terminal-drawer__status-dot" />
            <span>SYS: ONLINE</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="terminal-drawer__close-btn"
            aria-label="Close terminal"
            title="Press ESC to close"
          >
            <span>Close [ESC]</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Quick Ops Chips Toolbar */}
      <div className="terminal-drawer__chips-bar font-mono" role="toolbar" aria-label="Terminal quick actions">
        <span className="terminal-drawer__chips-label text-muted">
          ⚡ QUICK OPS:
        </span>
        <button type="button" onClick={() => handleExecute('help')} className="terminal-chip">
          <span className="text-terminal">$</span>&nbsp;help
        </button>
        <button type="button" onClick={() => handleExecute('whoami')} className="terminal-chip">
          <span className="text-terminal">$</span>&nbsp;whoami
        </button>
        <button type="button" onClick={() => handleExecute('projects')} className="terminal-chip">
          <span className="text-terminal">$</span>&nbsp;projects
        </button>
        <button type="button" onClick={() => handleExecute('skills')} className="terminal-chip">
          <span className="text-terminal">$</span>&nbsp;skills
        </button>
        <button type="button" onClick={() => handleExecute('skills --level')} className="terminal-chip">
          <span className="text-terminal">$</span>&nbsp;skills --level
        </button>
        <button type="button" onClick={() => handleExecute('contact')} className="terminal-chip">
          <span className="text-terminal">$</span>&nbsp;contact
        </button>
        <button type="button" onClick={() => handleExecute('clear')} className="terminal-chip terminal-chip--clear">
          <span className="text-primary">$</span>&nbsp;clear
        </button>
      </div>

      {/* Terminal CRT Output Viewport */}
      <div
        ref={scrollAreaRef}
        className="terminal-drawer__viewport font-mono"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {/* Matrix Rain Canvas Overlay */}
        {matrixActive && !reducedMotion && (
          <canvas
            ref={canvasRef}
            className="terminal-matrix-canvas"
            aria-hidden="true"
          />
        )}

        {/* Stream History */}
        <div className="terminal-drawer__stream">
          {history.map((entry) => (
            <div key={entry.id} className="terminal-entry">
              {entry.input && (
                <div className="terminal-entry__prompt">
                  <span className="text-terminal font-bold">guest@portfolio:~$</span>
                  <span className="text-white ml-2">{entry.input}</span>
                </div>
              )}

              <div className="terminal-entry__lines">
                {(entry.lines || []).map((line, lineIdx) => {
                  let colorClass = 'text-gray';
                  if (line.type === 'error') colorClass = 'text-primary';
                  else if (line.type === 'success') colorClass = 'text-terminal font-semibold';
                  else if (line.type === 'info') colorClass = 'text-cyan';
                  else if (line.type === 'warning') colorClass = 'text-yellow';
                  else if (line.type === 'muted') colorClass = 'text-muted';

                  return (
                    <div key={lineIdx} className={`terminal-line ${colorClass}`}>
                      {line.text}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Active Command Input Form */}
        <form onSubmit={handleSubmit} className="terminal-drawer__input-form">
          <label htmlFor="terminal-cli-input" className="terminal-drawer__input-label text-terminal font-bold">
            guest@portfolio:~$
          </label>
          <div className="terminal-drawer__input-wrapper">
            <input
              ref={inputRef}
              id="terminal-cli-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleInputKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Type command here (e.g. help, whoami, projects)..."
              className="terminal-drawer__input font-mono"
            />
            {/* Pulsing Solid Block Cursor */}
            <span className="terminal-drawer__cursor" aria-hidden="true" />
          </div>
        </form>
      </div>
    </section>
  );
}
