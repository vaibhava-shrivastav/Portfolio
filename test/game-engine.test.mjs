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
  migrateState
} from '../src/context/game-engine.js';
import { gameAchievements } from '../src/data/profile.js';

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
    { name: 'profile_select', xp: 20 },
    { name: 'about_view', xp: 30 },
    { name: 'project_open_proj1', xp: 25 },
    { name: 'project_open_proj2', xp: 25 },
    { name: 'skills_view', xp: 30 },
    { name: 'terminal_first_open', xp: 50 },
    { name: 'terminal_unique_commands', xp: 170 }, // 17 commands * 10
    { name: 'secret_or_konami', xp: 100 },
    { name: 'achievements_view', xp: 20 },
    { name: 'contact_view', xp: 20 },
    { name: 'link_click_github', xp: 15 },
    { name: 'link_click_linkedin', xp: 15 },
    { name: 'link_click_resume', xp: 15 },
    { name: 'contact_form_sent', xp: 20 }
  ];

  const totalPossibleXp = table.reduce((sum, item) => sum + item.xp, 0);
  assert.equal(totalPossibleXp, 555);
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

  // Pilot Episode
  const s1 = deriveBadges(['preloader_finish'], {});
  assert.equal(s1.unlocked.pilot_episode, true);
  assert.ok(s1.timestamps.pilot_episode);

  // Found the Terminal
  const s2 = deriveBadges(['terminal_first_open'], {});
  assert.equal(s2.unlocked.found_the_terminal, true);

  // Project Binge requires both projects
  const partialProjects = deriveBadges(['project:open:proj-1'], {});
  assert.equal(partialProjects.unlocked.project_binge, false);
  const fullProjects = deriveBadges(['project:open:proj-1', 'project:open:proj-2'], {});
  assert.equal(fullProjects.unlocked.project_binge, true);

  // Skill Collector requires all 6 categories
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

  // Cloud Native unlocks on persona:judge OR aws_services_view
  const judgePersona = deriveBadges(['persona:judge'], {});
  assert.equal(judgePersona.unlocked.cloud_native, true);
  const awsView = deriveBadges(['aws_services_view'], {});
  assert.equal(awsView.unlocked.cloud_native, true);

  // Shipped It unlocks on link_click:gla_exchange
  const shippedIt = deriveBadges(['link_click:gla_exchange'], {});
  assert.equal(shippedIt.unlocked.shipped_it, true);

  // Certified unlocks on certifications_view
  const certView = deriveBadges(['certifications_view'], {});
  assert.equal(certView.unlocked.certified, true);

  // Full Run unlocks only when all other 9 are unlocked
  const allNineActions = [
    'preloader_finish',
    'terminal_first_open',
    'project:open:proj-1',
    'project:open:proj-2',
    'skill_cat:Languages',
    'skill_cat:Frameworks & Libraries',
    'skill_cat:Cloud & DevOps',
    'skill_cat:Databases',
    'skill_cat:CS Fundamentals',
    'skill_cat:Developer Tools',
    'contact_form_sent',
    'secret_or_konami',
    'persona:judge',
    'link_click:gla_exchange',
    'certifications_view'
  ];

  const fullRunResult = deriveBadges(allNineActions, {});
  assert.equal(fullRunResult.unlocked.full_run, true, 'Full Run must unlock when all other 9 are unlocked');
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
