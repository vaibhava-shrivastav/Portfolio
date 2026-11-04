/**
 * ==========================================================================
 * GameContext — XP, Level, Achievements, Profile State Management
 * ==========================================================================
 * Persisted in localStorage with migration support and StrictMode safety
 * ==========================================================================
 */
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import {
  profile as initialProfile,
  gameAchievements as initialAchievements,
  visitorPersonas,
  xpLevels,
  xpActions
} from '../data/profile';

const STORAGE_KEY = 'netflix-portfolio-game-state';
const STORAGE_VERSION = 2;

/**
 * Level threshold calculator matching profile.js xpLevels:
 * Level 1: 0 XP (Curious Visitor)
 * Level 2: 100 XP (Explorer)
 * Level 3: 200 XP (Insider)
 * Level 4: 350 XP (Power User)
 * Level 5: 500 XP (Hired!)
 */
export function calculateLevel(xp) {
  if (xp >= 500) return { level: 5, name: 'Hired!', minXp: 500, nextXp: 500 };
  if (xp >= 350) return { level: 4, name: 'Power User', minXp: 350, nextXp: 500 };
  if (xp >= 200) return { level: 3, name: 'Insider', minXp: 200, nextXp: 350 };
  if (xp >= 100) return { level: 2, name: 'Explorer', minXp: 100, nextXp: 200 };
  return { level: 1, name: 'Curious Visitor', minXp: 0, nextXp: 100 };
}

export function calculateLevelProgress(xp) {
  const current = calculateLevel(xp);
  if (current.level >= 5) return 100;
  const range = current.nextXp - current.minXp;
  if (range <= 0) return 100;
  const progressInLevel = Math.max(0, Math.min(xp - current.minXp, range));
  return Math.round((progressInLevel / range) * 100);
}

// Initial state
const initialState = {
  // Profile & RPG Stats
  profile: initialProfile.stats,

  // XP System (strictly discrete action-based)
  xp: 0,
  level: 1,
  xpToNext: 100,
  awardedActionIds: [],

  // Achievements (10 badge-only achievements, 0 XP)
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

  // Session / Persona select state
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
  // XP & Actions
  AWARD_ACTION: 'AWARD_ACTION',
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

  // Session & Personas
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
    case ActionTypes.AWARD_ACTION: {
      const { actionId, amount } = action.payload;
      const awarded = state.awardedActionIds || [];
      // StrictMode / duplicate protection
      if (awarded.includes(actionId)) {
        return state;
      }

      const newXp = state.xp + amount;
      const levelInfo = calculateLevel(newXp);
      const newAwarded = [...awarded, actionId];

      let toasts = state.ui.toastQueue;
      if (levelInfo.level > state.level) {
        toasts = [
          ...toasts,
          {
            id: Date.now(),
            type: 'achievement',
            title: `Level Up! Level ${levelInfo.level}`,
            message: `Rank achieved: ${levelInfo.name}`
          }
        ];
      }

      return {
        ...state,
        xp: newXp,
        level: levelInfo.level,
        xpToNext: levelInfo.nextXp,
        awardedActionIds: newAwarded,
        profile: {
          ...state.profile,
          level: levelInfo.level,
          xp: newXp,
          title: levelInfo.name
        },
        ui: {
          ...state.ui,
          toastQueue: toasts
        }
      };
    }

    case ActionTypes.ADD_XP: {
      const { amount } = action.payload;
      const newXp = state.xp + amount;
      const levelInfo = calculateLevel(newXp);

      let toasts = state.ui.toastQueue;
      if (levelInfo.level > state.level) {
        toasts = [
          ...toasts,
          {
            id: Date.now(),
            type: 'achievement',
            title: `Level Up! Level ${levelInfo.level}`,
            message: `Rank achieved: ${levelInfo.name}`
          }
        ];
      }

      return {
        ...state,
        xp: newXp,
        level: levelInfo.level,
        xpToNext: levelInfo.nextXp,
        profile: {
          ...state.profile,
          level: levelInfo.level,
          xp: newXp,
          title: levelInfo.name
        },
        ui: {
          ...state.ui,
          toastQueue: toasts
        }
      };
    }

    case ActionTypes.SET_LEVEL: {
      const { level } = action.payload;
      return {
        ...state,
        level,
        profile: { ...state.profile, level }
      };
    }

    case ActionTypes.UNLOCK_ACHIEVEMENT: {
      const { key } = action.payload;
      const target = state.achievements.find(a => a.key === key);
      if (!target || target.unlocked) return state;

      const updatedAchievements = state.achievements.map(a =>
        a.key === key
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), notified: false }
          : a
      );

      const toast = {
        id: Date.now(),
        type: 'achievement',
        title: `Badge Unlocked: ${target.name || target.title}`,
        message: target.description || 'Achievement unlocked!'
      };

      return {
        ...state,
        achievements: updatedAchievements,
        ui: {
          ...state.ui,
          toastQueue: [...state.ui.toastQueue, toast]
        }
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
      return {
        ...state,
        terminal: { ...state.terminal, commandCount: newCount }
      };
    }

    case ActionTypes.ADD_EASTER_EGG: {
      const { egg } = action.payload;
      if (state.terminal.easterEggsFound.includes(egg)) return state;

      return {
        ...state,
        terminal: {
          ...state.terminal,
          easterEggsFound: [...state.terminal.easterEggsFound, egg]
        }
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
      const visited = state.session.visitedSections || [];
      if (visited.includes(section)) return state;

      // Section visit XP mapping from profile.js action table
      let actionId = null;
      let xpAmount = 0;
      if (section === 'about') {
        actionId = 'about_view';
        xpAmount = 30;
      } else if (section === 'skills') {
        actionId = 'skills_view';
        xpAmount = 30;
      } else if (section === 'achievements') {
        actionId = 'achievements_view';
        xpAmount = 20;
      } else if (section === 'contact') {
        actionId = 'contact_view';
        xpAmount = 20;
      }

      const awarded = state.awardedActionIds || [];
      let newXp = state.xp;
      let newAwarded = awarded;
      let newLevel = state.level;
      let newXpToNext = state.xpToNext;

      if (actionId && !awarded.includes(actionId)) {
        newXp += xpAmount;
        const levelInfo = calculateLevel(newXp);
        newLevel = levelInfo.level;
        newXpToNext = levelInfo.nextXp;
        newAwarded = [...awarded, actionId];
      }

      return {
        ...state,
        xp: newXp,
        level: newLevel,
        xpToNext: newXpToNext,
        awardedActionIds: newAwarded,
        session: {
          ...state.session,
          visitedSections: [...visited, section]
        }
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
    if (typeof window === 'undefined') return initial;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...initial,
          ...parsed,
          awardedActionIds: parsed.awardedActionIds || [],
          session: {
            ...initial.session,
            ...(parsed.session || {})
          },
          version: STORAGE_VERSION
        };
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
    // XP & Discrete Action Awards
    awardAction: (actionId, amount) => dispatch({
      type: ActionTypes.AWARD_ACTION,
      payload: { actionId, amount }
    }),
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

    // Session & Persona selection
    setProfileSelected: (selected) => dispatch({
      type: ActionTypes.SET_PROFILE_SELECTED,
      payload: selected
    }),
    setSelectedProfile: (profileId) => dispatch({
      type: ActionTypes.SET_SELECTED_PROFILE,
      payload: profileId
    }),
    selectPersona: (personaId) => {
      dispatch({
        type: ActionTypes.SET_SELECTED_PROFILE,
        payload: personaId
      });
      dispatch({
        type: ActionTypes.SET_PROFILE_SELECTED,
        payload: true
      });
      dispatch({
        type: ActionTypes.AWARD_ACTION,
        payload: { actionId: 'profile_select', amount: 20 }
      });
    },
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

    // Computed Helpers
    getLevelProgress: () => calculateLevelProgress(state.xp),
    getTotalXp: () => state.xp
  }), [state.xp, state.level, state.achievements, state.awardedActionIds]);

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
    addXp: actions.addXp,
    awardAction: actions.awardAction
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
    selectPersona: actions.selectPersona,
    addVisitedSection: actions.addVisitedSection
  };
}

export function usePersona() {
  const { state, actions } = useGame();
  const personaId = state.session?.selectedProfile;
  const persona = visitorPersonas.find(p => p.id === personaId) || null;
  return {
    persona,
    personaId,
    selectPersona: actions.selectPersona,
    tagline: persona?.tagline || initialProfile.tagline,
    firstRowOrder: persona?.firstRowOrder || ['projects', 'skills', 'about'],
    isSelectingProfile: !state.session?.profileSelected
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
