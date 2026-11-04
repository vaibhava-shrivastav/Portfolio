/**
 * ==========================================================================
 * GameContext — XP Engine, Discrete Action Table, Badges & Toast State
 * ==========================================================================
 * Features:
 * - Discrete action-based XP system (StrictMode idempotent, persisted once per ID)
 * - Pure badge derivation function (deriveBadges) with persisted unlock timestamps
 * - Level thresholds:
 *     Level 1: 0 XP (Curious Visitor)
 *     Level 2: 100 XP (Explorer)
 *     Level 3: 200 XP (Insider)
 *     Level 4: 350 XP (Power User)
 *     Level 5: 500 XP (Hired!)
 * - Maximum available XP sum = 555 XP >= 500 XP (Level 5 fully reachable)
 * - Single-item visible Toast queue with pause-on-hover/focus and drop-oldest-XP priority
 * - One-time migration for legacy localStorage formats
 * ==========================================================================
 */
import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import {
  profile as initialProfile,
  gameAchievements as initialAchievements,
  visitorPersonas,
  defaultPersona,
  projects as allProjects,
  xpLevels,
  xpActions
} from '../data/profile';
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  calculateLevel,
  calculateLevelProgress,
  deriveBadges,
  enqueueToast,
  migrateState
} from './game-engine';

// Re-export pure logic
export {
  STORAGE_KEY,
  STORAGE_VERSION,
  calculateLevel,
  calculateLevelProgress,
  deriveBadges,
  enqueueToast,
  migrateState
};

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

  // Session / Persona select state
  session: {
    profileSelected: false,
    selectedProfile: null,
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
const ActionTypes = {
  AWARD_ACTION: 'AWARD_ACTION',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  TOGGLE_TERMINAL: 'TOGGLE_TERMINAL',
  SET_MODAL_OPEN: 'SET_MODAL_OPEN',
  SET_SELECTED_PROJECT: 'SET_SELECTED_PROJECT',
  SET_PROFILE_SELECTED: 'SET_PROFILE_SELECTED',
  SET_SELECTED_PROFILE: 'SET_SELECTED_PROFILE',
  ADD_VISITED_SECTION: 'ADD_VISITED_SECTION',
  ADD_TERMINAL_HISTORY: 'ADD_TERMINAL_HISTORY',
  INCREMENT_COMMAND_COUNT: 'INCREMENT_COMMAND_COUNT',
  ADD_EASTER_EGG: 'ADD_EASTER_EGG',
  TOGGLE_MATRIX_MODE: 'TOGGLE_MATRIX_MODE',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.AWARD_ACTION: {
      const { actionId, amount = 0, label = '' } = action.payload || {};
      if (!actionId) return state;

      const awarded = state.awardedActionIds || [];
      // StrictMode idempotency / duplicate check
      if (awarded.includes(actionId)) {
        return state;
      }

      const newAwarded = [...awarded, actionId];
      const addedXp = Math.max(0, Number(amount) || 0);
      const newXp = state.xp + addedXp;
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

      // 2. Enqueue Achievement Toasts for any newly unlocked badges
      for (const badgeKey of newlyUnlockedKeys) {
        const badgeDef = initialAchievements.find((b) => b.key === badgeKey);
        if (badgeDef) {
          newToastQueue = enqueueToast(newToastQueue, {
            type: 'achievement',
            title: `Badge Unlocked: ${badgeDef.name}`,
            message: badgeDef.description,
            icon: badgeDef.icon || 'military_tech',
            rarity: badgeDef.rarity || 'common',
            badgeKey
          });
        }
      }

      // 3. Enqueue XP Toast if XP was gained
      if (addedXp > 0) {
        newToastQueue = enqueueToast(newToastQueue, {
          type: 'xp',
          actionId,
          title: `+${addedXp} XP`,
          message: label || actionId.replace(/_/g, ' '),
          amount: addedXp
        });
      }

      return {
        ...state,
        xp: newXp,
        level: levelInfo.level,
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
      return {
        ...state,
        ui: {
          ...state.ui,
          toastQueue: (state.ui.toastQueue || []).filter((t) => t.id !== action.payload)
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
      const willOpen = !state.ui.terminalOpen;
      return {
        ...state,
        ui: { ...state.ui, terminalOpen: willOpen }
      };
    }

    case ActionTypes.SET_MODAL_OPEN: {
      return {
        ...state,
        ui: {
          ...state.ui,
          modalOpen: action.payload,
          selectedProject: action.payload ? state.ui.selectedProject : null
        }
      };
    }

    case ActionTypes.SET_SELECTED_PROJECT: {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedProject: action.payload,
          modalOpen: Boolean(action.payload)
        }
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
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const migrated = migrateState(parsed) || {};
        const { unlocked, timestamps } = deriveBadges(
          migrated.awardedActionIds || [],
          migrated.badgeTimestamps || {}
        );
        const levelInfo = calculateLevel(migrated.xp || 0);

        return {
          ...initial,
          ...migrated,
          xp: migrated.xp || 0,
          level: levelInfo.level,
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
            ...(migrated.session || {})
          },
          version: STORAGE_VERSION
        };
      }
    } catch (err) {
      console.warn('Failed to load persisted game state:', err);
    }
    return initial;
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
    dispatch({ type: ActionTypes.SET_REDUCED_MOTION, payload: mediaQuery.matches });
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

      // Persona & Profile Selection
      selectPersona: (personaId) => {
        dispatch({
          type: ActionTypes.SET_SELECTED_PROFILE,
          payload: personaId
        });
        dispatch({
          type: ActionTypes.SET_PROFILE_SELECTED,
          payload: true
        });
        // Award profile select XP once
        dispatch({
          type: ActionTypes.AWARD_ACTION,
          payload: { actionId: 'profile_select', amount: 20, label: 'Profile Selected' }
        });
        // If Judge persona chosen, award persona:judge (triggers Cloud Native badge)
        if (personaId === 'judge') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: { actionId: 'persona:judge', amount: 0, label: 'Judge Persona Chosen' }
          });
        }
      },

      enterDirectly: (defaultPersonaId = 'default') => {
        dispatch({
          type: ActionTypes.SET_SELECTED_PROFILE,
          payload: state.session?.selectedProfile || defaultPersonaId
        });
        dispatch({
          type: ActionTypes.SET_PROFILE_SELECTED,
          payload: true
        });
      },

      setProfileSelected: (selected) =>
        dispatch({ type: ActionTypes.SET_PROFILE_SELECTED, payload: selected }),

      setSelectedProfile: (profileId) =>
        dispatch({ type: ActionTypes.SET_SELECTED_PROFILE, payload: profileId }),

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
        } else if (section === 'achievements') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: { actionId: 'achievements_view', amount: 20, label: 'Achievements Reviewed' }
          });
        } else if (section === 'contact') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: { actionId: 'contact_view', amount: 20, label: 'Contact Terminal Reached' }
          });
        }
      },

      // Project Modal
      openProjectModal: (projectOrId) => {
        let proj = projectOrId;
        if (typeof projectOrId === 'string') {
          proj =
            (allProjects || []).find(
              (p) => p.id === projectOrId || p.title.toLowerCase().includes(projectOrId.toLowerCase())
            ) || null;
        }
        if (proj) {
          dispatch({ type: ActionTypes.SET_SELECTED_PROJECT, payload: proj });
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: {
              actionId: `project:open:${proj.id}`,
              amount: 25,
              label: `Inspected ${proj.title}`
            }
          });
        }
      },

      closeProjectModal: () => dispatch({ type: ActionTypes.SET_MODAL_OPEN, payload: false }),

      // Terminal
      toggleTerminal: () => {
        const willOpen = !state.ui.terminalOpen;
        dispatch({ type: ActionTypes.TOGGLE_TERMINAL });
        if (willOpen) {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: {
              actionId: 'terminal_first_open',
              amount: 50,
              label: 'Interactive Terminal Initialized'
            }
          });
        }
      },

      addTerminalHistory: (entry) =>
        dispatch({ type: ActionTypes.ADD_TERMINAL_HISTORY, payload: entry }),

      incrementCommandCount: () => dispatch({ type: ActionTypes.INCREMENT_COMMAND_COUNT }),

      addEasterEgg: (egg) => {
        dispatch({ type: ActionTypes.ADD_EASTER_EGG, payload: { egg } });
        if (egg === 'konami') {
          dispatch({
            type: ActionTypes.AWARD_ACTION,
            payload: {
              actionId: 'secret_or_konami',
              amount: 100,
              label: 'Secret Konami Code Activated'
            }
          });
        }
      },

      toggleMatrixMode: () => dispatch({ type: ActionTypes.TOGGLE_MATRIX_MODE }),

      // Toasts
      addToast: (toast) => dispatch({ type: ActionTypes.ADD_TOAST, payload: toast }),
      removeToast: (id) => dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id }),

      // Achievements compatibility helpers
      unlockAchievement: (key) => {
        const keyActionMap = {
          pilot_episode: 'preloader_finish',
          found_the_terminal: 'terminal_first_open',
          reached_out: 'contact_form_sent',
          konami_master: 'secret_or_konami',
          cloud_native: 'aws_services_view',
          shipped_it: 'link_click:gla_exchange',
          certified: 'certifications_view'
        };
        const actionId = keyActionMap[key] || `badge_action:${key}`;
        dispatch({
          type: ActionTypes.AWARD_ACTION,
          payload: { actionId, amount: 0, label: `Badge Trigger: ${key}` }
        });
      },

      getUnlockedAchievements: () => (state.achievements || []).filter((a) => a.unlocked),
      getLockedAchievements: () => (state.achievements || []).filter((a) => !a.unlocked),

      // Progress Reset
      resetGame: () => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
            window.sessionStorage.removeItem('netflix-portfolio-session-preloader-seen');
          } catch (e) {
            console.warn(e);
          }
        }
        dispatch({ type: ActionTypes.RESET_STATE });
      },

      // Computed Helpers
      getLevelProgress: () => calculateLevelProgress(state.xp),
      getTotalXp: () => state.xp,
      isLevelMax: () => state.level >= 5
    }),
    [state.xp, state.level, state.achievements, state.awardedActionIds, state.ui.terminalOpen]
  );

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
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
  const { state, actions } = useGame();
  return {
    xp: state.xp,
    level: state.level,
    xpToNext: state.xpToNext,
    progress: actions.getLevelProgress(),
    totalXp: actions.getTotalXp(),
    isMaxLevel: actions.isLevelMax(),
    awardAction: actions.awardAction
  };
}

export function useAchievements() {
  const { state, actions } = useGame();
  return {
    achievements: state.achievements,
    unlocked: actions.getUnlockedAchievements(),
    locked: actions.getLockedAchievements(),
    unlock: actions.unlockAchievement
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
  const persona =
    visitorPersonas.find((p) => p.id === personaId) ||
    (personaId === 'default' ? defaultPersona : null);
  const activePersona = persona || defaultPersona;
  return {
    persona: activePersona,
    personaId: personaId || 'default',
    selectPersona: actions.selectPersona,
    enterDirectly: actions.enterDirectly,
    tagline: activePersona?.tagline || initialProfile.tagline,
    firstRowOrder: activePersona?.firstRowOrder || ['projects', 'about'],
    isSelectingProfile: !state.session?.profileSelected
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
    addToast: actions.addToast,
    removeToast: actions.removeToast
  };
}

export function useGameActions() {
  const { actions } = useGame();
  return actions;
}

export { GameContext };
