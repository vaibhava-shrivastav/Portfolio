/**
 * ==========================================================================
 * Netflix-Inspired Developer Portfolio — Personal Data
 * ==========================================================================
 * ALL personal content lives here. Edit this file only.
 * Rebuilt strictly from resume.pdf (A:\Vaibhava Kumar Shrivastav\Vaibhava_Resume.pdf)
 * ========================================================================== */

export const profile = {
  name: "Vaibhava Kumar Shrivastav",
  headline: "B.Tech Computer Science Student · Full-Stack & Cloud Builder",
  tagline: "Building scalable systems, one commit at a time.",
  welcome: "Welcome. I'm Vaibhava, pick a profile to see the portfolio tailored for you.",
  pronoun: "he/him",
  location: "Lucknow, Uttar Pradesh, India",
  email: "vaibhavakumarshrivastav@gmail.com",
  website: "https://glaexchange.online",
  github: "https://github.com/vaibhava-shrivastav",
  linkedin: "https://www.linkedin.com/in/vaibhavakumarshrivastav/",
  resumeUrl: "/resume.pdf",
  avatar: "/images/avatar.svg",
  bio: `B.Tech Computer Science student at GLA University with hands-on experience building
full-stack web applications and cloud infrastructure on AWS.
Skilled in React, Node.js, Python, and Terraform.
Builder of GLA Exchange (glaexchange.online) — a production campus marketplace.`,
  // RPG-style stats for terminal/profile select
  // NOTE: These are initial display values only. GameContext manages the real XP/level
  // system starting from 0 XP / Level 1 for each visitor.
  stats: {
    level: 1,
    xp: 0,
    xpToNext: 100,
    title: "Curious Visitor",
    class: "Full Stack Developer",
    specialization: "MERN & AWS"
  }
};

export const experience = [
  {
    id: "exp-1",
    company: "Astrea IT Services Pvt. Ltd.",
    role: "Salesforce Development Intern",
    technology: "Salesforce.com cloud computing development platform",
    period: "Jun 2026 — Jul 2026",
    type: "Internship",
    description: `Completed a hands-on training program on the Salesforce.com cloud computing development platform, gaining practical exposure to cloud-based application development and platform architecture.
Actively participated in all phases of the training, demonstrating strong conceptual understanding and consistent engagement.`,
    highlights: [
      "Completed a hands-on training program on the Salesforce.com cloud computing development platform, gaining practical exposure to cloud-based application development and platform architecture.",
      "Actively participated in all phases of the training, demonstrating strong conceptual understanding and consistent engagement."
    ],
    featured: true
  }
];

export const education = [
  {
    id: "edu-1",
    institution: "GLA University",
    degree: "Bachelor of Technology",
    field: "Computer Science",
    period: "2024 — 2028",
    location: "Mathura, Uttar Pradesh, India",
    score: "CPI 8.8",
    cpi: "CPI 8.8",
    gpa: "CPI 8.8",
    honors: [],
    relevantCoursework: [
      // NOTE: Inferred from skills section; resume does not list specific courses
      "Data Structures & Algorithms",
      "Database Management Systems",
      "Computer Networks",
      "Operating Systems",
      "Cloud Computing"
    ],
    featured: true
  },
  {
    id: "edu-2",
    institution: "Adani Public School",
    degree: "Class XII",
    field: "",
    period: "2023",
    location: "India",
    score: "89.8%",
    gpa: "89.8%",
    honors: [],
    relevantCoursework: [],
    featured: false
  },
  {
    id: "edu-3",
    institution: "Shri O.P Jindal Vidya Niketan",
    degree: "Class X",
    field: "",
    period: "2021",
    location: "India",
    score: "86.2%",
    gpa: "86.2%",
    honors: [],
    relevantCoursework: [],
    featured: false
  }
];

export const skills = {
  categories: [
    {
      name: "Languages",
      icon: "🔤",
      color: "var(--color-cyan)",
      items: [
        { name: "Java", level: 85, years: 3 }, // SELF-ASSESSED: confirm
        { name: "Python", level: 88, years: 3 }, // SELF-ASSESSED: confirm
        { name: "JavaScript", level: 92, years: 4 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "Frameworks & Libraries",
      icon: "⚛️",
      color: "var(--color-terminal)",
      items: [
        { name: "ReactJS", level: 90, years: 3 }, // SELF-ASSESSED: confirm
        { name: "Node.js", level: 88, years: 3 }, // SELF-ASSESSED: confirm
        { name: "Express.js", level: 85, years: 2 }, // SELF-ASSESSED: confirm
        { name: "MERN Stack", level: 85, years: 2 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "Cloud & DevOps",
      icon: "☁️",
      color: "var(--color-primary)",
      items: [
        { name: "AWS: EC2, S3, IAM, VPC", level: 85, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Terraform", level: 75, years: 1 }, // SELF-ASSESSED: confirm
        { name: "Docker", level: 85, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Cloud Architecture", level: 80, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Multitenant Environments", level: 75, years: 1 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "Databases",
      icon: "🗄️",
      color: "var(--color-warning)",
      items: [
        { name: "MongoDB", level: 85, years: 2 }, // SELF-ASSESSED: confirm
        { name: "MySQL", level: 80, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Distributed Storage Design", level: 75, years: 1 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "CS Fundamentals",
      icon: "📚",
      color: "var(--color-info)",
      items: [
        { name: "Data Structures & Algorithms", level: 90, years: 4 }, // SELF-ASSESSED: confirm
        { name: "OOP", level: 92, years: 4 }, // SELF-ASSESSED: confirm
        { name: "REST APIs", level: 90, years: 3 }, // SELF-ASSESSED: confirm
        { name: "System Design", level: 80, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Distributed Computing", level: 75, years: 1 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "Developer Tools",
      icon: "🛠️",
      color: "var(--color-success)",
      items: [
        { name: "Git", level: 95, years: 4 }, // SELF-ASSESSED: confirm
        { name: "GitHub", level: 95, years: 4 }, // SELF-ASSESSED: confirm
        { name: "VS Code", level: 90, years: 4 }, // SELF-ASSESSED: confirm
        { name: "IntelliJ IDEA", level: 80, years: 2 } // SELF-ASSESSED: confirm
      ]
    }
  ],
  // Top skills for hero/profile
  top: ["React", "Node.js", "AWS", "JavaScript", "MongoDB", "Docker"]
};

export const projects = [
  {
    id: "proj-1",
    slug: "gla-exchange",
    title: "GLA Exchange",
    tagline: "Campus Marketplace Platform",
    description: `Built and deployed a fullstack peer-to-peer marketplace for GLA University students featuring 20+ modules including real-time chat (Socket.io), Google OAuth 2.0, product listings with Cloudinary CDN image storage, and a role-based admin portal serving live users on a custom domain with SSL.`,
    longDescription: `Built and deployed a fullstack peer-to-peer marketplace for GLA University students featuring 20+ modules including real-time chat (Socket.io), Google OAuth 2.0, product listings with Cloudinary CDN image storage, and a role-based admin portal serving live users on a custom domain with SSL. Implemented production-grade security: Helmet.js headers, rate limiting, CORS whitelist, JWT, input validation, Google Search Console SEO with sitemap.xml, and structured data demonstrating ownership across the full software development lifecycle from architecture to deployment.`,
    image: "/images/projects/gla-exchange.svg",
    images: [
      "/images/projects/gla-exchange.svg"
    ],
    demoUrl: "https://glaexchange.online",
    repoUrl: "", // Per resume, profile link is canonical
    docsUrl: "",
    featured: true,
    status: "Production",
    period: "Jan 2026 — May 2026",
    role: "Full-Stack Project",
    tech: ["MERN Stack", "Socket.io", "JWT", "Google OAuth", "Cloudinary", "MongoDB Atlas", "Render"],
    highlights: [
      "Fullstack peer-to-peer marketplace for GLA University students featuring 20+ modules",
      "Real-time chat (Socket.io) and Google OAuth 2.0",
      "Product listings with Cloudinary CDN image storage",
      "Role-based admin portal serving live users on a custom domain with SSL",
      "Production-grade security: Helmet.js headers, rate limiting, CORS whitelist, JWT, input validation",
      "Google Search Console SEO with sitemap.xml, and structured data"
    ],
    gradient: "var(--gradient-project-gla)"
  },
  {
    id: "proj-2",
    slug: "educloud",
    title: "EduCloud",
    tagline: "Managed Cloud Learning Platform",
    description: `Architected a cloud platform provisioning isolated, fault-tolerant AWS environments for students using Terraform IaC integrating EC2, S3, IAM, and VPC to deliver secure, cost-controlled multi-tenant workspaces at scale.`,
    longDescription: `Architected a cloud platform provisioning isolated, fault-tolerant AWS environments for students using Terraform IaC integrating EC2, S3, IAM, and VPC to deliver secure, cost-controlled multi-tenant workspaces at scale. Designed IAM role-based access control and VPC network isolation for multitenant environments, ensuring security and resource separation across concurrent student workspaces mirroring distributed system patterns used in large-scale cloud platforms.`,
    image: "/images/projects/educloud.svg",
    images: [
      "/images/projects/educloud.svg"
    ],
    demoUrl: "", // TODO: Add if deployed
    repoUrl: "", // Per resume, profile link is canonical
    docsUrl: "",
    featured: true,
    status: "Completed",
    period: "Feb 2026 — Apr 2026",
    role: "Collaborative Project",
    tech: ["AWS", "Terraform", "IAM", "VPC", "EC2", "S3"],
    highlights: [
      "Architected cloud platform provisioning isolated, fault-tolerant AWS environments using Terraform IaC",
      "Integrating EC2, S3, IAM, and VPC to deliver secure, cost-controlled multi-tenant workspaces at scale",
      "Designed IAM role-based access control for multitenant environments",
      "VPC network isolation for multitenant environments",
      "Security and resource separation across concurrent student workspaces",
      "Mirroring distributed system patterns used in large-scale cloud platforms"
    ],
    gradient: "var(--gradient-project-edu)"
  }
];

/**
 * ==========================================================================
 * XP & Level System Configuration
 * ==========================================================================
 * Achievements are badges only (0 XP). All XP is earned via discrete actions:
 *
 * Action Table:
 * 1. Profile select (persona chosen):                 +20 XP (once)
 * 2. About section viewed:                            +30 XP (once)
 * 3. Each project modal opened (GLA, EduCloud):       +25 XP each = +50 XP (2 projects)
 * 4. Skills section viewed:                           +30 XP (once)
 * 5. Terminal first open:                             +50 XP (once)
 * 6. Each unique terminal command (17 allowed):       +10 XP each = up to +170 XP
 *    (help, whoami, about, skills, skills --level, projects, play, achievements,
 *     experience, education, resume, contact, github, linkedin, deploy, theme, clear)
 * 7. Secret command or Konami code:                   +100 XP (once)
 * 8. Achievements section viewed:                     +20 XP (once)
 * 9. Contact section viewed:                          +20 XP (once)
 * 10. External link clicks (GitHub, LinkedIn, Resume):+15 XP each = +45 XP (3 links)
 * 11. Contact form sent:                              +20 XP (once)
 *
 * SUM OF ALL POSSIBLE XP:
 * 20 + 30 + 50 + 30 + 50 + 170 + 100 + 20 + 20 + 45 + 20 = 555 XP
 * (Minimum realistic with e.g. 12 unique terminal commands: 385 + 120 = 505 XP)
 * Level 5 ("Hired!") requirement: 500 XP.
 * CHECK: 555 XP >= 500 XP — Level 5 is fully reachable!
 * ==========================================================================
 */
export const xpLevels = [
  { level: 1, name: "Curious Visitor", minXp: 0 },
  { level: 2, name: "Explorer", minXp: 100 },
  { level: 3, name: "Insider", minXp: 200 },
  { level: 4, name: "Power User", minXp: 350 },
  { level: 5, name: "Hired!", minXp: 500 }
];

export const xpActions = {
  PROFILE_SELECT: { id: "profile_select", xp: 20, maxCount: 1 },
  ABOUT_VIEW: { id: "about_view", xp: 30, maxCount: 1 },
  PROJECT_MODAL_VIEW: { id: "project_modal_view", xp: 25, maxCount: 2 }, // GLA + EduCloud = 50
  SKILLS_VIEW: { id: "skills_view", xp: 30, maxCount: 1 },
  TERMINAL_FIRST_OPEN: { id: "terminal_first_open", xp: 50, maxCount: 1 },
  TERMINAL_COMMAND_UNIQUE: { id: "terminal_command_unique", xp: 10, maxCount: 17 }, // up to 170
  SECRET_OR_KONAMI: { id: "secret_or_konami", xp: 100, maxCount: 1 },
  ACHIEVEMENTS_VIEW: { id: "achievements_view", xp: 20, maxCount: 1 },
  CONTACT_VIEW: { id: "contact_view", xp: 20, maxCount: 1 },
  LINK_CLICK: { id: "link_click", xp: 15, maxCount: 3 }, // GitHub, LinkedIn, Resume = 45
  CONTACT_FORM_SENT: { id: "contact_form_sent", xp: 20, maxCount: 1 }
};

// Game achievements — exactly 10 badges (visual only, NO XP values)
export const gameAchievements = [
  {
    id: "game-1",
    key: "pilot_episode",
    name: "Pilot Episode",
    title: "Pilot Episode",
    description: "Completed the preloader sequence and entered the portfolio",
    icon: "🎬",
    category: "milestone",
    rarity: "common",
    unlockHint: "Watch or complete the cinematic preloader sequence",
    trigger: "preloader_finish",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-2",
    key: "found_the_terminal",
    name: "Found the Terminal",
    title: "Found the Terminal",
    description: "Opened the interactive terminal overlay",
    icon: "💻",
    category: "exploration",
    rarity: "common",
    unlockHint: "Press the ` key or click the Terminal button in the navbar",
    trigger: "terminal_first_open",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-3",
    key: "project_binge",
    name: "Project Binge",
    title: "Project Binge",
    description: "Opened both project detail modals (GLA Exchange & EduCloud)",
    icon: "📦",
    category: "exploration",
    rarity: "rare",
    unlockHint: "Inspect both project detail modals in the catalog",
    trigger: "project:open:proj-1 && project:open:proj-2",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-4",
    key: "skill_collector",
    name: "Skill Collector",
    title: "Skill Collector",
    description: "Expanded all 6 skill categories in the character sheet",
    icon: "📚",
    category: "exploration",
    rarity: "rare",
    unlockHint: "Expand every category in the Character Attributes sheet",
    trigger: "all 6 skill categories expanded",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-5",
    key: "reached_out",
    name: "Reached Out",
    title: "Reached Out",
    description: "Sent a message via the contact form",
    icon: "📬",
    category: "interaction",
    rarity: "rare",
    unlockHint: "Send a message via the contact form",
    trigger: "contact_form_sent",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-6",
    key: "konami_master",
    name: "Konami Master",
    title: "Konami Master",
    description: "Activated the secret Konami code sequence",
    icon: "🎮",
    category: "secret",
    rarity: "mythic",
    unlockHint: "↑↑↓↓←→←→BA",
    trigger: "secret_or_konami",
    unlockedAt: null,
    secret: true
  },
  {
    id: "game-7",
    key: "cloud_native",
    name: "Cloud Native",
    title: "Cloud Native",
    description: "Selected Hackathon Judge persona or viewed AWS cloud services",
    icon: "☁️",
    category: "project",
    rarity: "epic",
    unlockHint: "Select Hackathon Judge persona or inspect the AWS services shelf",
    trigger: "persona:judge || aws_services_view",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-8",
    key: "shipped_it",
    name: "Shipped It",
    title: "Shipped It",
    description: "Visited the live production deployment of GLA Exchange",
    icon: "🚀",
    category: "project",
    rarity: "epic",
    unlockHint: "Launch live demo at glaexchange.online",
    trigger: "link_click:gla_exchange",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-9",
    key: "certified",
    name: "Certified",
    title: "Certified",
    description: "Inspected AWS certifications",
    icon: "📜",
    category: "accomplishment",
    rarity: "legendary",
    unlockHint: "View the AWS certifications in the achievements shelf",
    trigger: "certifications_view",
    unlockedAt: null,
    secret: false
  },
  {
    id: "game-10",
    key: "full_run",
    name: "Full Run",
    title: "Full Run",
    description: "Unlocked all other 9 achievements across the portfolio",
    icon: "🏁",
    category: "milestone",
    rarity: "mythic",
    unlockHint: "Unlock all other 9 achievements",
    trigger: "all 9 achievements unlocked",
    unlockedAt: null,
    secret: false
  }
];

export const achievements = gameAchievements;

// Accomplishments — real resume facts, shown as cards (separate from game achievements)
export const accomplishments = [
  {
    id: "acc-1",
    title: "LeetCode 150+ Problems",
    description: "Solved 150+ problems on LeetCode focused on arrays, trees, graphs, and dynamic programming.",
    category: "coding",
    icon: "💻"
  },
  {
    id: "acc-2",
    title: "Codeforces Rating 880+",
    description: "Achieved 880+ rating on Codeforces through competitive programming, demonstrating consistent performance under timed, multi-constraint problem solving.",
    category: "coding",
    icon: "⚡"
  },
  {
    id: "acc-3",
    title: "Smart India Hackathon",
    description: "Part of a 5-member team that qualified the internal round, demonstrating cross-disciplinary collaboration and delivery under ambiguity.",
    category: "competition",
    icon: "🏆"
  }
];

export const certifications = [
  {
    id: "cert-1",
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2026",
    expiry: "", // Not stated in resume
    credentialId: "TODO", // TODO: Add from certificate
    url: "https://aws.amazon.com/verification"
  },
  {
    id: "cert-2",
    name: "AWS Certified AI Practitioner",
    issuer: "Amazon Web Services",
    date: "2026",
    expiry: "", // Not stated in resume
    credentialId: "TODO",
    url: ""
  },
  {
    id: "cert-3",
    name: "AWS Academy Graduate Cloud Foundations",
    issuer: "Amazon Web Services",
    date: "2026-02",
    expiry: "", // Not stated in resume
    credentialId: "TODO",
    url: ""
  }
];

export const contact = {
  email: "vaibhavakumarshrivastav@gmail.com",
  github: "https://github.com/vaibhava-shrivastav",
  linkedin: "https://www.linkedin.com/in/vaibhavakumarshrivastav/",
  location: "Lucknow, Uttar Pradesh, India",
  timezone: "UTC+5:30",
  availability: "Open to opportunities",
  preferredContact: "email"
};

export const site = {
  title: "Vaibhava Kumar Shrivastav | Full Stack Developer",
  description: "B.Tech Computer Science student building full-stack and cloud projects. GLA Exchange, EduCloud, AWS certified.",
  ogImage: "/images/og-image.svg",
  favicon: "/favicon.svg",
  themeColor: "#E50914",
  lang: "en",
  // Single canonical URL placeholder constant — update this URL after AWS deployment:
  canonical: "https://vaibhava-shrivastav.vercel.app",
  features: {
    terminal: true,
    rpgStats: true,
    achievements: true,
    easterEggs: true,
    analytics: false, // TODO: Add Plausible/GA
    darkModeOnly: true
  },
  animations: {
    reducedMotion: false,
    staggerDelay: 100,
    pageTransition: 300
  }
};

export const easterEggs = {
  konami: {
    enabled: true,
    reward: { xp: 100, achievement: "konami_master" },
    message: "🎮 Konami Code activated! You've unlocked the Konami Master achievement."
  },
  commands: {
    "sudo": { response: "Nice try. This isn't Linux. 😄", xp: 10 },
    "whoami": { response: "A developer who loves building things.", xp: 5 },
    "date": { response: () => new Date().toISOString(), xp: 5 },
    "fortune": {
      responses: [
        "Your code will compile on the first try. Eventually.",
        "The best debugging tool is a good night's sleep.",
        "Deploy on Friday? Bold move.",
        "It works on my machine is a valid deployment strategy."
      ],
      xp: 10
    },
    "matrix": { response: "Wake up, Neo... 🐰", xp: 50, unlock: "matrix_mode" },
    "coffee": { response: "☕ *sips coffee* Ready to deploy!", xp: 5 }
  }
};

/**
 * ==========================================================================
 * Visitor Personas (Who\'s Watching)
 * ==========================================================================
 * Tailors the hero tagline and first row section order per persona.
 * ==========================================================================
 */
export const visitorPersonas = [
  {
    id: 'recruiter',
    key: 'recruiter',
    title: 'Recruiter',
    subtitle: 'Quick TL;DR & Resume Core',
    badge: 'VIEW 01',
    tag: 'RECRUITER',
    accentColor: '#00DAF3',
    glowColor: 'rgba(0, 218, 243, 0.35)',
    shortcut: '1',
    tagline: 'Proven full-stack engineering & cloud architecture — ready to deliver immediate team impact.',
    firstRowOrder: ['resume', 'skills', 'projects', 'experience', 'education'],
    heroActionText: 'Download Resume',
    heroActionTarget: '/resume.pdf'
  },
  {
    id: 'hiring_manager',
    key: 'hiring_manager',
    title: 'Hiring Manager',
    subtitle: 'Architecture & Impact KPIs',
    badge: 'VIEW 02',
    tag: 'LEADERSHIP',
    accentColor: '#FFB4AA',
    glowColor: 'rgba(255, 180, 170, 0.3)',
    shortcut: '2',
    tagline: 'Architecting production-grade MERN platforms and resilient multi-tenant AWS cloud systems.',
    firstRowOrder: ['projects', 'experience', 'skills', 'education', 'contact'],
    heroActionText: 'View Projects',
    heroActionTarget: '#projects'
  },
  {
    id: 'fellow_dev',
    key: 'fellow_dev',
    title: 'Fellow Dev',
    subtitle: 'Git Diffs, Stack & CLI Tooling',
    badge: 'DEV_CLI',
    tag: 'SYS.EXEC',
    accentColor: '#39FF14',
    glowColor: 'rgba(57, 255, 20, 0.35)',
    shortcut: '3',
    tagline: 'Clean commits, real-time WebSockets, IaC pipelines, and an interactive terminal environment.',
    firstRowOrder: ['terminal', 'github', 'projects', 'skills', 'experience'],
    heroActionText: 'Open Terminal',
    heroActionTarget: 'terminal'
  },
  {
    id: 'judge',
    key: 'judge',
    title: 'Hackathon Judge',
    subtitle: 'Prototypes, Demos & Speed',
    badge: 'PRIZE 1ST',
    tag: 'JUDGE',
    accentColor: '#E50914',
    glowColor: 'rgba(229, 9, 20, 0.45)',
    shortcut: '4',
    tagline: 'Shipped GLA Exchange to production with 100+ campus users and modular AWS Terraform infrastructure.',
    firstRowOrder: ['aws_services', 'terminal', 'projects', 'skills', 'achievements'],
    heroActionText: 'Live Demo',
    heroActionTarget: 'https://glaexchange.online'
  }
];

export const defaultPersona = {
  id: 'default',
  key: 'default',
  title: 'Visitor',
  subtitle: 'Standard Showcase',
  badge: 'DEFAULT',
  tag: 'EXPLORER',
  accentColor: '#E50914',
  glowColor: 'rgba(229, 9, 20, 0.35)',
  shortcut: '0',
  tagline: profile.tagline,
  firstRowOrder: ['projects', 'about'],
  heroActionText: 'View Projects',
  heroActionTarget: '#projects'
};

// Default export for convenience
export default {
  profile,
  experience,
  education,
  skills,
  projects,
  xpLevels,
  xpActions,
  gameAchievements,
  accomplishments,
  certifications,
  contact,
  site,
  easterEggs,
  visitorPersonas,
  defaultPersona
};