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
export const MAX_TOTAL_XP = 555;

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
  'project:open:proj-1': 25,
  'project:open:proj-2': 25,

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
  'command:deploy': 10,
  'command:theme': 10,
  'command:clear': 10,

  // Link clicks (15 XP each, max 3 link clicks = 45 XP)
  'link_click:resume': 15,
  'link_click:github': 15,
  'link_click:linkedin': 15,
  'project:live:proj-1': 15,
  'project:live:proj-2': 15,

  // Zero-XP Badge triggers (valid actions, 0 XP)
  preloader_finish: 0,
  certifications_view: 0,
  aws_services_view: 0,
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
export function deriveBadges(awardedActionIds = [], existingTimestamps = {}) {
  const ids = new Set(awardedActionIds || []);
  const timestamps = { ...(existingTimestamps || {}) };
  const newlyUnlockedKeys = [];
  const now = new Date().toISOString();

  const evaluate = (key, condition) => {
    const isUnlocked = Boolean(condition || timestamps[key]);
    if (condition && !timestamps[key]) {
      timestamps[key] = now;
      newlyUnlockedKeys.push(key);
    }
    return isUnlocked;
  };

  const unlocked = {
    // 1. Pilot Episode (preloader finished)
    pilot_episode: evaluate('pilot_episode', ids.has('preloader_finish')),

    // 2. Found the Terminal (terminal opened)
    found_the_terminal: evaluate('found_the_terminal', ids.has('terminal_first_open')),

    // 3. Project Binge (both projects opened)
    project_binge: evaluate(
      'project_binge',
      ids.has('project:open:proj-1') && ids.has('project:open:proj-2')
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

    // 5. Reached Out (contact form sent)
    reached_out: evaluate('reached_out', ids.has('contact_form_sent')),

    // 6. Konami Master (Konami code entered)
    konami_master: evaluate('konami_master', ids.has('secret_or_konami')),

    // 7. Cloud Native (AWS services shelf viewed)
    cloud_native: evaluate('cloud_native', ids.has('aws_services_view')),

    // 8. Shipped It (visited live GLA Exchange)
    shipped_it: evaluate(
      'shipped_it',
      ids.has('link_click:gla_exchange') || ids.has('project:live:proj-1')
    ),

    // 9. Certified (certifications card viewed)
    certified: evaluate('certified', ids.has('certifications_view')),

    // 10. Full Run (all other 9 unlocked)
    full_run: false
  };

  const otherNineKeys = [
    'pilot_episode', 'found_the_terminal', 'project_binge', 'skill_collector',
    'reached_out', 'konami_master', 'cloud_native', 'shipped_it', 'certified'
  ];
  const allNineUnlocked = otherNineKeys.every((k) => unlocked[k]);
  unlocked.full_run = evaluate('full_run', allNineUnlocked);

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
 * Deduplicates, enforces caps on link clicks (max 3 = 45 XP) and unique commands (max 17 = 170 XP),
 * and clamps between 0 and MAX_TOTAL_XP (555 XP).
 */
export function recomputeXpFromActions(actionIds = []) {
  const seen = new Set();
  let linkClickCount = 0;
  let commandCount = 0;
  let total = 0;

  for (const rawId of actionIds) {
    if (!rawId || typeof rawId !== 'string') continue;
    let id = rawId;
    if (id === 'profile_select' || id === 'profile-select') id = 'enter_portfolio';
    else if (id === 'terminal_open') id = 'terminal_first_open';
    else if (id === 'link_click:gla_exchange') id = 'project:live:proj-1';

    if (seen.has(id)) continue;
    seen.add(id);

    if (id.startsWith('command:')) {
      if (KNOWN_ACTIONS[id] !== undefined && commandCount < 17) {
        commandCount++;
        total += 10;
      }
    } else if (id.startsWith('link_click:') || id.startsWith('project:live:')) {
      if (KNOWN_ACTIONS[id] !== undefined && linkClickCount < 3) {
        linkClickCount++;
        total += 15;
      }
    } else if (KNOWN_ACTIONS[id] !== undefined) {
      total += KNOWN_ACTIONS[id];
    }
  }

  return Math.min(MAX_TOTAL_XP, Math.max(0, total));
}

/**
 * Migration for persisted localStorage state.
 * Validates saved state against KNOWN_ACTIONS, drops unknown IDs, removes old persona keys,
 * strictly recomputes XP from valid actions, and clamps XP between 0 and 555.
 */
export function migrateState(stored) {
  if (!stored || typeof stored !== 'object') return null;
  const migrated = { ...stored };

  // Sanitize awardedActionIds: map legacy IDs, drop unknown IDs & persona keys
  const rawAwarded = Array.isArray(migrated.awardedActionIds) ? migrated.awardedActionIds : [];
  const validActionIds = [];
  const seen = new Set();

  for (const rawId of rawAwarded) {
    if (!rawId || typeof rawId !== 'string') continue;
    // Drop old persona actions
    if (rawId.startsWith('persona:')) continue;

    let id = rawId;
    if (id === 'profile_select' || id === 'profile-select') id = 'enter_portfolio';
    else if (id === 'terminal_open') id = 'terminal_first_open';
    else if (id === 'link_click:gla_exchange') id = 'project:live:proj-1';

    if (KNOWN_ACTIONS[id] !== undefined && !seen.has(id)) {
      seen.add(id);
      validActionIds.push(id);
    }
  }
  migrated.awardedActionIds = validActionIds;

  // Recompute XP strictly from valid actions and clamp
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
  const { unlocked, timestamps } = deriveBadges(validActionIds, migrated.badgeTimestamps);
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
 * Clamps XP to MAX_TOTAL_XP (555).
 */
export function applyAwardAction(state, actionId, amount = 0) {
  if (!state || !actionId) return state;

  let normalizedId = actionId;
  if (normalizedId === 'profile_select' || normalizedId === 'profile-select') {
    normalizedId = 'enter_portfolio';
  } else if (normalizedId === 'terminal_open') {
    normalizedId = 'terminal_first_open';
  } else if (normalizedId === 'link_click:gla_exchange') {
    normalizedId = 'project:live:proj-1';
  }

  const awarded = state.awardedActionIds || [];
  if (awarded.includes(normalizedId) || (actionId !== normalizedId && awarded.includes(actionId))) {
    return state;
  }

  const newAwarded = [...awarded, normalizedId];
  if (normalizedId === 'terminal_first_open' && !newAwarded.includes('terminal_open')) {
    newAwarded.push('terminal_open');
  }

  const addedXp = Math.max(0, Number(amount) || 0);
  const currentXp = Number(state.xp) || 0;
  const newXp = Math.min(MAX_TOTAL_XP, currentXp + addedXp);
  const levelInfo = calculateLevel(newXp);

  const { unlocked, timestamps, newlyUnlockedKeys } = deriveBadges(
    newAwarded,
    state.badgeTimestamps
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
