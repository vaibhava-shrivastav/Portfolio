/**
 * ==========================================================================
 * Netflix-Inspired Developer Portfolio — Main Application
 * ==========================================================================
 * App bootstrap, routing, state machine, section rendering.
 * ==========================================================================
 */

const App = (() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  let currentSection = 'home';
  let isScrolling = false;
  let scrollSpyObserver = null;

  // ---------------------------------------------------------------------------
  // DOM ELEMENTS
  // ---------------------------------------------------------------------------
  let navEl, navLinks, mobileToggle, mainContent, sections;

  const cacheElements = () => {
    navEl = document.querySelector('.nav');
    navLinks = document.querySelectorAll('.nav__link');
    mobileToggle = document.querySelector('.nav__mobile-toggle');
    mainContent = document.getElementById('main-content');
    sections = document.querySelectorAll('section[id]');
  };

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------
  const init = async () => {
    cacheElements();

    // Initialize intro sequence first
    if (window.Intro) {
      await window.Intro.init();
    }

    // Initialize XP system
    if (window.XP) {
      window.XP.init();
      setupXPListeners();
    }

    // Initialize Terminal
    if (window.Terminal) {
      window.Terminal.init();
    }

    // Render dynamic content from DATA
    renderAllSections();

    // Setup navigation
    setupNavigation();
    setupScrollSpy();
    setupMobileMenu();
    setupSmoothScroll();
    setupContactForm();
    setupAnimations();

    // Keyboard navigation
    setupKeyboardNav();

    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('app:ready'));

    console.log('[App] Initialized');
  };

  // ---------------------------------------------------------------------------
  // XP EVENT LISTENERS
  // ---------------------------------------------------------------------------
  const setupXPListeners = () => {
    window.XP.on('xpChange', (state) => {
      updateXPDisplay(state);
    });

    window.XP.on('levelUp', (data) => {
      showToast(`Level Up! You're now ${data.title}!`, 'success', 5000);
      if (window.Terminal) {
        window.Terminal.outputText(`🎉 LEVEL UP! Level ${data.newLevel} — ${data.title}`, 'terminal__levelup');
      }
    });

    window.XP.on('achievementUnlock', (data) => {
      showToast(`Achievement Unlocked: ${data.achievement.title}`, 'success', 6000);
    });
  };

  const updateXPDisplay = (state) => {
    // Update hero stats if they exist
    const xpElements = document.querySelectorAll('[data-xp-display]');
    xpElements.forEach(el => {
      el.textContent = `${state.xp.toLocaleString()} / ${state.xpToNext === Infinity ? 'MAX' : state.xpToNext.toLocaleString()}`;
    });

    // Update level displays
    const levelElements = document.querySelectorAll('[data-level-display]');
    levelElements.forEach(el => {
      el.textContent = `Level ${state.level}`;
    });
  };

  // ---------------------------------------------------------------------------
  // SECTION RENDERING
  // ---------------------------------------------------------------------------
  const renderAllSections = () => {
    renderAbout();
    renderExperience();
    renderProjects();
    renderSkills();
    renderFooterProjects();
  };

  const renderAbout = () => {
    const profile = window.DATA?.profile;
    if (!profile) return;

    // Bio
    const bioEl = document.getElementById('about-bio');
    if (bioEl && profile.bio) {
      bioEl.innerHTML = profile.bio.split('\n').map(p => `<p>${p.trim()}</p>`).join('');
    }

    // Quick facts
    const factsEl = document.getElementById('about-facts');
    if (factsEl) {
      const facts = [
        { label: 'Name', value: profile.name },
        { label: 'Role', value: profile.headline },
        { label: 'Location', value: profile.location },
        { label: 'Email', value: profile.email },
        { label: 'GitHub', value: '<a href="' + profile.github + '" target="_blank" rel="noopener">@vaibhava-shrivastav</a>' },
        { label: 'LinkedIn', value: '<a href="' + profile.linkedin + '" target="_blank" rel="noopener">/in/vaibhavakumarshrivastav</a>' },
        { label: 'Level', value: `${profile.stats.level} (${profile.stats.xp}/${profile.stats.xpToNext} XP)` },
        { label: 'Class', value: profile.stats.class },
        { label: 'Specialization', value: profile.stats.specialization }
      ];

      factsEl.innerHTML = facts.map(f => `
        <div class="about__fact">
          <dt class="text-tertiary text-sm">${f.label}</dt>
          <dd class="text-secondary">${f.value}</dd>
        </div>
      `).join('');
    }

    // Tech stack
    const techEl = document.getElementById('about-tech');
    if (techEl && window.DATA?.skills?.top) {
      const gridEl = techEl.querySelector('[role="list"]');
      if (gridEl) {
        gridEl.innerHTML = window.DATA.skills.top.map(skill => `
          <div class="badge badge--neutral" role="listitem">${skill}</div>
        `).join('');
      }
    }
  };

  const renderExperience = () => {
    const timelineEl = document.getElementById('experience-timeline');
    const experience = window.DATA?.experience || [];
    if (!timelineEl) return;

    timelineEl.innerHTML = experience.map((exp, index) => `
      <article class="timeline__item card card--glass animate-slide-up" style="animation-delay: ${index * 100}ms" role="listitem">
        <div class="card__body">
          <div class="flex justify-between items-start flex-wrap gap-4 mb-3">
            <div>
              <h3 class="font-display text-xl text-primary">${exp.company}</h3>
              <p class="text-secondary">${exp.role}</p>
            </div>
            <div class="flex flex-col items-end text-tertiary text-sm">
              <span>${exp.period}</span>
              <span>${exp.location}</span>
              <span class="badge badge--neutral">${exp.type}</span>
            </div>
          </div>
          <p class="text-secondary mb-4">${exp.description}</p>

          ${exp.highlights.length > 0 ? `
            <h4 class="font-semibold text-tertiary mb-2">Key Achievements</h4>
            <ul class="experience__highlights" role="list">
              ${exp.highlights.map(h => `<li class="flex items-start gap-2"><span class="text-terminal text-sm">▸</span>${h}</li>`).join('')}
            </ul>
          ` : ''}

          <div class="flex flex-wrap gap-2 mt-4" role="list" aria-label="Technologies">
            ${exp.tech.map(t => `<span class="badge badge--neutral" role="listitem">${t}</span>`).join('')}
          </div>

          ${exp.metrics && Object.keys(exp.metrics).length > 0 ? `
            <div class="experience__metrics flex flex-wrap gap-6 mt-4 pt-4 border-t border-border-subtle">
              ${Object.entries(exp.metrics).map(([k, v]) => `
                <div class="metric">
                  <span class="font-mono text-lg text-primary">${v}</span>
                  <span class="text-tertiary text-sm">${k}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </article>
    `).join('');
  };

  const renderProjects = () => {
    const gridEl = document.getElementById('projects-grid');
    const projects = window.DATA?.projects || [];
    if (!gridEl) return;

    const renderProjectCard = (proj) => `
      <article class="card card--glass project-card" role="listitem" data-project="${proj.slug}" data-status="${proj.status.toLowerCase()}" data-featured="${proj.featured}">
        <div class="card__media">
          <div class="project-card__placeholder" style="aspect-ratio: 16/9; background: var(--color-bg-tertiary); display: flex; align-items: center; justify-content: center;">
            <span class="font-display text-4xl text-border-default">${proj.title.charAt(0)}</span>
          </div>
        </div>
        <div class="card__body">
          <div class="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 class="font-display text-xl text-primary">${proj.title}</h3>
              <p class="text-tertiary text-sm">${proj.tagline}</p>
            </div>
            <span class="badge badge--${proj.featured ? 'primary' : 'neutral'}">${proj.status}</span>
          </div>
          <p class="text-secondary text-sm mb-4 truncate-3">${proj.description}</p>
          <div class="flex flex-wrap gap-2 mb-4" role="list" aria-label="Technologies">
            ${proj.tech.slice(0, 6).map(t => `<span class="badge badge--neutral" role="listitem">${t}</span>`).join('')}
            ${proj.tech.length > 6 ? `<span class="badge badge--neutral">+${proj.tech.length - 6} more</span>` : ''}
          </div>
        </div>
        <div class="card__footer flex justify-between items-center">
          <span class="font-mono text-xs text-tertiary">${proj.period}</span>
          <div class="flex gap-2">
            ${proj.demoUrl ? `<a href="${proj.demoUrl}" target="_blank" rel="noopener" class="btn btn--ghost btn--sm" data-xp-action="click_demo">Demo</a>` : ''}
            ${proj.repoUrl ? `<a href="${proj.repoUrl}" target="_blank" rel="noopener" class="btn btn--terminal btn--sm" data-xp-action="click_repo">Code</a>` : ''}
            <button type="button" class="btn btn--secondary btn--sm project-card__details" data-project="${proj.slug}" aria-label="View ${proj.title} details">Details</button>
          </div>
        </div>
      </article>
    `;

    gridEl.innerHTML = projects.map(renderProjectCard).join('');

    // Add click handlers for detail buttons
    gridEl.querySelectorAll('.project-card__details').forEach(btn => {
      btn.addEventListener('click', () => openProjectModal(btn.dataset.project));
    });

    // Project card click for XP
    gridEl.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a, button')) {
          window.XP?.addXP(50, 'project_view');
          window.XP?.checkAchievements('project_view', document.querySelectorAll('.project-card:not([hidden])').length);
        }
      });
    });

    // Setup filter buttons
    setupProjectFilters();
  };

  const setupProjectFilters = () => {
    const filterBtns = document.querySelectorAll('.projects__filter-btn');
    const cards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter cards
        cards.forEach(card => {
          const status = card.dataset.status;
          const featured = card.dataset.featured === 'true';

          let show = false;
          switch (filter) {
            case 'all': show = true; break;
            case 'featured': show = featured; break;
            case 'production': show = status === 'production'; break;
            case 'open-source': show = status === 'open source'; break;
          }

          card.hidden = !show;
          if (show) card.classList.add('animate-fade-in');
        });
      });
    });
  };

  const openProjectModal = (slug) => {
    const project = (window.DATA?.projects || []).find(p => p.slug === slug);
    if (!project) return;

    // Create modal dynamically
    const modal = document.createElement('dialog');
    modal.className = 'project-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    modal.innerHTML = `
      <div class="project-modal__backdrop" tabindex="-1"></div>
      <div class="project-modal__panel">
        <header class="project-modal__header">
          <h2 id="modal-title" class="font-display text-3xl text-primary">${project.title}</h2>
          <button type="button" class="project-modal__close" aria-label="Close modal">&times;</button>
        </header>
        <div class="project-modal__body">
          <div class="project-modal__media">
            <div class="project-modal__placeholder" style="aspect-ratio: 16/9; background: var(--color-bg-tertiary); border-radius: var(--radius-md);">
              <span class="font-display text-6xl text-border-default">${project.title.charAt(0)}</span>
            </div>
          </div>
          <div class="project-modal__content">
            <p class="text-secondary">${project.longDescription || project.description}</p>

            <div class="project-modal__meta grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
              <div>
                <h4 class="font-semibold text-tertiary mb-2">Tech Stack</h4>
                <div class="flex flex-wrap gap-2">
                  ${project.tech.map(t => `<span class="badge badge--neutral">${t}</span>`).join('')}
                </div>
              </div>
              <div>
                <h4 class="font-semibold text-tertiary mb-2">Highlights</h4>
                <ul class="space-2">
                  ${project.highlights.map(h => `<li class="flex items-start gap-2"><span class="text-terminal text-sm">▸</span>${h}</li>`).join('')}
                </ul>
              </div>
              ${project.metrics && Object.keys(project.metrics).length > 0 ? `
                <div>
                  <h4 class="font-semibold text-tertiary mb-2">Metrics</h4>
                  <div class="flex flex-wrap gap-6">
                    ${Object.entries(project.metrics).map(([k, v]) => `
                      <div class="metric text-center">
                        <div class="font-mono text-xl text-primary">${v}</div>
                        <div class="text-tertiary text-xs">${k}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="project-modal__actions flex gap-4 flex-wrap mt-6 pt-4 border-t border-border-subtle">
              ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener" class="btn btn--primary" data-xp-action="click_demo">Live Demo</a>` : ''}
              ${project.repoUrl ? `<a href="${project.repoUrl}" target="_blank" rel="noopener" class="btn btn--terminal" data-xp-action="click_repo">View Code</a>` : ''}
              ${project.docsUrl ? `<a href="${project.docsUrl}" target="_blank" rel="noopener" class="btn btn--secondary">Documentation</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.showModal();
    document.body.style.overflow = 'hidden';

    // Close handlers
    const closeModal = () => {
      modal.close();
      document.body.style.overflow = '';
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('.project-modal__close').addEventListener('click', closeModal);
    modal.querySelector('.project-modal__backdrop').addEventListener('click', closeModal);
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // XP for viewing project detail
    window.XP?.addXP(50, 'project_detail_view');
  };

  const renderSkills = () => {
    const gridEl = document.getElementById('skills-grid');
    const categories = window.DATA?.skills?.categories || [];
    if (!gridEl) return;

    gridEl.innerHTML = categories.map((cat, catIndex) => `
      <article class="card card--glass skill-category animate-slide-up" style="animation-delay: ${catIndex * 100}ms" role="listitem">
        <div class="card__body">
          <header class="skill-category__header flex items-center gap-3 mb-6">
            <span class="skill-category__icon" style="font-size: 2rem;">${cat.icon}</span>
            <h3 class="font-display text-2xl" style="color: ${cat.color}">${cat.name}</h3>
          </header>
          <div class="skill-category__skills" role="list">
            ${cat.items.map((skill, skillIndex) => `
              <div class="skill-item animate-slide-up" style="animation-delay: ${(catIndex * 100) + (skillIndex * 50)}ms" role="listitem">
                <div class="flex justify-between items-center mb-1">
                  <span class="font-medium text-secondary">${skill.name}</span>
                  <span class="font-mono text-xs text-tertiary">${skill.level}%</span>
                </div>
                <div class="skill-bar" style="height: 6px; background: var(--color-bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
                  <div class="skill-bar__fill" style="width: 0%; height: 100%; background: ${cat.color}; border-radius: var(--radius-full); transition: width 1s ease-out ${(catIndex * 100) + (skillIndex * 50)}ms;" data-width="${skill.level}%"></div>
                </div>
                <span class="font-mono text-xs text-tertiary mt-1">${skill.years}+ years</span>
              </div>
            `).join('')}
          </div>
        </div>
      </article>
    `).join('');

    // Animate skill bars on scroll
    const animateSkillBars = () => {
      gridEl.querySelectorAll('.skill-bar__fill').forEach(bar => {
        const rect = bar.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
          bar.style.width = bar.dataset.width;
        }
      });
    };

    window.addEventListener('scroll', animateSkillBars, { passive: true });
    animateSkillBars(); // Initial check
  };

  const renderFooterProjects = () => {
    const footerProjectsEl = document.getElementById('footer-projects');
    const featuredProjects = (window.DATA?.projects || []).filter(p => p.featured).slice(0, 4);
    if (!footerProjectsEl) return;

    footerProjectsEl.innerHTML = featuredProjects.map(p => `
      <li><a href="#projects" class="text-tertiary hover:text-primary transition-colors">${p.title}</a></li>
    `).join('');
  };

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------
  const setupNavigation = () => {
    // Nav link clicks
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href?.startsWith('#')) {
          navigateTo(href.slice(1));
        }
      });
    });

    // Update active nav on scroll
    const updateActiveNav = () => {
      let current = 'home';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) {
          current = section.id;
        }
      });

      navLinks.forEach(link => {
        const isActive = link.dataset.nav === current;
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
      });

      currentSection = current;
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  };

  const navigateTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${sectionId}`);

      // Close mobile menu
      closeMobileMenu();
    }
  };

  const setupSmoothScroll = () => {
    // Handle hash on load
    if (window.location.hash) {
      setTimeout(() => {
        const section = document.querySelector(window.location.hash);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const setupMobileMenu = () => {
    if (!mobileToggle) return;

    const navLinksEl = document.querySelector('.nav__links');

    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.toggle('nav__links--open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.querySelector('.nav__hamburger').classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinksEl.classList.contains('nav__links--open')) {
        closeMobileMenu();
      }
    });
  };

  const closeMobileMenu = () => {
    const navLinksEl = document.querySelector('.nav__links');
    if (navLinksEl?.classList.contains('nav__links--open')) {
      navLinksEl.classList.remove('nav__links--open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.querySelector('.nav__hamburger').classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ---------------------------------------------------------------------------
  // SCROLL SPY & ANIMATIONS
  // ---------------------------------------------------------------------------
  const setupScrollSpy = () => {
    // IntersectionObserver for section animations
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section--visible');

          // Track scroll milestones for XP
          const sectionIndex = Array.from(sections).indexOf(entry.target);
          const percentage = ((sectionIndex + 1) / sections.length) * 100;
          window.XP?.trackScroll(percentage);
        }
      });
    }, observerOptions);

    sections.forEach(section => scrollSpyObserver.observe(section));
  };

  const setupAnimations = () => {
    // Stagger animation for elements with .animate-slide-up
    const animatedElements = document.querySelectorAll('.animate-slide-up:not(.animated)');

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animationObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => animationObserver.observe(el));
  };

  // ---------------------------------------------------------------------------
  // CONTACT FORM
  // ---------------------------------------------------------------------------
  const setupContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Validate
      const errors = validateContactForm(data);
      if (Object.keys(errors).length > 0) {
        showFormErrors(form, errors);
        return;
      }

      // Submit (simulate)
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));

        showToast('Message sent successfully!', 'success');
        form.reset();
        window.XP?.addXP(200, 'contact_form');
      } catch (err) {
        showToast('Failed to send message. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  };

  const validateContactForm = (data) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Name is required';
    if (!data.email?.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
    if (!data.subject?.trim()) errors.subject = 'Subject is required';
    if (!data.message?.trim()) errors.message = 'Message is required';
    return errors;
  };

  const validateField = (input) => {
    const value = input.value.trim();
    let error = '';

    if (input.required && !value) error = `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is required`;
    else if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';

    if (error) showFieldError(input, error);
    else clearFieldError(input);

    return !error;
  };

  const showFieldError = (input, message) => {
    clearFieldError(input);
    input.classList.add('input--error');
    const errorEl = document.createElement('span');
    errorEl.className = 'input__error text-error text-sm';
    errorEl.textContent = message;
    input.parentNode.appendChild(errorEl);
  };

  const clearFieldError = (input) => {
    input.classList.remove('input--error');
    const errorEl = input.parentNode.querySelector('.input__error');
    if (errorEl) errorEl.remove();
  };

  const showFormErrors = (form, errors) => {
    Object.entries(errors).forEach(([field, message]) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) showFieldError(input, message);
    });
  };

  // ---------------------------------------------------------------------------
  // KEYBOARD NAVIGATION
  // ---------------------------------------------------------------------------
  const setupKeyboardNav = () => {
    // Skip link handling
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('main-content');
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      });
    }
  };

  // ---------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // ---------------------------------------------------------------------------
  const showToast = (message, type = 'info', duration = 4000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type} animate-slide-in-right`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast__icon" aria-hidden="true">${icons[type] || icons.info}</span>
      <span class="toast__message">${message}</span>
      <button type="button" class="toast__close" aria-label="Dismiss">&times;</button>
    `;

    container.appendChild(toast);

    // Auto dismiss
    const timer = setTimeout(() => dismissToast(toast), duration);

    // Manual dismiss
    toast.querySelector('.toast__close').addEventListener('click', () => {
      clearTimeout(timer);
      dismissToast(toast);
    });
  };

  const dismissToast = (toast) => {
    toast.classList.remove('animate-slide-in-right');
    toast.classList.add('animate-slide-out-right');
    setTimeout(() => toast.remove(), 300);
  };

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  const api = {
    init,
    navigateTo,
    showToast,
    getCurrentSection: () => currentSection
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.App = api;
  }

  return api;
})();

export default App;