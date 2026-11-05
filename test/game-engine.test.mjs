/**
 * ==========================================================================
 * Unit Tests — Game Engine, XP Progression, Badges Derivation, and Queue
 * ==========================================================================
 * Verified with node:test (Node.js built-in runner, zero external test dependencies)
 * ==========================================================================
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevel,
  calculateLevelProgress,
  deriveBadges,
  enqueueToast,
  migrateState,
  applyAwardAction,
  KNOWN_ACTIONS,
  MAX_TOTAL_XP,
  recomputeXpFromActions
} from '../src/context/game-engine.js';
import { gameAchievements } from '../src/data/profile.js';
import { parseCommand } from '../src/terminal/commands.js';
import { isKonamiSequence } from '../src/hooks/useKonami.js';

test('Level calculator respects exact threshold brackets', () => {
  assert.deepEqual(calculateLevel(0), { level: 1, name: 'Curious Visitor', minXp: 0, nextXp: 100 });
  assert.equal(calculateLevel(50).level, 1);
  assert.equal(calculateLevel(99).level, 1);

  assert.deepEqual(calculateLevel(100), { level: 2, name: 'Explorer', minXp: 100, nextXp: 200 });
  assert.equal(calculateLevel(150).level, 2);
  assert.equal(calculateLevel(199).level, 2);

  assert.deepEqual(calculateLevel(200), { level: 3, name: 'Insider', minXp: 200, nextXp: 350 });
  assert.equal(calculateLevel(250).level, 3);
  assert.equal(calculateLevel(349).level, 3);

  assert.deepEqual(calculateLevel(350), { level: 4, name: 'Power User', minXp: 350, nextXp: 500 });
  assert.equal(calculateLevel(400).level, 4);
  assert.equal(calculateLevel(499).level, 4);

  assert.deepEqual(calculateLevel(500), { level: 5, name: 'Hired!', minXp: 500, nextXp: 500 });
  assert.equal(calculateLevel(555).level, 5);
  assert.equal(calculateLevel(1000).level, 5);
});

test('Level progress percentage calculates correctly within bracket', () => {
  assert.equal(calculateLevelProgress(0), 0);
  assert.equal(calculateLevelProgress(50), 50);
  assert.equal(calculateLevelProgress(100), 0);
  assert.equal(calculateLevelProgress(150), 50);
  assert.equal(calculateLevelProgress(200), 0);
  assert.equal(calculateLevelProgress(275), 50);
  assert.equal(calculateLevelProgress(350), 0);
  assert.equal(calculateLevelProgress(425), 50);
  assert.equal(calculateLevelProgress(500), 100);
  assert.equal(calculateLevelProgress(600), 100);
});

test('XP Action Table maximum sum is at least 500 (Level 5 reachable)', () => {
  const table = [
    { name: 'enter_portfolio', xp: 20 },
    { name: 'about_view', xp: 30 },
    { name: 'project:open:gla-exchange', xp: 25 },
    { name: 'project:open:educloud', xp: 25 },
    { name: 'project:live:gla-exchange', xp: 15 },
    { name: 'skills_view', xp: 30 },
    { name: 'terminal_first_open', xp: 50 },
    { name: 'terminal_unique_commands', xp: 170 }, // 17 commands * 10
    { name: 'secret_or_konami', xp: 100 },
    { name: 'achievements_view', xp: 20 },
    { name: 'contact_view', xp: 20 },
    { name: 'link_click:github', xp: 15 },
    { name: 'link_click:linkedin', xp: 15 },
    { name: 'link_click:resume', xp: 15 },
    { name: 'contact_form_sent', xp: 20 }
  ];

  const totalPossibleXp = table.reduce((sum, item) => sum + item.xp, 0);
  assert.equal(totalPossibleXp, 570);
  assert.equal(MAX_TOTAL_XP, 570);
  assert.ok(totalPossibleXp >= 500, 'Sum of all possible XP must be >= 500 to reach Level 5');
});

test('All 10 badges award 0 XP (visual only badges)', () => {
  assert.equal(gameAchievements.length, 10, 'Must have exactly 10 badges');
  for (const badge of gameAchievements) {
    assert.equal(badge.xpReward, undefined, `Badge ${badge.name} must not define xpReward`);
    assert.equal(badge.xp, undefined, `Badge ${badge.name} must not define xp`);
  }
});

test('Pure deriveBadges unlocks badges based on discrete action IDs', () => {
  // Empty actions
  const initial = deriveBadges([], {});
  assert.equal(Object.values(initial.unlocked).filter(Boolean).length, 0);

  // 1. Pilot Episode (preloader_finish or enter_portfolio)
  const s1 = deriveBadges(['preloader_finish'], {});
  assert.equal(s1.unlocked.pilot_episode, true);
  assert.ok(s1.timestamps.pilot_episode);

  const s1b = deriveBadges(['enter_portfolio'], {});
  assert.equal(s1b.unlocked.pilot_episode, true);

  // 2. Found the Terminal
  const s2 = deriveBadges(['terminal_first_open'], {});
  assert.equal(s2.unlocked.found_the_terminal, true);

  // 3. Project Binge requires both projects
  const partialProjects = deriveBadges(['project:open:gla-exchange'], {});
  assert.equal(partialProjects.unlocked.project_binge, false);
  const fullProjects = deriveBadges(['project:open:gla-exchange', 'project:open:educloud'], {});
  assert.equal(fullProjects.unlocked.project_binge, true);

  // 4. Skill Collector requires all 6 categories
  const partialSkills = deriveBadges([
    'skill_cat:Languages',
    'skill_cat:Frameworks & Libraries'
  ], {});
  assert.equal(partialSkills.unlocked.skill_collector, false);

  const fullSkills = deriveBadges([
    'skill_cat:Languages',
    'skill_cat:Frameworks & Libraries',
    'skill_cat:Cloud & DevOps',
    'skill_cat:Databases',
    'skill_cat:CS Fundamentals',
    'skill_cat:Developer Tools'
  ], {});
  assert.equal(fullSkills.unlocked.skill_collector, true);

  // 5. Reached Out
  const reached = deriveBadges(['contact_form_sent'], {});
  assert.equal(reached.unlocked.reached_out, true);

  // 6. Konami Master
  const konami = deriveBadges(['secret_or_konami'], {});
  assert.equal(konami.unlocked.konami_master, true);

  // 7. Cloud Native unlocks on project:open:educloud
  const eduCloudView = deriveBadges(['project:open:educloud'], {});
  assert.equal(eduCloudView.unlocked.cloud_native, true);

  // 8. Shipped It unlocks on project:live:gla-exchange
  const shippedIt = deriveBadges(['project:live:gla-exchange'], {});
  assert.equal(shippedIt.unlocked.shipped_it, true);

  // 9. Certified unlocks on certifications_view
  const certView = deriveBadges(['certifications_view'], {});
  assert.equal(certView.unlocked.certified, true);

  // 10. Full Run unlocks on Level 5 (500+ XP)
  const below500 = deriveBadges([], {}, 499);
  assert.equal(below500.unlocked.full_run, false);

  const at500 = deriveBadges([], {}, 500);
  assert.equal(at500.unlocked.full_run, true);

  const allActions = [
    'preloader_finish',
    'terminal_first_open',
    'project:open:gla-exchange',
    'project:open:educloud',
    'skill_cat:Languages',
    'skill_cat:Frameworks & Libraries',
    'skill_cat:Cloud & DevOps',
    'skill_cat:Databases',
    'skill_cat:CS Fundamentals',
    'skill_cat:Developer Tools',
    'contact_form_sent',
    'secret_or_konami',
    'project:live:gla-exchange',
    'certifications_view'
  ];

  const fullRunResult = deriveBadges(allActions, {}, 570);
  assert.equal(fullRunResult.unlocked.full_run, true);
  assert.equal(Object.values(fullRunResult.unlocked).filter(Boolean).length, 10);
});

test('Toast queue manager limits to 5 items and drops oldest XP toast first', () => {
  let queue = [];

  // Add 3 XP toasts and 2 achievement toasts
  queue = enqueueToast(queue, { type: 'xp', actionId: 'act1', amount: 10 });
  queue = enqueueToast(queue, { type: 'xp', actionId: 'act2', amount: 20 });
  queue = enqueueToast(queue, { type: 'achievement', title: 'Badge 1' });
  queue = enqueueToast(queue, { type: 'achievement', title: 'Badge 2' });
  queue = enqueueToast(queue, { type: 'xp', actionId: 'act3', amount: 30 });

  assert.equal(queue.length, 5);

  // Adding 6th toast (achievement) drops oldest XP toast ('act1')
  queue = enqueueToast(queue, { type: 'achievement', title: 'Badge 3' });
  assert.equal(queue.length, 5);
  assert.ok(!queue.find((t) => t.actionId === 'act1'), 'Oldest XP toast act1 must have been dropped');
  assert.ok(queue.find((t) => t.title === 'Badge 1'), 'Achievement Badge 1 must NOT be dropped');
});

test('State migration cleans legacy structures', () => {
  const legacy = {
    version: 1,
    xp: 250,
    achievements: [
      { id: 'game-1', xpReward: 100, name: 'Pilot' }
    ]
  };

  const migrated = migrateState(legacy);
  assert.equal(migrated.version, 3);
  assert.deepEqual(migrated.awardedActionIds, []);
  assert.deepEqual(migrated.badgeTimestamps, {});
  assert.equal(migrated.achievements[0].xpReward, undefined);
});

test('Stored-state bug fix: 8810 XP corrupted state recovers to strictly valid recomputed XP and clamped level', () => {
  // Corrupted saved state mimicking earlier builds with 8810 XP and bogus action IDs
  const corruptedState = {
    version: 2,
    xp: 8810,
    level: 5,
    awardedActionIds: [
      'fake_action_1',
      'enter_portfolio',
      'about_view',
      'unknown_inflated_xp_token',
      'persona:judge',
      'command:about'
    ],
    badgeTimestamps: {
      pilot_episode: '2026-11-01T10:00:00Z'
    },
    session: {
      profileSelected: true,
      selectedProfile: 'judge',
      persona: 'Hackathon Judge',
      visitedSections: ['hero', 'projects']
    }
  };

  const recovered = migrateState(corruptedState);
  assert.ok(recovered);

  // Only known valid actions remain ('enter_portfolio' = 20, 'about_view' = 30, 'command:about' = 10)
  assert.deepEqual(recovered.awardedActionIds, ['enter_portfolio', 'about_view', 'command:about']);
  // Recomputed XP: 20 + 30 + 10 = 60 XP (Curious Visitor, Level 1)
  assert.equal(recovered.xp, 60);
  assert.equal(recovered.level, 1);
  assert.equal(recovered.levelTitle, 'Curious Visitor');
  assert.ok(recovered.xp <= MAX_TOTAL_XP);

  // Legacy persona keys stripped from session
  assert.equal(recovered.session.selectedProfile, undefined);
  assert.equal(recovered.session.persona, undefined);
  assert.equal(recovered.selectedProfile, undefined);
  assert.equal(recovered.selectedPersona, undefined);
  assert.equal(recovered.session.profileSelected, true);
  assert.deepEqual(recovered.session.visitedSections, ['hero', 'projects']);
});

test('State migration maps legacy action IDs (profile_select, terminal_open, link_click:gla_exchange, proj-1, proj-2)', () => {
  const legacyActionsState = {
    version: 2,
    xp: 9999,
    awardedActionIds: [
      'profile_select',
      'terminal_open',
      'link_click:gla_exchange',
      'project:open:proj-1',
      'project:open:proj-2'
    ]
  };

  const migrated = migrateState(legacyActionsState);
  assert.deepEqual(migrated.awardedActionIds, [
    'enter_portfolio',
    'terminal_first_open',
    'project:live:gla-exchange',
    'project:open:gla-exchange',
    'project:open:educloud'
  ]);
  // enter_portfolio (20) + terminal_first_open (50) + project:live:gla-exchange (15) + 25 + 25 = 135 XP
  assert.equal(migrated.xp, 135);
  assert.equal(migrated.level, 2);
  assert.equal(migrated.levelTitle, 'Explorer');
});

test('State migration resets non-object or unrecognized shapes to null', () => {
  assert.equal(migrateState(null), null);
  assert.equal(migrateState(undefined), null);
  assert.equal(migrateState('corrupted string'), null);
  assert.equal(migrateState(12345), null);
  assert.equal(migrateState([]), null);
  assert.equal(migrateState({ unrecognizedField: 123 }), null);
});

test('XP-Once Awards: awarding the same actionId twice increments XP only once (StrictMode idempotency)', () => {
  const initial = {
    xp: 0,
    level: 1,
    levelTitle: 'Curious Visitor',
    awardedActionIds: [],
    badgeTimestamps: {}
  };

  // First award: awards +20 XP
  const state1 = applyAwardAction(initial, 'enter_portfolio', 20);
  assert.equal(state1.xp, 20);
  assert.equal(state1.awardedActionIds.includes('enter_portfolio'), true);

  // Duplicate award of the exact same action: XP must NOT increment
  const state2 = applyAwardAction(state1, 'enter_portfolio', 20);
  assert.equal(state2.xp, 20, 'Second award of enter_portfolio must not add double XP');
  assert.equal(state2.awardedActionIds.length, 1);

  // Terminal alias idempotency: terminal_open vs terminal_first_open
  const state3 = applyAwardAction(state2, 'terminal_open', 50);
  assert.equal(state3.xp, 70);
  const state4 = applyAwardAction(state3, 'terminal_first_open', 50);
  assert.equal(state4.xp, 70, 'terminal_first_open should be idempotent with terminal_open');

  // Legacy profile_select alias idempotency with enter_portfolio
  const state5 = applyAwardAction(state4, 'profile_select', 20);
  assert.equal(state5.xp, 70, 'profile_select should be idempotent with enter_portfolio');
});

test('Per-project IDs and live links award once', () => {
  const initial = {
    xp: 0,
    level: 1,
    awardedActionIds: [],
    badgeTimestamps: {}
  };

  const s1 = applyAwardAction(initial, 'project:open:gla-exchange', 25);
  assert.equal(s1.xp, 25);
  const s2 = applyAwardAction(s1, 'project:open:educloud', 25);
  assert.equal(s2.xp, 50);
  const s2Repeat = applyAwardAction(s2, 'project:open:educloud', 25);
  assert.equal(s2Repeat.xp, 50, 'Duplicate project open must award 0 XP');

  const s3 = applyAwardAction(s2, 'project:live:gla-exchange', 15);
  assert.equal(s3.xp, 65);
  const s3Repeat = applyAwardAction(s3, 'project:live:gla-exchange', 15);
  assert.equal(s3Repeat.xp, 65, 'Duplicate live link click must award 0 XP');
});

test('Distinct terminal commands each award 10 XP once and repeated commands award nothing', () => {
  let state = {
    xp: 0,
    level: 1,
    awardedActionIds: [],
    badgeTimestamps: {}
  };

  const cmds = [
    'command:help',
    'command:whoami',
    'command:about',
    'command:skills',
    'command:skills --level',
    'command:projects',
    'command:play',
    'command:achievements',
    'command:experience',
    'command:education',
    'command:resume',
    'command:contact',
    'command:github',
    'command:linkedin',
    'command:deploy --global',
    'command:theme',
    'command:clear'
  ];

  assert.equal(cmds.length, 17, 'Must have exactly 17 distinct valid commands');

  for (let i = 0; i < cmds.length; i++) {
    state = applyAwardAction(state, cmds[i], 10);
    assert.equal(state.xp, (i + 1) * 10);
  }
  assert.equal(state.xp, 170, '17 distinct commands must award exactly 170 XP');

  // Repeated commands award nothing
  for (const cmd of cmds) {
    const repeatedState = applyAwardAction(state, cmd, 10);
    assert.equal(repeatedState.xp, 170, `Repeated command ${cmd} must award 0 XP`);
  }
});

test('Secret command and Konami code award +100 once for secret_or_konami', () => {
  const initial = {
    xp: 0,
    level: 1,
    awardedActionIds: [],
    badgeTimestamps: {}
  };

  const state1 = applyAwardAction(initial, 'secret_or_konami', 100);
  assert.equal(state1.xp, 100);
  assert.equal(state1.badgeUnlocked.konami_master, true);

  // Subsequent activation of either secret or konami awards nothing
  const state2 = applyAwardAction(state1, 'secret_or_konami', 100);
  assert.equal(state2.xp, 100);
});

test('Link click IDs each award +15 once (github, linkedin, resume)', () => {
  let state = {
    xp: 0,
    level: 1,
    awardedActionIds: [],
    badgeTimestamps: {}
  };

  state = applyAwardAction(state, 'link_click:github', 15);
  assert.equal(state.xp, 15);
  state = applyAwardAction(state, 'link_click:linkedin', 15);
  assert.equal(state.xp, 30);
  state = applyAwardAction(state, 'link_click:resume', 15);
  assert.equal(state.xp, 45);

  // Repeat clicks award nothing
  state = applyAwardAction(state, 'link_click:github', 15);
  assert.equal(state.xp, 45);
});

test('Badge Triggers: discrete action IDs unlock their exact respective badges', () => {
  const initial = {
    xp: 0,
    level: 1,
    awardedActionIds: [],
    badgeTimestamps: {}
  };

  // 1. Found the Terminal
  const terminalState = applyAwardAction(initial, 'terminal_first_open', 50);
  assert.equal(terminalState.badgeUnlocked.found_the_terminal, true);

  // 2. Konami Master
  const konamiState = applyAwardAction(initial, 'secret_or_konami', 100);
  assert.equal(konamiState.badgeUnlocked.konami_master, true);

  // 3. Project Binge requires both project:open:gla-exchange and project:open:educloud
  const p1State = applyAwardAction(initial, 'project:open:gla-exchange', 25);
  assert.equal(p1State.badgeUnlocked.project_binge, false);
  const p2State = applyAwardAction(p1State, 'project:open:educloud', 25);
  assert.equal(p2State.badgeUnlocked.project_binge, true);

  // 4. Skill Collector requires all 6 categories
  let skillState = initial;
  const cats = [
    'skill_cat:Languages',
    'skill_cat:Frameworks & Libraries',
    'skill_cat:Cloud & DevOps',
    'skill_cat:Databases',
    'skill_cat:CS Fundamentals',
    'skill_cat:Developer Tools'
  ];
  for (const cat of cats) {
    skillState = applyAwardAction(skillState, cat, 0);
  }
  assert.equal(skillState.badgeUnlocked.skill_collector, true);

  // 5. Cloud Native unlocks on project:open:educloud
  const cloudState = applyAwardAction(initial, 'project:open:educloud', 25);
  assert.equal(cloudState.badgeUnlocked.cloud_native, true);

  // 6. Shipped It unlocks on project:live:gla-exchange
  const shippedState = applyAwardAction(initial, 'project:live:gla-exchange', 15);
  assert.equal(shippedState.badgeUnlocked.shipped_it, true);

  // 7. Reached Out unlocks on contact_form_sent
  const contactState = applyAwardAction(initial, 'contact_form_sent', 20);
  assert.equal(contactState.badgeUnlocked.reached_out, true);

  // 8. Certified unlocks on certifications_view
  const certState = applyAwardAction(initial, 'certifications_view', 0);
  assert.equal(certState.badgeUnlocked.certified, true);

  // 9. Pilot Episode unlocks on enter_portfolio or preloader_finish
  const pilotState = applyAwardAction(initial, 'enter_portfolio', 20);
  assert.equal(pilotState.badgeUnlocked.pilot_episode, true);
});

test('Initial state starts at 0 XP, Level 1 and cannot reach Level 5', () => {
  const initial = {
    xp: 0,
    level: 1,
    awardedActionIds: [],
    badgeTimestamps: {}
  };
  const levelInfo = calculateLevel(initial.xp);
  assert.equal(levelInfo.level, 1);
  assert.equal(levelInfo.name, 'Curious Visitor');
  assert.ok(levelInfo.level < 5, 'Initial state must never be Level 5');
});

test('Level thresholds: verify exact level boundaries from 0 to 570 XP', () => {
  const boundaries = [
    { xp: 0, expectedLevel: 1, expectedName: 'Curious Visitor' },
    { xp: 99, expectedLevel: 1, expectedName: 'Curious Visitor' },
    { xp: 100, expectedLevel: 2, expectedName: 'Explorer' },
    { xp: 199, expectedLevel: 2, expectedName: 'Explorer' },
    { xp: 200, expectedLevel: 3, expectedName: 'Insider' },
    { xp: 349, expectedLevel: 3, expectedName: 'Insider' },
    { xp: 350, expectedLevel: 4, expectedName: 'Power User' },
    { xp: 499, expectedLevel: 4, expectedName: 'Power User' },
    { xp: 500, expectedLevel: 5, expectedName: 'Hired!' },
    { xp: 570, expectedLevel: 5, expectedName: 'Hired!' }
  ];

  for (const b of boundaries) {
    const res = calculateLevel(b.xp);
    assert.equal(res.level, b.expectedLevel, `XP ${b.xp} should be level ${b.expectedLevel}`);
    assert.equal(res.name, b.expectedName, `XP ${b.xp} should have title ${b.expectedName}`);
  }
});

test('Konami sequence validation: verifies 10-key sequence strictly', () => {
  const validSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  assert.equal(isKonamiSequence(validSequence), true);

  // Incomplete or mutated sequence
  assert.equal(isKonamiSequence(validSequence.slice(0, 9)), false);
  assert.equal(isKonamiSequence(['ArrowDown', ...validSequence.slice(1)]), false);
  assert.equal(isKonamiSequence(['x', 'y']), false);
});

test('Theme persistence: terminal theme command produces valid side effect and persists valid choices', () => {
  const themes = ['dark', 'neon', 'pastel'];
  for (const t of themes) {
    const res = parseCommand(`theme ${t}`);
    assert.equal(res.success, true);
    assert.ok(
      res.sideEffects.some((e) => e.type === 'SET_THEME' && e.theme === t),
      `theme ${t} must trigger SET_THEME with ${t}`
    );
  }

  // Clear command produces CLEAR_OUTPUT side effect
  const clearRes = parseCommand('clear');
  assert.equal(clearRes.success, true);
  assert.ok(clearRes.sideEffects.some((e) => e.type === 'CLEAR_OUTPUT'));

  // Invalid theme returns guidance without setting theme
  const invalidRes = parseCommand('theme cyberpunk');
  assert.equal(invalidRes.success, true);
  assert.equal(invalidRes.sideEffects.length, 0);
  assert.ok(invalidRes.output.some((l) => l.text.includes('ACCENT THEMES AVAILABLE')));
});
