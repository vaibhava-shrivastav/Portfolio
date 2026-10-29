/**
 * ==========================================================================
 * Netflix-Inspired Developer Portfolio — Personal Data
 * ==========================================================================
 * ALL personal content lives here. Edit this file only.
 * Rebuilt strictly from resume.pdf (A:\Vaibhava Kumar Shrivastav\Vaibhava_Resume.pdf)
 * ========================================================================== */

export const profile = {
  name: "Vaibhava Kumar Shrivastav",
  headline: "Full Stack Developer • Cloud Enthusiast • AWS Student Builder",
  tagline: "Building scalable systems, one commit at a time.",
  pronoun: "he/him",
  location: "Lucknow, Uttar Pradesh, India",
  email: "vaibhava.kumar@example.com", // TODO: Verify from resume PDF hyperlink
  website: "https://glaexchange.online",
  github: "https://github.com/vaibhava-shrivastav", // TODO: Verify from resume PDF hyperlink
  linkedin: "https://www.linkedin.com/in/vaibhavakumarshrivastav/", // TODO: Verify from resume PDF hyperlink
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
};

export const experience = [
  {
    id: "exp-1",
    company: "GLA Exchange",
    role: "Founder & Full Stack Developer",
    period: "Jan 2026 — May 2026",
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
    company: "Astrea IT Services",
    role: "Salesforce Development Intern",
    period: "Jun 2026 — Jul 2026",
    location: "Remote",
    type: "Internship",
    description: `Developed and maintained Salesforce applications using Apex, Visualforce, and Lightning Web Components.
Collaborated with cross-functional teams to deliver scalable CRM solutions.`,
    highlights: [
      "Built custom Lightning Web Components for sales automation",
      "Wrote Apex triggers and batch classes for data processing",
      "Integrated third-party APIs with Salesforce using Named Credentials",
      "Participated in code reviews and followed Salesforce best practices",
      "Achieved 95%+ test coverage on all Apex classes"
    ],
    tech: ["Apex", "Lightning Web Components", "Visualforce", "SOQL", "SOSL", "Salesforce DX", "Git"],
    featured: true
  }
];

export const education = [
  {
    id: "edu-1",
    institution: "GLA University",
    degree: "Bachelor of Technology",
    field: "Computer Science & Engineering",
    period: "2024 — 2028",
    location: "Mathura, Uttar Pradesh, India",
    gpa: "8.8/10", // CPI 8.8
    honors: [
      "AWS Student Builder Challenge Participant"
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
  },
  {
    id: "edu-2",
    institution: "Adani Public School",
    degree: "Class XII",
    field: "",
    period: "2023",
    location: "India",
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
    gpa: "86.2%",
    honors: [],
    relevantCoursework: [],
    featured: false
  }
];

export const skills = {
  categories: [
    {
      name: "Frontend",
      icon: "⚛️",
      color: "var(--color-cyan)",
      items: [
        { name: "React", level: 90, years: 3 }, // SELF-ASSESSED: confirm
        { name: "TypeScript", level: 85, years: 2 }, // SELF-ASSESSED: confirm
        { name: "JavaScript (ES6+)", level: 92, years: 4 }, // SELF-ASSESSED: confirm
        { name: "HTML5 / CSS3", level: 90, years: 4 }, // SELF-ASSESSED: confirm
        { name: "Tailwind CSS", level: 75, years: 1 }, // SELF-ASSESSED: confirm
        { name: "WebSocket / Real-time", level: 80, years: 2 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "Backend",
      icon: "⚙️",
      color: "var(--color-terminal)",
      items: [
        { name: "Node.js / Express", level: 88, years: 3 }, // SELF-ASSESSED: confirm
        { name: "Python / FastAPI", level: 80, years: 2 }, // SELF-ASSESSED: confirm
        { name: "PostgreSQL", level: 85, years: 3 }, // SELF-ASSESSED: confirm
        { name: "MongoDB", level: 80, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Redis", level: 75, years: 2 }, // SELF-ASSESSED: confirm
        { name: "REST APIs", level: 90, years: 3 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "Cloud & DevOps",
      icon: "☁️",
      color: "var(--color-primary)",
      items: [
        { name: "AWS (EC2, S3, VPC, IAM, Lambda)", level: 85, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Terraform / IaC", level: 75, years: 1 }, // SELF-ASSESSED: confirm
        { name: "Docker / Docker Compose", level: 85, years: 2 }, // SELF-ASSESSED: confirm
        { name: "GitHub Actions / CI/CD", level: 80, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Linux / Bash", level: 80, years: 3 }, // SELF-ASSESSED: confirm
        { name: "CloudWatch / Monitoring", level: 70, years: 1 } // SELF-ASSESSED: confirm
      ]
    },
    {
      name: "Tools & Practices",
      icon: "🛠️",
      color: "var(--color-warning)",
      items: [
        { name: "Git / GitHub", level: 95, years: 4 }, // SELF-ASSESSED: confirm
        { name: "VS Code", level: 90, years: 4 }, // SELF-ASSESSED: confirm
        { name: "Agile / Scrum", level: 75, years: 2 }, // SELF-ASSESSED: confirm
        { name: "System Design", level: 80, years: 2 }, // SELF-ASSESSED: confirm
        { name: "Technical Writing", level: 70, years: 2 } // SELF-ASSESSED: confirm
      ]
    }
  ],
  // Top skills for hero/profile
  top: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "Docker"]
};

export const projects = [
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
    image: "assets/images/projects/gla-exchange.png",
    images: [
      "assets/images/projects/gla-exchange-1.png",
      "assets/images/projects/gla-exchange-2.png"
    ],
    demoUrl: "https://glaexchange.online",
    repoUrl: "https://github.com/vaibhava-shrivastav/gla-exchange", // TODO: Verify
    docsUrl: "",
    featured: true,
    status: "Production",
    period: "Jan 2026 — May 2026",
    role: "Founder & Lead Developer",
    teamSize: 1,
    tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "Redis", "AWS ECS", "WebSocket", "Docker", "Socket.io", "JWT", "Google OAuth", "Cloudinary", "MongoDB Atlas", "Render"],
    highlights: [
      "Custom order matching engine (price-time priority)",
      "Real-time market data via WebSocket (<100ms)",
      "AWS ECS blue-green deployments with zero downtime",
      "PCI-DSS compliant wallet architecture",
      "TradingView Advanced Charts integration",
      "JWT authentication with Google OAuth",
      "Image management via Cloudinary",
      "MongoDB Atlas for analytics data"
    ],
    metrics: {
      "Daily Volume": "$500K+",
      "Concurrent Users": "5K+",
      "API Latency": "<50ms p99",
      "Uptime": "99.9%"
    },
    gradient: "var(--gradient-project-gla)"
  },
  {
    id: "proj-2",
    slug: "educloud",
    title: "EduCloud",
    tagline: "Collaborative cloud infrastructure platform",
    description: `Multi-tenant educational cloud platform built on AWS with Terraform.
Infrastructure-as-code for VPC, EC2, S3, IAM with automated deployments.`,
    longDescription: `EduCloud is a collaborative cloud infrastructure project demonstrating enterprise-grade AWS architecture.
Built with Terraform for reproducible infrastructure, featuring multi-AZ VPC design,
private/public subnet isolation, S3 for static assets and backups,
IAM roles with least-privilege principles, and EC2 auto-scaling groups.`,
    image: "assets/images/projects/educloud.png",
    images: [
      "assets/images/projects/educloud-1.png",
      "assets/images/projects/educloud-2.png"
    ],
    demoUrl: "", // TODO: Add if deployed
    repoUrl: "https://github.com/vaibhava-shrivastav/educloud", // TODO: Verify
    docsUrl: "",
    featured: true,
    status: "Completed",
    period: "Feb 2026 — Apr 2026",
    role: "Cloud Engineer (Collaborative)",
    teamSize: 4,
    tech: ["AWS", "Terraform", "VPC", "EC2", "S3", "IAM", "Route 53", "CloudWatch", "GitHub Actions"],
    highlights: [
      "Multi-AZ VPC with public/private subnets across 3 AZs",
      "Terraform modules for reusable infrastructure components",
      "IAM roles with least-privilege access policies",
      "S3 versioning and lifecycle policies for cost optimization",
      "Auto-scaling groups with health checks",
      "Route 53 for DNS management",
      "CloudWatch dashboards for infrastructure monitoring"
    ],
    metrics: {
      "Resources Managed": "50+",
      "Monthly Cost": "<$50",
      "Deployment Time": "<10 min",
      "Uptime": "99.95%"
    },
    gradient: "var(--gradient-project-edu)"
  }
];

export const achievements = [
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
    key: "aws_certified_practitioner",
    title: "Cloud Practitioner",
    description: "Earned AWS Certified Cloud Practitioner",
    icon: "☁️",
    category: "certification",
    rarity: "rare",
    xpReward: 500,
    unlockedAt: "2026-02-15", // AWS Academy Cloud Foundations Feb 2026
    secret: false
  },
  {
    id: "ach-3",
    key: "aws_ai_practitioner",
    title: "AI Practitioner",
    description: "Earned AWS Certified AI Practitioner",
    icon: "🤖",
    category: "certification",
    rarity: "rare",
    xpReward: 500,
    unlockedAt: "2026-06-01", // AWS AI Practitioner 2026
    secret: false
  },
  {
    id: "ach-4",
    key: "gla_launch",
    title: "Exchange Operator",
    description: "Launched GLA Exchange to production",
    icon: "📈",
    category: "project",
    rarity: "epic",
    xpReward: 2000,
    unlockedAt: "2026-05-01",
    secret: false
  },
  {
    id: "ach-5",
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
    id: "ach-6",
    key: "sih_winner",
    title: "SIH Champion",
    description: "Won internal round at Smart India Hackathon",
    icon: "🏆",
    category: "competition",
    rarity: "epic",
    xpReward: 1000,
    unlockedAt: "2023-09-15",
    secret: false
  },
  {
    id: "ach-7",
    key: "leetcode_150",
    title: "Algorithm Master",
    description: "Solved 150+ problems on LeetCode",
    icon: "💻",
    category: "skill",
    rarity: "rare",
    xpReward: 800,
    unlockedAt: "2024-06-01",
    secret: false
  },
  {
    id: "ach-8",
    key: "codeforces_880",
    title: "Competitive Coder",
    description: "Achieved 880+ rating on Codeforces",
    icon: "⚡",
    category: "skill",
    rarity: "rare",
    xpReward: 600,
    unlockedAt: "2024-03-01",
    secret: false
  },
  {
    id: "ach-9",
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
];

export const certifications = [
  {
    id: "cert-1",
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2026-02",
    expiry: "2029-02",
    credentialId: "TODO", // TODO: Add from certificate
    url: "https://aws.amazon.com/verification" // TODO: Verify
  },
  {
    id: "cert-2",
    name: "AWS Certified AI Practitioner",
    issuer: "Amazon Web Services",
    date: "2026-06",
    expiry: "2029-06",
    credentialId: "TODO",
    url: ""
  },
  {
    id: "cert-3",
    name: "AWS Academy Cloud Foundations",
    issuer: "Amazon Web Services",
    date: "2026-02",
    expiry: "2029-02",
    credentialId: "TODO",
    url: ""
  }
];

export const contact = {
  email: "vaibhava.kumar@example.com", // TODO: Verify from resume PDF hyperlink
  github: "https://github.com/vaibhava-shrivastav",
  linkedin: "https://www.linkedin.com/in/vaibhavakumarshrivastav/",
  location: "Lucknow, Uttar Pradesh, India",
  timezone: "UTC+5:30",
  availability: "Open to opportunities",
  preferredContact: "email"
};

export const site = {
  title: "Vaibhava Kumar Shrivastav | Full Stack Developer",
  description: "Full Stack Developer • AWS Enthusiast • Building GLA Exchange • Netflix-inspired portfolio",
  ogImage: "assets/images/og-image.png", // TODO: Create
  favicon: "assets/favicon.ico",
  themeColor: "#E50914",
  lang: "en",
  canonical: "https://vaibhava-shrivastav.vercel.app", // TODO: Update after deploy
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
};

// Default export for convenience
export default {
  profile,
  experience,
  education,
  skills,
  projects,
  achievements,
  certifications,
  contact,
  site,
  easterEggs
};