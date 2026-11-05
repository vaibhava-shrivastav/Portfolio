/**
 * ==========================================================================
 * Game Engine — Pure Logic for XP Progression, Badges, Toasts & Migration
 * ==========================================================================
 * Pure functions with zero JSX or React dependencies, fully testable by node:test
 * ==========================================================================
 */

export const STORAGE_KEY = 'netflix-portfolio-game-state';
export const STORAGE_VERSION = 3;

/**
 * Maximum achievable XP across all discrete game actions.
 * Level 5 ("Hired!") is reached at 500 XP.
 */
export const MAX_TOTAL_XP = 570;

/**
 * Known discrete actions that award XP or trigger badges.
 * Any action ID not in this map is invalid and rejected during state migration.
 */
export const KNOWN_ACTIONS = {
  // Gateway entry (+20 XP once)
  enter_portfolio: 20,

  // Section views
  about_view: 30,
  skills_view: 30,
  achievements_view: 20,
  contact_view: 20,
  contact_form_sent: 20,

  // Projects (25 XP each, max 2 = 50 XP)
  'project:open:gla-exchange': 25,
  'project:open:educloud': 25,

  // Live project link (15 XP, only GLA Exchange has a live link)
  'project:live:gla-exchange': 15,

  // Terminal
  terminal_first_open: 50,
  secret_or_konami: 100,

  // Terminal commands (10 XP each, up to 17 unique = 170 XP)
  'command:help': 10,
  'command:whoami': 10,
  'command:about': 10,
  'command:skills': 10,
  'command:skills --level': 10,
  'command:projects': 10,
  'command:play': 10,
  'command:achievements': 10,
  'command:experience': 10,
  'command:education': 10,
  'command:resume': 10,
  'command:contact': 10,
  'command:github': 10,
  'command:linkedin': 10,
  'command:deploy --global': 10,
  'command:theme': 10,
  'command:clear': 10,

  // Link clicks (15 XP each, max 3 link clicks = 45 XP)
  'link_click:github': 15,
  'link_click:linkedin': 15,
  'link_click:resume': 15,

  // Zero-XP Badge triggers (valid actions, 0 XP)
  preloader_finish: 0,
  certifications_view: 0,
  'skill_cat:Languages': 0,
  'skill_cat:Frameworks & Libraries': 0,
  'skill_cat:Cloud & DevOps': 0,
  'skill_cat:Databases': 0,
  'skill_cat:CS Fundamentals': 0,
  'skill_cat:Developer Tools': 0
};

/**
 * Calculates current level details based on XP.
 */
export function calculateLevel(xp = 0) {
  const currentXp = Math.max(0, Number(xp) || 0);
  if (currentXp >= 500) return { level: 5, name: 'Hired!', minXp: 500, nextXp: 500 };
  if (currentXp >= 350) return { level: 4, name: 'Power User', minXp: 350, nextXp: 500 };
  if (currentXp >= 200) return { level: 3, name: 'Insider', minXp: 200, nextXp: 350 };
  if (currentXp >= 100) return { level: 2, name: 'Explorer', minXp: 100, nextXp: 200 };
  return { level: 1, name: 'Curious Visitor', minXp: 0, nextXp: 100 };
}

/**
 * Calculates 0-100% progress within current level bracket.
 */
export function calculateLevelProgress(xp = 0) {
  const currentXp = Math.max(0, Number(xp) || 0);
  const current = calculateLevel(currentXp);
  if (current.level >= 5) return 100;
  const range = current.nextXp - current.minXp;
  if (range <= 0) return 100;
  const progressInLevel = Math.max(0, Math.min(currentXp - current.minXp, range));
  return Math.round((progressInLevel / range) * 100);
}

/**
 * Pure function deriving badges from awarded action IDs and existing unlock timestamps.
 * Returns { unlocked, timestamps, newlyUnlockedKeys }
 */
export function deriveBadges(awardedActionIds = [], existingTimestamps = {}, currentXp = null) {
  const ids = new Set(awardedActionIds || []);
  const timestamps = { ...(existingTimestamps || {}) };
  const newlyUnlockedKeys = [];
  const now = new Date().toISOString();

  const xp = typeof currentXp === 'number' && currentXp >= 0
    ? currentXp
    : recomputeXpFromActions(awardedActionIds);

  const evaluate = (key, condition) => {
    const isUnlocked = Boolean(condition || timestamps[key]);
    if (condition && !timestamps[key]) {
      timestamps[key] = now;
      newlyUnlockedKeys.push(key);
    }
    return isUnlocked;
  };

  const unlocked = {
    // 1. Pilot Episode (preloader finished or entered portfolio)
    pilot_episode: evaluate('pilot_episode', ids.has('preloader_finish') || ids.has('enter_portfolio')),

    // 2. Found the Terminal (terminal opened)
    found_the_terminal: evaluate('found_the_terminal', ids.has('terminal_first_open')),

    // 3. Project Binge (both projects opened)
    project_binge: evaluate(
      'project_binge',
      ids.has('project:open:gla-exchange') && ids.has('project:open:educloud')
    ),

    // 4. Skill Collector (all 6 skill categories expanded)
    skill_collector: evaluate(
      'skill_collector',
      ids.has('skill_cat:Languages') &&
      ids.has('skill_cat:Frameworks & Libraries') &&
      ids.has('skill_cat:Cloud & DevOps') &&
      ids.has('skill_cat:Databases') &&
      ids.has('skill_cat:CS Fundamentals') &&
      ids.has('skill_cat:Developer Tools')
    ),

    // 5. Reached Out (contact form sent on real API success)
    reached_out: evaluate('reached_out', ids.has('contact_form_sent')),

    // 6. Konami Master (Konami sequence or secret protocol activated)
    konami_master: evaluate('konami_master', ids.has('secret_or_konami')),

    // 7. Cloud Native (EduCloud project detail opened)
    cloud_native: evaluate('cloud_native', ids.has('project:open:educloud')),

    // 8. Shipped It (visited live GLA Exchange)
    shipped_it: evaluate('shipped_it', ids.has('project:live:gla-exchange')),

    // 9. Certified (certifications card viewed)
    certified: evaluate('certified', ids.has('certifications_view')),

    // 10. Full Run (reached Level 5: 500+ XP)
    full_run: evaluate('full_run', xp >= 500 || ids.has('level_5_reached'))
  };

  return { unlocked, timestamps, newlyUnlockedKeys };
}

/**
 * Toast queue manager with max length 5.
 * Collapses duplicate XP toasts and drops oldest XP toasts first.
 */
export function enqueueToast(queue = [], newToast) {
  const current = [...queue];

  // Collapse repeat XP toasts with identical source
  if (newToast.type === 'xp') {
    const existingIndex = current.findIndex(
      (t) => t.type === 'xp' && t.actionId === newToast.actionId
    );
    if (existingIndex !== -1) {
      current[existingIndex] = {
        ...current[existingIndex],
        ...newToast,
        id: Date.now()
      };
      return current;
    }
  }

  // Cap queue length at 5: drop oldest XP toast first, never drop achievement toasts if XP exists
  if (current.length >= 5) {
    const oldestXpIndex = current.findIndex((t) => t.type === 'xp');
    if (oldestXpIndex !== -1) {
      current.splice(oldestXpIndex, 1);
    } else {
      // If only achievements or level-ups remain, drop oldest non-critical
      current.shift();
    }
  }

  current.push({
    id: newToast.id || `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...newToast
  });

  return current;
}

/**
 * Pure function: strictly recomputes total XP from a list of action IDs based on KNOWN_ACTIONS.
 * Deduplicates, maps legacy action IDs to approved equivalents, and sums valid actions.
 * No clamping is applied because valid actions mathematically sum to the real maximum (570 XP).
 */
export function recomputeXpFromActions(actionIds = []) {
  if (!Array.isArray(actionIds)) return 0;
  const seen = new Set();
  let total = 0;

  for (const rawId of actionIds) {
    if (!rawId || typeof rawId !== 'string') continue;
    let id = rawId;
    if (id === 'profile_select' || id === 'profile-select' || id.startsWith('persona:')) {
      id = 'enter_portfolio';
    } else if (id === 'terminal_open') {
      id = 'terminal_first_open';
    } else if (id === 'project:open:proj-1' || id === 'project_modal_view' || id === 'project_gla_exchange_view') {
      id = 'project:open:gla-exchange';
    } else if (id === 'project:open:proj-2' || id === 'project_educloud_view') {
      id = 'project:open:educloud';
    } else if (id === 'link_click:gla_exchange' || id === 'project:live:proj-1') {
      id = 'project:live:gla-exchange';
    } else if (id === 'command:deploy') {
      id = 'command:deploy --global';
    }

    if (seen.has(id)) continue;
    seen.add(id);

    if (KNOWN_ACTIONS[id] !== undefined) {
      total += KNOWN_ACTIONS[id];
    }
  }

  return Math.max(0, total);
}

/**
 * Migration for persisted localStorage state.
 * Validates saved state against KNOWN_ACTIONS, drops unknown IDs, removes old persona keys,
 * and strictly recomputes XP from valid actions without clamping.
 * If the saved state is not an object or has an unrecognized shape, resets to empty state (null).
 */
export function migrateState(stored) {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return null;
  }

  const hasRecognizedShape =
    'awardedActionIds' in stored ||
    'xp' in stored ||
    'version' in stored ||
    'session' in stored;

  if (!hasRecognizedShape) {
    return null;
  }

  const migrated = { ...stored };

  // Sanitize awardedActionIds: map legacy IDs, drop unknown IDs
  const rawAwarded = Array.isArray(migrated.awardedActionIds) ? migrated.awardedActionIds : [];
  const validActionIds = [];
  const seen = new Set();

  for (const rawId of rawAwarded) {
    if (!rawId || typeof rawId !== 'string') continue;

    let id = rawId;
    if (id === 'profile_select' || id === 'profile-select' || id.startsWith('persona:')) {
      id = 'enter_portfolio';
    } else if (id === 'terminal_open') {
      id = 'terminal_first_open';
    } else if (id === 'project:open:proj-1' || id === 'project_modal_view' || id === 'project_gla_exchange_view') {
      id = 'project:open:gla-exchange';
    } else if (id === 'project:open:proj-2' || id === 'project_educloud_view') {
      id = 'project:open:educloud';
    } else if (id === 'link_click:gla_exchange' || id === 'project:live:proj-1') {
      id = 'project:live:gla-exchange';
    } else if (id === 'command:deploy') {
      id = 'command:deploy --global';
    }

    if (KNOWN_ACTIONS[id] !== undefined && !seen.has(id)) {
      seen.add(id);
      validActionIds.push(id);
    }
  }
  migrated.awardedActionIds = validActionIds;

  // Recompute XP strictly from valid actions without clamping
  const recomputedXp = recomputeXpFromActions(validActionIds);
  migrated.xp = recomputedXp;
  const levelInfo = calculateLevel(recomputedXp);
  migrated.level = levelInfo.level;
  migrated.levelTitle = levelInfo.name;
  migrated.xpToNext = levelInfo.nextXp;

  // Ensure badgeTimestamps map
  if (!migrated.badgeTimestamps || typeof migrated.badgeTimestamps !== 'object') {
    migrated.badgeTimestamps = {};
  }

  // Derive badges with updated action set
  const { unlocked, timestamps } = deriveBadges(validActionIds, migrated.badgeTimestamps, recomputedXp);
  migrated.badgeTimestamps = timestamps;
  migrated.badgeUnlocked = unlocked;

  // Clean session: remove persona references (selectedProfile, persona keys)
  const rawSession = (migrated.session && typeof migrated.session === 'object') ? migrated.session : {};
  const { selectedProfile, persona, ...restSession } = rawSession;
  migrated.session = {
    ...restSession,
    profileSelected: Boolean(
      rawSession.profileSelected ||
      migrated.profileSelected ||
      seen.has('enter_portfolio')
    ),
    visitedSections: Array.isArray(rawSession.visitedSections) ? rawSession.visitedSections : []
  };

  // Delete any top-level persona artifacts
  delete migrated.selectedProfile;
  delete migrated.selectedPersona;
  delete migrated.persona;

  // Strip legacy XP values from achievements if present
  if (Array.isArray(migrated.achievements)) {
    migrated.achievements = migrated.achievements.map((a) => {
      const { xpReward, xp, ...rest } = a;
      return {
        ...rest,
        unlocked: Boolean(unlocked[a.key]),
        unlockedAt: timestamps[a.key] || null
      };
    });
  }

  migrated.version = STORAGE_VERSION;
  return migrated;
}

/**
 * Pure state transition for awarding an XP action.
 * Idempotent: if actionId has already been awarded, returns original state without modifying XP.
 * Recomputes strictly from approved action values without clamping.
 */
export function applyAwardAction(state, actionId, amount = 0) {
  if (!state || !actionId) return state;

  let normalizedId = actionId;
  if (normalizedId === 'profile_select' || normalizedId === 'profile-select' || normalizedId.startsWith('persona:')) {
    normalizedId = 'enter_portfolio';
  } else if (normalizedId === 'terminal_open') {
    normalizedId = 'terminal_first_open';
  } else if (normalizedId === 'project:open:proj-1' || normalizedId === 'project_modal_view' || normalizedId === 'project_gla_exchange_view') {
    normalizedId = 'project:open:gla-exchange';
  } else if (normalizedId === 'project:open:proj-2' || normalizedId === 'project_educloud_view') {
    normalizedId = 'project:open:educloud';
  } else if (normalizedId === 'link_click:gla_exchange' || normalizedId === 'project:live:proj-1') {
    normalizedId = 'project:live:gla-exchange';
  } else if (normalizedId === 'command:deploy') {
    normalizedId = 'command:deploy --global';
  }

  const awarded = state.awardedActionIds || [];
  if (awarded.includes(normalizedId) || (actionId !== normalizedId && awarded.includes(actionId))) {
    return state;
  }

  const newAwarded = [...awarded, normalizedId];
  if (normalizedId === 'terminal_first_open' && !newAwarded.includes('terminal_open')) {
    newAwarded.push('terminal_open');
  }

  const addedXp = KNOWN_ACTIONS[normalizedId] !== undefined
    ? KNOWN_ACTIONS[normalizedId]
    : Math.max(0, Number(amount) || 0);
  const currentXp = Number(state.xp) || 0;
  const newXp = currentXp + addedXp;
  const levelInfo = calculateLevel(newXp);

  const { unlocked, timestamps, newlyUnlockedKeys } = deriveBadges(
    newAwarded,
    state.badgeTimestamps,
    newXp
  );

  return {
    ...state,
    xp: newXp,
    level: levelInfo.level,
    levelTitle: levelInfo.name,
    xpToNext: levelInfo.nextXp,
    awardedActionIds: newAwarded,
    badgeTimestamps: timestamps,
    badgeUnlocked: unlocked,
    newlyUnlockedKeys
  };
}
