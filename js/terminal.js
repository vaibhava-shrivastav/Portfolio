/**
 * ==========================================================================
 * Netflix-Inspired Developer Portfolio — Terminal Overlay
 * ==========================================================================
 * Interactive CLI with RPG mechanics, easter eggs, and command system.
 * ==========================================================================
 */

const Terminal = (() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // COMMAND REGISTRY
  // ---------------------------------------------------------------------------
  const commands = new Map();
  const aliases = new Map();
  let history = [];
  let historyIndex = -1;
  let isOpen = false;
  let konamiBuffer = '';
  const KONAMI_CODE = 'arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftrightbaba';

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------
  const output = (html, className = '') => {
    const el = document.createElement('div');
    el.className = `terminal__line ${className}`;
    el.innerHTML = html;
    outputEl.appendChild(el);
    outputEl.scrollTop = outputEl.scrollHeight;
    return el;
  };

  const outputText = (text, className = '') => {
    return output(`<span class="terminal__text">${escapeHtml(text)}</span>`, className);
  };

  const outputError = (text) => outputText(text, 'terminal__error');
  const outputSuccess = (text) => outputText(text, 'terminal__success');
  const outputWarning = (text) => outputText(text, 'terminal__warning');
  const outputInfo = (text) => outputText(text, 'terminal__info');

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const typeWriter = (element, text, speed = 30) => {
    return new Promise(resolve => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text[i++];
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  };

  const clearOutput = () => {
    outputEl.innerHTML = '';
  };

  // ---------------------------------------------------------------------------
  // COMMAND DEFINITIONS
  // ---------------------------------------------------------------------------
  const register = (name, handler, options = {}) => {
    const cmd = { name, handler, ...options };
    commands.set(name.toLowerCase(), cmd);
    if (options.aliases) {
      options.aliases.forEach(a => aliases.set(a.toLowerCase(), name.toLowerCase()));
    }
    return cmd;
  };

  const resolveCommand = (input) => {
    const parts = input.trim().split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check aliases
    const resolved = aliases.get(name) || name;
    const cmd = commands.get(resolved);

    return { cmd, args, raw: input };
  };

  // ---------------------------------------------------------------------------
  // BUILT-IN COMMANDS
  // ---------------------------------------------------------------------------

  // Help
  register('help', {
    description: 'Show available commands',
    usage: 'help [command]',
    handler: (args) => {
      if (args[0]) {
        const cmd = commands.get(args[0].toLowerCase()) || commands.get(aliases.get(args[0].toLowerCase()));
        if (cmd) {
          outputText(`${cmd.name} - ${cmd.description}`);
          outputText(`Usage: ${cmd.usage || cmd.name}`);
          if (cmd.examples) {
            outputText('Examples:');
            cmd.examples.forEach(ex => outputText(`  ${ex}`, 'terminal__dim'));
          }
        } else {
          outputError(`Unknown command: ${args[0]}. Type 'help' for list.`);
        }
      } else {
        outputText('Available commands:', 'terminal__header');
        outputText('');
        const categories = {};
        commands.forEach(cmd => {
          if (cmd.hidden) return;
          const cat = cmd.category || 'general';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd);
        });

        Object.entries(categories).forEach(([cat, cmds]) => {
          outputText(`${cat.toUpperCase()}:`, 'terminal__category');
          cmds.forEach(cmd => {
            outputText(`  ${cmd.name.padEnd(16)} ${cmd.description}`, 'terminal__cmd');
          });
          outputText('');
        });
        outputText('Type "help <command>" for details.', 'terminal__dim');
      }
    }
  }, { category: 'general', aliases: ['?', 'h'] });

  // Clear
  register('clear', {
    description: 'Clear terminal output',
    usage: 'clear',
    handler: () => clearOutput()
  }, { category: 'general', aliases: ['cls', 'reset'] });

  // Whoami
  register('whoami', {
    description: 'Display current user profile',
    usage: 'whoami',
    handler: () => {
      const profile = window.DATA?.profile;
      if (profile) {
        outputText(`User: ${profile.name}`);
        outputText(`Role: ${profile.headline}`);
        outputText(`Location: ${profile.location}`);
        outputText(`Level: ${profile.stats.level} (${profile.stats.xp}/${profile.stats.xpToNext} XP)`);
        outputText(`Class: ${profile.stats.class}`);
        outputText(`Specialization: ${profile.stats.specialization}`);
      } else {
        outputText('vaibhava@portfolio');
      }
    }
  }, { category: 'profile', aliases: ['me', 'profile'] });

  // Stats
  register('stats', {
    description: 'Show RPG stats',
    usage: 'stats',
    handler: () => {
      const stats = window.DATA?.profile?.stats;
      if (stats) {
        outputText('╔══════════════════════════════╗', 'terminal__border');
        outputText('║          STATS               ║', 'terminal__border');
        outputText('╠══════════════════════════════╣', 'terminal__border');
        Object.entries(stats).forEach(([key, value]) => {
          if (key !== 'title' && key !== 'class' && key !== 'specialization' && key !== 'alignment') {
            const bar = '█'.repeat(Math.min(Math.floor(value / 10), 10)) + '░'.repeat(10 - Math.min(Math.floor(value / 10), 10));
            outputText(`║ ${key.padEnd(14)} ${bar} ${value.toString().padStart(3)} ║`, 'terminal__stat');
          }
        });
        outputText('╚══════════════════════════════╝', 'terminal__border');
      }
    }
  }, { category: 'profile', aliases: ['stat', 'attributes'] });

  // Skills
  register('skills', {
    description: 'List technical skills',
    usage: 'skills [category]',
    handler: (args) => {
      const skills = window.DATA?.skills?.categories;
      if (!skills) return outputError('Skills data not loaded');

      if (args[0]) {
        const cat = skills.find(s => s.name.toLowerCase() === args[0].toLowerCase());
        if (cat) {
          outputText(`${cat.icon} ${cat.name} Skills:`, 'terminal__header');
          cat.items.forEach(s => {
            const bar = '█'.repeat(Math.floor(s.level / 10)) + '░'.repeat(10 - Math.floor(s.level / 10));
            outputText(`  ${s.name.padEnd(25)} ${bar} ${s.level}%`);
          });
        } else {
          outputError(`Category not found. Available: ${skills.map(s => s.name).join(', ')}`);
        }
      } else {
        outputText('Skill Categories:', 'terminal__header');
        skills.forEach(cat => {
          outputText(`  ${cat.icon}  ${cat.name} (${cat.items.length} skills)`);
        });
        outputText('\nUse "skills <category>" for details.', 'terminal__dim');
      }
    }
  }, { category: 'profile', aliases: ['skill', 'tech'] });

  // Projects
  register('projects', {
    description: 'List portfolio projects',
    usage: 'projects [slug]',
    handler: (args) => {
      const projects = window.DATA?.projects || [];

      if (args[0]) {
        const proj = projects.find(p => p.slug === args[0].toLowerCase());
        if (proj) {
          outputText(`╔══════════════════════════════════╗`, 'terminal__border');
          outputText(`║ ${proj.title.padEnd(30)} ║`, 'terminal__border');
          outputText(`╠══════════════════════════════════╣`, 'terminal__border');
          outputText(`║ ${proj.tagline.padEnd(30)} ║`, 'terminal__border');
          outputText(`╠══════════════════════════════════╣`, 'terminal__border');
          outputText(`║ Status: ${proj.status.padEnd(21)} ║`, 'terminal__border');
          outputText(`║ Period: ${proj.period.padEnd(21)} ║`, 'terminal__border');
          outputText(`║ Role:   ${proj.role.padEnd(21)} ║`, 'terminal__border');
          outputText(`╚══════════════════════════════════╝`, 'terminal__border');
          outputText('');
          outputText(proj.description);
          outputText('');
          outputText('Tech Stack:', 'terminal__category');
          proj.tech.forEach(t => outputText(`  • ${t}`));
          if (proj.demoUrl) outputText(`\nDemo: ${proj.demoUrl}`, 'terminal__link');
          if (proj.repoUrl) outputText(`Repo: ${proj.repoUrl}`, 'terminal__link');
        } else {
          outputError(`Project not found: ${args[0]}`);
        }
      } else {
        outputText('Projects:', 'terminal__header');
        projects.forEach(p => {
          const star = p.featured ? ' ★' : '';
          outputText(`  ${p.slug.padEnd(20)} ${p.title}${star}`);
        });
        outputText('\nUse "projects <slug>" for details.', 'terminal__dim');
      }
    }
  }, { category: 'portfolio', aliases: ['proj', 'work'] });

  // Experience
  register('experience', {
    description: 'Show work experience',
    usage: 'experience [id]',
    handler: (args) => {
      const exp = window.DATA?.experience || [];

      if (args[0]) {
        const item = exp.find(e => e.id === args[0].toLowerCase());
        if (item) {
          outputText(`${item.company} — ${item.role}`, 'terminal__header');
          outputText(`${item.period} | ${item.location} | ${item.type}`);
          outputText('');
          outputText(item.description);
          outputText('');
          outputText('Highlights:', 'terminal__category');
          item.highlights.forEach(h => outputText(`  • ${h}`));
          outputText('');
          outputText('Tech:', 'terminal__category');
          outputText(`  ${item.tech.join(', ')}`);
        } else {
          outputError(`Experience not found: ${args[0]}`);
        }
      } else {
        outputText('Experience:', 'terminal__header');
        exp.forEach(e => {
          outputText(`  ${e.id.padEnd(12)} ${e.company} — ${e.role} (${e.period})`);
        });
      }
    }
  }, { category: 'portfolio', aliases: ['exp', 'work', 'jobs'] });

  // Education
  register('education', {
    description: 'Show education history',
    usage: 'education',
    handler: () => {
      const edu = window.DATA?.education || [];
      outputText('Education:', 'terminal__header');
      edu.forEach(e => {
        outputText(`  ${e.institution}`);
        outputText(`    ${e.degree} in ${e.field}`);
        outputText(`    ${e.period} | ${e.location}`);
        if (e.gpa) outputText(`    GPA: ${e.gpa}`);
      });
    }
  }, { category: 'profile', aliases: ['edu', 'school'] });

  // Contact
  register('contact', {
    description: 'Show contact information',
    usage: 'contact',
    handler: () => {
      const c = window.DATA?.contact || {};
      outputText('Contact Information:', 'terminal__header');
      outputText(`  Email:    ${c.email}`);
      outputText(`  GitHub:   ${c.github}`);
      outputText(`  LinkedIn: ${c.linkedin}`);
      if (c.twitter) outputText(`  Twitter:  ${c.twitter}`);
      outputText(`  Location: ${c.location} (${c.timezone})`);
      outputText(`  Status:   ${c.availability}`);
    }
  }, { category: 'profile', aliases: ['contacts', 'reach'] });

  // Achievements
  register('achievements', {
    description: 'List unlocked achievements',
    usage: 'achievements [--all]',
    handler: (args) => {
      const all = window.DATA?.achievements || [];
      const unlocked = window.XP?.getUnlockedAchievements() || [];
      const unlockedKeys = new Set(unlocked.map(a => a.key));

      if (args.includes('--all') || args.includes('-a')) {
        outputText('All Achievements:', 'terminal__header');
        all.forEach(a => {
          const isUnlocked = unlockedKeys.has(a.key);
          const prefix = isUnlocked ? '✓' : '○';
          const rarity = a.rarity ? `[${a.rarity.toUpperCase()}]` : '';
          outputText(`  ${prefix} ${a.icon} ${a.title.padEnd(25)} ${rarity} ${isUnlocked ? 'UNLOCKED' : 'LOCKED'}`);
        });
      } else {
        outputText('Unlocked Achievements:', 'terminal__header');
        if (unlocked.length === 0) {
          outputText('  No achievements yet. Keep exploring!');
        } else {
          unlocked.forEach(a => {
            outputText(`  ✓ ${a.icon} ${a.title} (${a.rarity}) — +${a.xpReward} XP`);
          });
        }
        outputText(`\nUse "achievements --all" to see all ${all.length} achievements.`, 'terminal__dim');
      }
    }
  }, { category: 'profile', aliases: ['ach', 'badges', 'trophies'] });

  // Certifications
  register('certs', {
    description: 'Show certifications',
    usage: 'certs',
    handler: () => {
      const certs = window.DATA?.certifications || [];
      outputText('Certifications:', 'terminal__header');
      certs.forEach(c => {
        outputText(`  ${c.name}`);
        outputText(`    Issuer: ${c.issuer} | Date: ${c.date}${c.expiry ? ` | Expires: ${c.expiry}` : ''}`);
        if (c.url) outputText(`    Verify: ${c.url}`);
      });
    }
  }, { category: 'profile', aliases: ['cert', 'certifications'] });

  // XP / Level
  register('xp', {
    description: 'Show XP and level info',
    usage: 'xp',
    handler: () => {
      const state = window.XP?.getState();
      if (state) {
        outputText(`Level: ${state.level} — ${state.title}`, 'terminal__header');
        outputText(`XP: ${state.xp.toLocaleString()} / ${state.xpToNext === Infinity ? 'MAX' : state.xpToNext.toLocaleString()}`);
        outputText(`Total Earned: ${state.totalXPEarned.toLocaleString()}`);
        const barLength = 30;
        const filled = Math.floor(barLength * state.progress);
        const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
        outputText(`Progress: [${bar}] ${(state.progress * 100).toFixed(1)}%`);
      }
    }
  }, { category: 'profile', aliases: ['level', 'rank'] });

  // Date/Time
  register('date', {
    description: 'Show current date and time',
    usage: 'date',
    handler: () => {
      outputText(new Date().toString());
    }
  }, { category: 'general', aliases: ['time', 'now'] });

  // Echo
  register('echo', {
    description: 'Print arguments',
    usage: 'echo <text>',
    handler: (args) => {
      outputText(args.join(' '));
    }
  }, { category: 'general' });

  // Fortune / Quote
  register('fortune', {
    description: 'Get a random developer fortune',
    usage: 'fortune',
    handler: () => {
      const fortunes = window.DATA?.easterEggs?.commands?.fortune?.responses || [
        "Your code will compile on the first try. Eventually.",
        "The best debugging tool is a good night's sleep.",
        "Deploy on Friday? Bold move.",
        "It works on my machine is a valid deployment strategy.",
        "Semicolons are optional. Sanity is not.",
        "Rubber duck debugging: 99% effective, 100% ridiculous.",
        "There are 10 types of people: those who understand binary and those who don't."
      ];
      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      outputText(`"${fortune}"`, 'terminal__fortune');
      window.XP?.addXP(window.DATA?.easterEggs?.commands?.fortune?.xp || 10, 'fortune');
    }
  }, { category: 'fun', aliases: ['quote', 'wisdom'] });

  // Matrix mode
  register('matrix', {
    description: 'Enter the matrix',
    usage: 'matrix',
    handler: () => {
      outputText('Wake up, Neo...', 'terminal__matrix');
      outputText('The Matrix has you...', 'terminal__matrix');
      outputText('Follow the white rabbit.', 'terminal__matrix');
      outputText('Knock, knock, Neo.', 'terminal__matrix');
      document.body.classList.add('matrix-mode');
      setTimeout(() => document.body.classList.remove('matrix-mode'), 10000);
      window.XP?.addXP(window.DATA?.easterEggs?.commands?.matrix?.xp || 50, 'matrix');
    }
  }, { category: 'fun', aliases: ['redpill'] });

  // Coffee
  register('coffee', {
    description: 'Coffee break',
    usage: 'coffee',
    handler: () => {
      const messages = [
        '☕ *sips coffee* Ready to deploy!',
        '☕ Coffee loaded. Productivity +50%.',
        '☕ "Code, coffee, repeat."',
        '☕ Fresh brew detected. Bugs fleeing...'
      ];
      outputText(messages[Math.floor(Math.random() * messages.length)], 'terminal__coffee');
      window.XP?.addXP(window.DATA?.easterEggs?.commands?.coffee?.xp || 5, 'coffee');
    }
  }, { category: 'fun', aliases: ['cafe', 'brew'] });

  // Sudo
  register('sudo', {
    description: 'Try to run as root',
    usage: 'sudo <command>',
    handler: (args) => {
      const responses = window.DATA?.easterEggs?.commands?.sudo?.response || "Nice try. This isn't Linux. 😄";
      outputWarning(responses);
      window.XP?.addXP(window.DATA?.easterEggs?.commands?.sudo?.xp || 10, 'sudo');
    }
  }, { category: 'fun' });

  // LS / Dir
  register('ls', {
    description: 'List directory contents',
    usage: 'ls [path]',
    handler: (args) => {
      const dirs = ['projects/', 'skills/', 'experience/', 'education/', 'contact/', 'achievements/'];
      const files = ['README.md', 'resume.pdf', 'package.json', '.gitignore'];
      outputText('Directory: /home/vaibhava/portfolio');
      dirs.forEach(d => outputText(`  📁 ${d}`, 'terminal__dir'));
      files.forEach(f => outputText(`  📄 ${f}`, 'terminal__file'));
    }
  }, { category: 'general', aliases: ['dir', 'list'] });

  // CD
  register('cd', {
    description: 'Change directory',
    usage: 'cd <path>',
    handler: (args) => {
      if (!args[0]) {
        outputText('/home/vaibhava/portfolio');
      } else {
        outputText(`cd: ${args[0]}: No such directory (this is a simulation)`);
      }
    }
  }, { category: 'general' });

  // PWD
  register('pwd', {
    description: 'Print working directory',
    usage: 'pwd',
    handler: () => outputText('/home/vaibhava/portfolio')
  }, { category: 'general' });

  // Theme
  register('theme', {
    description: 'Toggle theme (placeholder)',
    usage: 'theme [dark|light|auto]',
    handler: (args) => {
      outputInfo('Theme switching not implemented in this demo.');
    }
  }, { category: 'general' });

  // History
  register('history', {
    description: 'Show command history',
    usage: 'history [-c]',
    handler: (args) => {
      if (args.includes('-c') || args.includes('--clear')) {
        history = [];
        historyIndex = -1;
        outputSuccess('History cleared.');
      } else {
        history.forEach((cmd, i) => outputText(`  ${(i + 1).toString().padStart(4)}  ${cmd}`));
      }
    }
  }, { category: 'general', aliases: ['hist'] });

  // Exit
  register('exit', {
    description: 'Close terminal',
    usage: 'exit',
    handler: () => {
      close();
    }
  }, { category: 'general', aliases: ['quit', 'q', 'bye'] });

  // Secret: Konami
  const checkKonami = (key) => {
    konamiBuffer += key.toLowerCase().replace('arrow', '');
    if (konamiBuffer.length > KONAMI_CODE.length) {
      konamiBuffer = konamiBuffer.slice(-KONAMI_CODE.length);
    }
    if (konamiBuffer === KONAMI_CODE) {
      konamiBuffer = '';
      triggerKonami();
    }
  };

  const triggerKonami = () => {
    outputText('', 'terminal__konami');
    outputText('╔══════════════════════════════════════╗', 'terminal__konami');
    outputText('║      🎮 KONAMI CODE ACTIVATED!       ║', 'terminal__konami');
    outputText('║                                      ║', 'terminal__konami');
    outputText('║   Terminal Master achievement        ║', 'terminal__konami');
    outputText('║   unlocked! +1000 XP                 ║', 'terminal__konami');
    outputText('╚══════════════════════════════════════╝', 'terminal__konami');
    window.XP?.addXP(1000, 'konami');
    window.XP?.unlockAchievement('terminal_master');
    document.body.classList.add('konami-active');
    setTimeout(() => document.body.classList.remove('konami-active'), 5000);
  };

  // ---------------------------------------------------------------------------
  // DOM ELEMENTS
  // ---------------------------------------------------------------------------
  let terminalEl, outputEl, inputEl, backdropEl, closeBtn;

  const cacheElements = () => {
    terminalEl = document.getElementById('terminal');
    outputEl = document.getElementById('terminal-output');
    inputEl = document.getElementById('terminal-input');
    backdropEl = terminalEl?.querySelector('.terminal__backdrop');
    closeBtn = terminalEl?.querySelector('.terminal__close-btn');
  };

  // ---------------------------------------------------------------------------
  // OPEN / CLOSE
  // ---------------------------------------------------------------------------
  const open = () => {
    if (isOpen) return;
    cacheElements();
    if (!terminalEl) return;

    isOpen = true;
    terminalEl.showModal();
    document.body.style.overflow = 'hidden';
    inputEl.focus();

    // Welcome message
    if (outputEl.children.length === 0) {
      showWelcome();
    }

    window.XP?.addXP(25, 'terminal_open');
    window.dispatchEvent(new CustomEvent('terminal:open'));
  };

  const close = () => {
    if (!isOpen) return;
    cacheElements();
    if (!terminalEl) return;

    isOpen = false;
    terminalEl.close();
    document.body.style.overflow = '';
    window.XP?.addXP(5, 'terminal_close');
    window.dispatchEvent(new CustomEvent('terminal:close'));
  };

  const toggle = () => isOpen ? close() : open();

  const showWelcome = () => {
    clearOutput();
    const profile = window.DATA?.profile;
    outputText('╔══════════════════════════════════════╗', 'terminal__border');
    outputText('║     VAIBHAVA PORTFOLIO TERMINAL      ║', 'terminal__border');
    outputText('║           v1.0.0 - BETA              ║', 'terminal__border');
    outputText('╚══════════════════════════════════════╝', 'terminal__border');
    outputText('');
    outputText(`Welcome back, ${profile?.name?.split(' ')[0] || 'Developer'}!`);
    outputText(`Level ${profile?.stats?.level || 1} ${profile?.stats?.class || 'Developer'} | ${profile?.stats?.xp || 0} XP`);
    outputText('');
    outputText('Type "help" for commands, "exit" to close.', 'terminal__dim');
    outputText('');
  };

  // ---------------------------------------------------------------------------
  // COMMAND EXECUTION
  // ---------------------------------------------------------------------------
  const execute = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add to history
    history.push(trimmed);
    historyIndex = history.length;

    // Show command in output
    outputText(`vaibhava@portfolio:~$ ${trimmed}`, 'terminal__command-echo');

    // Resolve and execute
    const { cmd, args } = resolveCommand(trimmed);

    if (cmd) {
      try {
        cmd.handler(args);
      } catch (e) {
        outputError(`Error: ${e.message}`);
        console.error('[Terminal] Command error:', e);
      }
    } else {
      outputError(`Command not found: ${trimmed.split(' ')[0]}. Type "help" for list.`);
    }

    // Award XP for command
    window.XP?.addXP(5, 'terminal_command');
  };

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------
  const handleKeydown = (e) => {
    // Konami code detection
    if (e.key) {
      checkKonami(e.key);
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        execute(inputEl.value);
        inputEl.value = '';
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          inputEl.value = history[historyIndex] || '';
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          inputEl.value = history[historyIndex] || '';
        } else {
          historyIndex = history.length;
          inputEl.value = '';
        }
        break;
      case 'Tab':
        e.preventDefault();
        // Tab completion
        const parts = inputEl.value.trim().split(/\s+/);
        const partial = parts[parts.length - 1].toLowerCase();
        const matches = [...commands.keys()].filter(c => c.startsWith(partial));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          inputEl.value = parts.join(' ') + ' ';
        } else if (matches.length > 1) {
          outputText(matches.join('  '), 'terminal__completion');
        }
        break;
      case 'Escape':
        close();
        break;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropEl) close();
  };

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------
  const init = () => {
    cacheElements();
    if (!terminalEl) return;

    // Event listeners
    inputEl.addEventListener('keydown', handleKeydown);
    backdropEl.addEventListener('click', handleBackdropClick);
    closeBtn.addEventListener('click', close);

    // Global keyboard shortcut: Cmd/Ctrl + K
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    });

    // Trigger open buttons
    document.querySelectorAll('[data-terminal-trigger]').forEach(btn => {
      btn.addEventListener('click', open);
    });

    // Listen for XP events to update prompt
    window.XP?.on('xpChange', () => {
      const prompt = terminalEl?.querySelector('.terminal__prompt');
      if (prompt && window.DATA?.profile) {
        prompt.textContent = `vaibhava@portfolio:~$`;
      }
    });
  };

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  const api = {
    init,
    open,
    close,
    toggle,
    execute,
    register,
    commands,
    isOpen: () => isOpen,
    clearOutput,
    output,
    outputText,
    outputError,
    outputSuccess,
    outputWarning,
    outputInfo
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.Terminal = api;
  }

  return api;
})();

export default Terminal;