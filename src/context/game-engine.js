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

    // 7. Cloud Native (judge persona chosen OR AWS services row viewed)
    cloud_native: evaluate(
      'cloud_native',
      ids.has('persona:judge') || ids.has('aws_services_view')
    ),

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
 * One-time migration for legacy localStorage shapes
 */
export function migrateState(stored) {
  if (!stored || typeof stored !== 'object') return null;
  const migrated = { ...stored };

  // Ensure awardedActionIds array
  if (!Array.isArray(migrated.awardedActionIds)) {
    migrated.awardedActionIds = [];
  }

  // Ensure badgeTimestamps map
  if (!migrated.badgeTimestamps || typeof migrated.badgeTimestamps !== 'object') {
    migrated.badgeTimestamps = {};
  }

  // Strip legacy XP values from achievements if present
  if (Array.isArray(migrated.achievements)) {
    migrated.achievements = migrated.achievements.map((a) => {
      const { xpReward, xp, ...rest } = a;
      return { ...rest };
    });
  }

  migrated.version = STORAGE_VERSION;
  return migrated;
}

/**
 * Pure state transition for awarding an XP action.
 * Idempotent: if actionId has already been awarded, returns original state without modifying XP.
 */
export function applyAwardAction(state, actionId, amount = 0) {
  if (!state || !actionId) return state;

  const awarded = state.awardedActionIds || [];
  if (awarded.includes(actionId)) {
    return state;
  }
  if (actionId === 'terminal_open' && awarded.includes('terminal_first_open')) {
    return state;
  }
  if (actionId === 'terminal_first_open' && awarded.includes('terminal_open')) {
    return state;
  }

  const newAwarded = [...awarded, actionId];
  if (actionId === 'terminal_first_open' && !newAwarded.includes('terminal_open')) {
    newAwarded.push('terminal_open');
  } else if (actionId === 'terminal_open' && !newAwarded.includes('terminal_first_open')) {
    newAwarded.push('terminal_first_open');
  }

  const addedXp = Math.max(0, Number(amount) || 0);
  const currentXp = Number(state.xp) || 0;
  const newXp = currentXp + addedXp;
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
    awardedActionIds: newAwarded,
    badgeTimestamps: timestamps,
    badgeUnlocked: unlocked,
    newlyUnlockedKeys
  };
}
