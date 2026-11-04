# Phase 1 Audit — Netflix Portfolio Redesign (Corrected)

**Date**: 2026-11-04  
**Status**: AUDIT COMPLETE & REVISED — Awaiting "approved" to begin Stage A

---

## Executive Summary

This audit establishes the ground truth by reconciling the **9 Stitch design screens** against the **current React 18 + Vite codebase** and the candidate's actual **resume (`resume.pdf`)**.

**Key Principles**:
1. All portfolio facts derive strictly from `resume.pdf` via `src/data/profile.js`.
2. No fabricated facts, metrics, team sizes, soft skills, or placeholder entities (e.g. EduPort, TaskFlow).
3. No phone number anywhere in `src/` or `dist/`.
4. High visual fidelity to Stitch designs using vanilla CSS custom properties (no Tailwind, no external UI frameworks).
5. Phased branch-and-PR execution model (Stage A through Stage F) branching from `dev`.

---

## Step 1: Real `profile.js` Facts Table (Reconciled with Resume)

### Top-Level Exported Keys in `src/data/profile.js`
`profile`, `experience`, `education`, `skills`, `projects`, `gameAchievements`, `accomplishments`, `certifications`, `contact`, `site`, `easterEggs`.

### Core Profile Facts
| Field | Real Value in `profile.js` | Source / Resume Reality |
|---|---|---|
| **Name** | "Vaibhava Kumar Shrivastav" | ✅ Exact match on resume |
| **Headline** | "B.Tech Computer Science Student · Full-Stack & Cloud Builder" | ✅ Grounded in education & skills |
| **Tagline** | "Building scalable systems, one commit at a time." | ✅ Grounded UI copy |
| **Pronoun** | "he/him" | ✅ Display metadata |
| **Location** | "Lucknow, Uttar Pradesh, India" | ✅ Resume: "Lucknow, Uttar Pradesh" |
| **Email** | "vaibhavakumarshrivastav@gmail.com" | ✅ Real email from resume |
| **Website** | "https://glaexchange.online" | ✅ Live project domain from resume |
| **GitHub** | "https://github.com/vaibhava-shrivastav" | ✅ Real profile link from resume |
| **LinkedIn** | "https://www.linkedin.com/in/vaibhavakumarshrivastav/" | ✅ Real profile link from resume |
| **Resume URL** | "/resume.pdf" | ✅ Real resume file |
| **Phone Number** | **NONE** | ✅ Confirmed zero phone fields or numbers anywhere in `src/` |

---

### Work Experience (Exactly 1 Real Entry)
The candidate has only one professional internship. Projects (GLA Exchange and EduCloud) are cataloged under Projects, not Experience.

| # | Company | Role | Period | Type | Tech | Highlights |
|---|---|---|---|---|---|---|
| 1 | **Astrea IT Services Pvt. Ltd.** | Salesforce Development Intern | Jun 2026 — Jul 2026 | Internship | Salesforce.com cloud computing development platform | Completed hands-on training program on Salesforce.com cloud computing platform; practical exposure to cloud-based application development & platform architecture. |

---

### Education (Reconciled from Resume)
| # | Institution | Degree / Certificate | Field | Period | Score | Details |
|---|---|---|---|---|---|---|
| 1 | **GLA University, Mathura** | Bachelor of Technology | Computer Science | 2024 — 2028 | CPI: 8.8 | Core CS degree program |
| 2 | **Adani Public School** | Intermediate (Class XII) | — | 2023 | 89.8% | Senior secondary |
| 3 | **Shri O.P Jindal Vidya Niketan** | High School (Class X) | — | 2021 | 86.2% | Secondary |

---

### Projects (Both REAL — Must Both Be in Projects)
Mock projects from Stitch (`EduPort`, `TaskFlow`) are strictly forbidden. Only the 2 real projects from the resume exist:

| # | Slug | Title | Tagline | Timeline | Role | Tech Stack | Links / Live | Highlights |
|---|---|---|---|---|---|---|---|---|
| 1 | `gla-exchange` | **GLA Exchange** | Campus Marketplace Platform | Jan 2026 — May 2026 | Full-Stack Project | MERN Stack, Socket.io, JWT, Google OAuth, Cloudinary, MongoDB Atlas, Render | `https://glaexchange.online`, GitHub repo | Fullstack peer-to-peer marketplace with 20+ modules, real-time chat, OAuth 2.0, Cloudinary CDN, admin portal, Helmet.js, rate limiting, CORS whitelist, SEO with sitemap.xml. |
| 2 | `educloud` | **EduCloud** | Managed Cloud Learning Platform | Feb 2026 — Apr 2026 | Collaborative Project | AWS, Terraform, IAM, VPC, EC2, S3 | GitHub repo | Cloud platform provisioning isolated, fault-tolerant AWS student environments with Terraform IaC, multi-tenant IAM RBAC and VPC network isolation. |

---

### Skills Categories (Exactly the 6 Resume Categories)
No "Soft Skills", no XP purchase cost, and no rarity badges on individual skills. Every skill percentage is marked `// SELF-ASSESSED: confirm` and shown numerically as text.

| # | Category Name | Icon | Accent Variable | Real Items from Resume |
|---|---|---|---|---|
| 1 | **Languages** | 🔤 | `var(--color-cyan)` | Java, Python, JavaScript |
| 2 | **Frameworks & Libraries** | ⚛️ | `var(--color-terminal)` | ReactJS, Node.js, Express.js, MERN Stack |
| 3 | **Cloud & DevOps** | ☁️ | `var(--color-primary)` | AWS (EC2, S3, IAM, VPC), Terraform, Docker, Cloud Architecture, Multitenant Environments |
| 4 | **Databases** | 🗄️ | `var(--color-warning)` | MongoDB, MySQL, Distributed Storage Design |
| 5 | **CS Fundamentals** | 📚 | `var(--color-info)` | Data Structures & Algorithms, OOP, REST APIs, System Design, Distributed Computing |
| 6 | **Developer Tools** | 🛠️ | `var(--color-success)` | Git, GitHub, VS Code, IntelliJ IDEA |

---

### Real Accomplishments & Certifications (From Resume — Separate from Game Achievements)
#### Real Certifications (Cards in profile.js)
1. **AWS Certified Cloud Practitioner** (2026) — Amazon Web Services
2. **AWS Certified AI Practitioner** (2026) — Amazon Web Services
3. **AWS Academy Graduate Cloud Foundations** (Feb 2026) — Amazon Web Services

#### Real Accomplishments (Cards in profile.js)
1. **LeetCode 150+ Problems** — Solved 150+ DSA problems (arrays, trees, graphs, DP).
2. **Codeforces Rating 880+** — Competitive programming under timed multi-constraint conditions.
3. **Smart India Hackathon (SIH)** — 5-member team that qualified the internal round.

---

### Game Achievements List (Exactly 10 Badges — Visual Only, 0 XP)
Distinct from resume certifications/accomplishments. Achievements do not award XP; XP is earned strictly via the action table below. Locked achievements display as dimmed silhouettes with unlock hints.

| # | Key | Title / Name | Category | Rarity (Visual Only) | Trigger / Hint |
|---|---|---|---|---|---|
| 1 | `pilot_episode` | **Pilot Episode** | Milestone | Common | Complete preloader & enter portfolio |
| 2 | `found_the_terminal` | **Found the Terminal** | Exploration | Common | Press \` or click terminal button |
| 3 | `project_binge` | **Project Binge** | Exploration | Rare | Open both project detail modals |
| 4 | `skill_collector` | **Skill Collector** | Exploration | Rare | Expand all 6 skill categories |
| 5 | `reached_out` | **Reached Out** | Interaction | Rare | Submit message via contact form |
| 6 | `konami_master` | **Konami Master** | Secret | Mythic | Enter Konami code (`↑↑↓↓←→←→BA`) |
| 7 | `cloud_native` | **Cloud Native** | Project | Epic | Open EduCloud project modal |
| 8 | `shipped_it` | **Shipped It** | Project | Epic | Open GLA Exchange project modal |
| 9 | `certified` | **Certified** | Accomplishment | Legendary | View the certifications section |
| 10 | `full_run` | **Full Run** | Milestone | Mythic | Reach Level 5 ("Hired!") |

---

### XP Action Table & Level Progression
XP is earned solely through discrete user actions:

| Action | XP Award | Limits |
|---|---|---|
| Profile Select (Persona chosen) | +20 XP | Once |
| About section viewed | +30 XP | Once |
| Project modal opened (GLA Exchange, EduCloud) | +25 XP each | Max 2 (+50 XP) |
| Skills section viewed | +30 XP | Once |
| Terminal first opened | +50 XP | Once |
| Unique terminal commands entered (17 allowed) | +10 XP each | Max 17 (+170 XP) |
| Secret command or Konami code | +100 XP | Once |
| Achievements section viewed | +20 XP | Once |
| Contact section viewed | +20 XP | Once |
| External links clicked (GitHub, LinkedIn, Resume) | +15 XP each | Max 3 (+45 XP) |
| Contact form submitted | +20 XP | Once |

**Sum of All Possible XP**:
20 + 30 + 50 + 30 + 50 + 170 + 100 + 20 + 20 + 45 + 20 = **555 XP**  
(Even with only 12 terminal commands executed: 385 + 120 = 505 XP)  
**Level Thresholds**:
- Level 1: **Curious Visitor** — 0 XP
- Level 2: **Explorer** — 100 XP
- Level 3: **Insider** — 200 XP
- Level 4: **Power User** — 350 XP
- Level 5: **Hired!** — 500 XP  
**Verification**: Total available XP (555 XP) ≥ 500 XP required for Level 5. Level 5 is fully reachable.

---

## Step 2: Key Architecture & Feature Decisions

| Feature / Area | Decision & Requirement |
|---|---|
| **a) Profile Select** | 4 visitor personas: **Recruiter**, **Hiring Manager**, **Fellow Dev**, **Hackathon Judge**. Uses Stitch tile layout with hover/focus glow. Displays visitor's real live XP and level from `GameContext`. Selecting awards **+20 XP once**, customizes the hero tagline, and rearranges section row order (Recruiter: resume & skills first; Hiring Manager: projects first; Fellow Dev: terminal hint & GitHub first; Judge: AWS services & terminal first). "Switch profile" is accessible from the navbar avatar menu. |
| **b) Preloader** | Builds **only the real full-screen preloader**: SVG ribbon V drawing in, glow, zoom & fade, light streaks, terminal ticks, and name line. Does **NOT** build the 3-frame storyboard or the decorative mobile phone frame. Fixed duration under 3 seconds. Skip button, any key or tap skips immediately. Runs once per session via `sessionStorage`. Under `prefers-reduced-motion`, displays a static V for 800 ms. |
| **c) Skills Sheet** | RPG character-sheet look with the **six real categories**. No "Soft Skills", no XP purchase cost, and no rarity badges on skills. Level bars only, with the number shown as text, marked `// SELF-ASSESSED: confirm`. Expandable on click or tap with a button and `aria-expanded` (no hover expansion). |
| **d) Achievements** | Rarity colors and glows serve as gamified visual accents. List is **exactly the 10 items** above. Locked achievements display as dimmed silhouettes with unlock hints. Real certifications and resume accomplishments are rendered on separate dedicated cards. |
| **e) Project Modal** | Reconciled strictly from resume facts: hero media (gradient fallback), role/timeline, description from resume bullets, tech chips, and real links (`glaexchange.online` for GLA Exchange; GitHub profile/repo for both). Zero fabricated metrics, outcomes, team sizes, or fake "Case Study" links. External links open with `target="_blank"` and `rel="noopener noreferrer"`; modal remains open. |
| **f) Terminal Commands** | **Exact allowed commands**: `help`, `whoami`, `about`, `skills`, `skills --level`, `projects`, `play <project>`, `achievements`, `experience`, `education`, `resume`, `contact`, `github`, `linkedin`, `deploy --global`, `theme <neon\|pastel\|dark>`, `clear`, closest-match suggestion for unknown commands, hidden `secret`, and Konami code (matrix rain 4s, personal message, +100 XP). Visible commands `xp`, `levelup`, `echo`, and `matrix` are removed. Opens with \` key (ignored while input/textarea is focused) or button; closes with `Esc`. Fixed bottom slide-up panel (50% desktop height, full width mobile) with no dragging, resizing, or minimize controls. Session-only command history. Closes automatically when a project modal opens. `deploy` command names only candidate's AWS services: Amplify, CloudFront, API Gateway, Lambda, SES. |
| **g) Toasts** | One visible at a time, queued in `GameContext`, auto-dismisses after 5 seconds, includes close button, uses `aria-live="polite"`. |
| **h) Carousel** | Finite scroll-snap carousel (no infinite looping). Arrow buttons on desktop, touch-swipe on mobile, full keyboard navigation support. |
| **i) Hero** | CSS-only background effects (radial flare, light streaks); zero canvas or WebGL overhead. Terminal-style greeting (`> VAIBHAVA.K.SHRIVASTAV`) types in character-by-character, but renders instantaneously under `prefers-reduced-motion`. Real-time stats (XP, Level, Projects, Achievements) read from `GameContext` and `profile.js`. |
| **j) Tokens** | Complete replacement of `src/styles/tokens.css` with authoritative values from Stitch (pure black `#000000` background, white-opacity borders, 4-stop primary gradient, wide 0.24em tracking for subtitles). Keeps Oswald fallback for Bebas Neue. Mobile-first (320px minimum, 360px & 390px primary targets). Verified WCAG AA contrast. |
| **k) Audit Commit** | `docs/phase1-audit.md` is committed only on the Stage A branch (`feature/redesign-foundation`), never directly to `dev`. |

---

## Step 3: Revised Stage Implementation Plan (A through F)

Each stage branches from an up-to-date `dev` (`git checkout dev && git pull`) and terminates with commit, push, PR creation (with compare URL, title, and detailed description), then stops and waits for user confirmation ("merged") before proceeding.

### Stage A: `feature/redesign-foundation`
- **Scope**:
  - `src/styles/tokens.css` — Complete rewrite from Stitch designs
  - `src/styles/base.css` — Reset, typography, scrollbar, focus outlines
  - `src/styles/components.css` — Foundation component styles
  - `index.html` — Fonts preload & head tags
  - `src/components/Navbar.jsx` — Red V brand mark, link underline animation, live XP bar, avatar menu with "Switch Profile", mobile hamburger drawer, solid-on-scroll background, scroll-spy navigation
  - `src/components/Footer.jsx` — Clean footer with copyright, links, and "Reset progress" link (clears game state)
  - `docs/phase1-audit.md` — Authoritative audit file included in this branch

### Stage B: `feature/redesign-preloader-profile`
- **Scope**:
  - `src/components/Preloader.jsx` — SVG ribbon V drawing animation, glow, zoom-fade, light streaks, terminal ticks, name line, skip button, session gating, reduced-motion fallback
  - `src/components/ProfileSelect.jsx` — 4 persona tiles (Recruiter, Hiring Manager, Fellow Dev, Hackathon Judge) with real XP/level, +20 XP grant, session persistence, hero & row ordering signals
  - `src/App.jsx` — Flow integration (Preloader → Profile Select → Main Portfolio)

### Stage C: `feature/redesign-home`
- **Scope**:
  - `src/components/Hero.jsx` — Bebas Neue title, typewriter greeting, CSS flare/streaks, dynamic stats, CTA buttons
  - `src/components/Projects.jsx` & `src/components/Row.jsx` — Finite scroll-snap carousel with desktop arrows & mobile touch swipe
  - `src/components/ProjectModal.jsx` — Resume-grounded modal with media, role, timeline, bullets, tech chips, external links (target blank + noopener), focus trap, backdrop/Esc dismiss

### Stage D: `feature/redesign-skills-xp`
- **Scope**:
  - `src/components/SkillsSheet.jsx` — 6 resume categories, RPG character sheet layout, text percentage bars, `// SELF-ASSESSED: confirm`, click/tap expansion with `aria-expanded`
  - `src/components/Achievements.jsx` — Exactly 10 game achievements with rarity colors/glows, dimmed locked states with hints; separate sections for AWS Certifications and Accomplishments cards
  - `src/components/Toast.jsx` — Single-queue polite toast notification
  - `src/context/GameContext.jsx` — XP engine with idempotent action IDs, React StrictMode safety, level thresholds (1: Curious Visitor 0 XP, 2: Explorer 100 XP, 3: Insider 200 XP, 4: Power User 350 XP, 5: Hired! 500 XP), "You've seen it all" banner at Level 5

### Stage E: `feature/redesign-terminal`
- **Scope**:
  - `src/components/Terminal.jsx` — Lazy-loaded (`React.lazy`), bottom slide-up drawer (50% desktop height, full width mobile), exact allowed command list, closest-match suggestion, hidden "secret", Konami code matrix rain (4s) + personal message + 100 XP, global \` key toggle, Esc close, auto-close on modal open, session-only history

### Stage F: `feature/redesign-contact-ui`
- **Scope**:
  - `src/components/ContactSection.jsx` — Responsive contact UI, validation, hidden honeypot field, link cards (email, GitHub, LinkedIn, location)
  - `src/utils/contact.js` — Client-side `submitContact()` utility with graceful mailto/email fallback when `VITE_CONTACT_API_URL` is unset

---

## Step 4: Standing Quality & Verification Rules
1. **Fact Integrity**: All data sourced from `src/data/profile.js`. Zero phone numbers in `src/` or `dist/` (automated grep check after each build).
2. **Visual Verification**: Compare against Stitch screenshots across 360px, 390px, 768px, 1280px, and 1920px viewports. Document any intentional trade-offs honestly.
3. **Accessibility**: Semantic HTML, visible focus outlines, full keyboard navigability, ARIA expanded/live attributes, `prefers-reduced-motion` compliance, tap targets ≥ 44px, zero horizontal overflow.
4. **Bundle Performance**: Build with `npm run build` after each stage; verify bundle sizes, eliminate unused assets, and introduce no external dependencies without approval.
5. **Infrastructure**: Do not modify `amplify.yml` or backend resources during these UI stages.
