/**
 * ==========================================================================
 * GameContext — XP, Level, Achievements, Profile State Management
 * ==========================================================================
 * Persisted in localStorage with migration support
 * ==========================================================================
 */
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { profile as initialProfile } from '../data/profile';
import { achievements as initialAchievements } from '../data/profile';

const STORAGE_KEY = 'netflix-portfolio-game-state';
const STORAGE_VERSION = 1;

// Initial state
const initialState = {
  // Profile & RPG Stats
  profile: initialProfile.stats,

  // XP System
  xp: initialProfile.stats.xp,
  level: initialProfile.stats.level,
  xpToNext: initialProfile.stats.xpToNext,

  // Achievements
  achievements: initialAchievements.map(a => ({
    ...a,
    unlocked: !!a.unlockedAt,
    unlockedAt: a.unlockedAt || null,
    notified: false
  })),

  // Terminal state
  terminal: {
    history: [],
    commandCount: 0,
    easterEggsFound: [],
    matrixMode: false
  },

  // Session/Profile select
  session: {
    profileSelected: false,
    selectedProfile: null,
    visitedSections: []
  },

  // UI State
  ui: {
    reducedMotion: false,
    terminalOpen: false,
    toastQueue: []
  },

  // Version for migration
  version: STORAGE_VERSION
};

// Action types
const ActionTypes = {
  // XP & Level
  ADD_XP: 'ADD_XP',
  SET_LEVEL: 'SET_LEVEL',

  // Achievements
  UNLOCK_ACHIEVEMENT: 'UNLOCK_ACHIEVEMENT',
  NOTIFY_ACHIEVEMENT: 'NOTIFY_ACHIEVEMENT',

  // Terminal
  ADD_TERMINAL_HISTORY: 'ADD_TERMINAL_HISTORY',
  INCREMENT_COMMAND_COUNT: 'INCREMENT_COMMAND_COUNT',
  ADD_EASTER_EGG: 'ADD_EASTER_EGG',
  TOGGLE_MATRIX_MODE: 'TOGGLE_MATRIX_MODE',

  // Session
  SET_PROFILE_SELECTED: 'SET_PROFILE_SELECTED',
  SET_SELECTED_PROFILE: 'SET_SELECTED_PROFILE',
  ADD_VISITED_SECTION: 'ADD_VISITED_SECTION',

  // UI
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  TOGGLE_TERMINAL: 'TOGGLE_TERMINAL',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',

  // Persistence
  LOAD_STATE: 'LOAD_STATE',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_XP: {
      const { amount, source } = action.payload;
      let newXp = state.xp + amount;
      let newLevel = state.level;
      let newXpToNext = state.xpToNext;
      const newlyUnlocked = [];

      // Level up logic
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.floor(newXpToNext * 1.5); // Exponential growth

        // Level up achievement check
        if (newLevel === 10) {
          newlyUnlocked.push('level_10');
        } else if (newLevel === 25) {
          newlyUnlocked.push('level_25');
        } else if (newLevel === 50) {
          newlyUnlocked.push('level_50');
        }
      }

      // Update profile stats
      const newProfile = {
        ...state.profile,
        level: newLevel,
        xp: newXp,
        xpToNext: newXpToNext
      };

      return {
        ...state,
        xp: newXp,
        level: newLevel,
        xpToNext: newXpToNext,
        profile: newProfile,
        // Queue achievements for notification
        achievements: state.achievements.map(a =>
          newlyUnlocked.includes(a.key) ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), notified: false } : a
        )
      };
    }

    case ActionTypes.SET_LEVEL: {
      const { level } = action.payload;
      const newProfile = { ...state.profile, level };
      return { ...state, level, profile: newProfile };
    }

    case ActionTypes.UNLOCK_ACHIEVEMENT: {
      const { key } = action.payload;
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.key === key && !a.unlocked
            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), notified: false }
            : a
        )
      };
    }

    case ActionTypes.NOTIFY_ACHIEVEMENT: {
      const { key } = action.payload;
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.key === key ? { ...a, notified: true } : a
        )
      };
    }

    case ActionTypes.ADD_TERMINAL_HISTORY: {
      const { entry } = action.payload;
      return {
        ...state,
        terminal: {
          ...state.terminal,
          history: [...state.terminal.history, { ...entry, timestamp: Date.now() }].slice(-100)
        }
      };
    }

    case ActionTypes.INCREMENT_COMMAND_COUNT: {
      const newCount = state.terminal.commandCount + 1;
      const newlyUnlocked = [];

      // Command count achievements
      if (newCount === 10) newlyUnlocked.push('cmd_10');
      if (newCount === 50) newlyUnlocked.push('cmd_50');
      if (newCount === 100) newlyUnlocked.push('cmd_100');

      return {
        ...state,
        terminal: { ...state.terminal, commandCount: newCount },
        achievements: state.achievements.map(a =>
          newlyUnlocked.includes(a.key) ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), notified: false } : a
        )
      };
    }

    case ActionTypes.ADD_EASTER_EGG: {
      const { egg } = action.payload;
      if (state.terminal.easterEggsFound.includes(egg)) return state;

      const newlyUnlocked = egg === 'konami' ? ['terminal_master'] : [];

      return {
        ...state,
        terminal: {
          ...state.terminal,
          easterEggsFound: [...state.terminal.easterEggsFound, egg]
        },
        achievements: state.achievements.map(a =>
          newlyUnlocked.includes(a.key) ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), notified: false } : a
        )
      };
    }

    case ActionTypes.TOGGLE_MATRIX_MODE: {
      return {
        ...state,
        terminal: { ...state.terminal, matrixMode: !state.terminal.matrixMode }
      };
    }

    case ActionTypes.SET_PROFILE_SELECTED: {
      return {
        ...state,
        session: { ...state.session, profileSelected: action.payload }
      };
    }

    case ActionTypes.SET_SELECTED_PROFILE: {
      return {
        ...state,
        session: { ...state.session, selectedProfile: action.payload }
      };
    }

    case ActionTypes.ADD_VISITED_SECTION: {
      const { section } = action.payload;
      if (state.session.visitedSections.includes(section)) return state;

      // XP for visiting new sections
      const sectionXp = { about: 50, skills: 50, projects: 50, achievements: 50, contact: 50 };

      return {
        ...state,
        session: {
          ...state.session,
          visitedSections: [...state.session.visitedSections, section]
        },
        xp: state.xp + (sectionXp[section] || 0)
      };
    }

    case ActionTypes.SET_REDUCED_MOTION: {
      return {
        ...state,
        ui: { ...state.ui, reducedMotion: action.payload }
      };
    }

    case ActionTypes.TOGGLE_TERMINAL: {
      return {
        ...state,
        ui: { ...state.ui, terminalOpen: !state.ui.terminalOpen }
      };
    }

    case ActionTypes.ADD_TOAST: {
      const toast = { id: Date.now(), ...action.payload };
      return {
        ...state,
        ui: { ...state.ui, toastQueue: [...state.ui.toastQueue, toast] }
      };
    }

    case ActionTypes.REMOVE_TOAST: {
      return {
        ...state,
        ui: { ...state.ui, toastQueue: state.ui.toastQueue.filter(t => t.id !== action.payload) }
      };
    }

    case ActionTypes.LOAD_STATE: {
      return { ...state, ...action.payload, version: STORAGE_VERSION };
    }

    case ActionTypes.RESET_STATE: {
      return initialState;
    }

    default:
      return state;
  }
}

// Context
const GameContext = createContext(null);

// Provider
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    // Lazy initialization from localStorage
    if (typeof window === 'undefined') return initial;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration logic
        if (parsed.version !== STORAGE_VERSION) {
          // Handle migrations here
          console.log(`Migrating game state from v${parsed.version} to v${STORAGE_VERSION}`);
        }
        return { ...initial, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load game state:', error);
    }
    return initial;
  });

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }, [state]);

  // Sync reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => dispatch({ type: ActionTypes.SET_REDUCED_MOTION, payload: e.matches });
    mediaQuery.addEventListener('change', handleChange);
    dispatch({ type: ActionTypes.SET_REDUCED_MOTION, payload: mediaQuery.matches });
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Actions
  const actions = useMemo(() => ({
    // XP & Level
    addXp: (amount, source = 'action') => dispatch({
      type: ActionTypes.ADD_XP,
      payload: { amount, source }
    }),

    // Achievements
    unlockAchievement: (key) => dispatch({
      type: ActionTypes.UNLOCK_ACHIEVEMENT,
      payload: { key }
    }),
    notifyAchievement: (key) => dispatch({
      type: ActionTypes.NOTIFY_ACHIEVEMENT,
      payload: { key }
    }),
    getUnlockedAchievements: () => state.achievements.filter(a => a.unlocked),
    getLockedAchievements: () => state.achievements.filter(a => !a.unlocked),
    getUnnotifiedAchievements: () => state.achievements.filter(a => a.unlocked && !a.notified),

    // Terminal
    addTerminalHistory: (entry) => dispatch({
      type: ActionTypes.ADD_TERMINAL_HISTORY,
      payload: { entry }
    }),
    incrementCommandCount: () => dispatch({ type: ActionTypes.INCREMENT_COMMAND_COUNT }),
    addEasterEgg: (egg) => dispatch({
      type: ActionTypes.ADD_EASTER_EGG,
      payload: { egg }
    }),
    toggleMatrixMode: () => dispatch({ type: ActionTypes.TOGGLE_MATRIX_MODE }),

    // Session
    setProfileSelected: (selected) => dispatch({
      type: ActionTypes.SET_PROFILE_SELECTED,
      payload: selected
    }),
    setSelectedProfile: (profile) => dispatch({
      type: ActionTypes.SET_SELECTED_PROFILE,
      payload: profile
    }),
    addVisitedSection: (section) => dispatch({
      type: ActionTypes.ADD_VISITED_SECTION,
      payload: { section }
    }),

    // UI
    toggleTerminal: () => dispatch({ type: ActionTypes.TOGGLE_TERMINAL }),
    addToast: (toast) => dispatch({
      type: ActionTypes.ADD_TOAST,
      payload: toast
    }),
    removeToast: (id) => dispatch({
      type: ActionTypes.REMOVE_TOAST,
      payload: id
    }),

    // Persistence
    resetGame: () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      dispatch({ type: ActionTypes.RESET_STATE });
    },

    // Computed
    getLevelProgress: () => ((state.xp / state.xpToNext) * 100).toFixed(1),
    getTotalXp: () => {
      // Calculate total XP including previous levels
      let total = state.xp;
      let levelXp = 1000; // Base XP for level 1
      for (let i = 1; i < state.level; i++) {
        total += levelXp;
        levelXp = Math.floor(levelXp * 1.5);
      }
      return total;
    }
  }), [state.xp, state.xpToNext, state.level, state.achievements]);

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

// Hooks
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function useXP() {
  const { state, actions } = useGame();
  return {
    xp: state.xp,
    level: state.level,
    xpToNext: state.xpToNext,
    progress: actions.getLevelProgress(),
    totalXp: actions.getTotalXp(),
    addXp: actions.addXp
  };
}

export function useAchievements() {
  const { state, actions } = useGame();
  return {
    achievements: state.achievements,
    unlocked: actions.getUnlockedAchievements(),
    locked: actions.getLockedAchievements(),
    unnotified: actions.getUnnotifiedAchievements(),
    unlock: actions.unlockAchievement,
    notify: actions.notifyAchievement
  };
}

export function useTerminal() {
  const { state, actions } = useGame();
  return {
    history: state.terminal.history,
    commandCount: state.terminal.commandCount,
    easterEggsFound: state.terminal.easterEggsFound,
    matrixMode: state.terminal.matrixMode,
    addHistory: actions.addTerminalHistory,
    incrementCommand: actions.incrementCommandCount,
    addEasterEgg: actions.addEasterEgg,
    toggleMatrixMode: actions.toggleMatrixMode
  };
}

export function useSession() {
  const { state, actions } = useGame();
  return {
    profileSelected: state.session.profileSelected,
    selectedProfile: state.session.selectedProfile,
    visitedSections: state.session.visitedSections,
    setProfileSelected: actions.setProfileSelected,
    setSelectedProfile: actions.setSelectedProfile,
    addVisitedSection: actions.addVisitedSection
  };
}

export function useUI() {
  const { state, actions } = useGame();
  return {
    reducedMotion: state.ui.reducedMotion,
    terminalOpen: state.ui.terminalOpen,
    toasts: state.ui.toastQueue,
    toggleTerminal: actions.toggleTerminal,
    addToast: actions.addToast,
    removeToast: actions.removeToast
  };
}

export function useGameActions() {
  const { actions } = useGame();
  return actions;
}

export { GameContext };