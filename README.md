# Netflix-Inspired Developer Portfolio

A cinematic, Netflix-inspired developer portfolio built for the **AWS Student Builder Challenge**. Features an interactive terminal with RPG mechanics, XP/level progression, achievements, and a fully responsive design system extracted from Stitch designs.

## 🎬 Features

- **Cinematic Preloader** — Netflix-style intro sequence with animated logo
- **Profile Selection** — Choose your adventure (Developer / Gamer modes)
- **Interactive Terminal** — Full CLI with 20+ commands, easter eggs, Konami code
- **RPG Mechanics** — XP, levels, stats, achievements with localStorage persistence
- **Project Showcase** — Modal details, filtering, metrics
- **Skills Visualization** — Animated skill bars, categorized expertise
- **Experience Timeline** — Work history with metrics and highlights
- **Contact Form** — Real-time validation, toast notifications
- **Full Accessibility** — Semantic HTML, keyboard navigation, ARIA labels, prefers-reduced-motion
- **Performance Optimized** — No frameworks, CSS custom properties, lazy loading ready

## 🛠 Tech Stack

- **React 18 + Vite** — Modern JavaScript framework with fast HMR
- **CSS Custom Properties** — Design tokens (colors, spacing, typography, shadows, gradients)
- **Context API** — Game state (XP, level, achievements) with localStorage persistence
- **AWS Amplify** — Static hosting with SPA rewrites, custom headers

## 📁 Project Structure

```
netflix-portfolio/
├── index.html              # Entry point
├── amplify.yml             # AWS Amplify build config
├── vite.config.js          # Vite configuration (base '/', port 5173)
├── package.json            # Dependencies and scripts
├── public/
│   ├── favicon.svg         # SVG favicon
│   ├── manifest.json       # PWA manifest
│   ├── images/             # Icons, OG image, project images
│   └── resume.pdf          # Downloadable resume
├── src/
│   ├── main.jsx            # App bootstrap
│   ├── App.jsx             # Root component with routing
│   ├── context/
│   │   └── GameContext.jsx # Global game state (XP, level, achievements)
│   ├── data/
│   │   └── profile.js      # ALL personal content (single source of truth)
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   ├── useInView.js
│   │   └── useKeyPress.js
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Experience.jsx
│   │   ├── Education.jsx
│   │   ├── Projects.jsx
│   │   ├── SkillsSheet.jsx
│   │   ├── Achievements.jsx
│   │   ├── ContactSection.jsx
│   │   ├── Terminal.jsx
│   │   ├── Toast.jsx
│   │   ├── Row.jsx
│   │   ├── Footer.jsx
│   │   └── Preloader.jsx
│   └── styles/
│       ├── tokens.css      # Design tokens (CSS custom properties)
│       ├── base.css        # Base styles, reset, typography
│       └── components.css  # Component-specific styles
└── design/
    ├── screens/            # Stitch design exports (HTML) - .gitkeep only
    └── shots/              # Stitch design screenshots (PNG) - .gitkeep only
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Local Development

```bash
# Clone the repository
git clone https://github.com/vaibhava-shrivastav/netflix-portfolio.git
cd netflix-portfolio

# Install dependencies
npm ci

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Production Build

```bash
npm run build
# Output in ./dist
```

## 🎮 Terminal Commands

Open terminal with `⌘K` (Mac) / `Ctrl+K` (Win) or click "Terminal" in nav.

| Command | Description |
|---------|-------------|
| `help` | Show all commands |
| `whoami` | Display profile |
| `stats` | Show RPG stats |
| `skills [category]` | List technical skills |
| `projects [slug]` | List/view projects |
| `experience [id]` | Show work experience |
| `education` | Show education |
| `contact` | Contact information |
| `achievements [--all]` | View achievements |
| `certs` | View certifications |
| `xp` | Show XP/level |
| `fortune` | Random dev quote |
| `matrix` | Enter the matrix |
| `coffee` | Coffee break |
| `sudo` | Try to run as root |
| `ls` | List directory |
| `clear` | Clear terminal |
| `exit` | Close terminal |

### Easter Eggs
- **Konami Code** (↑↑↓↓←→←→BA) — Unlocks "Terminal Master" achievement
- **Secret Commands** — `whoami`, `date`, `fortune`, `coffee`, `matrix`, `sudo`

## 🎨 Design System

Extracted from Stitch Project: `10673983893490798032`

### Colors
- **Primary**: `#E50914` (Netflix Red)
- **Terminal**: `#39FF14` (Terminal Green)
- **Cyan**: `#00E5FF` (Electric Cyan)
- **Backgrounds**: `#131313` / `#141414` / `#1A1A1A`
- **Glass**: `rgba(20, 20, 20, 0.85)`

### Typography
- **Display**: Bebas Neue (headlines)
- **Body**: Inter (UI text)
- **Mono**: JetBrains Mono (terminal, code)

### Spacing
- Base: 4px/8px
- Gutter: 1.5rem
- Page Margin: 2rem
- Scale: ×2

### Shadows
- Cinematic Hover
- Terminal Active
- Deep Shadow
- Glass Panels

## 📦 Deployment (AWS Amplify)

### Automatic (Recommended)
1. Push to GitHub
2. Connect repo in AWS Amplify Console
3. Amplify detects `amplify.yml` automatically
4. Deploy!

### Manual
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Deploy
amplify publish
```

### Custom Domain
1. Add domain in Amplify Console
2. Configure DNS (CNAME/ALIAS)
3. SSL provisioned automatically

## 🔧 Configuration

### Personal Data
Edit `src/data/profile.js` — **single source of truth** for all content:
- Profile info, bio, stats
- Experience, education
- Skills, projects
- Achievements, certifications
- Contact links
- Easter eggs

### Design Tokens
Edit `src/styles/tokens.css` — CSS custom properties in `:root`:
- Colors, typography, spacing
- Shadows, radii, transitions
- Grid breakpoints, z-index scale

## ♿ Accessibility

- Semantic HTML5 elements
- Keyboard navigation (Tab, Enter, Escape, Arrows)
- Visible focus states (`:focus-visible`)
- ARIA labels, roles, live regions
- `prefers-reduced-motion` support
- Skip to main content link
- Screen reader optimized

## ⚡ Performance

- **React 18** — Concurrent features, automatic batching
- **Vite** — Fast HMR, optimized production builds
- **CSS Custom Properties** — Native theming
- **Font-display: swap** — No FOIT
- **Lazy loading ready** — `loading="lazy"` on images
- **Optimized caching** — Immutable assets, long TTL
- **Code splitting** — Dynamic imports for routes

## 📝 License

MIT License — Feel free to use as inspiration for your own portfolio!

## 🤝 Credits

- **Design**: Stitch by Google
- **Fonts**: Bebas Neue, Inter, JetBrains Mono
- **Icons**: Custom SVG, Unicode emoji
- **Inspiration**: Netflix UI, Terminal aesthetics, RPG mechanics

---

**Built with ❤️ and ☕ for the AWS Student Builder Challenge**

[vaibhava-shrivastav.vercel.app](https://vaibhava-shrivastav.vercel.app) • [GitHub](https://github.com/vaibhava-shrivastav) • [LinkedIn](https://www.linkedin.com/in/vaibhavakumarshrivastav/)
