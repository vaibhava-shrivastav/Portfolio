/**
 * ==========================================================================
 * Netflix-Inspired Developer Portfolio — Intro Sequence (Preloader + Profile Select)
 * ==========================================================================
 * Handles cinematic preloader animation and profile selection gate.
 * Uses sessionStorage for intro gate (shown once per session).
 * ==========================================================================
 */

const Intro = (() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------------------------
  const CONFIG = {
    // Preloader timing
    preloader: {
      minDuration: 2000,      // Minimum time to show preloader
      logoRevealDelay: 300,   // Delay before logo animation
      progressDuration: 1500, // Progress bar animation duration
      fadeOutDuration: 500    // Fade out duration
    },
    // Profile select
    profileSelect: {
      autoAdvanceDelay: 3000  // Auto-advance if only one profile
    },
    // Storage
    storageKey: 'portfolio_intro_complete',
    sessionKey: 'portfolio_session_started'
  };

  // ---------------------------------------------------------------------------
  // PROFILE DEFINITIONS
  // ---------------------------------------------------------------------------
  const PROFILES = [
    {
      id: 'developer',
      name: 'Developer',
      subtitle: 'Full Stack Engineer',
      description: 'View my projects, skills, and experience',
      icon: '⚙️',
      color: 'var(--color-cyan)',
      stats: { level: 12, xp: 8450, title: 'Cloud Architect Initiate' },
      default: true
    },
    {
      id: 'gamer',
      name: 'Gamer Profile',
      subtitle: 'RPG Mode Activated',
      description: 'Experience the portfolio as an RPG character',
      icon: '🎮',
      color: 'var(--color-terminal)',
      stats: { level: 42, xp: 999999, title: 'Terminal Master' },
      secret: true
    }
  ];

  // ---------------------------------------------------------------------------
  // DOM ELEMENTS
  // ---------------------------------------------------------------------------
  let preloaderEl, profileSelectEl, progressBarEl, progressTextEl, profileOptionsEl, confirmBtn, skipBtn;

  const cacheElements = () => {
    preloaderEl = document.getElementById('preloader');
    profileSelectEl = document.getElementById('profile-select');
    progressBarEl = document.querySelector('.preloader__bar');
    progressTextEl = document.querySelector('.preloader__text');
    profileOptionsEl = document.querySelector('.profile-select__options');
    confirmBtn = document.getElementById('profile-select-confirm');
    skipBtn = document.getElementById('profile-select-skip');
  };

  // ---------------------------------------------------------------------------
  // PRELOADER ANIMATION
  // ---------------------------------------------------------------------------
  const runPreloader = () => {
    return new Promise((resolve) => {
      cacheElements();
      if (!preloaderEl) return resolve();

      const startTime = Date.now();
      let progress = 0;
      const messages = [
        'Initializing portfolio...',
        'Loading design tokens...',
        'Fetching project data...',
        'Compiling shaders...',
        'Establishing secure connection...',
        'Almost there...'
      ];
      let messageIndex = 0;

      // Animate progress bar
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const targetProgress = Math.min(elapsed / CONFIG.preloader.progressDuration, 1);

        // Eased progress
        progress = easeOutCubic(targetProgress);
        progressBarEl.style.width = `${progress * 100}%`;

        // Update message periodically
        if (progress > (messageIndex + 1) / messages.length) {
          messageIndex = Math.min(messageIndex + 1, messages.length - 1);
          progressTextEl.textContent = messages[messageIndex];
        }

        if (progress < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          // Minimum duration check
          const remaining = CONFIG.preloader.minDuration - (Date.now() - startTime);
          if (remaining > 0) {
            setTimeout(completePreloader, remaining);
          } else {
            completePreloader();
          }
        }
      };

      const completePreloader = () => {
        progressBarEl.style.width = '100%';
        progressTextEl.textContent = 'Ready!';

        // Fade out
        preloaderEl.style.transition = `opacity ${CONFIG.preloader.fadeOutDuration}ms ease-out`;
        preloaderEl.style.opacity = '0';

        setTimeout(() => {
          preloaderEl.hidden = true;
          preloaderEl.removeAttribute('aria-busy');
          showProfileSelect().then(resolve);
        }, CONFIG.preloader.fadeOutDuration);
      };

      // Start animation after logo reveal delay
      setTimeout(() => {
        preloaderEl.classList.add('preloader--active');
        requestAnimationFrame(animateProgress);
      }, CONFIG.preloader.logoRevealDelay);
    });
  };

  // Easing function
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  // ---------------------------------------------------------------------------
  // PROFILE SELECT
  // ---------------------------------------------------------------------------
  const showProfileSelect = () => {
    return new Promise((resolve) => {
      cacheElements();
      if (!profileSelectEl) return resolve();

      // Check if intro already completed this session
      if (sessionStorage.getItem(CONFIG.sessionKey)) {
        profileSelectEl.hidden = true;
        completeIntro(resolve);
        return;
      }

      // Populate profile options
      renderProfileOptions();

      // Show modal
      profileSelectEl.hidden = false;
      profileSelectEl.showModal();

      // Focus first option
      const firstOption = profileOptionsEl?.querySelector('[role="option"]');
      firstOption?.focus();

      // Event listeners
      const handleConfirm = () => {
        const selected = profileOptionsEl?.querySelector('[aria-selected="true"]');
        if (selected) {
          const profileId = selected.dataset.profileId;
          selectProfile(profileId);
          cleanup();
          completeIntro(resolve);
        }
      };

      const handleSkip = () => {
        // Select default profile
        const defaultProfile = PROFILES.find(p => p.default);
        if (defaultProfile) selectProfile(defaultProfile.id);
        cleanup();
        completeIntro(resolve);
      };

      const handleKeydown = (e) => {
        if (e.key === 'Enter' && document.activeElement === confirmBtn) {
          handleConfirm();
        } else if (e.key === 'Escape') {
          handleSkip();
        }
      };

      const handleOptionClick = (e) => {
        const option = e.target.closest('[role="option"]');
        if (option) {
          selectOption(option);
        }
      };

      const handleOptionKeydown = (e) => {
        const option = e.target.closest('[role="option"]');
        if (!option) return;

        const options = Array.from(profileOptionsEl.querySelectorAll('[role="option"]'));
        const index = options.indexOf(option);

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            selectOption(options[(index + 1) % options.length]);
            break;
          case 'ArrowUp':
            e.preventDefault();
            selectOption(options[(index - 1 + options.length) % options.length]);
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            handleConfirm();
            break;
        }
      };

      confirmBtn.addEventListener('click', handleConfirm);
      skipBtn.addEventListener('click', handleSkip);
      profileOptionsEl.addEventListener('click', handleOptionClick);
      profileOptionsEl.addEventListener('keydown', handleOptionKeydown);
      profileSelectEl.addEventListener('close', cleanup, { once: true });

      function cleanup() {
        confirmBtn.removeEventListener('click', handleConfirm);
        skipBtn.removeEventListener('click', handleSkip);
        profileOptionsEl.removeEventListener('click', handleOptionClick);
        profileOptionsEl.removeEventListener('keydown', handleOptionKeydown);
      }
    });
  };

  const renderProfileOptions = () => {
    if (!profileOptionsEl) return;

    profileOptionsEl.innerHTML = PROFILES.map((profile, index) => `
      <button
        type="button"
        role="option"
        aria-selected="${profile.default}"
        data-profile-id="${profile.id}"
        class="profile-option ${profile.default ? 'selected' : ''} ${profile.secret ? 'secret' : ''}"
        style="--option-color: ${profile.color}"
        tabindex="${profile.default ? '0' : '-1'}"
      >
        <span class="profile-option__icon" aria-hidden="true">${profile.icon}</span>
        <div class="profile-option__info">
          <span class="profile-option__name">${profile.name}</span>
          <span class="profile-option__subtitle">${profile.subtitle}</span>
        </div>
        <span class="profile-option__description">${profile.description}</span>
        ${profile.secret ? '<span class="profile-option__badge">SECRET</span>' : ''}
      </button>
    `).join('');
  };

  const selectOption = (option) => {
    const options = profileOptionsEl?.querySelectorAll('[role="option"]');
    options?.forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-selected', 'false');
      opt.tabIndex = -1;
    });
    option.classList.add('selected');
    option.setAttribute('aria-selected', 'true');
    option.tabIndex = 0;
    option.focus();
    confirmBtn.disabled = false;
  };

  const selectProfile = (profileId) => {
    const profile = PROFILES.find(p => p.id === profileId);
    if (profile && window.XP) {
      window.XP.setProfile(profileId);
    }
    // Store selected profile for session
    sessionStorage.setItem('portfolio_selected_profile', profileId);
  };

  // ---------------------------------------------------------------------------
  // COMPLETION
  // ---------------------------------------------------------------------------
  const completeIntro = (resolve) => {
    // Mark intro as complete for this session
    sessionStorage.setItem(CONFIG.sessionKey, 'true');
    localStorage.setItem(CONFIG.storageKey, Date.now().toString());

    // Show main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.hidden = false;
      mainContent.classList.add('animate-fade-in');
      document.body.style.overflow = '';
    }

    // Award first visit XP
    window.XP?.addXP(100, 'intro_complete');

    // Dispatch event
    window.dispatchEvent(new CustomEvent('intro:complete', {
      detail: { profile: sessionStorage.getItem('portfolio_selected_profile') }
    }));

    resolve();
  };

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  const api = {
    init: async () => {
      // Check if intro was completed in a previous session (not current)
      const prevComplete = localStorage.getItem(CONFIG.storageKey);
      const thisSession = sessionStorage.getItem(CONFIG.sessionKey);

      if (prevComplete && !thisSession) {
        // Show preloader but skip profile select
        await runPreloader();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.hidden = false;
          document.body.style.overflow = '';
        }
        sessionStorage.setItem(CONFIG.sessionKey, 'true');
        window.dispatchEvent(new CustomEvent('intro:complete', { detail: { skipped: true } }));
      } else if (!prevComplete) {
        // First visit ever - full intro
        await runPreloader();
        // showProfileSelect called from runPreloader
      } else {
        // Already completed this session - just show content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.hidden = false;
          document.body.style.overflow = '';
        }
      }
    },

    // For testing/debugging
    reset: () => {
      localStorage.removeItem(CONFIG.storageKey);
      sessionStorage.removeItem(CONFIG.sessionKey);
      sessionStorage.removeItem('portfolio_selected_profile');
    },

    skip: () => {
      const mainContent = document.getElementById('main-content');
      if (preloaderEl) {
        preloaderEl.hidden = true;
        preloaderEl.removeAttribute('aria-busy');
      }
      if (profileSelectEl) {
        profileSelectEl.hidden = true;
        profileSelectEl.close();
      }
      if (mainContent) {
        mainContent.hidden = false;
        document.body.style.overflow = '';
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.Intro = api;
  }

  return api;
})();

export default Intro;