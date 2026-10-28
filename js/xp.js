/**
 * ==========================================================================
 * Netflix-Inspired Developer Portfolio — XP / Level / Achievement System
 * ==========================================================================
 * Pure vanilla JS, no dependencies. Persists to localStorage.
 * ==========================================================================
 */

const XP = (() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------------------------
  const CONFIG = {
    // XP curve: base XP for level 1, multiplier per level
    baseXP: 1000,
    multiplier: 1.5,
    // Max level
    maxLevel: 50,
    // Storage keys
    storageKey: 'portfolio_xp',
    achievementsKey: 'portfolio_achievements',
    profileKey: 'portfolio_profile',
    // XP rewards for actions
    rewards: {
      pageView: 10,
      projectView: 50,
      terminalCommand: 5,
      terminalEasterEgg: 100,
      achievementUnlock: 0, // Bonus handled per achievement
      konamiCode: 1000,
      profileComplete: 500,
      firstVisit: 100,
      returnVisit: 50,
      scrollDepth25: 25,
      scrollDepth50: 50,
      scrollDepth75: 75,
      scrollDepth100: 100,
      clickContact: 200,
      clickGithub: 50,
      clickLinkedIn: 50,
      clickResume: 100,
      themeToggle: 10, // If implemented
      terminalOpen: 25,
      terminalClose: 5
    }
  };

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  let state = {
    xp: 0,
    level: 1,
    xpToNext: CONFIG.baseXP,
    totalXPEarned: 0,
    achievements: {},
    profile: null,
    lastVisit: null,
    visitCount: 0,
    scrollMilestones: { 25: false, 50: false, 75: false, 100: false }
  };

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------
  const calculateXPForLevel = (level) => {
    if (level >= CONFIG.maxLevel) return Infinity;
    return Math.floor(CONFIG.baseXP * Math.pow(CONFIG.multiplier, level - 1));
  };

  const calculateLevelFromXP = (xp) => {
    let level = 1;
    let required = CONFIG.baseXP;
    let remaining = xp;

    while (level < CONFIG.maxLevel && remaining >= required) {
      remaining -= required;
      level++;
      required = calculateXPForLevel(level);
    }
    return { level, xpIntoLevel: remaining, xpToNext: required };
  };

  const getTitleForLevel = (level) => {
    const titles = [
      { min: 1, max: 4, title: "Junior Developer" },
      { min: 5, max: 9, title: "Developer" },
      { min: 10, max: 14, title: "Senior Developer" },
      { min: 15, max: 19, title: "Lead Developer" },
      { min: 20, max: 24, title: "Staff Engineer" },
      { min: 25, max: 29, title: "Principal Engineer" },
      { min: 30, max: 34, title: "Distinguished Engineer" },
      { min: 35, max: 39, title: "Technical Fellow" },
      { min: 40, max: 44, title: "VP Engineering" },
      { min: 45, max: 50, title: "CTO" }
    ];
    const match = titles.find(t => level >= t.min && level <= t.max);
    return match ? match.title : "Legend";
  };

  const saveState = () => {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        xp: state.xp,
        level: state.level,
        totalXPEarned: state.totalXPEarned,
        lastVisit: state.lastVisit,
        visitCount: state.visitCount,
        scrollMilestones: state.scrollMilestones
      }));
      localStorage.setItem(CONFIG.achievementsKey, JSON.stringify(state.achievements));
      if (state.profile) {
        localStorage.setItem(CONFIG.profileKey, JSON.stringify(state.profile));
      }
    } catch (e) {
      console.warn('[XP] Failed to save state:', e);
    }
  };

  const loadState = () => {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      }
      const savedAchievements = localStorage.getItem(CONFIG.achievementsKey);
      if (savedAchievements) {
        state.achievements = JSON.parse(savedAchievements);
      }
      const savedProfile = localStorage.getItem(CONFIG.profileKey);
      if (savedProfile) {
        state.profile = JSON.parse(savedProfile);
      }
    } catch (e) {
      console.warn('[XP] Failed to load state:', e);
    }
    // Recalculate level from XP
    const calc = calculateLevelFromXP(state.xp);
    state.level = calc.level;
    state.xpToNext = calc.xpToNext;
  };

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  const api = {
    // Initialize - call on app start
    init() {
      loadState();
      this.handleVisit();
      return this.getState();
    },

    // Get current state
    getState() {
      return {
        xp: state.xp,
        level: state.level,
        xpToNext: state.xpToNext,
        xpIntoLevel: state.xp - (calculateLevelFromXP(state.xp).xpIntoLevel || 0),
        totalXPEarned: state.totalXPEarned,
        progress: state.xpToNext === Infinity ? 1 : (state.xp % state.xpToNext) / state.xpToNext,
        title: getTitleForLevel(state.level),
        achievements: { ...state.achievements },
        visitCount: state.visitCount
      };
    },

    // Handle visit tracking
    handleVisit() {
      const now = Date.now();
      const lastVisit = state.lastVisit;

      if (!lastVisit) {
        // First visit ever
        this.addXP(CONFIG.rewards.firstVisit, 'first_visit');
        state.visitCount = 1;
      } else {
        const daysSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60 * 24);
        if (daysSinceLastVisit >= 1) {
          // Return visit (new day)
          this.addXP(CONFIG.rewards.returnVisit, 'return_visit');
          state.visitCount++;
        }
      }
      state.lastVisit = now;
      saveState();
    },

    // Add XP and check for level up
    addXP(amount, source = 'unknown') {
      if (amount <= 0) return this.getState();

      const oldLevel = state.level;
      state.xp += amount;
      state.totalXPEarned += amount;

      const calc = calculateLevelFromXP(state.xp);
      const newLevel = calc.level;
      state.level = newLevel;
      state.xpToNext = calc.xpToNext;

      // Level up!
      if (newLevel > oldLevel) {
        this.onLevelUp(oldLevel, newLevel);
      }

      saveState();
      this.emit('xpChange', this.getState());
      return this.getState();
    },

    // Spend XP (for unlocks, etc.)
    spendXP(amount) {
      if (state.xp < amount) return false;
      state.xp -= amount;
      const calc = calculateLevelFromXP(state.xp);
      state.level = calc.level;
      state.xpToNext = calc.xpToNext;
      saveState();
      this.emit('xpChange', this.getState());
      return true;
    },

    // Level up handler
    onLevelUp(oldLevel, newLevel) {
      const title = getTitleForLevel(newLevel);
      this.emit('levelUp', { oldLevel, newLevel, title, xp: state.xp });

      // Check for level-based achievements
      this.checkAchievements('level', newLevel);
    },

    // Achievement system
    unlockAchievement(key) {
      if (state.achievements[key]) return false; // Already unlocked

      // Find achievement in DATA
      const achievement = (window.DATA?.achievements || []).find(a => a.key === key);
      if (!achievement) {
        console.warn(`[XP] Achievement not found: ${key}`);
        return false;
      }

      state.achievements[key] = {
        unlockedAt: new Date().toISOString(),
        xpReward: achievement.xpReward || 0
      };

      // Award XP
      if (achievement.xpReward > 0) {
        this.addXP(achievement.xpReward, `achievement_${key}`);
      }

      saveState();
      this.emit('achievementUnlock', { key, achievement, state: this.getState() });
      return true;
    },

    checkAchievements(trigger, value) {
      const achievements = window.DATA?.achievements || [];

      achievements.forEach(achievement => {
        if (state.achievements[achievement.key]) return; // Already unlocked

        let shouldUnlock = false;

        switch (trigger) {
          case 'level':
            if (achievement.category === 'milestone' && value >= (achievement.requiredLevel || 1)) {
              shouldUnlock = true;
            }
            break;
          case 'project_view':
            if (achievement.key === 'project_explorer' && value >= 5) shouldUnlock = true;
            break;
          case 'terminal_command':
            if (achievement.key === 'terminal_master' && value >= 50) shouldUnlock = true;
            break;
          case 'konami':
            if (achievement.key === 'terminal_master') shouldUnlock = true;
            break;
          case 'profile_complete':
            if (achievement.key === 'profile_complete') shouldUnlock = true;
            break;
        }

        if (shouldUnlock) {
          this.unlockAchievement(achievement.key);
        }
      });
    },

    isAchievementUnlocked(key) {
      return !!state.achievements[key];
    },

    getUnlockedAchievements() {
      return Object.keys(state.achievements).map(key => ({
        key,
        ...state.achievements[key],
        ...(window.DATA?.achievements?.find(a => a.key === key) || {})
      }));
    },

    // Profile selection (for intro)
    setProfile(profileId) {
      state.profile = profileId;
      saveState();
      this.emit('profileChange', profileId);
    },

    getProfile() {
      return state.profile;
    },

    // Scroll milestone tracking
    trackScroll(percentage) {
      const milestones = [25, 50, 75, 100];
      milestones.forEach(m => {
        if (percentage >= m && !state.scrollMilestones[m]) {
          state.scrollMilestones[m] = true;
          this.addXP(CONFIG.rewards[`scrollDepth${m}`], `scroll_${m}`);
        }
      });
      saveState();
    },

    // Event system
    _listeners: new Map(),

    on(event, callback) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set());
      }
      this._listeners.get(event).add(callback);
      return () => this.off(event, callback);
    },

    off(event, callback) {
      this._listeners.get(event)?.delete(callback);
    },

    emit(event, data) {
      this._listeners.get(event)?.forEach(cb => {
        try { cb(data); } catch (e) { console.error(`[XP] Event error (${event}):`, e); }
      });
    },

    // Reset (for testing)
    reset() {
      state = {
        xp: 0,
        level: 1,
        xpToNext: CONFIG.baseXP,
        totalXPEarned: 0,
        achievements: {},
        profile: null,
        lastVisit: null,
        visitCount: 0,
        scrollMilestones: { 25: false, 50: false, 75: false, 100: false }
      };
      localStorage.removeItem(CONFIG.storageKey);
      localStorage.removeItem(CONFIG.achievementsKey);
      localStorage.removeItem(CONFIG.profileKey);
      this.emit('reset', this.getState());
    },

    // Debug helpers
    debug: {
      getState: () => ({ ...state }),
      addXP: (amt) => api.addXP(amt, 'debug'),
      setLevel: (lvl) => {
        state.xp = 0;
        for (let i = 1; i < lvl; i++) {
          state.xp += calculateXPForLevel(i);
        }
        const calc = calculateLevelFromXP(state.xp);
        state.level = calc.level;
        state.xpToNext = calc.xpToNext;
        saveState();
        api.emit('xpChange', api.getState());
      },
      unlockAll: () => {
        (window.DATA?.achievements || []).forEach(a => api.unlockAchievement(a.key));
      }
    }
  };

  // ---------------------------------------------------------------------------
  // EXPORT
  // ---------------------------------------------------------------------------
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.XP = api;
  }

  return api;
})();

// Export for ES modules
export default XP;