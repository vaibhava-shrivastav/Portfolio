/**
 * ==========================================================================
 * GameContext — State Management for XP Progression, Badges & Session
 * ==========================================================================
 * Features:
 * - Single-source-of-truth React Context for game engine state
 * - Pure badge derivation and strict idempotency for XP awards
 * - Persisted state with migration for legacy shapes and clamped XP
 * - Welcome Gateway session state (single-user flow)
 * - Toast notification queue with priority capping
 * ==========================================================================
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import {
  profile as initialProfile,
  gameAchievements as initialAchievements,
  projects as allProjects,
  xpLevels,
  xpActions
} from '../data/profile';
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  MAX_TOTAL_XP,
  calculateLevel,
  calculateLevelProgress,
  deriveBadges,
  enqueueToast,
  migrateState
} from './game-engine';

// Re-export pure logic
export { calculateLevel, calculateLevelProgress, MAX_TOTAL_XP };

export const WELCOME_ENTERED_KEY = 'portfolio_entered';
export const PRELOADER_COMPLETED_KEY = 'preloader_completed';

// Initial State
const initialState = {
  // Discrete XP & Level
  xp: 0,
  level: 1,
  xpToNext: 100,
  awardedActionIds: [],
  badgeTimestamps: {},

  // Achievements (10 badge-only achievements, 0 XP)
  achievements: initialAchievements.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: null
  })),

  // Session state (single-user gateway)
  session: {
    profileSelected: false,
    visitedSections: []
  },

  // Terminal state
  terminal: {
    history: [],
    commandCount: 0,
    easterEggsFound: [],
    matrixMode: false
  },

  // UI state
  ui: {
    reducedMotion: false,
    terminalOpen: false,
    modalOpen: false,
    selectedProject: null,
    toastQueue: []
  },

  version: STORAGE_VERSION
};

// Action Types
export const ActionTypes = {
  AWARD_ACTION: 'AWARD_ACTION',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  TOGGLE_TERMINAL: 'TOGGLE_TERMINAL',
  SET_TERMINAL_OPEN: 'SET_TERMINAL_OPEN',
  SET_MODAL_OPEN: 'SET_MODAL_OPEN',
  SET_SELECTED_PROJECT: 'SET_SELECTED_PROJECT',
  SET_PROFILE_SELECTED: 'SET_PROFILE_SELECTED',
  ADD_VISITED_SECTION: 'ADD_VISITED_SECTION',
  ADD_TERMINAL_HISTORY: 'ADD_TERMINAL_HISTORY',
  INCREMENT_COMMAND_COUNT: 'INCREMENT_COMMAND_COUNT',
  ADD_EASTER_EGG: 'ADD_EASTER_EGG',
  TOGGLE_MATRIX_MODE: 'TOGGLE_MATRIX_MODE',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
export function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.AWARD_ACTION: {
      const { actionId, amount = 0, label = '' } = action.payload || {};
      if (!actionId) return state;

      let normalizedId = actionId;
      if (normalizedId === 'profile_select' || normalizedId === 'profile-select') {
        normalizedId = 'enter_portfolio';
      } else if (normalizedId === 'terminal_open') {
        normalizedId = 'terminal_first_open';
      } else if (normalizedId === 'link_click:gla_exchange') {
        normalizedId = 'project:live:proj-1';
      }

      const awarded = state.awardedActionIds || [];
      // StrictMode idempotency / duplicate check
      if (awarded.includes(normalizedId) || (actionId !== normalizedId && awarded.includes(actionId))) {
        return state;
      }

      const newAwarded = [...awarded, normalizedId];
      if (normalizedId === 'terminal_first_open' && !newAwarded.includes('terminal_open')) {
        newAwarded.push('terminal_open');
      }

      const addedXp = Math.max(0, Number(amount) || 0);
      const newXp = Math.min(MAX_TOTAL_XP, (state.xp || 0) + addedXp);
      const oldLevel = state.level;
      const levelInfo = calculateLevel(newXp);

      // Run pure badge derivation
      const { unlocked, timestamps, newlyUnlockedKeys } = deriveBadges(
        newAwarded,
        state.badgeTimestamps
      );

      // Synchronize achievements array
      const updatedAchievements = initialAchievements.map((badge) => ({
        ...badge,
        unlocked: Boolean(unlocked[badge.key]),
        unlockedAt: timestamps[badge.key] || null
      }));

      let newToastQueue = [...(state.ui.toastQueue || [])];

      // 1. Enqueue Level Up Toast if level advanced
      if (levelInfo.level > oldLevel) {
        newToastQueue = enqueueToast(newToastQueue, {
          type: 'levelup',
          title: `Level Up! Level ${levelInfo.level}`,
          message: `Rank: ${levelInfo.name}`,
          icon: 'auto_awesome',
          level: levelInfo.level
        });
      }

      // 2. Enqueue Badge Unlocked Toast(s)
      for (const badgeKey of newlyUnlockedKeys) {
        const badgeMeta = initialAchievements.find((a) => a.key === badgeKey);
        if (badgeMeta) {
          newToastQueue = enqueueToast(newToastQueue, {
            type: 'achievement',
            title: `Badge Unlocked: ${badgeMeta.name}`,
            message: badgeMeta.description,
            icon: badgeMeta.icon || 'military_tech',
            badgeKey
          });
        }
      }

      // 3. Enqueue XP Toast (only if XP was awarded and no level up was shown)
      if (addedXp > 0 && levelInfo.level === oldLevel) {
        newToastQueue = enqueueToast(newToastQueue, {
          type: 'xp',
          actionId: normalizedId,
          title: `+${addedXp} XP`,
          message: label || 'Action completed',
          icon: 'bolt'
        });
      }

      return {
        ...state,
        xp: newXp,
        level: levelInfo.level,
        levelTitle: levelInfo.name,
        xpToNext: levelInfo.nextXp,
        awardedActionIds: newAwarded,
        badgeTimestamps: timestamps,
        achievements: updatedAchievements,
        ui: {
          ...state.ui,
          toastQueue: newToastQueue
        }
      };
    }

    case ActionTypes.ADD_TOAST: {
      return {
        ...state,
        ui: {
          ...state.ui,
          toastQueue: enqueueToast(state.ui.toastQueue, action.payload)
        }
      };
    }

    case ActionTypes.REMOVE_TOAST: {
      const toastId = action.payload;
      return {
        ...state,
        ui: {
          ...state.ui,
          toastQueue: (state.ui.toastQueue || []).filter((t) => t.id !== toastId)
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
      if (state.ui.modalOpen) {
        return state;
      }
      const willOpen = !state.ui.terminalOpen;
      return {
        ...state,
        ui: { ...state.ui, terminalOpen: willOpen }
      };
    }

    case ActionTypes.SET_TERMINAL_OPEN: {
      if (action.payload && state.ui.modalOpen) {
        return state;
      }
      return {
        ...state,
        ui: { ...state.ui, terminalOpen: Boolean(action.payload) }
      };
    }

    case ActionTypes.SET_MODAL_OPEN: {
      return {
        ...state,
        ui: {
          ...state.ui,
          modalOpen: action.payload,
          selectedProject: action.payload ? state.ui.selectedProject : null,
          terminalOpen: action.payload ? false : state.ui.terminalOpen
        }
      };
    }

    case ActionTypes.SET_SELECTED_PROJECT: {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedProject: action.payload,
          modalOpen: Boolean(action.payload),
          terminalOpen: Boolean(action.payload) ? false : state.ui.terminalOpen
        }
      };
    }

    case ActionTypes.SET_PROFILE_SELECTED: {
      return {
        ...state,
        session: { ...state.session, profileSelected: Boolean(action.payload) }
      };
    }

    case ActionTypes.ADD_VISITED_SECTION: {
      const section = action.payload;
      const visited = state.session.visitedSections || [];
      if (visited.includes(section)) return state;

      return {
        ...state,
        session: {
          ...state.session,
          visitedSections: [...visited, section]
        }
      };
    }

    case ActionTypes.ADD_TERMINAL_HISTORY: {
      return {
        ...state,
        terminal: {
          ...state.terminal,
          history: [...state.terminal.history, { ...action.payload, timestamp: Date.now() }].slice(-100)
        }
      };
    }

    case ActionTypes.INCREMENT_COMMAND_COUNT: {
      return {
        ...state,
        terminal: { ...state.terminal, commandCount: state.terminal.commandCount + 1 }
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

    case ActionTypes.RESET_STATE: {
      return {
        ...initialState,
        achievements: initialAchievements.map((a) => ({
          ...a,
          unlocked: false,
          unlockedAt: null
        }))
      };
    }

    default:
      return state;
  }
}

// Context
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    if (typeof window === 'undefined') return initial;
    const hasEntered = window.localStorage.getItem(WELCOME_ENTERED_KEY) === 'true';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const migrated = migrateState(parsed) || {};
        const { unlocked, timestamps } = deriveBadges(
          migrated.awardedActionIds || [],
          migrated.badgeTimestamps || {},
          migrated.xp || 0
        );
        const levelInfo = calculateLevel(migrated.xp || 0);

        return {
          ...initial,
          ...migrated,
          xp: migrated.xp || 0,
          level: levelInfo.level,
          levelTitle: levelInfo.name,
          xpToNext: levelInfo.nextXp,
          awardedActionIds: migrated.awardedActionIds || [],
          badgeTimestamps: timestamps,
          achievements: initialAchievements.map((badge) => ({
            ...badge,
            unlocked: Boolean(unlocked[badge.key]),
            unlockedAt: timestamps[badge.key] || null
          })),
          session: {
            ...initial.session,
            ...(migrated.session || {}),
            profileSelected: hasEntered || Boolean(migrated.session?.profileSelected)
          },
          version: STORAGE_VERSION
        };
      }
    } catch (err) {
      console.warn('Failed to load persisted game state:', err);
    }
    return {
      ...initial,
      session: {
        ...initial.session,
        profileSelected: hasEntered
      }
    };
  });

  // Save state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Failed to persist game state:', err);
    }
  }, [state]);

  // Sync reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => dispatch({ type: ActionTypes.SET_REDUCED_MOTION, payload: e.matches });
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Action dispatches
  const actions = useMemo(
    () => ({
      // XP & Action Awards
      awardAction: (actionId, amount = 0, label = '') =>
        dispatch({
          type: ActionTypes.AWARD_ACTION,
          payload: { actionId, amount, label }
        }),

      // Welcome Gateway Actions
      enterPortfolio: () => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(WELCOME_ENTERED_KEY, 'true');
          } catch (e) {
            /* ignore */
          }
        }
        dispatch({
          type: ActionTypes.SET_PROFILE_SELECTED,
          payload: true
        });
        dispatch({
          type: ActionTypes.AWARD_ACTION,
          payload: { actionId: 'enter_portfolio', amount: 20, label: 'Entered Portfolio Gateway' }
        });
      },

      enterCliMode: () => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(WELCOME_ENTERED_KEY, 'true');
          } catch (e) {
            /* ignore */
          }
        }
        dispatch({
          type: ActionTypes.SET_PROFILE_SELECTED,
          payload: true
        });
        dispatch({
          type: ActionTypes.SET_TERMINAL_OPEN,
          payload: true
        });
      },

      setProfileSelected: (selected) => {
        if (typeof window !== 'undefined' && selected) {
          try {
            window.localStorage.setItem(WELCOME_ENTERED_KEY, 'true');
          } catch (e) {
            /* ignore */
          }
        }
        dispatch({ type: ActionTypes.SET_PROFILE_SELECTED, payload: Boolean(selected) });
      },

      addVisitedSection: (section) => {
        dispatch({ type: ActionTypes.ADD_VISITED_SECTION, payload: section });
        // Discrete section view actions
        if (section === 'about') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: { actionId: 'about_view', amount: 30, label: 'About Shelf Explored' }
          });
        } else if (section === 'skills') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: { actionId: 'skills_view', amount: 30, label: 'Character Sheet Inspected' }
          });
        } else if (section === 'contact') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: { actionId: 'contact_view', amount: 20, label: 'Contact Terminal Reached' }
          });
        } else if (section === 'achievements') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: { actionId: 'achievements_view', amount: 20, label: 'Achievements Shelf Explored' }
          });
        }
      },

      // Project detail modal
      openProjectModal: (project) => {
        dispatch({
          type: ActionTypes.SET_SELECTED_PROJECT,
          payload: project
        });
        if (project) {
          const proj = allProjects.find((p) => p.id === project.id || p.slug === project.slug);
          if (proj) {
            const projectSlug = proj.slug || (proj.id === 'proj-1' ? 'gla-exchange' : 'educloud');
            dispatch({
              type: ActionTypes.AWARD_ACTION,
              payload: {
                actionId: `project:open:${projectSlug}`,
                amount: 25,
                label: `Project Detail: ${proj.title}`
              }
            });
          }
        }
      },

      closeProjectModal: () =>
        dispatch({
          type: ActionTypes.SET_MODAL_OPEN,
          payload: false
        }),

      // Terminal drawer
      toggleTerminal: () => dispatch({ type: ActionTypes.TOGGLE_TERMINAL }),
      openTerminal: () => dispatch({ type: ActionTypes.SET_TERMINAL_OPEN, payload: true }),
      closeTerminal: () => dispatch({ type: ActionTypes.SET_TERMINAL_OPEN, payload: false }),

      addTerminalHistory: (entry) =>
        dispatch({ type: ActionTypes.ADD_TERMINAL_HISTORY, payload: entry }),

      incrementCommandCount: () =>
        dispatch({ type: ActionTypes.INCREMENT_COMMAND_COUNT }),

      addEasterEgg: (egg) =>
        dispatch({ type: ActionTypes.ADD_EASTER_EGG, payload: { egg } }),

      toggleMatrixMode: () =>
        dispatch({ type: ActionTypes.TOGGLE_MATRIX_MODE }),

      // Toasts
      addToast: (toast) => dispatch({ type: ActionTypes.ADD_TOAST, payload: toast }),
      removeToast: (id) => dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id }),

      // Reset
      resetGame: () => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(WELCOME_ENTERED_KEY);
            window.localStorage.removeItem(STORAGE_KEY);
            window.sessionStorage.removeItem(PRELOADER_COMPLETED_KEY);
          } catch (e) {
            /* ignore */
          }
        }
        dispatch({ type: ActionTypes.RESET_STATE });
      },

      // Helpers
      getUnlockedAchievements: () =>
        (state.achievements || []).filter((a) => a.unlocked),

      hasBadge: (key) =>
        Boolean((state.achievements || []).find((a) => a.key === key && a.unlocked))
    }),
    [state.achievements]
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom Hooks
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function useXP() {
  const { state } = useGame();
  const currentXp = state.xp || 0;
  const levelInfo = calculateLevel(currentXp);
  const progressInLevel = calculateLevelProgress(currentXp);

  return {
    xp: currentXp,
    totalXp: currentXp,
    level: levelInfo.level,
    levelTitle: levelInfo.name,
    xpToNext: levelInfo.nextXp,
    progress: progressInLevel
  };
}

export function useAchievements() {
  const { state } = useGame();
  return {
    achievements: state.achievements || [],
    unlockedCount: (state.achievements || []).filter((a) => a.unlocked).length,
    totalCount: (state.achievements || []).length
  };
}

export function useSession() {
  const { state, actions } = useGame();
  return {
    profileSelected: state.session.profileSelected,
    visitedSections: state.session.visitedSections,
    setProfileSelected: actions.setProfileSelected,
    enterPortfolio: actions.enterPortfolio,
    enterCliMode: actions.enterCliMode,
    addVisitedSection: actions.addVisitedSection
  };
}

export function useUI() {
  const { state, actions } = useGame();
  return {
    reducedMotion: state.ui.reducedMotion,
    terminalOpen: state.ui.terminalOpen,
    modalOpen: state.ui.modalOpen,
    selectedProject: state.ui.selectedProject,
    openProjectModal: actions.openProjectModal,
    closeProjectModal: actions.closeProjectModal,
    toasts: state.ui.toastQueue,
    toggleTerminal: actions.toggleTerminal,
    openTerminal: actions.openTerminal,
    closeTerminal: actions.closeTerminal,
    addToast: actions.addToast,
    removeToast: actions.removeToast
  };
}

export function useGameActions() {
  const { actions } = useGame();
  return actions;
}

export { GameContext };
