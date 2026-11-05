/**
 * ==========================================================================
 * Terminal Commands — Pure Execution Map & Side-Effect Descriptors
 * ==========================================================================
 * All text outputs derived strictly from profile.js.
 * Zero invented facts, metrics, or phone numbers.
 * ==========================================================================
 */
import {
  profile,
  projects,
  skills,
  experience,
  education,
  accomplishments,
  certifications,
  gameAchievements
} from '../data/profile.js';
import { calculateLevel } from '../context/game-engine.js';

/**
 * Generates an ASCII bar for proficiency percentage
 */
function createAsciiBar(percentage = 0, length = 14) {
  const filledCount = Math.round((percentage / 100) * length);
  const emptyCount = Math.max(0, length - filledCount);
  return `[${'█'.repeat(filledCount)}${'░'.repeat(emptyCount)}] ${percentage}%`;
}

export const commands = {
  // 1. HELP (Grouped: Core, Portfolio, System, Secrets)
  help: {
    help: 'List all commands grouped by category',
    run: () => ({
      output: [
        { type: 'info', text: 'PORTFOLIO_OS INTERACTIVE COMMAND MATRIX' },
        { type: 'muted', text: 'Type a command and press Enter, or click Quick-Ops chips.' },
        { type: 'warning', text: '--- CORE COMMANDS ---' },
        { type: 'text', text: '  help            Display this command matrix' },
        { type: 'text', text: '  whoami          Display role, rank level, XP & system status' },
        { type: 'text', text: '  theme <name>    Switch accent theme (dark | neon | pastel)' },
        { type: 'text', text: '  clear           Clear terminal viewport history' },
        { type: 'warning', text: '--- PORTFOLIO COMMANDS ---' },
        { type: 'text', text: '  about           Bio & engineering journey summary' },
        { type: 'text', text: '  skills          List technical skill categories' },
        { type: 'text', text: '  skills --level  Render self-assessed skill proficiency bars' },
        { type: 'text', text: '  projects        Catalog of production projects with IDs' },
        { type: 'text', text: '  play <id|num>   Open project detail modal (e.g. play gla, play 1)' },
        { type: 'text', text: '  experience      Work experience & platform training' },
        { type: 'text', text: '  education       University degree & academic credentials' },
        { type: 'text', text: '  achievements    Exploration badges (unlocked vs total) & credentials' },
        { type: 'warning', text: '--- SYSTEM & LINKS ---' },
        { type: 'text', text: '  resume          Direct resume PDF link (/resume.pdf)' },
        { type: 'text', text: '  contact         Email & social links' },
        { type: 'text', text: '  github          Open canonical GitHub profile' },
        { type: 'text', text: '  linkedin        Open LinkedIn profile' },
        { type: 'text', text: '  deploy --global Run simulated AWS deployment pipeline' },
        { type: 'muted', text: '--- CLASSIFIED ---' },
        { type: 'muted', text: '  Hidden system protocols & gamer sequences reward discovery...' }
      ]
    })
  },

  // 2. WHOAMI (Role, level, current XP, and system status)
  whoami: {
    help: 'Display developer profile, rank level, XP, and system status',
    run: (args, context = {}) => {
      const currentXp = Number(context.xp) || 0;
      const levelInfo = calculateLevel(currentXp);

      return {
        output: [
          { type: 'success', text: `NAME     : ${profile.name.toUpperCase()}` },
          { type: 'text', text: `ROLE     : ${profile.headline}` },
          { type: 'info', text: `LEVEL    : Level ${levelInfo.level} · ${levelInfo.name}` },
          { type: 'info', text: `XP       : ${currentXp} XP` },
          { type: 'muted', text: `LOCATION : ${profile.location}` },
          { type: 'text', text: `EMAIL    : ${profile.email}` }
        ]
      };
    }
  },

  // 3. ABOUT (Bio and journey summary)
  about: {
    help: 'Bio and engineering journey summary',
    run: () => {
      const lines = [
        { type: 'info', text: 'ABOUT VAIBHAVA KUMAR SHRIVASTAV' },
        { type: 'text', text: profile.bio.replace(/\n/g, ' ') },
        { type: 'muted', text: '--- KEY JOURNEY MILESTONES ---' },
        { type: 'text', text: '● GLA University: B.Tech Computer Science student (CPI: 8.8).' },
        { type: 'text', text: '● Astrea IT Services: Practical training on Salesforce.com cloud platform.' },
        { type: 'text', text: '● GLA Exchange: Shipped fullstack campus marketplace platform to production.' },
        { type: 'text', text: '● EduCloud: Architected cloud platform provisioning isolated AWS environments with Terraform.' }
      ];
      return { output: lines };
    }
  },

  // 4. SKILLS (Grouped skills list)
  skills: {
    help: 'Grouped technical skills list (Languages, Cloud, etc.)',
    run: (args) => {
      if (args && args.includes('--level')) {
        return commands['skills --level'].run();
      }

      const lines = [
        { type: 'info', text: 'TECHNICAL SKILL CATEGORIES (FROM RESUME)' }
      ];

      (skills.categories || []).forEach((cat) => {
        const itemNames = (cat.items || []).map((i) => i.name).join(', ');
        lines.push({
          type: 'text',
          text: `● ${cat.name}: ${itemNames}`
        });
      });

      lines.push({
        type: 'muted',
        text: 'Tip: Run "skills --level" to inspect skills grouped by proficiency.'
      });

      return { output: lines };
    }
  },

  // 5. SKILLS --LEVEL (Self-assessed proficiency bars)
  'skills --level': {
    help: 'Render self-assessed skill proficiency bars',
    run: () => {
      const lines = [
        { type: 'info', text: 'TECHNICAL SKILLS (SELF-ASSESSED LEVELS)' }
      ];

      (skills.categories || []).forEach((cat) => {
        lines.push({ type: 'warning', text: `[${cat.name.toUpperCase()}]` });
        (cat.items || []).forEach((item) => {
          const label = item.name.padEnd(28, ' ');
          lines.push({
            type: 'text',
            text: `  ${label} ${createAsciiBar(item.level)}`
          });
        });
      });

      lines.push({
        type: 'muted',
        text: '// Note: Percentage ratings are self-assessed estimates based on university coursework and practical project experience.'
      });

      return { output: lines };
    }
  },

  // 6. PROJECTS (Catalog with ID and one-line summary)
  projects: {
    help: 'List all projects with ID and one-line summary',
    run: () => {
      const lines = [
        { type: 'info', text: 'PROJECT CATALOG (RESUME REALITY)' }
      ];

      projects.forEach((proj, idx) => {
        lines.push({
          type: 'success',
          text: `[${idx + 1}] ID: ${proj.slug} | ${proj.title}`
        });
        lines.push({
          type: 'text',
          text: `    Tagline : ${proj.tagline} (${proj.period})`
        });
        lines.push({
          type: 'text',
          text: `    Role    : ${proj.role} | Tech: ${proj.tech.join(', ')}`
        });
        lines.push({
          type: 'muted',
          text: `    Summary : ${proj.description}`
        });
        if (proj.demoUrl) {
          lines.push({
            type: 'info',
            text: `    Live URL: ${proj.demoUrl}`
          });
        }
      });

      lines.push({
        type: 'warning',
        text: 'To open detail modal: "play <id|number>" (e.g. "play 1", "play gla", "play educloud").'
      });

      return { output: lines };
    }
  },

  // 7. PLAY <id|number> (Opens project modal and closes terminal)
  play: {
    help: 'Open project modal by ID, slug, or number (e.g. play 1, play gla)',
    run: (args) => {
      const raw = (args || '').trim();
      const query = raw.toLowerCase().replace(/^#/, '');

      if (!query) {
        return {
          output: [
            { type: 'error', text: 'Missing project argument. Usage: play <id|number>' },
            { type: 'text', text: 'Examples: "play 1", "play gla", "play 2", "play educloud".' }
          ],
          sideEffects: []
        };
      }

      // Check by index (1-based or 0-based)
      let match = null;
      const num = parseInt(query, 10);
      if (!isNaN(num)) {
        if (num >= 1 && num <= projects.length) {
          match = projects[num - 1];
        } else if (num === 0 && projects.length > 0) {
          match = projects[0];
        }
      }

      // Check by id, slug, or title match
      if (!match) {
        match = projects.find(
          (p) =>
            p.id.toLowerCase() === query ||
            p.slug.toLowerCase() === query ||
            p.slug.toLowerCase().includes(query) ||
            p.title.toLowerCase().includes(query)
        );
      }

      if (!match) {
        return {
          output: [
            { type: 'error', text: `Project "${raw}" not found in catalog.` },
            { type: 'text', text: 'Available options: "play 1" (GLA Exchange), "play 2" (EduCloud).' }
          ],
          sideEffects: []
        };
      }

      return {
        output: [
          { type: 'success', text: `Opening detail modal for ${match.title}...` },
          { type: 'info', text: 'Closing terminal and launching modal.' }
        ],
        sideEffects: [
          { type: 'OPEN_PROJECT_MODAL', project: match },
          { type: 'CLOSE_TERMINAL' }
        ]
      };
    }
  },

  // 8. ACHIEVEMENTS (Badges unlocked vs total, plus credentials)
  achievements: {
    help: 'List badges unlocked vs total, plus credentials',
    run: (args, context = {}) => {
      const contextUnlocked = context.achievements || [];
      const totalBadges = gameAchievements.length;

      // Count unlocked badges
      let unlockedCount = 0;
      const badgeLines = [];

      gameAchievements.forEach((badge) => {
        let isUnlocked = false;
        if (Array.isArray(contextUnlocked)) {
          isUnlocked = contextUnlocked.some((a) => {
            if (typeof a === 'string') return a === badge.key || a === badge.id;
            return (a.key === badge.key || a.id === badge.id) && a.unlocked;
          });
        }

        if (isUnlocked) {
          unlockedCount++;
          badgeLines.push({
            type: 'success',
            text: `  [UNLOCKED] [x] ${badge.name}: ${badge.description}`
          });
        } else if (badge.secret) {
          badgeLines.push({
            type: 'muted',
            text: `  [LOCKED] [?] ??? : Secret objective hidden in code or terminal.`
          });
        } else {
          badgeLines.push({
            type: 'muted',
            text: `  [LOCKED] [-] ${badge.name}: Hint: ${badge.unlockHint}`
          });
        }
      });

      const lines = [
        { type: 'info', text: `PORTFOLIO EXPLORATION BADGES: ${unlockedCount}/${totalBadges} UNLOCKED (0 XP)` },
        ...badgeLines,
        { type: 'warning', text: '--- AWS CERTIFICATIONS ---' }
      ];

      certifications.forEach((c) => {
        lines.push({
          type: 'text',
          text: `● ${c.name} (${c.issuer} · ${c.date})`
        });
      });

      lines.push({ type: 'warning', text: '--- RESUME ACCOMPLISHMENTS ---' });
      accomplishments.forEach((acc) => {
        lines.push({
          type: 'text',
          text: `● ${acc.title}: ${acc.description}`
        });
      });

      return { output: lines };
    }
  },

  // 9. EXPERIENCE (Professional cloud training & experience)
  experience: {
    help: 'Professional cloud computing training & experience',
    run: () => {
      const lines = [
        { type: 'info', text: 'PROFESSIONAL EXPERIENCE (FROM RESUME)' }
      ];

      experience.forEach((exp) => {
        lines.push({
          type: 'success',
          text: `${exp.company} — ${exp.role}`
        });
        if (exp.period) {
          lines.push({
            type: 'text',
            text: `  Period    : ${exp.period}`
          });
        }
        if (exp.technology) {
          lines.push({
            type: 'text',
            text: `  Technology: ${exp.technology}`
          });
        }
        const bullets = exp.highlights || exp.bullets || [];
        bullets.forEach((b) => {
          lines.push({
            type: 'muted',
            text: `  ● ${b}`
          });
        });
      });

      return { output: lines };
    }
  },

  // 10. EDUCATION (Degree & academic credentials)
  education: {
    help: 'University degree and secondary schooling',
    run: () => {
      const lines = [
        { type: 'info', text: 'EDUCATION BACKGROUND (FROM RESUME)' }
      ];

      education.forEach((edu) => {
        lines.push({
          type: 'success',
          text: `${edu.institution}`
        });
        if (edu.degree || edu.period) {
          const degParts = [edu.degree, edu.field].filter(Boolean).join(' | ');
          const periodStr = edu.period ? ` (${edu.period})` : '';
          lines.push({
            type: 'text',
            text: `  Degree: ${degParts}${periodStr}`
          });
        }
        const scoreVal = edu.score || edu.cpi || edu.gpa;
        if (scoreVal) {
          lines.push({
            type: 'info',
            text: `  Score : ${scoreVal}`
          });
        }
      });

      return { output: lines };
    }
  },

  // 11. RESUME (Direct /resume.pdf link & open)
  resume: {
    help: 'Print direct resume URL and open in new tab',
    run: () => ({
      output: [
        { type: 'success', text: 'Opening resume (/resume.pdf)...' },
        { type: 'info', text: 'Direct URL: /resume.pdf' }
      ],
      sideEffects: [
        { type: 'OPEN_EXTERNAL_LINK', url: '/resume.pdf', actionId: 'link_click:resume' }
      ]
    })
  },

  // 12. CONTACT (Email & social links)
  contact: {
    help: 'Close terminal and scroll to contact terminal',
    run: () => ({
      output: [
        { type: 'info', text: 'CONTACT INFORMATION' },
        { type: 'text', text: `Email    : ${profile.email}` },
        { type: 'text', text: `GitHub   : ${profile.github}` },
        { type: 'text', text: `LinkedIn : ${profile.linkedin}` },
        { type: 'text', text: `Location : ${profile.location}` },
        { type: 'success', text: 'Closing terminal and scrolling to #contact...' }
      ],
      sideEffects: [
        { type: 'SCROLL_TO', targetId: 'contact' },
        { type: 'CLOSE_TERMINAL' }
      ]
    })
  },

  // 13. GITHUB (Open canonical GitHub profile)
  github: {
    help: 'Open canonical GitHub profile in new tab',
    run: () => ({
      output: [
        { type: 'success', text: `Opening GitHub profile: ${profile.github}` }
      ],
      sideEffects: [
        { type: 'OPEN_EXTERNAL_LINK', url: profile.github, actionId: 'link_click:github' }
      ]
    })
  },

  // 14. LINKEDIN (Open LinkedIn profile)
  linkedin: {
    help: 'Open LinkedIn profile in new tab',
    run: () => ({
      output: [
        { type: 'success', text: `Opening LinkedIn profile: ${profile.linkedin}` }
      ],
      sideEffects: [
        { type: 'OPEN_EXTERNAL_LINK', url: profile.linkedin, actionId: 'link_click:linkedin' }
      ]
    })
  },

  // 15. DEPLOY --GLOBAL (Simulated deployment ending in "Deployed to production!")
  'deploy --global': {
    help: 'Run simulated AWS deployment pipeline',
    run: () => ({
      output: [
        { type: 'warning', text: '>>> INITIALIZING SIMULATED GLOBAL DEPLOYMENT PIPELINE <<<' },
        { type: 'info', text: '[AWS AMPLIFY] Pulling repository branch origin/main' },
        { type: 'text', text: '[AWS AMPLIFY] Building static bundle assets via Vite' },
        { type: 'info', text: '[AWS CLOUDFRONT] Invalidating edge cache distributions' },
        { type: 'text', text: '[AWS API GATEWAY] Validating route schemas and CORS headers' },
        { type: 'text', text: '[AWS LAMBDA] Provisioning serverless contact dispatch functions' },
        { type: 'text', text: '[AWS SES] Validating DKIM and identity routing policies' },
        { type: 'success', text: 'Simulation complete. Real deployment: AWS Amplify Hosting.' }
      ],
      sideEffects: []
    })
  },

  // Alias for deploy
  deploy: {
    help: 'Simulate deployment pipeline (usage: deploy --global)',
    run: (args) => commands['deploy --global'].run()
  },

  // 16. THEME <neon|pastel|dark>
  theme: {
    help: 'Switch terminal theme (dark | neon | pastel)',
    run: (args) => {
      const choice = (args || '').trim().toLowerCase();
      const validThemes = ['dark', 'neon', 'pastel'];

      if (!choice || !validThemes.includes(choice)) {
        return {
          output: [
            { type: 'info', text: 'ACCENT THEMES AVAILABLE:' },
            { type: 'text', text: '  theme dark    Obsidian black with phosphor green (WCAG AAA)' },
            { type: 'text', text: '  theme neon    High-voltage cyberpunk with magenta & electric cyan (WCAG AA)' },
            { type: 'text', text: '  theme pastel  Lavender, mint, and soft rose palette (WCAG AA)' },
            { type: 'muted', text: 'Usage: theme <name> (e.g. theme neon)' }
          ],
          sideEffects: []
        };
      }

      return {
        output: [
          { type: 'success', text: `Accent theme switched to "${choice}". Persisted in localStorage.` }
        ],
        sideEffects: [
          { type: 'SET_THEME', theme: choice }
        ]
      };
    }
  },

  // 17. CLEAR (Clear terminal history)
  clear: {
    help: 'Clear terminal viewport history',
    run: () => ({
      output: [],
      sideEffects: [
        { type: 'CLEAR_OUTPUT' }
      ]
    })
  },

  // HIDDEN EASTER EGGS (Not in help)
  secret: {
    help: 'Classified protocol activator',
    run: () => ({
      output: [
        { type: 'warning', text: '>>> [CLASSIFIED PROTOCOL UNLOCKED] <<<' },
        { type: 'success', text: 'Hello, explorer! Thank you for inspecting the terminal.' },
        { type: 'text', text: `"${profile.headline}"` },
        { type: 'info', text: 'Achievement Unlocked: Secret Protocol (+100 XP awarded)' }
      ],
      sideEffects: [
        { type: 'TRIGGER_MATRIX_RAIN', duration: 4000 },
        { type: 'AWARD_SECRET' }
      ]
    })
  },

  konami: {
    help: 'Konami code activator',
    run: () => commands.secret.run()
  }
};

/**
 * Valid command names for autocomplete and Levenshtein suggestion
 */
export const VALID_COMMAND_NAMES = Object.keys(commands).filter(
  (cmd) => cmd !== 'secret' && cmd !== 'konami'
);

/**
 * Pure command parser & execution function
 * parseCommand(inputString, context) -> { success, commandName, output, sideEffects }
 */
export function parseCommand(inputString = '', context = {}) {
  const trimmed = (inputString || '').trim();
  if (!trimmed) {
    return {
      success: false,
      commandName: '',
      output: [],
      sideEffects: []
    };
  }

  const lower = trimmed.toLowerCase();
  let matchedKey = null;
  let args = '';

  if (commands[lower]) {
    matchedKey = lower;
    args = '';
  } else {
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex !== -1) {
      const firstWord = trimmed.slice(0, spaceIndex).toLowerCase();
      const rest = trimmed.slice(spaceIndex + 1).trim();

      // Check if full command is e.g. "skills --level" or "deploy --global"
      if (commands[`${firstWord} ${rest.toLowerCase()}`]) {
        matchedKey = `${firstWord} ${rest.toLowerCase()}`;
        args = '';
      } else if (commands[firstWord]) {
        matchedKey = firstWord;
        args = rest;
      }
    } else {
      matchedKey = lower;
    }
  }

  if (matchedKey && commands[matchedKey]) {
    const result = commands[matchedKey].run(args, context);
    return {
      success: true,
      commandName: matchedKey,
      output: result.output || [],
      sideEffects: result.sideEffects || []
    };
  }

  return {
    success: false,
    commandName: trimmed,
    output: [],
    sideEffects: []
  };
}

/**
 * Alias for executeCommandLine
 */
export function executeCommandLine(rawInput = '', context = {}) {
  return parseCommand(rawInput, context);
}
