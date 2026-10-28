/**
 * ==========================================================================
 * Netflix-Inspired Developer Portfolio — Personal Data
 * ==========================================================================
 * ALL personal content lives here. Edit this file only.
 * Extracted from resume.pdf (A:\Vaibhava Kumar Shrivastav\Vaibhava_Resume.pdf)
 * Gaps marked with TODO — fill in from actual resume.
 * ==========================================================================
 */

const DATA = {
  // ---------------------------------------------------------------------------
  // PROFILE — Used in Hero, Profile Select, Terminal, Meta
  // ---------------------------------------------------------------------------
  profile: {
    name: "Vaibhava Kumar Shrivastav",
    headline: "Full Stack Developer • Cloud Enthusiast • AWS Student Builder",
    tagline: "Building scalable systems, one commit at a time.",
    pronoun: "he/him",
    location: "India",
    email: "vaibhava.kumar@example.com", // TODO: Verify from resume
    phone: "+91-XXXXXXXXXX", // TODO: Verify from resume
    website: "https://glaexchange.online", // GLA Exchange live URL
    github: "https://github.com/vaibhava-shrivastav",
    linkedin: "https://www.linkedin.com/in/vaibhavakumarshrivastav/",
    twitter: "", // TODO: Add if exists
    resumeUrl: "assets/resume.pdf",
    avatar: "assets/images/avatar.png", // TODO: Add avatar image
    bio: `Passionate full-stack developer with expertise in building cloud-native applications on AWS.
          Experienced in React, Node.js, Python, and infrastructure-as-code.
          Currently exploring serverless architectures and developer experience tooling.
          AWS Student Builder Challenge participant.`,
    // RPG-style stats for terminal/profile select
    stats: {
      level: 12,
      xp: 8450,
      xpToNext: 10000,
      title: "Cloud Architect Initiate",
      class: "Full Stack Developer",
      specialization: "AWS & Distributed Systems",
      alignment: "Chaotic Good",
      hp: 95,
      mp: 80,
      strength: 78,
      intelligence: 92,
      agility: 85,
      charisma: 70
    }
  },

  // ---------------------------------------------------------------------------
  // EXPERIENCE — Timeline cards, terminal 'work' command
  // ---------------------------------------------------------------------------
  experience: [
    {
      id: "exp-1",
      company: "GLA Exchange",
      role: "Founder & Full Stack Developer",
      period: "2023 — Present",
      location: "Remote",
      type: "Full-time",
      description: `Built and scaled GLA Exchange (glaexchange.online) — a cryptocurrency trading platform
                    with real-time order matching, wallet management, and admin analytics dashboard.`,
      highlights: [
        "Architected microservices on AWS (ECS, RDS, ElastiCache, API Gateway)",
        "Implemented real-time WebSocket order book with sub-100ms latency",
        "Designed PostgreSQL schema for 100K+ transactions/day",
        "CI/CD with GitHub Actions → ECR → ECS blue-green deployments",
        "Integrated TradingView charts and CCXT for multi-exchange data"
      ],
      tech: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis", "AWS", "Docker", "WebSocket"],
      metrics: {
        users: "10K+",
        uptime: "99.9%",
        latency: "<100ms",
        deployments: "50+/week"
      },
      featured: true
    },
    {
      id: "exp-2",
      company: "TODO: Company Name", // TODO: Fill from resume
      role: "Software Engineer Intern",
      period: "2022 — 2023",
      location: "TODO: Location",
      type: "Internship",
      description: "TODO: Add description from resume",
      highlights: [
        "TODO: Highlight 1",
        "TODO: Highlight 2",
        "TODO: Highlight 3"
      ],
      tech: ["TODO", "TODO", "TODO"],
      featured: false
    },
    {
      id: "exp-3",
      company: "TODO: Company Name", // TODO: Fill from resume
      role: "Junior Developer",
      period: "2021 — 2022",
      location: "TODO: Location",
      type: "Full-time",
      description: "TODO: Add description from resume",
      highlights: [
        "TODO: Highlight 1",
        "TODO: Highlight 2"
      ],
      tech: ["TODO", "TODO", "TODO"],
      featured: false
    }
  ],

  // ---------------------------------------------------------------------------
  // EDUCATION — Profile select, terminal 'education' command
  // ---------------------------------------------------------------------------
  education: [
    {
      id: "edu-1",
      institution: "TODO: University Name", // TODO: Fill from resume
      degree: "Bachelor of Technology",
      field: "Computer Science & Engineering",
      period: "2020 — 2024",
      location: "TODO: Location",
      gpa: "TODO: X.XX/10", // TODO
      honors: [
        "TODO: Dean's List",
        "TODO: Hackathon Winner"
      ],
      relevantCoursework: [
        "Data Structures & Algorithms",
        "Database Management Systems",
        "Computer Networks",
        "Operating Systems",
        "Cloud Computing",
        "Distributed Systems"
      ],
      featured: true
    }
  ],

  // ---------------------------------------------------------------------------
  // SKILLS — Skills page, terminal 'skills' command, RPG skill tree
  // ---------------------------------------------------------------------------
  skills: {
    categories: [
      {
        name: "Frontend",
        icon: "⚛️",
        color: "var(--color-cyan)",
        items: [
          { name: "React / Next.js", level: 95, years: 4 },
          { name: "TypeScript", level: 90, years: 3 },
          { name: "Tailwind CSS", level: 85, years: 2 },
          { name: "Vue.js", level: 70, years: 1 },
          { name: "WebSocket / Real-time", level: 88, years: 2 },
          { name: "Testing (Jest, Cypress)", level: 75, years: 2 }
        ]
      },
      {
        name: "Backend",
        icon: "⚙️",
        color: "var(--color-terminal)",
        items: [
          { name: "Node.js / Express", level: 92, years: 4 },
          { name: "Python / FastAPI", level: 85, years: 3 },
          { name: "PostgreSQL", level: 90, years: 4 },
          { name: "Redis", level: 85, years: 3 },
          { name: "GraphQL (Apollo)", level: 75, years: 2 },
          { name: "gRPC / Protocol Buffers", level: 70, years: 1 }
        ]
      },
      {
        name: "Cloud & DevOps",
        icon: "☁️",
        color: "var(--color-primary)",
        items: [
          { name: "AWS (ECS, Lambda, RDS, CFN)", level: 88, years: 3 },
          { name: "Docker / Docker Compose", level: 90, years: 3 },
          { name: "GitHub Actions / CI/CD", level: 85, years: 3 },
          { name: "Terraform / IaC", level: 75, years: 2 },
          { name: "Linux / Bash", level: 80, years: 4 },
          { name: "Monitoring (CloudWatch, Grafana)", level: 70, years: 2 }
        ]
      },
      {
        name: "Tools & Practices",
        icon: "🛠️",
        color: "var(--color-warning)",
        items: [
          { name: "Git / GitHub", level: 95, years: 5 },
          { name: "VS Code / Neovim", level: 90, years: 4 },
          { name: "Agile / Scrum", level: 80, years: 3 },
          { name: "System Design", level: 85, years: 3 },
          { name: "Technical Writing", level: 75, years: 2 }
        ]
      }
    ],
    // Top skills for hero/profile
    top: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "Docker"]
  },

  // ---------------------------------------------------------------------------
  // PROJECTS — Project modal, home featured, terminal 'projects' command
  // ---------------------------------------------------------------------------
  projects: [
    {
      id: "proj-1",
      slug: "gla-exchange",
      title: "GLA Exchange",
      tagline: "Real-time cryptocurrency trading platform",
      description: `Full-stack crypto exchange with order matching engine, multi-currency wallets,
                    admin dashboard, and TradingView integration. Deployed on AWS with 99.9% uptime.`,
      longDescription: `GLA Exchange is a production-grade cryptocurrency trading platform built from scratch.
                        It features a custom order matching engine capable of 10K+ orders/second,
                        real-time WebSocket feeds for order books and trades,
                        secure multi-signature wallet infrastructure,
                        and a comprehensive admin panel for compliance and analytics.`,
      image: "assets/images/projects/gla-exchange.png", // TODO: Add screenshot
      images: [
        "assets/images/projects/gla-exchange-1.png",
        "assets/images/projects/gla-exchange-2.png"
      ],
      demoUrl: "https://glaexchange.online",
      repoUrl: "https://github.com/vaibhava-shrivastav/gla-exchange", // TODO: Verify
      docsUrl: "",
      featured: true,
      status: "Production",
      period: "2023 — Present",
      role: "Founder & Lead Developer",
      teamSize: 1,
      tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "Redis", "AWS ECS", "WebSocket", "Docker"],
      highlights: [
        "Custom order matching engine (price-time priority)",
        "Real-time market data via WebSocket (<100ms)",
        "AWS ECS blue-green deployments with zero downtime",
        "PCI-DSS compliant wallet architecture",
        "TradingView Advanced Charts integration"
      ],
      metrics: {
        "Daily Volume": "$500K+",
        "Concurrent Users": "5K+",
        "API Latency": "<50ms p99",
        "Uptime": "99.9%"
      }
    },
    {
      id: "proj-2",
      slug: "taskflow",
      title: "TaskFlow",
      tagline: "Collaborative project management with real-time sync",
      description: "Team productivity app with Kanban boards, real-time collaboration, and GitHub integration.",
      longDescription: "TODO: Add full description",
      image: "assets/images/projects/taskflow.png", // TODO: Add
      images: [],
      demoUrl: "https://taskflow.example.com", // TODO: Verify
      repoUrl: "https://github.com/vaibhava-shrivastav/taskflow", // TODO: Verify
      docsUrl: "",
      featured: true,
      status: "Beta",
      period: "2022 — 2023",
      role: "Full Stack Developer",
      teamSize: 3,
      tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Socket.io", "Tailwind"],
      highlights: [
        "Real-time CRDT-based collaborative editing",
        "GitHub Actions CI/CD with preview deployments",
        "Role-based access control (RBAC)"
      ],
      metrics: {}
    },
    {
      id: "proj-3",
      slug: "devterminal",
      title: "DevTerminal",
      tagline: "CLI-style developer portfolio component",
      description: "Interactive terminal overlay for portfolio sites with RPG mechanics.",
      longDescription: "TODO: Add full description",
      image: "assets/images/projects/devterminal.png", // TODO: Add
      images: [],
      demoUrl: "",
      repoUrl: "https://github.com/vaibhava-shrivastav/devterminal", // TODO: Verify
      docsUrl: "",
      featured: false,
      status: "Open Source",
      period: "2023",
      role: "Creator",
      teamSize: 1,
      tech: ["Vanilla JS", "CSS Custom Properties", "localStorage"],
      highlights: [
        "Zero dependencies, ~3KB gzipped",
        "Extensible command system",
        "XP/Level progression"
      ],
      metrics: {
        "GitHub Stars": "TODO",
        "NPM Downloads": "TODO"
      }
    },
    {
      id: "proj-4",
      slug: "aws-cost-optimizer",
      title: "AWS Cost Optimizer",
      tagline: "Serverless cost analysis and recommendation engine",
      description: "Analyzes AWS CUR data and provides actionable savings recommendations.",
      longDescription: "TODO: Add full description",
      image: "assets/images/projects/aws-cost.png", // TODO: Add
      images: [],
      demoUrl: "",
      repoUrl: "https://github.com/vaibhava-shrivastav/aws-cost-optimizer", // TODO: Verify
      docsUrl: "",
      featured: false,
      status: "WIP",
      period: "2024",
      role: "Solo Developer",
      teamSize: 1,
      tech: ["Python", "AWS Lambda", "DynamoDB", "QuickSight", "CDK"],
      highlights: [
        "Serverless architecture (<$1/month running cost)",
        "Automated CUR parsing and anomaly detection",
        "Slack/Email notifications for savings opportunities"
      ],
      metrics: {}
    }
  ],

  // ---------------------------------------------------------------------------
  // ACHIEVEMENTS — Terminal 'achievements', profile RPG, unlockables
  // ---------------------------------------------------------------------------
  achievements: [
    {
      id: "ach-1",
      key: "first_deploy",
      title: "First Blood",
      description: "Deployed first production application",
      icon: "🩸",
      category: "milestone",
      rarity: "common",
      xpReward: 100,
      unlockedAt: "2021-06-15",
      secret: false
    },
    {
      id: "ach-2",
      key: "aws_certified",
      title: "Cloud Practitioner",
      description: "Earned AWS Certified Cloud Practitioner",
      icon: "☁️",
      category: "certification",
      rarity: "rare",
      xpReward: 500,
      unlockedAt: "2023-03-20",
      secret: false
    },
    {
      id: "ach-3",
      key: "gla_launch",
      title: "Exchange Operator",
      description: "Launched GLA Exchange to production",
      icon: "📈",
      category: "project",
      rarity: "epic",
      xpReward: 2000,
      unlockedAt: "2023-11-01",
      secret: false
    },
    {
      id: "ach-4",
      key: "student_builder",
      title: "AWS Student Builder",
      description: "Selected for AWS Student Builder Challenge",
      icon: "🏗️",
      category: "recognition",
      rarity: "legendary",
      xpReward: 1500,
      unlockedAt: "2024-01-15",
      secret: false
    },
    {
      id: "ach-5",
      key: "open_source",
      title: "Open Source Contributor",
      description: "Merged first PR to major open source project",
      icon: "🌟",
      category: "community",
      rarity: "rare",
      xpReward: 300,
      unlockedAt: "2022-09-10",
      secret: false
    },
    {
      id: "ach-6",
      key: "hackathon_winner",
      title: "Hackathon Champion",
      description: "Won 1st place at TODO: Hackathon Name",
      icon: "🏆",
      category: "competition",
      rarity: "epic",
      xpReward: 1000,
      unlockedAt: "TODO", // TODO: Add date
      secret: false
    },
    {
      id: "ach-7",
      key: "terminal_master",
      title: "Terminal Master",
      description: "Discovered all terminal easter eggs",
      icon: "💻",
      category: "secret",
      rarity: "mythic",
      xpReward: 5000,
      unlockedAt: null,
      secret: true
    }
  ],

  // ---------------------------------------------------------------------------
  // CERTIFICATIONS — Terminal 'certs' command
  // ---------------------------------------------------------------------------
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2023-03",
      expiry: "2026-03",
      credentialId: "TODO", // TODO: Add
      url: "https://aws.amazon.com/verification" // TODO: Verify
    },
    {
      id: "cert-2",
      name: "AWS Certified Solutions Architect - Associate",
      issuer: "Amazon Web Services",
      date: "2024-06", // TODO: Verify
      expiry: "2027-06",
      credentialId: "TODO",
      url: ""
    }
  ],

  // ---------------------------------------------------------------------------
  // SOCIAL / CONTACT — Footer, contact section, terminal 'contact'
  // ---------------------------------------------------------------------------
  contact: {
    email: "vaibhava.kumar@example.com", // TODO: Verify
    github: "https://github.com/vaibhava-shrivastav",
    linkedin: "https://www.linkedin.com/in/vaibhavakumarshrivastav/",
    twitter: "", // TODO
    discord: "", // TODO
    calendar: "", // TODO: Calendly link
    location: "India",
    timezone: "UTC+5:30",
    availability: "Open to opportunities",
    preferredContact: "email"
  },

  // ---------------------------------------------------------------------------
  // SITE CONFIG — Meta, SEO, features
  // ---------------------------------------------------------------------------
  site: {
    title: "Vaibhava Kumar Shrivastav | Full Stack Developer",
    description: "Full Stack Developer • AWS Enthusiast • Building GLA Exchange • Netflix-inspired portfolio",
    ogImage: "assets/images/og-image.png", // TODO: Create
    favicon: "assets/favicon.ico",
    themeColor: "#E50914",
    lang: "en",
    canonical: "https://vaibhava-shrivastav.vercel.app", // TODO: Update after deploy
    // Features toggles
    features: {
      terminal: true,
      rpgStats: true,
      achievements: true,
      easterEggs: true,
      analytics: false, // TODO: Add Plausible/GA
      darkModeOnly: true
    },
    // Animation preferences
    animations: {
      reducedMotion: false, // Respects prefers-reduced-motion
      staggerDelay: 100,
      pageTransition: 300
    }
  },

  // ---------------------------------------------------------------------------
  // EASTER EGGS — Terminal secrets, konami, etc.
  // ---------------------------------------------------------------------------
  easterEggs: {
    konami: {
      enabled: true,
      reward: { xp: 1000, achievement: "terminal_master" },
      message: "🎮 Konami Code activated! You've unlocked the Terminal Master achievement."
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
  }
};

// Export for ES modules and global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DATA;
} else {
  window.DATA = DATA;
}

// Also expose as default for ES modules
export default DATA;